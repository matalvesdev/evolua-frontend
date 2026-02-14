"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useRBAC } from "@/lib/security/rbac"
import { ROUTE_PERMISSIONS } from "@/lib/security/rbac"

interface RouteGuardProps {
  children: React.ReactNode
}

/**
 * Finds the most specific matching route from ROUTE_PERMISSIONS for a given pathname.
 * E.g., "/dashboard/pacientes/123" matches "/dashboard/pacientes".
 */
function findMatchingRoute(pathname: string): string | null {
  const routes = Object.keys(ROUTE_PERMISSIONS)

  // Sort by specificity (longest prefix first) and find the best match
  const match = routes
    .filter((route) => pathname === route || pathname.startsWith(route + "/"))
    .sort((a, b) => b.length - a.length)[0]

  return match ?? null
}

export function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { canAccessRoute, loading } = useRBAC()
  const hasRedirected = useRef(false)

  const matchedRoute = findMatchingRoute(pathname)
  const isAuthorized = matchedRoute ? canAccessRoute(matchedRoute) : true

  useEffect(() => {
    if (loading || isAuthorized || hasRedirected.current) return

    hasRedirected.current = true
    toast.error("Acesso negado")
    router.replace("/dashboard")
  }, [loading, isAuthorized, router])

  // Reset redirect flag when pathname changes
  useEffect(() => {
    hasRedirected.current = false
  }, [pathname])

  if (loading) {
    return null
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
