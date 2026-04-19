'use client';

import { useState } from 'react';
import { SessionRecorder } from '@/components/session-recorder';
import { useSessions } from '@/hooks/use-therapeutic-session';
import type { TherapeuticSession } from '@/lib/api/sessions';

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  recording: { label: 'Gravando', color: 'text-red-600 bg-red-50' },
  processing: { label: 'Processando', color: 'text-yellow-600 bg-yellow-50' },
  transcribed: { label: 'Transcrito', color: 'text-blue-600 bg-blue-50' },
  report_generated: { label: 'Relatório Gerado', color: 'text-green-600 bg-green-50' },
};

export default function SessaoPage() {
  const [view, setView] = useState<'list' | 'record' | 'detail'>('list');
  const [patientId] = useState(''); // In real use: from URL or selection
  const [selectedSession, setSelectedSession] = useState<TherapeuticSession | null>(null);

  const { sessions, loading } = useSessions();

  const handleSessionComplete = (session: TherapeuticSession) => {
    setSelectedSession(session);
    setView('detail');
  };

  if (view === 'record') {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('list')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Modo Tablet — Sessão ao Vivo</h1>
            <p className="text-sm text-gray-500">Gravação + transcrição em tempo real pela IA</p>
          </div>
        </div>

        {patientId ? (
          <SessionRecorder
            patientId={patientId}
            onSessionComplete={handleSessionComplete}
            onCancel={() => setView('list')}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-5xl">person_search</span>
            <div>
              <p className="font-semibold text-gray-600">Selecione um paciente primeiro</p>
              <p className="text-sm text-gray-400 mt-1">
                Acesse esta página a partir do perfil do paciente
              </p>
            </div>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (view === 'detail' && selectedSession) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('list')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sessão Gravada</h1>
            <p className="text-sm text-gray-500">
              {new Date(selectedSession.createdAt).toLocaleDateString('pt-BR')} ·{' '}
              {formatDuration(selectedSession.duration)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {selectedSession.videoUrl && (
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              <video src={selectedSession.videoUrl} controls className="w-full h-full" />
            </div>
          )}

          {selectedSession.transcription && (
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-purple-500 text-base">transcribe</span>
                Transcrição
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedSession.transcription}</p>
            </div>
          )}

          {selectedSession.reportDraft && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-purple-500 text-base">auto_awesome</span>
                Rascunho do Relatório (IA)
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedSession.reportDraft}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Sessões Terapêuticas</h1>
          <p className="text-sm text-gray-500">Gravação com IA · Transcrição em tempo real</p>
        </div>
        <button
          onClick={() => setView('record')}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          Nova Sessão
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="material-symbols-outlined text-gray-300 text-6xl">videocam</span>
          <div>
            <p className="font-semibold text-gray-600">Nenhuma sessão gravada ainda</p>
            <p className="text-sm text-gray-400 mt-1">
              Use o modo tablet para gravar sessões com transcrição automática
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const status = STATUS_LABELS[session.status] ?? STATUS_LABELS.transcribed;
            return (
              <button
                key={session.id}
                onClick={() => { setSelectedSession(session); setView('detail'); }}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left"
              >
                <span className="material-symbols-outlined text-purple-400 text-3xl">
                  {session.videoUrl ? 'videocam' : 'mic'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">
                    {session.title ?? 'Sessão sem título'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} · {formatDuration(session.duration)}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
                <span className="material-symbols-outlined text-gray-300">chevron_right</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
