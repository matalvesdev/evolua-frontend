import type { AudioSession as PrismaAudioSession } from '@prisma/client';
import type { AudioSession } from '@evolua/contracts';

export const audioMapper = {
  toDto(s: PrismaAudioSession): AudioSession {
    return {
      id: s.id,
      clinicId: s.clinicId,
      patientId: s.patientId,
      therapistId: s.therapistId,
      appointmentId: s.appointmentId,
      audioUrl: s.audioUrl,
      audioDuration: s.audioDuration,
      fileSize: s.fileSize,
      transcription: s.transcription,
      transcriptionStatus: s.transcriptionStatus ?? 'pending',
      transcriptionError: s.transcriptionError,
      transcribedAt: s.transcribedAt ? s.transcribedAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  },
};
