import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/cadastro')({
  component: CadastroPage,
})

function CadastroPage() {
  return <Navigate to="https://app.useevolua.com.br/cadastro" />
}
