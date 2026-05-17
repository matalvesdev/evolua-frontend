export interface User {
  id: string
  email: string
  user_metadata: {
    name?: string
    full_name?: string
    role?: string
    avatar_url?: string
  }
}

export interface Patient {
  id: string
  clinicId: string
  therapistId: string | null
  name: string
  email: string | null
  phone: string | null
  birthDate: string | null
  cpf: string | null
  status: string
  guardianName: string | null
  guardianPhone: string | null
  guardianRelationship: string | null
  address: unknown
  medicalHistory: { diagnoses?: string[]; medications?: string[]; allergies?: string[]; notes?: string } | null
  startDate: string | null
  dischargeDate: string | null
  dischargeReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  dateTime: string
  type: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  modality?: 'presential' | 'teleconsult'
  notes?: string
}

export interface Report {
  id: string
  patientId: string
  patientName: string
  title?: string
  type: string
  status: 'draft' | 'pending_review' | 'approved' | 'signed'
  createdAt: string
}

export interface Task {
  id: string
  title: string
  status: 'pending' | 'completed'
  type: 'task' | 'reminder'
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  status: 'pending' | 'paid' | 'overdue'
  date: string
}

export interface DashboardStats {
  activePatientsCount: number
  weekAppointmentsCount: number
  pendingReportsCount: number
  todayPendingCount: number
  weekCompletedCount: number
  monthRevenue: number
  monthRevenueGrowth: number
}
