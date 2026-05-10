import { z } from 'zod';
import { UuidSchema } from './common.js';

export const TranscriptionStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);
export type TranscriptionStatus = z.infer<typeof TranscriptionStatusEnum>;

export const AudioSessionSchema = z.object({
  id: UuidSchema,
  clinicId: UuidSchema,
  patientId: UuidSchema,
  therapistId: UuidSchema,
  appointmentId: UuidSchema.nullable(),
  audioUrl: z.string(),
  audioDuration: z.number().int().nullable(),
  fileSize: z.number().int().nullable(),
  transcription: z.string().nullable(),
  transcriptionStatus: z.string(),
  transcriptionError: z.string().nullable(),
  transcribedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type AudioSession = z.infer<typeof AudioSessionSchema>;

const audioUrlSchema = z
  .string()
  .url()
  .refine(
    (u) => /^https:\/\/[^/]+\.(supabase\.co|amazonaws\.com)\//.test(u),
    'audioUrl deve ser https em domínio Supabase ou AWS',
  );

export const CreateAudioSessionSchema = z.object({
  patientId: UuidSchema,
  appointmentId: UuidSchema.optional(),
  audioUrl: audioUrlSchema,
  audioDuration: z.number().int().min(0).optional(),
  fileSize: z.number().int().min(0).optional(),
});
export type CreateAudioSessionInput = z.infer<typeof CreateAudioSessionSchema>;

export const TranscribeAudioSchema = z.object({
  audioSessionId: UuidSchema,
  language: z.string().max(10).optional(),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioSchema>;

export const ListAudioSessionsQuerySchema = z.object({
  patientId: UuidSchema.optional(),
  transcriptionStatus: TranscriptionStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListAudioSessionsQuery = z.infer<typeof ListAudioSessionsQuerySchema>;
