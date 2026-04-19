'use client';

import { useRef, useEffect, useState } from 'react';
import { useTherapeuticSessionRecorder } from '@/hooks/use-therapeutic-session';
import { toast } from 'sonner';
import type { TherapeuticSession } from '@/lib/api/sessions';

interface SessionRecorderProps {
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  onSessionComplete?: (session: TherapeuticSession) => void;
  onCancel?: () => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SessionRecorder({
  patientId,
  patientName,
  appointmentId,
  onSessionComplete,
  onCancel,
}: SessionRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStopping, setIsStopping] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const {
    isRecording,
    isPaused,
    isProcessing,
    duration,
    transcription,
    interimTranscript,
    error,
    videoPreviewUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = useTherapeuticSessionRecorder(patientId, appointmentId);

  // Attach camera stream to video element
  useEffect(() => {
    if (!isRecording || !videoRef.current) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {/* mirror stream already acquired in hook */});
  }, [isRecording]);

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const session = await stopRecording();
      if (session) {
        toast.success('Sessão gravada com sucesso! Relatório rascunho gerado pela IA.');
        onSessionComplete?.(session);
      }
    } catch {
      toast.error('Erro ao finalizar gravação.');
    } finally {
      setIsStopping(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="material-symbols-outlined text-red-400 text-5xl">videocam_off</span>
        <div>
          <p className="font-semibold text-gray-800">Erro ao acessar câmera/microfone</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <p className="text-xs text-gray-400 mt-2">
            Verifique se você concedeu permissão para câmera e microfone.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (!isRecording && !isProcessing && videoPreviewUrl) {
    return (
      <div className="flex flex-col gap-4">
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          <video src={videoPreviewUrl} controls className="w-full h-full" />
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Transcrição gerada</p>
          <p className="text-sm text-gray-700 leading-relaxed">{transcription || '(sem transcrição)'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Video Preview */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        {isRecording ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
            <span className="material-symbols-outlined text-6xl opacity-50">videocam</span>
            <p className="text-sm opacity-60">Pronto para gravar</p>
            {patientName && (
              <p className="text-xs opacity-50">Paciente: {patientName}</p>
            )}
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && !isPaused && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-mono font-bold">{formatDuration(duration)}</span>
          </div>
        )}
        {isPaused && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-yellow-400 text-sm">pause</span>
            <span className="text-white text-sm font-mono">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Live Transcription */}
      {isRecording && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500 text-lg">transcribe</span>
              Transcrição em tempo real
            </span>
            <span className="material-symbols-outlined text-gray-400 text-lg">
              {showTranscript ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showTranscript && (
            <div className="px-4 pb-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed">
                {transcription}
                {interimTranscript && (
                  <span className="text-gray-400 italic">{interimTranscript}</span>
                )}
                {!transcription && !interimTranscript && (
                  <span className="text-gray-400">Aguardando fala...</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording && !isProcessing && (
          <>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg"
            >
              <span className="w-3 h-3 rounded-full bg-white" />
              Iniciar Gravação
            </button>
          </>
        )}

        {isRecording && !isStopping && (
          <>
            <button
              onClick={cancelRecording}
              className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              title="Cancelar"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>

            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Retomar
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined">pause</span>
                Pausar
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-800 text-white font-bold hover:bg-gray-900 transition-colors shadow-lg"
            >
              <span className="w-3 h-3 rounded bg-white" />
              Finalizar
            </button>
          </>
        )}

        {(isProcessing || isStopping) && (
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600 font-medium">
              Processando e gerando relatório com IA...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
