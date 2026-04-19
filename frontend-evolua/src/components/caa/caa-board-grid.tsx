'use client';

import Image from 'next/image';
import { getArasaacPictogramUrl } from '@/lib/api/caa';
import type { CAACell } from '@/lib/api/caa';

interface CAABoardGridProps {
  rows: number;
  cols: number;
  cells: CAACell[];
  editable?: boolean;
  onCellClick?: (row: number, col: number, cell?: CAACell) => void;
}

const DEFAULT_COLORS = [
  '#FFFFFF', // default — white
  '#FFD700', // people/social — yellow
  '#90EE90', // verbs — green
  '#87CEEB', // descriptors — blue
  '#FFB6C1', // nouns — pink
  '#DDA0DD', // questions — purple
];

export function CAABoardGrid({ rows, cols, cells, editable, onCellClick }: CAABoardGridProps) {
  const cellMap = new Map<string, CAACell>();
  cells.forEach((c) => cellMap.set(`${c.row}-${c.col}`, c));

  return (
    <div
      className="inline-grid gap-1 p-2 bg-gray-100 rounded-2xl w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const key = `${r}-${c}`;
          const cell = cellMap.get(key);

          return (
            <button
              key={key}
              onClick={() => onCellClick?.(r, c, cell)}
              disabled={!editable && !cell}
              className={`
                flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-1.5 min-h-16 transition-all
                ${cell ? 'border-gray-300 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95' : 'border-dashed border-gray-300 bg-white/50'}
                ${editable ? 'cursor-pointer' : cell ? 'cursor-default' : 'cursor-not-allowed opacity-40'}
              `}
              style={{ backgroundColor: cell?.backgroundColor ?? '#FFFFFF' }}
              aria-label={cell?.label ?? 'Célula vazia'}
            >
              {cell?.pictogramId ? (
                <>
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={getArasaacPictogramUrl(cell.pictogramId, { resolution: 100 })}
                      alt={cell.label}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span
                    className="text-[10px] font-semibold text-center leading-tight"
                    style={{ color: cell.textColor ?? '#1a1a1a' }}
                  >
                    {cell.label}
                  </span>
                </>
              ) : cell ? (
                <span className="text-xs font-medium text-gray-700 text-center">{cell.label}</span>
              ) : editable ? (
                <span className="material-symbols-outlined text-gray-300 text-lg">add</span>
              ) : null}
            </button>
          );
        })
      )}
    </div>
  );
}

export { DEFAULT_COLORS };
