'use client';

import { useState } from 'react';
import { useMaterials, useMaterialMutations } from '@/hooks/use-materials';
import { MaterialPrintView } from '@/components/materials';
import type { TherapeuticArea, MaterialType } from '@/lib/api/materials';
import { toast } from 'sonner';

const AREA_LABELS: Record<string, string> = {
  fonologia: 'Fonologia',
  semantica: 'Semântica',
  pragmatica: 'Pragmática',
  sintaxe: 'Sintaxe',
  prosódia: 'Prosódia',
  motricidade_orofacial: 'Motricidade Orofacial',
  transtorno_motor_fala: 'Transtorno Motor de Fala',
  interpretacao_texto: 'Interpretação de Texto',
  caa: 'CAA',
  audicao: 'Audição',
  voz: 'Voz',
  geral: 'Geral',
};

const TYPE_LABELS: Record<string, string> = {
  jogo: 'Jogo',
  ficha_atividade: 'Ficha de Atividade',
  cartao_figura: 'Cartão-Figura',
  bingo: 'Bingo',
  dominó: 'Dominó',
  memoria: 'Memória',
  sequencia_narrativa: 'Sequência Narrativa',
  prancha_caa: 'Prancha CAA',
  exercicio_escrito: 'Exercício Escrito',
  outro: 'Outro',
};

const AREA_COLORS: Record<string, string> = {
  fonologia: 'bg-blue-100 text-blue-700',
  semantica: 'bg-green-100 text-green-700',
  pragmatica: 'bg-orange-100 text-orange-700',
  sintaxe: 'bg-yellow-100 text-yellow-700',
  motricidade_orofacial: 'bg-pink-100 text-pink-700',
  caa: 'bg-purple-100 text-purple-700',
  geral: 'bg-gray-100 text-gray-700',
};

export default function MateriaisPage() {
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState<TherapeuticArea | ''>('');
  const [filterType, setFilterType] = useState<MaterialType | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { materials, loading } = useMaterials({
    search: search || undefined,
    therapeuticArea: filterArea || undefined,
    type: filterType || undefined,
  });
  const { duplicateMaterial } = useMaterialMutations();

  const selectedMaterial = materials.find((m) => m.id === selectedId);

  if (selectedMaterial) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedId(null)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">arrow_back</span>
          </button>
        </div>
        <MaterialPrintView material={selectedMaterial} onClose={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Materiais Terapêuticos</h1>
          <p className="text-sm text-gray-500">Recursos prontos para imprimir · Com objetivo terapêutico</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar materiais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value as TherapeuticArea | '')}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todas as áreas</option>
          {Object.entries(AREA_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as MaterialType | '')}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="material-symbols-outlined text-gray-300 text-6xl">description</span>
          <div>
            <p className="font-semibold text-gray-600">Nenhum material encontrado</p>
            <p className="text-sm text-gray-400 mt-1">
              Os materiais terapêuticos aparecerão aqui após serem criados
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-purple-400 text-2xl mt-0.5">article</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{mat.title}</p>
                  {mat.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{mat.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${AREA_COLORS[mat.therapeuticArea] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {AREA_LABELS[mat.therapeuticArea]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                  {TYPE_LABELS[mat.type]}
                </span>
              </div>

              <div className="p-2 bg-purple-50 rounded-lg">
                <p className="text-[10px] font-semibold text-purple-600">Objetivo terapêutico</p>
                <p className="text-xs text-gray-700 mt-0.5 line-clamp-2">{mat.therapeuticObjective}</p>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setSelectedId(mat.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  Visualizar / Imprimir
                </button>
                <button
                  onClick={async () => {
                    await duplicateMaterial(mat.id);
                    toast.success('Material duplicado!');
                  }}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Duplicar"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
