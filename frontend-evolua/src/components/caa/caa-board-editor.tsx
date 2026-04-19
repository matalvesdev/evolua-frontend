'use client';

import { useState, useCallback } from 'react';
import { CAABoardGrid } from './caa-board-grid';
import { PictogramSearch } from './pictogram-search';
import type { CAACell, ArasaacPictogram } from '@/lib/api/caa';
import { getArasaacPictogramUrl } from '@/lib/api/caa';

export interface CAABoardEditorState {
  title: string;
  rows: number;
  cols: number;
  cells: CAACell[];
  category: string;
  therapeuticObjective: string;
}

interface CAABoardEditorProps {
  initialState?: Partial<CAABoardEditorState>;
  onSave: (state: CAABoardEditorState) => Promise<void>;
  onPrint?: (state: CAABoardEditorState) => void;
  isSaving?: boolean;
}

const CATEGORIES = [
  'Comunicação Básica',
  'Rotina Diária',
  'Alimentação',
  'Emoções',
  'Escola',
  'Família',
  'Atividades',
  'Vocabulário',
  'Frases',
  'Personalizado',
];

const THERAPEUTIC_OBJECTIVES = [
  'Ampliar vocabulário expressivo',
  'Comunicação funcional',
  'Interação social',
  'Identificação de figuras',
  'Sequência temporal',
  'Expressão de emoções',
  'Rotina e autonomia',
  'Personalizado',
];

export function CAABoardEditor({ initialState, onSave, onPrint, isSaving }: CAABoardEditorProps) {
  const [state, setState] = useState<CAABoardEditorState>({
    title: initialState?.title ?? 'Nova Prancha CAA',
    rows: initialState?.rows ?? 3,
    cols: initialState?.cols ?? 5,
    cells: initialState?.cells ?? [],
    category: initialState?.category ?? 'Comunicação Básica',
    therapeuticObjective: initialState?.therapeuticObjective ?? '',
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showPictogramSearch, setShowPictogramSearch] = useState(false);
  const [editingCellLabel, setEditingCellLabel] = useState('');

  const handleCellClick = useCallback((row: number, col: number, cell?: CAACell) => {
    setSelectedCell({ row, col });
    setEditingCellLabel(cell?.label ?? '');
    setShowPictogramSearch(true);
  }, []);

  const handleSelectPictogram = useCallback(
    (pictogram: ArasaacPictogram) => {
      if (!selectedCell) return;
      const label = editingCellLabel || (pictogram.keywords[0]?.keyword ?? '');
      const newCell: CAACell = {
        id: `${selectedCell.row}-${selectedCell.col}`,
        row: selectedCell.row,
        col: selectedCell.col,
        pictogramId: pictogram._id,
        pictogramUrl: getArasaacPictogramUrl(pictogram._id),
        label,
        backgroundColor: '#FFFFFF',
      };
      setState((prev) => ({
        ...prev,
        cells: [
          ...prev.cells.filter((c) => !(c.row === selectedCell.row && c.col === selectedCell.col)),
          newCell,
        ],
      }));
      setShowPictogramSearch(false);
      setSelectedCell(null);
    },
    [selectedCell, editingCellLabel]
  );

  const removeCell = useCallback(
    (row: number, col: number) => {
      setState((prev) => ({
        ...prev,
        cells: prev.cells.filter((c) => !(c.row === row && c.col === col)),
      }));
    },
    []
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            placeholder="Título da prancha"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            value={state.category}
            onChange={(e) => setState((s) => ({ ...s, category: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <select
          value={state.therapeuticObjective}
          onChange={(e) => setState((s) => ({ ...s, therapeuticObjective: e.target.value }))}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Selecionar objetivo terapêutico...</option>
          {THERAPEUTIC_OBJECTIVES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            Linhas:
            <input
              type="number"
              min={1}
              max={8}
              value={state.rows}
              onChange={(e) => setState((s) => ({ ...s, rows: Math.min(8, Math.max(1, +e.target.value)) }))}
              className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </label>
          <label className="flex items-center gap-2 text-gray-600">
            Colunas:
            <input
              type="number"
              min={1}
              max={10}
              value={state.cols}
              onChange={(e) => setState((s) => ({ ...s, cols: Math.min(10, Math.max(1, +e.target.value)) }))}
              className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </label>
        </div>
      </div>

      {/* Board Preview */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 mb-3">
          Clique em uma célula para adicionar um pictograma
        </p>
        <CAABoardGrid
          rows={state.rows}
          cols={state.cols}
          cells={state.cells}
          editable
          onCellClick={handleCellClick}
        />
      </div>

      {/* Pictogram Search Panel */}
      {showPictogramSearch && (
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Escolher pictograma — Célula ({selectedCell?.row ?? 0 + 1}, {selectedCell?.col ?? 0 + 1})
            </h3>
            <button
              onClick={() => {
                setShowPictogramSearch(false);
                setSelectedCell(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Label da célula (opcional)"
              value={editingCellLabel}
              onChange={(e) => setEditingCellLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <PictogramSearch onSelect={handleSelectPictogram} />
          {selectedCell && (
            <button
              onClick={() => {
                if (selectedCell) removeCell(selectedCell.row, selectedCell.col);
                setShowPictogramSearch(false);
                setSelectedCell(null);
              }}
              className="mt-2 text-xs text-red-500 hover:text-red-700"
            >
              Remover célula atual
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onPrint && (
          <button
            onClick={() => onPrint(state)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Imprimir
          </button>
        )}
        <button
          onClick={() => onSave(state)}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg">save</span>
          )}
          Salvar Prancha
        </button>
      </div>
    </div>
  );
}
