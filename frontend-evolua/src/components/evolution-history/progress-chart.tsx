'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type {
  ProgressChartProps,
  GoalProgressSnapshot,
  Milestone,
  MilestoneType,
} from '@/types/evolution-history';
import { chartDataFormatter } from '@/services/goal-history';
import { milestoneConfig } from '@/types/evolution-history';
import { useMediaQuery } from '@/hooks/use-media-query';

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  snapshots: GoalProgressSnapshot[];
}

function CustomTooltip({ active, payload, snapshots }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const snapshot = snapshots.find(
    (s) => Math.abs(s.createdAt.getTime() - data.date.getTime()) < 60000
  );

  if (!snapshot) return null;

  const tooltipData = chartDataFormatter.formatTooltipData(snapshot);

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
      <p className="text-xs text-gray-600 mb-2">{tooltipData.date}</p>
      <div className="space-y-1">
        <p className="text-sm font-bold text-[#8A05BE]">Progresso: {tooltipData.progress}</p>
        {snapshot.variation !== undefined && snapshot.variation !== 0 && (
          <p
            className={`text-xs font-medium ${
              snapshot.variation > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            Variação: {tooltipData.variation}
          </p>
        )}
        {data.isMilestone && (
          <p className="text-xs font-medium text-blue-600 mt-2">📍 Marco importante</p>
        )}
      </div>
    </div>
  );
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { date: Date; isMilestone?: boolean; milestoneType?: MilestoneType };
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
}

function CustomDot({ cx, cy, payload, milestones, onMilestoneClick }: CustomDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null;

  if (payload.isMilestone && payload.milestoneType) {
    const config = milestoneConfig[payload.milestoneType];
    const colorMap: Record<string, string> = {
      green: '#10b981',
      blue: '#3b82f6',
      yellow: '#f59e0b',
      red: '#ef4444',
    };

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill={colorMap[config.color]}
          stroke="white"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const milestone = milestones.find(
              (m) => Math.abs(m.date.getTime() - payload.date.getTime()) < 60000
            );
            if (milestone && onMilestoneClick) {
              onMilestoneClick(milestone);
            }
          }}
        />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={4} fill="#8A05BE" stroke="white" strokeWidth={2} />;
}

/**
 * Gráfico de linha interativo para visualização da evolução de progresso.
 * Usa Recharts para renderizar pontos de progresso ao longo do tempo,
 * com destaque visual para milestones e tooltip customizado.
 * Agrupa dados por semana automaticamente para períodos maiores que 6 meses.
 */
export function ProgressChart({ snapshots, milestones, onMilestoneClick }: ProgressChartProps) {
  // Formatar dados para o gráfico
  const chartData = useMemo(() => {
    // Verificar se precisa agrupar por semana
    const shouldGroup = chartDataFormatter.shouldGroupByWeek(snapshots);
    const processedSnapshots = shouldGroup ? chartDataFormatter.groupByWeek(snapshots) : snapshots;

    return chartDataFormatter.format(processedSnapshots, milestones);
  }, [snapshots, milestones]);

  const isMobile = useMediaQuery('(max-width: 767px)');

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum dado de progresso disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minHeight={isMobile ? 220 : 300}
        aspect={isMobile ? 1.2 : 2}
      >
        <LineChart
          data={chartData}
          margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 0 : 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: ptBR })}
            stroke="#6b7280"
            style={{ fontSize: isMobile ? '10px' : '12px' }}
            interval={isMobile ? 'preserveStartEnd' : 'preserveEnd'}
          />

          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke="#6b7280"
            style={{ fontSize: isMobile ? '10px' : '12px' }}
            width={isMobile ? 36 : 48}
          />

          <Tooltip content={<CustomTooltip snapshots={snapshots} />} />

          <Line
            type="monotone"
            dataKey="progress"
            stroke="#8A05BE"
            strokeWidth={3}
            dot={<CustomDot milestones={milestones} onMilestoneClick={onMilestoneClick} />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
