import { useState, type ChangeEvent, type FormEvent } from 'react'
import { z, type ZodTypeAny } from 'zod'

type Status = 'idle' | 'loading' | 'success' | 'error'

export const leadSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  cidade: z.string().optional(),
  pacientesMes: z.string().optional(),
  comoConheceu: z.string().optional(),
})

export type LeadData = z.infer<typeof leadSchema>

type FieldErrors<T> = Partial<Record<keyof T, string>>

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  schema?: ZodTypeAny,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldErrors<T>>({})
  const [errorMessage, setErrorMessage] = useState<string>('')

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setErrorMessage('')

    // Validate with Zod if schema provided
    if (schema) {
      const result = schema.safeParse(values)
      if (!result.success) {
        const fieldErrors: FieldErrors<T> = {}
        const issues = (result.error as { issues?: Array<{ path: (string | number)[]; message: string }> }).issues ?? []
        issues.forEach((issue) => {
          const field = issue.path[0] as keyof T
          if (field) fieldErrors[field] = issue.message
        })
        setErrors(fieldErrors)
        return
      }
    }

    setStatus('loading')

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${apiUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        throw new Error(`Erro ${res.status}`)
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error && err.message.startsWith('Erro')
          ? 'Algo deu errado. Tente novamente em instantes.'
          : 'Sem conexão. Verifique sua internet e tente novamente.',
      )
    }
  }

  function reset() {
    setValues(initialValues)
    setStatus('idle')
    setErrors({})
    setErrorMessage('')
  }

  return { values, handleChange, handleSubmit, reset, status, errors, errorMessage }
}
