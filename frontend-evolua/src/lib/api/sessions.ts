// ============================================================================
// SESSÕES TERAPÊUTICAS API (Tablet Mode)
// Gravação de vídeo+áudio + transcrição IA em tempo real
// ============================================================================

import { api } from './client';

export type SessionStatus = 'recording' | 'processing' | 'transcribed' | 'report_generated';

export interface TherapeuticSession {
  id: string;
  patientId: string;
  therapistId: string;
  appointmentId?: string;
  title?: string;
  status: SessionStatus;
  videoUrl?: string;
  audioUrl?: string;
  transcription?: string;
  reportDraft?: string;
  duration?: number; // seconds
  objectives?: string[];
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionInput {
  patientId: string;
  appointmentId?: string;
  title?: string;
  objectives?: string[];
}

export interface SaveSessionMediaInput {
  sessionId: string;
  videoBlob: Blob;
  audioBlob: Blob;
  duration: number;
}

export async function createSession(input: CreateSessionInput): Promise<TherapeuticSession> {
  return api.post<TherapeuticSession>('/sessions', input);
}

export async function getSession(id: string): Promise<TherapeuticSession> {
  return api.get<TherapeuticSession>(`/sessions/${id}`);
}

export async function listSessions(params?: {
  patientId?: string;
  appointmentId?: string;
  status?: SessionStatus;
  page?: number;
  limit?: number;
}): Promise<{ data: TherapeuticSession[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.appointmentId) query.set('appointmentId', params.appointmentId);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return api.get<{ data: TherapeuticSession[]; total: number }>(
    `/sessions${qs ? `?${qs}` : ''}`
  );
}

export async function updateSessionTranscription(
  id: string,
  transcription: string,
  reportDraft?: string
): Promise<TherapeuticSession> {
  return api.patch<TherapeuticSession>(`/sessions/${id}/transcription`, {
    transcription,
    reportDraft,
  });
}

export async function generateReportFromSession(id: string): Promise<{ reportDraft: string }> {
  return api.post<{ reportDraft: string }>(`/sessions/${id}/generate-report`, {});
}

export async function deleteSession(id: string): Promise<void> {
  return api.delete(`/sessions/${id}`);
}
