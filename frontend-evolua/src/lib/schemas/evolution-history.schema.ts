import { z } from 'zod'

// ============================================================================
// Zod Schemas para Validação
// ============================================================================

export const GoalProgressSnapshotSchema = z.object({
  id: z.string().uuid(),
  goalId: z.string().uuid(),
  progress: z.number().int().min(0).max(100),
  createdAt: z.date(),
  therapistId: z.string().uuid(),
  notes: z.string().optional(),
  variation: z.number().int().optional(),
  daysSinceLast: z.number().int().optional()
})

export const MilestoneSchema = z.object({
  id: z.string().uuid(),
  goalId: z.string().uuid(),
  type: z.enum(['started', 'significant_increase', 'significant_decrease', 'completed']),
  date: z.date(),
  progress: z.number().int().min(0).max(100),
  description: z.string().min(1),
  createdAt: z.date()
})

export const PeriodSelectionSchema = z.object({
  type: z.enum(['preset', 'custom']),
  preset: z.enum(['last7days', 'last30days', 'last3months', 'last6months']).optional(),
  customRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional()
}).refine(
  data => (data.type === 'preset' && data.preset) || (data.type === 'custom' && data.customRange),
  { message: 'Preset or customRange must be provided based on type' }
)

export const CreateSnapshotDTOSchema = z.object({
  goalId: z.string().uuid(),
  progress: z.number().int().min(0).max(100),
  therapistId: z.string().uuid(),
  notes: z.string().optional()
})

export const CreateMilestoneDTOSchema = z.object({
  goalId: z.string().uuid(),
  type: z.enum(['started', 'significant_increase', 'significant_decrease', 'completed']),
  date: z.date(),
  progress: z.number().int().min(0).max(100),
  description: z.string().min(1)
})
