'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { TherapeuticMaterial } from '@/lib/api/materials';
import { getArasaacPictogramUrl } from '@/lib/api/caa';

interface MaterialPrintViewProps {
  material: TherapeuticMaterial;
  onClose?: () => void;
}

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

export function MaterialPrintView({ material, onClose }: MaterialPrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: material.content.orientation === 'landscape' ? 'l' : 'p',
      unit: 'mm',
      format: material.content.paperSize === 'A3' ? 'a3' : 'a4',
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${material.title}.pdf`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{material.title}</h2>
          <p className="text-xs text-purple-600 font-medium mt-0.5">
            {AREA_LABELS[material.therapeuticArea]} · {TYPE_LABELS[material.type]}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Baixar PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Print-ready area */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl shadow p-6 border border-gray-100"
        style={{ fontFamily: 'sans-serif' }}
      >
        {/* Material Header */}
        <div className="border-b-2 border-purple-200 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{material.title}</h1>
              {material.description && (
                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              <div className="font-semibold text-purple-700">Objetivo Terapêutico</div>
              <div className="font-medium text-gray-800 mt-0.5">{material.therapeuticObjective}</div>
            </div>
          </div>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {AREA_LABELS[material.therapeuticArea]}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              {TYPE_LABELS[material.type]}
            </span>
          </div>
        </div>

        {/* Pages */}
        {material.content.pages.map((page, pi) => (
          <div key={page.id} className={pi > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}>
            <div className="relative min-h-[400px]">
              {page.elements.map((el) => (
                <div
                  key={el.id}
                  className="absolute"
                  style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                >
                  {el.type === 'text' && (
                    <p
                      style={{
                        fontSize: el.fontSize,
                        fontWeight: el.fontWeight,
                        textAlign: el.textAlign,
                        color: el.color,
                      }}
                    >
                      {el.text}
                    </p>
                  )}
                  {el.type === 'pictogram' && (
                    <div className="flex flex-col items-center gap-1 h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getArasaacPictogramUrl(el.arasaacId)}
                        alt={el.label}
                        className="flex-1 object-contain"
                        crossOrigin="anonymous"
                      />
                      {el.showLabel && (
                        <span className="text-xs font-semibold text-center">{el.label}</span>
                      )}
                    </div>
                  )}
                  {el.type === 'grid' && (
                    <div
                      className="grid h-full gap-1"
                      style={{ gridTemplateColumns: `repeat(${el.cols}, 1fr)` }}
                    >
                      {el.cells.map((cell, ci) => (
                        <div
                          key={ci}
                          className="border border-gray-300 rounded flex flex-col items-center justify-center p-1 text-center text-xs"
                        >
                          {cell.arasaacId ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getArasaacPictogramUrl(cell.arasaacId, { resolution: 100 })}
                              alt={cell.content}
                              className="w-8 h-8 object-contain"
                              crossOrigin="anonymous"
                            />
                          ) : null}
                          <span>{cell.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Instructions */}
        {material.instructions && (
          <div className="mt-6 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-800 mb-1">Instruções</p>
            <p className="text-xs text-gray-700">{material.instructions}</p>
          </div>
        )}
        {material.adaptations && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Sugestões de Adaptação</p>
            <p className="text-xs text-gray-700">{material.adaptations}</p>
          </div>
        )}

        <p className="text-[9px] text-gray-400 text-right mt-4">
          Gerado pelo Evolua — useevolua.com.br
        </p>
      </div>
    </div>
  );
}
