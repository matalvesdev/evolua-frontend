'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sessionsApi from '@/lib/api/sessions';
import type { CreateSessionInput, TherapeuticSession } from '@/lib/api/sessions';
import { createClient } from '@/lib/supabase/client';

// Cross-browser Speech Recognition types
interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: ((e: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export type { TherapeuticSession } from '@/lib/api/sessions';

export function useSessions(params?: {
  patientId?: string;
  appointmentId?: string;
  status?: sessionsApi.SessionStatus;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sessions', params],
    queryFn: () => sessionsApi.listSessions(params),
  });
  return { sessions: data?.data ?? [], total: data?.total ?? 0, loading: isLoading, error };
}

// ============================================================================
// Hook principal para modo tablet — gravação vídeo+áudio + transcrição em tempo real
// ============================================================================
export function useTherapeuticSessionRecorder(patientId: string, appointmentId?: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && !isPaused) {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Setup Speech Recognition (Web Speech API — tempo real)
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return null;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscription((prev) => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      // Ignore no-speech errors — just means silence
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    // Auto-restart on end if still recording
    recognition.onend = () => {
      if (isRecording && !isPaused) {
        try { recognition.start(); } catch { /* already started */ }
      }
    };

    return recognition;
  }, [isRecording, isPaused]);

  const createSessionMutation = useMutation({
    mutationFn: (input: CreateSessionInput) => sessionsApi.createSession(input),
  });

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setDuration(0);
      setTranscription('');
      chunksRef.current = [];

      // Request camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      streamRef.current = stream;

      // Create session on backend
      const session = await createSessionMutation.mutateAsync({
        patientId,
        appointmentId,
        objectives: [],
      });
      setSessionId(session.id);

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(1000); // chunk every 1s
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Start speech recognition
      const recognition = setupSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar gravação';
      setError(msg);
    }
  }, [patientId, appointmentId, createSessionMutation, setupSpeechRecognition]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      recognitionRef.current?.stop();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      recognitionRef.current?.start();
      setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<TherapeuticSession | null> => {
    if (!mediaRecorderRef.current || !sessionId) return null;

    setIsProcessing(true);
    recognitionRef.current?.stop();

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current!;

      recorder.onstop = async () => {
        try {
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

          // Create preview URL
          const previewUrl = URL.createObjectURL(videoBlob);
          setVideoPreviewUrl(previewUrl);

          // Upload video to Supabase Storage
          const videoFile = new File([videoBlob], `session-${sessionId}.webm`, {
            type: 'video/webm',
          });
          const { error: uploadError } = await supabase.storage
            .from('session-recordings')
            .upload(`${sessionId}/video.webm`, videoFile, { upsert: true });

          if (uploadError) {
            console.error('Upload error:', uploadError);
          }

          // Save transcription to backend + request AI report draft
          const finalTranscript = transcription.trim();
          const updated = await sessionsApi.updateSessionTranscription(sessionId, finalTranscript);

          // Trigger AI report generation
          try {
            const { reportDraft } = await sessionsApi.generateReportFromSession(sessionId);
            await sessionsApi.updateSessionTranscription(sessionId, finalTranscript, reportDraft);
          } catch {
            // Non-critical — report can be generated manually
          }

          queryClient.invalidateQueries({ queryKey: ['sessions'] });

          // Cleanup stream
          streamRef.current?.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
          setIsPaused(false);
          setIsProcessing(false);

          resolve({ ...updated, duration: durationSec });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao processar gravação');
          setIsProcessing(false);
          resolve(null);
        }
      };

      if (recorder.state !== 'inactive') {
        recorder.stop();
      } else {
        recorder.onstop?.(new Event('stop'));
      }
    });
  }, [sessionId, transcription, supabase, queryClient]);

  const cancelRecording = useCallback(() => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(false);
    setTranscription('');
    setSessionId(null);
  }, []);

  return {
    // State
    sessionId,
    isRecording,
    isPaused,
    isProcessing,
    duration,
    transcription,
    interimTranscript,
    error,
    videoPreviewUrl,
    // Actions
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
}
