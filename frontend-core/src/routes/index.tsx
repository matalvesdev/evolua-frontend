import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/entrar' })
  },
  component: () => null,
})
