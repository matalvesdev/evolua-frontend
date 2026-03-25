import { createClient } from '@/lib/supabase/client'
import type {
  GoalProgressSnapshot,
  Milestone,
  CreateSnapshotDTO,
  CreateMilestoneDTO
} from '@/types/evolution-history'

/**
 * Serviço para gerenciar histórico de progresso de metas terapêuticas
 * Responsável por toda comunicação com backend Supabase
 */
export class GoalHistoryService {
  private supabase = createClient()

  /**
   * Busca histórico de snapshots de uma meta específica
   * @param goalId - ID da meta
   * @param startDate - Data inicial opcional para filtro
   * @param endDate - Data final opcional para filtro
   * @returns Array de snapshots ordenados por data (mais recente primeiro)
   */
  async fetchGoalHistory(
    goalId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<GoalProgressSnapshot[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_goal_history_with_stats', {
        p_goal_id: goalId,
        p_start_date: startDate?.toISOString() || null,
        p_end_date: endDate?.toISOString() || null
      })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.snapshot_id,
        goalId,
        progress: row.progress,
        createdAt: new Date(row.created_at),
        therapistId: row.therapist_id,
        notes: row.notes,
        variation: row.variation,
        daysSinceLast: row.days_since_last
      }))
    } catch (error) {
      console.error('Error fetching goal history:', error)
      throw new Error('Não foi possível carregar o histórico da meta')
    }
  }

  /**
   * Busca histórico de snapshots de todas as metas de um paciente
   * @param patientId - ID do paciente
   * @returns Array de snapshots de todas as metas do paciente
   */
  async fetchPatientHistory(patientId: string): Promise<GoalProgressSnapshot[]> {
    try {
      // Primeiro buscar todas as metas do paciente
      const { data: goals, error: goalsError } = await this.supabase
        .from('patient_goals')
        .select('id')
        .eq('patient_id', patientId)

      if (goalsError) throw goalsError

      if (!goals || goals.length === 0) {
        return []
      }

      const goalIds = goals.map(g => g.id)

      // Buscar snapshots de todas as metas
      const { data, error } = await this.supabase
        .from('goal_progress_history')
        .select('*')
        .in('goal_id', goalIds)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        goalId: row.goal_id,
        progress: row.progress,
        createdAt: new Date(row.created_at),
        therapistId: row.therapist_id,
        notes: row.notes
      }))
    } catch (error) {
      console.error('Error fetching patient history:', error)
      throw new Error('Não foi possível carregar o histórico do paciente')
    }
  }

  /**
   * Busca milestones de uma meta específica
   * @param goalId - ID da meta
   * @returns Array de milestones ordenados por data (mais recente primeiro)
   */
  async fetchMilestones(goalId: string): Promise<Milestone[]> {
    try {
      const { data, error } = await this.supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('date', { ascending: false })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        goalId: row.goal_id,
        type: row.type,
        date: new Date(row.date),
        progress: row.progress,
        description: row.description,
        createdAt: new Date(row.created_at)
      }))
    } catch (error) {
      console.error('Error fetching milestones:', error)
      throw new Error('Não foi possível carregar os marcos da meta')
    }
  }

  /**
   * Cria um snapshot de progresso manualmente
   * @param dto - Dados do snapshot a ser criado
   * @returns Snapshot criado
   */
  async createSnapshot(dto: CreateSnapshotDTO): Promise<GoalProgressSnapshot> {
    try {
      const { data, error } = await this.supabase
        .from('goal_progress_history')
        .insert({
          goal_id: dto.goalId,
          progress: dto.progress,
          therapist_id: dto.therapistId,
          notes: dto.notes
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        goalId: data.goal_id,
        progress: data.progress,
        createdAt: new Date(data.created_at),
        therapistId: data.therapist_id,
        notes: data.notes
      }
    } catch (error) {
      console.error('Error creating snapshot:', error)
      throw new Error('Não foi possível criar o snapshot de progresso')
    }
  }

  /**
   * Cria um milestone manualmente
   * @param dto - Dados do milestone a ser criado
   * @returns Milestone criado
   */
  async createMilestone(dto: CreateMilestoneDTO): Promise<Milestone> {
    try {
      const { data, error } = await this.supabase
        .from('goal_milestones')
        .insert({
          goal_id: dto.goalId,
          type: dto.type,
          date: dto.date.toISOString(),
          progress: dto.progress,
          description: dto.description
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        goalId: data.goal_id,
        type: data.type,
        date: new Date(data.date),
        progress: data.progress,
        description: data.description,
        createdAt: new Date(data.created_at)
      }
    } catch (error) {
      console.error('Error creating milestone:', error)
      throw new Error('Não foi possível criar o marco')
    }
  }
}

// Exportar instância singleton
export const goalHistoryService = new GoalHistoryService()
