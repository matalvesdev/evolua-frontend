import { supabase } from './supabase'
import { api } from './api'

const BUCKET = 'audio-sessions'

/**
 * Upload de áudio de sessão para o bucket privado `audio-sessions`.
 *
 * O backend valida paciente/tenant e emite token temporário. O navegador nunca
 * recebe credenciais privilegiadas e não decide o path do arquivo.
 *
 * @returns o path autorizado no bucket privado.
 */
export async function uploadAudioBlob(
  patientId: string,
  blob: Blob,
): Promise<string> {
  // sanity: patientId precisa ser UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(patientId)) {
    throw new Error('uploadAudioBlob: patientId inválido')
  }
  const contentType = normalizeAudioContentType(blob.type)
  const target = await api.post<{ path: string; token: string }>('/api/audio/upload-target', {
    patientId,
    contentType,
  })

  const { error } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(target.path, target.token, blob, {
      contentType,
      cacheControl: '3600',
    })

  if (error) {
    throw new Error(`Falha no upload do áudio: ${error.message}`)
  }
  return target.path
}

type AudioContentType = 'audio/webm' | 'audio/ogg' | 'audio/mpeg' | 'audio/mp3' | 'audio/wav' | 'audio/mp4' | 'audio/m4a' | 'audio/x-m4a' | 'audio/aac'

function normalizeAudioContentType(value: string): AudioContentType {
  const contentType = value.split(';', 1)[0].toLowerCase()
  if (!isAudioContentType(contentType)) {
    throw new Error('Formato de áudio não suportado')
  }
  return contentType
}

function isAudioContentType(value: string): value is AudioContentType {
  return value === 'audio/webm' || value === 'audio/ogg' || value === 'audio/mpeg' ||
    value === 'audio/mp3' || value === 'audio/wav' || value === 'audio/mp4' ||
    value === 'audio/m4a' || value === 'audio/x-m4a' || value === 'audio/aac'
}
