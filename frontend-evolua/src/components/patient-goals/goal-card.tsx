'use client';

import { useState } from 'react';

interface GoalCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'in-progress' | 'attention' | 'started';
  iconName: string;
  colorScheme: 'purple' | 'blue' | 'pink';
  patientId: string;
}

const statusConfig = {
  'in-progress': { label: 'Em Andamento', color: 'green' },
  attention: { label: 'Atenção', color: 'yellow' },
  started: { label: 'Iniciado', color: 'gray' },
};

const colorSchemes = {
  purple: {
    iconBg: 'bg-purple-50',
    iconText: 'text-[#8A05BE]',
    iconHoverBg: 'group-hover:bg-[#8A05BE]',
    progressBar: 'bg-[#8A05BE]',
    progressShadow: 'shadow-[#8A05BE]/30',
    progressText: 'text-[#8A05BE]',
  },
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    iconHoverBg: 'group-hover:bg-blue-500',
    progressBar: 'bg-blue-500',
    progressShadow: 'shadow-blue-500/30',
    progressText: 'text-blue-500',
  },
  pink: {
    iconBg: 'bg-pink-50',
    iconText: 'text-pink-500',
    iconHoverBg: 'group-hover:bg-pink-500',
    progressBar: 'bg-pink-500',
    progressShadow: 'shadow-pink-500/30',
    progressText: 'text-pink-500',
  },
};

export function GoalCard({
  id,
  title,
  description,
  progress,
  status,
  iconName,
  colorScheme,
  patientId,
}: GoalCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const statusInfo = statusConfig[status];
  const colors = colorSchemes[colorScheme];

  return (
    <>
      <div className="glass-card rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-white group relative min-w-0">
        {/* Botão Ver Histórico */}
        <button
          onClick={() => setShowHistory(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          title="Ver Histórico"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-600">history</span>
        </button>

        <div className="flex justify-between items-start mb-5">
          <div
            className={`${colors.iconBg} ${colors.iconText} p-3 rounded-xl ${colors.iconHoverBg} group-hover:text-white transition-colors shadow-sm`}
          >
            <span className="material-symbols-outlined text-[26px]">{iconName}</span>
          </div>
          <span
            className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-${statusInfo.color}-200`}
          >
            {statusInfo.label}
          </span>
        </div>

        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-words pr-8 sm:pr-0">
          {title}
        </h4>
        <p className="text-sm text-gray-600 mb-5 sm:mb-6 line-clamp-2 min-h-10">{description}</p>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-bold">
            <span className={colors.progressText}>{progress}%</span>
            <span className="text-gray-600">Meta: 100%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progressBar} rounded-full relative shadow-lg ${colors.progressShadow}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Evolution History Panel */}
      {showHistory && (
        <div className="fixed inset-0 z-50">
          <EvolutionHistoryPanel
            goalId={id}
            patientId={patientId}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
        </div>
      )}
    </>
  );
}

// Importar o painel de histórico
import { EvolutionHistoryPanel } from '@/components/evolution-history';
