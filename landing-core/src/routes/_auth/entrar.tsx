import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/entrar')({
  component: EntrarPage,
})

function EntrarPage() {
  return <Navigate to="https://app.useevolua.com.br/entrar" />
}
