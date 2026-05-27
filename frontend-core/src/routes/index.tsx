import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/entrar' })
  },
  component: () => null,
})
