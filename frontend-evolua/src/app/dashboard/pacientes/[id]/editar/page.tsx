"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { usePatient, usePatientMutations } from "@/hooks"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getInitials } from "@/components/patients/patient-utils"

interface EditPatientPageProps {
  params: Promise<{ id: string }>
}

const NAV_TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/pacientes", label: "Pacientes" },
  { href: "/dashboard/agendamentos", label: "Agenda" },
  { href: "/dashboard/financeiro", label: "Financeiro" },
  { href: "/dashboard/relatorios", label: "Relatórios" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
]

const editPatientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string()
    .refine((v) => !v || /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(v.replace(/\s/g, "")), { message: "Telefone inválido" })
    .optional().or(z.literal("")),
  birthDate: z.string().optional(),
  cpf: z.string()
    .refine((v) => !v || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v), { message: "CPF inválido" })
    .optional().or(z.literal("")),
  guardianName: z.string().optional(),
  guardianPhone: z.string()
    .refine((v) => !v || /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(v.replace(/\s/g, "")), { message: "Telefone inválido" })
    .optional().or(z.literal("")),
  guardianRelationship: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string()
      .refine((v) => !v || /^[\d]+[a-zA-Z]?$/.test(v.trim()), { message: "Número inválido" })
      .optional().or(z.literal("")),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string()
      .refine((v) => !v || /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v.trim()), { message: "Cidade inválida" })
      .optional().or(z.literal("")),
    state: z.string().optional(),
    zipCode: z.string()
      .refine((v) => !v || /^\d{5}-?\d{3}$/.test(v.replace(/\s/g, "")), { message: "CEP inválido" })
      .optional().or(z.literal("")),
  }).optional(),
  medicalHistory: z.object({
    diagnosis: z.string().optional(),
    specialty: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
})

type EditPatientFormValues = z.infer<typeof editPatientSchema>

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function maskNumber(value: string): string {
  return value.replace(/[^0-9a-zA-Z]/g, "")
}

