'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useArasaacSearch } from '@/hooks/use-caa';
import { getArasaacPictogramUrl } from '@/lib/api/caa';
import type { ArasaacPictogram } from '@/lib/api/caa';

interface PictogramSearchProps {
  onSelect: (pictogram: ArasaacPictogram) => void;
}

export function PictogramSearch({ onSelect }: PictogramSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { pictograms, loading } = useArasaacSearch(debouncedQuery);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const timer = setTimeout(() => setDebouncedQuery(val), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar pictograma (ex: comer, casa, feliz...)"
          value={query}
          onChange={handleChange}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {pictograms.length > 0 && (
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
          {pictograms.slice(0, 40).map((p) => (
            <button
              key={p._id}
              onClick={() => onSelect(p)}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-transparent hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <div className="relative w-14 h-14">
                <Image
                  src={getArasaacPictogramUrl(p._id, { resolution: 100 })}
                  alt={p.keywords[0]?.keyword ?? ''}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-[10px] text-center text-gray-600 leading-tight line-clamp-2 group-hover:text-purple-700">
                {p.keywords[0]?.keyword ?? ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {debouncedQuery.length >= 2 && !loading && pictograms.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          Nenhum pictograma encontrado para &quot;{debouncedQuery}&quot;
        </p>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Pictogramas fornecidos por{' '}
        <a
          href="https://arasaac.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-purple-600"
        >
          ARASAAC
        </a>{' '}
        (licença CC BY-NC-SA)
      </p>
    </div>
  );
}
