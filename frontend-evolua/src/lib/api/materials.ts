// ============================================================================
// MATERIAIS TERAPÊUTICOS API
// Inspirado no modelo Criança Tagarela Clube — recursos prontos para imprimir
// ============================================================================

import { api } from './client';

export type TherapeuticArea =
  | 'fonologia'
  | 'semantica'
  | 'pragmatica'
  | 'sintaxe'
  | 'prosódia'
  | 'motricidade_orofacial'
  | 'transtorno_motor_fala'
  | 'interpretacao_texto'
  | 'caa'
  | 'audicao'
  | 'voz'
  | 'geral';

export type MaterialType =
  | 'jogo'
  | 'ficha_atividade'
  | 'cartao_figura'
  | 'bingo'
  | 'dominó'
  | 'memoria'
  | 'sequencia_narrativa'
  | 'prancha_caa'
  | 'exercicio_escrito'
  | 'outro';

export type AgeGroup = 'pre_escolar' | 'escolar' | 'adolescente' | 'adulto' | 'idoso' | 'todos';

export interface TherapeuticMaterial {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  therapeuticArea: TherapeuticArea;
  therapeuticObjective: string;
  ageGroup: AgeGroup;
  instructions?: string;
  adaptations?: string;
  patientId?: string;
  content: MaterialContent;
  tags: string[];
  isPrintReady: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialContent {
  pages: MaterialPage[];
  orientation: 'portrait' | 'landscape';
  paperSize: 'A4' | 'A3' | 'carta';
}

export interface MaterialPage {
  id: string;
  elements: MaterialElement[];
}

export type MaterialElement =
  | TextElement
  | ImageElement
  | PictogramElement
  | GridElement
  | ShapeElement;

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
}

export interface PictogramElement extends BaseElement {
  type: 'pictogram';
  arasaacId: number;
  label: string;
  showLabel: boolean;
  borderColor?: string;
  backgroundColor?: string;
}

export interface GridElement extends BaseElement {
  type: 'grid';
  rows: number;
  cols: number;
  cells: Array<{ content: string; imageUrl?: string; arasaacId?: number }>;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: 'rect' | 'circle' | 'line';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface CreateMaterialInput {
  title: string;
  description?: string;
  type: MaterialType;
  therapeuticArea: TherapeuticArea;
  therapeuticObjective: string;
  ageGroup: AgeGroup;
  instructions?: string;
  adaptations?: string;
  patientId?: string;
  content: MaterialContent;
  tags?: string[];
}

export type UpdateMaterialInput = Partial<CreateMaterialInput>;

export async function listMaterials(params?: {
  patientId?: string;
  type?: MaterialType;
  therapeuticArea?: TherapeuticArea;
  ageGroup?: AgeGroup;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: TherapeuticMaterial[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.type) query.set('type', params.type);
  if (params?.therapeuticArea) query.set('therapeuticArea', params.therapeuticArea);
  if (params?.ageGroup) query.set('ageGroup', params.ageGroup);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return api.get<{ data: TherapeuticMaterial[]; total: number }>(
    `/materials${qs ? `?${qs}` : ''}`
  );
}

export async function getMaterial(id: string): Promise<TherapeuticMaterial> {
  return api.get<TherapeuticMaterial>(`/materials/${id}`);
}

export async function createMaterial(input: CreateMaterialInput): Promise<TherapeuticMaterial> {
  return api.post<TherapeuticMaterial>('/materials', input);
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput
): Promise<TherapeuticMaterial> {
  return api.patch<TherapeuticMaterial>(`/materials/${id}`, input);
}

export async function deleteMaterial(id: string): Promise<void> {
  return api.delete(`/materials/${id}`);
}

export async function duplicateMaterial(id: string): Promise<TherapeuticMaterial> {
  return api.post<TherapeuticMaterial>(`/materials/${id}/duplicate`, {});
}