const pillInput = "w-full rounded-full border border-gray-200 py-3 px-5 bg-white text-sm transition-all focus:border-[#8A05BE] focus:ring-1 focus:ring-[#8A05BE] outline-none"
const pillSelect = "w-full rounded-full border border-gray-200 py-3 px-5 bg-white text-sm text-gray-700 appearance-none cursor-pointer focus:border-[#8A05BE] focus:ring-1 focus:ring-[#8A05BE] outline-none"

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const { patient, loading } = usePatient(id)
  const { updatePatient, isUpdating } = usePatientMutations()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const form = useForm<EditPatientFormValues>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      name: "", email: "", phone: "", birthDate: "", cpf: "",
      guardianName: "", guardianPhone: "", guardianRelationship: "",
      address: { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" },
      medicalHistory: { diagnosis: "", specialty: "", notes: "" },
    },
  })

  useEffect(() => {
    if (patient) {
      const addr = patient.address
      form.reset({
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        birthDate: patient.birthDate ? patient.birthDate.split("T")[0] : "",
        cpf: patient.cpf || "",
        guardianName: patient.guardianName || "",
        guardianPhone: patient.guardianPhone || "",
        guardianRelationship: patient.guardianRelationship || "",
        address: {
          street: addr?.street || "", number: addr?.number || "",
          complement: addr?.complement || "", neighborhood: addr?.neighborhood || "",
          city: addr?.city || "", state: addr?.state || "", zipCode: addr?.zipCode || "",
        },
        medicalHistory: {
          diagnosis: patient.medicalHistory?.diagnosis?.[0] || "",
          specialty: patient.medicalHistory?.diagnosis?.[1] || "",
          notes: patient.medicalHistory?.notes || "",
        },
      })
      // Initialize tags from allergies + medications
      const initialTags: string[] = []
      patient.medicalHistory?.allergies?.forEach(a => initialTags.push(`Alergia: ${a}`))
      patient.medicalHistory?.medications?.forEach(m => initialTags.push(m))
      setTags(initialTags)
    }
  }, [patient, form])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: EditPatientFormValues) => {
    setError(null)
    setSaved(false)
    try {
      const addr = values.address
      const hasAddress = addr && Object.values(addr).some((v) => v && v.trim())
      await updatePatient({
        id,
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        birthDate: values.birthDate || undefined,
        cpf: values.cpf || undefined,
        guardianName: values.guardianName || undefined,
        guardianPhone: values.guardianPhone || undefined,
        guardianRelationship: values.guardianRelationship || undefined,
        address: hasAddress ? addr : undefined,
        medicalHistory: values.medicalHistory?.notes ? { notes: values.medicalHistory.notes } : undefined,
      })
      setSaved(true)
      setTimeout(() => router.push(`/dashboard/pacientes/${id}`), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar paciente")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-[#8A05BE] text-3xl">progress_activity</span>
      </div>
    )
  }

  const patientName = form.watch("name") as string | undefined
  const initials = getInitials(patientName || "?")

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="px-6 lg:px-10 bg-transparent mb-6 hidden md:block">
        <div className="flex items-center justify-center gap-8">
          {NAV_TABS.map((item) => {
            const isActive = item.href === "/dashboard/pacientes"
              ? pathname.startsWith("/dashboard/pacientes")
              : item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive ? "border-[#8A05BE] text-gray-900" : "border-transparent text-gray-500 hover:text-[#8A05BE] hover:border-[#8A05BE]/30"
                }`}
              >{item.label}</Link>
            )
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth pb-24">
        <div className="max-w-[1000px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
            <Link href={`/dashboard/pacientes/${id}`} className="hover:text-[#8A05BE] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>Voltar
            </Link>
            <span>/</span>
            <span>Pacientes</span>
            <span>/</span>
            <span>{patientName}</span>
            <span>/</span>
            <span className="text-[#8A05BE] font-medium">Editar Perfil</span>
          </div>

          {/* Main Form Card */}
          <div className="glass-panel rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] overflow-hidden relative mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-100 to-transparent rounded-bl-full opacity-40 pointer-events-none" />

            <div className="p-6 md:p-8 lg:p-10 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editar Perfil do Paciente</h1>
                  <p className="text-sm text-gray-500 mt-1">Atualize as informações cadastrais e clínicas de {patientName}.</p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border-4 border-white shadow-sm">
                    {initials}
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  {/* Dados Básicos */}
                  <section>
                    <SectionTitle icon="badge" label="Dados Básicos" />
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Photo upload */}
                      <div className="md:col-span-3 flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                          <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-[#8A05BE] transition-colors flex items-center justify-center">
                            <div className="text-center p-2">
                              <span className="material-symbols-outlined text-gray-400 text-3xl group-hover:text-[#8A05BE] transition-colors">add_a_photo</span>
                              <p className="text-xs text-gray-400 mt-1 group-hover:text-[#8A05BE]">Alterar foto</p>
                            </div>
                          </div>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">Recomendado: 400x400px</p>
                      </div>

                      <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Nome Completo</FormLabel>
                              <FormControl><input className={pillInput} placeholder="Ex: Pedro Henrique da Silva" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Data de Nascimento</FormLabel>
                            <FormControl><input type="date" className={pillInput} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 pl-1">Gênero</label>
                          <select className={pillSelect}>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Informações Clínicas */}
                  <section>
                    <SectionTitle icon="medical_services" label="Informações Clínicas" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="medicalHistory.diagnosis" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Diagnóstico Principal</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <select className={pillSelect} {...field}>
                                <option value="">Selecione</option>
                                <option value="TEA Nível 1">TEA Nível 1</option>
                                <option value="TEA Nível 2">TEA Nível 2</option>
                                <option value="TEA Nível 3">TEA Nível 3</option>
                                <option value="TDAH">TDAH</option>
                                <option value="Atraso na Fala">Atraso na Fala</option>
                                <option value="Apraxia de Fala">Apraxia de Fala</option>
                                <option value="Outro">Outro</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="medicalHistory.specialty" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Especialidade</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <select className={pillSelect} {...field}>
                                <option value="">Selecione</option>
                                <option value="Linguagem">Linguagem</option>
                                <option value="Motricidade Orofacial">Motricidade Orofacial</option>
                                <option value="Voz">Voz</option>
                                <option value="Audiologia">Audiologia</option>
                                <option value="Disfagia">Disfagia</option>
                                <option value="Processamento Auditivo">Processamento Auditivo</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </section>

                  {/* Responsável Legal */}
                  <section>
                    <SectionTitle icon="family_restroom" label="Responsável Legal" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="guardianName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Nome do Responsável</FormLabel>
                            <FormControl><input className={pillInput} placeholder="Nome completo do responsável" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="guardianRelationship" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Parentesco</FormLabel>
                          <FormControl>
                            <select className={pillSelect} {...field}>
                              <option value="">Selecione</option>
                              <option value="Mãe">Mãe</option>
                              <option value="Pai">Pai</option>
                              <option value="Avó/Avô">Avó/Avô</option>
                              <option value="Tio/Tia">Tio/Tia</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cpf" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">CPF</FormLabel>
                          <FormControl><input className={pillInput} placeholder="000.000.000-00" inputMode="numeric" {...field} onChange={(e) => field.onChange(maskCPF(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="guardianPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Telefone / WhatsApp</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                                  <span className="material-symbols-outlined text-sm">phone</span>
                                </span>
                                <input className={`${pillInput} pl-11`} placeholder="(00) 00000-0000" type="tel" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </section>

                  {/* Endereço */}
                  <section>
                    <SectionTitle icon="place" label="Endereço" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <FormField control={form.control} name="address.street" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Rua</FormLabel>
                            <FormControl><input className={pillInput} placeholder="Nome da rua" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="address.number" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Número</FormLabel>
                          <FormControl><input className={pillInput} placeholder="123" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="address.complement" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Complemento</FormLabel>
                            <FormControl><input className={pillInput} placeholder="Apto, Bloco, etc." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="address.neighborhood" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Bairro</FormLabel>
                          <FormControl><input className={pillInput} placeholder="Bairro" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="address.city" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-2 pl-1">Cidade</FormLabel>
                            <FormControl><input className={pillInput} placeholder="Cidade" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </section>

                  {/* Histórico Rápido (Tags) */}
                  <section>
                    <SectionTitle icon="label" label="Histórico Rápido (Tags)" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 pl-1">Condições e Alertas</label>
                      <div className="flex flex-wrap gap-2 min-h-[50px] border border-gray-200 rounded-2xl px-4 py-3 bg-white focus-within:ring-1 focus-within:ring-[#8A05BE] focus-within:border-[#8A05BE] transition-all">
                        {tags.map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200">
                            {tag}
                            <button type="button" onClick={() => removeTag(i)} className="ml-1 text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          className="flex-1 bg-transparent outline-none min-w-[120px] text-sm p-1 text-gray-700 placeholder-gray-400"
                          placeholder="Digite e pressione Enter..."
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 pl-1">Adicione palavras-chave importantes para visualização rápida no perfil.</p>
                    </div>
                  </section>

                  {/* Error / Success */}
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <span className="material-symbols-outlined text-red-500">error</span>
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}
                  {saved && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                      <p className="text-sm text-green-700 font-medium">Paciente atualizado com sucesso! Redirecionando...</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#8A05BE] text-white font-bold hover:bg-[#6D08AF] shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Salvando...</>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-200 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
              <p>© {new Date().getFullYear()} Evolua Premium. Uso exclusivo.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-[#8A05BE] transition-colors">Suporte Prioritário</a>
                <a href="#" className="hover:text-[#8A05BE] transition-colors">Privacidade</a>
                <a href="#" className="hover:text-[#8A05BE] transition-colors">Termos</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  )
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <h3 className="text-sm uppercase tracking-wide font-bold text-gray-400 mb-5 flex items-center gap-2">
      <span className="material-symbols-outlined text-[#8A05BE] text-base">{icon}</span>
      {label}
    </h3>
  )
}
