'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { SessionRecorder } from '@/components/session-recorder';
import type { TherapeuticSession } from '@/lib/api/sessions';

interface Props {
  params: Promise<{ id: string }>;
}

export default function PatientSessaoPage({ params }: Props) {
  const { id: patientId } = use(params);
  const router = useRouter();

  const handleComplete = (session: TherapeuticSession) => {
    // Navigate to sessions list with session detail
    router.push(`/dashboard/sessao?session=${session.id}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-500">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gravar Sessão</h1>
          <p className="text-sm text-gray-500">Modo Tablet · Vídeo + Áudio + IA</p>
        </div>
      </div>

      <SessionRecorder
        patientId={patientId}
        onSessionComplete={handleComplete}
        onCancel={() => router.back()}
      />
    </div>
  );
}
