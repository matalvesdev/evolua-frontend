"use client"

import { useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/lib/core/domain/types"

type RoutePermissions = Record<string, UserRole[]>

export const ROUTE_PERMISSIONS: RoutePermissions = {
  "/dashboard": ["admin", "therapist", "secretary", "patient"],
  "/dashboard/pacientes": ["admin", "therapist", "secretary"],
  "/dashboard/agendamentos": ["admin", "therapist", "secretary"],
  "/dashboard/financeiro": ["admin", "therapist"],
  "/dashboard/relatorios": ["admin", "therapist"],
  "/dashboard/tarefas": ["admin", "therapist", "secretary"],
  "/dashboard/configuracoes": ["admin"],
  "/dashboard/perfil": ["admin", "therapist", "secretary", "patient"],
}

export function useRBAC() {
  const { user, loading } = useAuth()

  const role: UserRole | null = useMemo(() => {
    const r = user?.user_metadata?.role
    if (r === "admin" || r === "therapist" || r === "secretary" || r === "patient") {
      return r
    }
    return null
  }, [user])

  const hasPermission = useMemo(() => {
    return (allowedRoles: UserRole[]): boolean => {
      if (!role) return false
      return allowedRoles.includes(role)
    }
  }, [role])

  const canAccessRoute = useMemo(() => {
    return (route: string): boolean => {
      const allowedRoles = ROUTE_PERMISSIONS[route]
      if (!allowedRoles) return false
      return hasPermission(allowedRoles)
    }
  }, [hasPermission])

  return { role, loading, hasPermission, canAccessRoute }
}
