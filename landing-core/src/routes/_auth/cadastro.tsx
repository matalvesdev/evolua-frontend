import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/cadastro')({
  beforeLoad: () => {
    throw redirect({ href: 'https://app.useevolua.com.br/cadastro' })
  },
  component: () => null,
})
