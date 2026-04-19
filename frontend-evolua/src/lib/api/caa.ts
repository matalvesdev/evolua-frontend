// ============================================================================
// CAA (Comunicação Aumentativa e Alternativa) API
// Integração com ARASAAC — https://api.arasaac.org
// ============================================================================

import { api } from './client';

export interface ArasaacPictogram {
  _id: number;
  keywords: Array<{ keyword: string; type: number; plural?: string }>;
  url: string;
  categories?: string[];
}

export interface CAACell {
  id: string;
  pictogramId?: number;
  pictogramUrl?: string;
  label: string;
  backgroundColor?: string;
  textColor?: string;
  row: number;
  col: number;
  action?: string;
}

export interface CAABoard {
  id: string;
  patientId?: string;
  title: string;
  description?: string;
  rows: number;
  cols: number;
  cells: CAACell[];
  category: string;
  therapeuticObjective?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCAABoardInput {
  patientId?: string;
  title: string;
  description?: string;
  rows: number;
  cols: number;
  cells: Omit<CAACell, 'id'>[];
  category: string;
  therapeuticObjective?: string;
}

export type UpdateCAABoardInput = Partial<CreateCAABoardInput>;

// ARASAAC pictogram search (direct to ARASAAC API)
export async function searchArasaacPictograms(
  keyword: string,
  language = 'pt'
): Promise<ArasaacPictogram[]> {
  const res = await fetch(
    `https://api.arasaac.org/v1/pictograms/${language}/search/${encodeURIComponent(keyword)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export function getArasaacPictogramUrl(id: number, options?: { resolution?: number }): string {
  const res = options?.resolution ?? 300;
  return `https://static.arasaac.org/pictograms/${id}/${id}_${res}.png`;
}

// CAA Boards CRUD via backend
export async function listCAABoards(params?: {
  patientId?: string;
  category?: string;
}): Promise<CAABoard[]> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.category) query.set('category', params.category);
  const qs = query.toString();
  return api.get<CAABoard[]>(`/caa/boards${qs ? `?${qs}` : ''}`);
}

export async function getCAABoard(id: string): Promise<CAABoard> {
  return api.get<CAABoard>(`/caa/boards/${id}`);
}

export async function createCAABoard(input: CreateCAABoardInput): Promise<CAABoard> {
  return api.post<CAABoard>('/caa/boards', input);
}

export async function updateCAABoard(
  id: string,
  input: UpdateCAABoardInput
): Promise<CAABoard> {
  return api.patch<CAABoard>(`/caa/boards/${id}`, input);
}

export async function deleteCAABoard(id: string): Promise<void> {
  return api.delete(`/caa/boards/${id}`);
}
