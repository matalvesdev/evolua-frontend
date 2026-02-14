"use client"

import type { UserRole } from "@/lib/core/domain/types"
import { useRBAC } from "@/lib/security/rbac"

interface RBACGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RBACGuard({ allowedRoles, children, fallback }: RBACGuardProps) {
  const { hasPermission, loading } = useRBAC()

  if (loading) {
    return null
  }

  if (hasPermission(allowedRoles)) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}
