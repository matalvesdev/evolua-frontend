"use client"

import { useEffect } from "react"
import { getHimetrica } from "@/lib/analytics/himetrica"
import { useUser } from "@/hooks"

export function HimetricaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  useEffect(() => {
    // Initialize on mount (browser only)
    getHimetrica()
  }, [])

  useEffect(() => {
    if (user?.email) {
      const name =
        (user.user_metadata?.name as string) ||
        (user.user_metadata?.full_name as string) ||
        ""
      getHimetrica().identify({ name, email: user.email })
    }
  }, [user])

  return <>{children}</>
}
