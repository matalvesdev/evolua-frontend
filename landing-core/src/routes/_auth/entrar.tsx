import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/entrar')({
  beforeLoad: () => {
    throw redirect({ href: 'https://app.useevolua.com.br/entrar' })
  },
  component: () => null,
})
