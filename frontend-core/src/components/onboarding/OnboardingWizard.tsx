import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'

type Step = 'empresa' | 'whatsapp' | 'importar' | 'automacao' | 'upgrade'

interface StepConfig {
  id: Step
  label: string
  description: string
  icon: string
}

const STEPS: StepConfig[] = [
  { id: 'empresa', label: 'Empresa', description: 'Configure sua clínica', icon: 'business' },
  { id: 'whatsapp', label: 'WhatsApp', description: 'Conecte seu WhatsApp', icon: 'chat' },
  { id: 'importar', label: 'Importar', description: 'Importe seus contatos', icon: 'file_upload' },
  { id: 'automacao', label: 'Automação', description: 'Automatize tarefas', icon: 'auto_awesome' },
  { id: 'upgrade', label: 'Plano', description: 'Escolha seu plano', icon: 'workspace_premium' },
]

export function OnboardingWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [_loading, setLoading] = useState(false)

  const step = STEPS[currentStep]

  async function handleNext(data?: Record<string, unknown>) {
    setLoading(true)
    try {
      await api.post(`/api/onboarding/${step.id}`, { data, completed: true })
      setCompleted(prev => new Set(prev).add(step.id))
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(curr => curr + 1)
      } else {
        await api.post('/api/onboarding/complete', {})
        navigate({ to: '/dashboard' })
      }
    } catch {
      // error handled by parent
    }
    setLoading(false)
  }

  function skip() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1)
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= currentStep ? 'bg-primary text-white' : 'bg-surface-high text-text-tertiary'
                }`}>
                  {completed.has(s.id) ? (
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= currentStep ? 'text-text-primary' : 'text-text-tertiary'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-surface border border-border p-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>{step.icon}</span>
          </div>
          <h2 className="font-display font-bold text-xl text-text-primary mb-2">
            {step.label}
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            {step.description}
          </p>

          {/* Dynamic step content */}
          {currentStep === 0 && <EmpresaStep onNext={handleNext} />}
          {currentStep === 1 && <WhatsAppStep onNext={handleNext} />}
          {currentStep === 2 && <ImportarStep onNext={handleNext} />}
          {currentStep === 3 && <AutomacaoStep onNext={handleNext} />}
          {currentStep === 4 && <UpgradeStep onNext={handleNext} />}

          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <button onClick={skip} className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
              {currentStep < STEPS.length - 1 ? 'Pular' : 'Ir para o dashboard'}
            </button>
            <p className="text-xs text-text-tertiary">
              Passo {currentStep + 1} de {STEPS.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmpresaStep({ onNext }: { onNext: (data?: Record<string, unknown>) => Promise<void> }) {
  const [nome, setNome] = useState('')
  const [especialidade, setEspecialidade] = useState('')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-text-primary mb-1">Nome da clínica</label>
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          placeholder="Minha Clínica de Fonoaudiologia"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-text-primary mb-1">Especialidade principal</label>
        <select
          value={especialidade}
          onChange={e => setEspecialidade(e.target.value)}
          className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">Selecione</option>
          <option value="voz">Voz</option>
          <option value="disfagia">Disfagia</option>
          <option value="linguagem-infantil">Linguagem Infantil</option>
          <option value="linguagem-adulto">Linguagem Adulto</option>
          <option value="motricidade">Motricidade Orofacial</option>
          <option value="audicao">Audição</option>
        </select>
      </div>
      <button
        onClick={() => onNext({ nome, especialidade })}
        className="w-full bg-deep text-neon py-3 text-sm font-bold hover:bg-ink transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

function WhatsAppStep({ onNext }: { onNext: (data?: Record<string, unknown>) => Promise<void> }) {
  return (
    <div className="space-y-4">
      <div className="bg-info-surface border border-info/20 p-4 text-sm text-info">
        <p className="font-bold mb-1">Conecte seu WhatsApp</p>
        <p className="text-xs">Escaneie o QR code abaixo com o WhatsApp do seu celular para começar a enviar lembretes e mensagens automáticas.</p>
      </div>
      <div className="flex justify-center py-4">
        <div className="w-48 h-48 bg-surface-high border border-border flex items-center justify-center">
          <span className="text-xs text-text-tertiary">QR Code</span>
        </div>
      </div>
      <button
        onClick={() => onNext()}
        className="w-full bg-deep text-neon py-3 text-sm font-bold hover:bg-ink transition-colors"
      >
        Já conectei, continuar
      </button>
    </div>
  )
}

function ImportarStep({ onNext }: { onNext: (data?: Record<string, unknown>) => Promise<void> }) {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-3xl text-text-tertiary mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>file_upload</span>
        <p className="text-sm text-text-secondary">Arraste seu CSV de pacientes aqui</p>
        <p className="text-xs text-text-tertiary mt-1">ou clique para selecionar</p>
      </div>
      <p className="text-xs text-text-tertiary text-center">
        Formato esperado: nome, telefone, email, observações
      </p>
      <button
        onClick={() => onNext()}
        className="w-full bg-deep text-neon py-3 text-sm font-bold hover:bg-ink transition-colors"
      >
        Pular importação
      </button>
    </div>
  )
}

function AutomacaoStep({ onNext }: { onNext: (data?: Record<string, unknown>) => Promise<void> }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 p-3 border border-border hover:border-primary/50 transition-colors cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
          <div>
            <p className="text-sm font-bold text-text-primary">Lembrete de consulta</p>
            <p className="text-xs text-text-secondary">Envia WhatsApp automático 24h antes</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border border-border hover:border-primary/50 transition-colors cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
          <div>
            <p className="text-sm font-bold text-text-primary">Confirmação de presença</p>
            <p className="text-xs text-text-secondary">Paciente confirma com 1 clique</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border border-border hover:border-primary/50 transition-colors cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
          <div>
            <p className="text-sm font-bold text-text-primary">Relatório pós-sessão</p>
            <p className="text-xs text-text-secondary">IA gera rascunho automaticamente</p>
          </div>
        </label>
      </div>
      <button
        onClick={() => onNext()}
        className="w-full bg-deep text-neon py-3 text-sm font-bold hover:bg-ink transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

function UpgradeStep({ onNext }: { onNext: (data?: Record<string, unknown>) => Promise<void> }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Seu teste grátis de 14 dias está ativo. Escolha o plano ideal para sua clínica quando quiser.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border p-4 hover:border-primary transition-colors cursor-pointer">
          <p className="text-xs font-bold text-text-primary">Só Você</p>
          <p className="text-lg font-display font-bold text-text-primary mt-1">R$ 97</p>
          <p className="text-xs text-text-tertiary">/mês</p>
        </div>
        <div className="border-2 border-primary p-4 bg-primary/5 cursor-pointer">
          <p className="text-xs font-bold text-primary">Galera</p>
          <p className="text-lg font-display font-bold text-primary mt-1">R$ 197</p>
          <p className="text-xs text-text-tertiary">/mês</p>
        </div>
      </div>
      <button
        onClick={() => onNext()}
        className="w-full bg-deep text-neon py-3 text-sm font-bold hover:bg-ink transition-colors"
      >
        Continuar de graça
      </button>
    </div>
  )
}
