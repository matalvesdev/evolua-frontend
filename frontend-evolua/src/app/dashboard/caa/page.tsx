'use client';

import { useState } from 'react';
import { useCAABoards, useCAAboadMutations } from '@/hooks/use-caa';
import { CAABoardEditor, CAABoardGrid } from '@/components/caa';
import type { CAABoardEditorState } from '@/components/caa/caa-board-editor';
import { toast } from 'sonner';

export default function CAAPage() {
  const { boards, loading } = useCAABoards();
  const { createBoard, deleteBoard, isCreating } = useCAAboadMutations();
  const [view, setView] = useState<'list' | 'new' | 'view'>('list');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const handleSave = async (state: CAABoardEditorState) => {
    try {
      await createBoard({
        ...state,
        cells: state.cells.map(({ id: _, ...c }) => c),
      });
      toast.success('Prancha salva com sucesso!');
      setView('list');
    } catch {
      toast.error('Erro ao salvar prancha.');
    }
  };

  const handlePrint = (state: CAABoardEditorState) => {
    // Open print dialog with board rendered
    window.print();
  };

  if (view === 'new') {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('list')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Nova Prancha CAA</h1>
            <p className="text-sm text-gray-500">Pictogramas ARASAAC</p>
          </div>
        </div>
        <CAABoardEditor onSave={handleSave} onPrint={handlePrint} isSaving={isCreating} />
      </div>
    );
  }

  if (view === 'view' && selectedBoard) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('list')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{selectedBoard.title}</h1>
            <p className="text-sm text-purple-600">{selectedBoard.category}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Imprimir
            </button>
            <button
              onClick={async () => {
                if (confirm('Tem certeza que deseja excluir esta prancha?')) {
                  await deleteBoard(selectedBoard.id);
                  toast.success('Prancha excluída.');
                  setView('list');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>

        {selectedBoard.therapeuticObjective && (
          <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-xs font-semibold text-purple-700">Objetivo Terapêutico</p>
            <p className="text-sm text-gray-700 mt-0.5">{selectedBoard.therapeuticObjective}</p>
          </div>
        )}

        <CAABoardGrid
          rows={selectedBoard.rows}
          cols={selectedBoard.cols}
          cells={selectedBoard.cells}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pranchas CAA</h1>
          <p className="text-sm text-gray-500">Comunicação Aumentativa e Alternativa · ARASAAC</p>
        </div>
        <button
          onClick={() => setView('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nova Prancha
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="material-symbols-outlined text-gray-300 text-6xl">grid_view</span>
          <div>
            <p className="font-semibold text-gray-600">Nenhuma prancha criada ainda</p>
            <p className="text-sm text-gray-400 mt-1">
              Crie sua primeira prancha CAA com pictogramas ARASAAC
            </p>
          </div>
          <button
            onClick={() => setView('new')}
            className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Criar Prancha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => { setSelectedBoardId(board.id); setView('view'); }}
              className="flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-gray-800 text-sm">{board.title}</p>
                <p className="text-xs text-purple-600 mt-0.5">{board.category}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{board.rows}×{board.cols} · {board.cells.length} pictogramas</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
              {board.therapeuticObjective && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1 truncate">
                  {board.therapeuticObjective}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
