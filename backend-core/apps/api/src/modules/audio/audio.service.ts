import type { Prisma, AudioSession } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import type {
  CreateAudioSessionInput,
  ListAudioSessionsQuery,
  TranscribeAudioInput,
} from '@evolua/contracts';

export interface PaginatedAudioSessions {
  data: AudioSession[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const ALLOWED_AUDIO_HOSTS = ['supabase.co', 'amazonaws.com'];

function isAllowedAudioUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    return ALLOWED_AUDIO_HOSTS.some((d) => u.hostname.endsWith(d));
  } catch {
    return false;
  }
}

export class AudioService {
  async create(
    clinicId: string,
    therapistId: string,
    input: CreateAudioSessionInput,
  ): Promise<AudioSession> {
    const patient = await prisma.patient.findFirst({
      where: { id: input.patientId, clinicId, deletedAt: null },
      select: { id: true },
    });
    if (!patient) {
      const err = new Error('Patient not found in this clinic');
      (err as Error & { statusCode: number }).statusCode = 404;
      throw err;
    }

    return prisma.audioSession.create({
      data: {
        clinicId,
        therapistId,
        patientId: input.patientId,
        appointmentId: input.appointmentId ?? null,
        audioUrl: input.audioUrl,
        audioDuration: input.audioDuration ?? null,
        fileSize: input.fileSize ?? null,
        transcriptionStatus: 'pending',
      },
    });
  }

  async list(
    clinicId: string,
    query: ListAudioSessionsQuery,
  ): Promise<PaginatedAudioSessions> {
    const where: Prisma.AudioSessionWhereInput = { clinicId, deletedAt: null };
    if (query.patientId) where.patientId = query.patientId;
    if (query.transcriptionStatus) where.transcriptionStatus = query.transcriptionStatus;

    const [data, total] = await prisma.$transaction([
      prisma.audioSession.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.audioSession.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  async findOne(clinicId: string, id: string): Promise<AudioSession | null> {
    return prisma.audioSession.findFirst({ where: { id, clinicId, deletedAt: null } });
  }

  async getTranscription(
    clinicId: string,
    id: string,
  ): Promise<{ transcription: string; transcriptionStatus: string } | null> {
    const s = await this.findOne(clinicId, id);
    if (!s) return null;
    return {
      transcription: s.transcription ?? '',
      transcriptionStatus: s.transcriptionStatus ?? 'pending',
    };
  }

  async remove(clinicId: string, id: string): Promise<boolean> {
    const s = await this.findOne(clinicId, id);
    if (!s) return false;
    await prisma.audioSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  /**
   * Solicita transcrição ao serviço Python AI.
   * Retorna a sessão atualizada (status `processing` enquanto espera resposta).
   *
   * O serviço Python (TODO) faz: download do áudio → Whisper → atualização do registro.
   * Aqui só mudamos o status e disparamos a chamada async.
   */
  async transcribe(
    clinicId: string,
    therapistId: string,
    input: TranscribeAudioInput,
  ): Promise<AudioSession | null> {
    const session = await this.findOne(clinicId, input.audioSessionId);
    if (!session) return null;
    if (!isAllowedAudioUrl(session.audioUrl)) {
      throw Object.assign(new Error('audioUrl não permitida'), { statusCode: 400 });
    }

    const updated = await prisma.audioSession.update({
      where: { id: session.id },
      data: { transcriptionStatus: 'processing', transcriptionError: null },
    });

    void this.dispatchTranscription(updated, therapistId, input.language).catch((err) => {
      logger.warn(
        { err, sessionId: updated.id, patientId: updated.patientId },
        'audio: transcription dispatch failed',
      );
    });

    return updated;
  }

  private async dispatchTranscription(
    session: AudioSession,
    therapistId: string,
    language?: string,
  ): Promise<void> {
    try {
      const res = await fetch(`${env.AI_SERVICE_URL}/clinical/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': env.INTERNAL_SERVICE_TOKEN,
          'x-user-id': therapistId,
        },
        body: JSON.stringify({
          audio_session_id: session.id,
          audio_url: session.audioUrl,
          language: language ?? 'pt',
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) {
        const body = await res.text();
        await prisma.audioSession.update({
          where: { id: session.id },
          data: {
            transcriptionStatus: 'failed',
            transcriptionError: `AI service ${res.status}: ${body.slice(0, 500)}`,
          },
        });
        return;
      }
      const data = (await res.json()) as { transcription: string };
      await prisma.audioSession.update({
        where: { id: session.id },
        data: {
          transcription: data.transcription ?? '',
          transcriptionStatus: 'completed',
          transcribedAt: new Date(),
        },
      });
    } catch (e) {
      await prisma.audioSession.update({
        where: { id: session.id },
        data: {
          transcriptionStatus: 'failed',
          transcriptionError: e instanceof Error ? e.message : String(e),
        },
      });
    }
  }
}

export const audioService = new AudioService();
