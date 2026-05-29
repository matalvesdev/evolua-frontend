import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'

export const Route = createFileRoute('/dashboard/configuracoes')({
  component: ConfiguracoesPage,
})

type Section = 'clinica' | 'notificacoes' | 'ia' | 'pagamentos' | 'privacidade'

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id:'clinica',       label:'Clínica',         icon:'local_hospital' },
  { id:'notificacoes',  label:'Notificações',     icon:'notifications'  },
  { id:'ia',            label:'IA & Automações',  icon:'auto_awesome'   },
  { id:'pagamentos',    label:'Pagamentos',        icon:'payments'       },
  { id:'privacidade',   label:'Privacidade',       icon:'lock'           },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-olive' : 'bg-surface-high'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border-soft last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-tertiary mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function ConfiguracoesPage() {
  const [section, setSection] = useState<Section>('clinica')
  const [toast, setToast]     = useState('')
  const { data: settings, isLoading, isError } = useSettings()
  const updateSettings = useUpdateSettings()

  // Estados de configuração (inicializados a partir da query)
  const [clinicName, setClinicName]       = useState(settings?.clinicName ?? '')
  const [clinicPhone, setClinicPhone]     = useState(settings?.clinicPhone ?? '')
  const [clinicAddress, setClinicAddress] = useState(settings?.clinicAddress ?? '')
  const [sessionDuration, setSessionDuration] = useState(String(settings?.sessionDuration ?? '50'))

  const [notifSessao, setNotifSessao]     = useState(settings?.notifSessao ?? true)
  const [notifReport, setNotifReport]     = useState(settings?.notifReport ?? true)
  const [notifPagamento, setNotifPagamento] = useState(settings?.notifPagamento ?? false)
  const [notifWhatsapp, setNotifWhatsapp] = useState(settings?.notifWhatsapp ?? true)
  const [notifEmail, setNotifEmail]       = useState(settings?.notifEmail ?? false)

  const [iaTranscricao, setIaTranscricao] = useState(settings?.iaTranscricao ?? true)
  const [iaRelatorio, setIaRelatorio]     = useState(settings?.iaRelatorio ?? true)
  const [iaLembrete, setIaLembrete]       = useState(settings?.iaLembrete ?? true)
  const [iaSugestao, setIaSugestao]       = useState(settings?.iaSugestao ?? false)

  const [pixKey, setPixKey]               = useState(settings?.pixKey ?? '')
  const [cobAutomatica, setCobAutomatica] = useState(settings?.cobAutomatica ?? false)

  const [lgpd, setLgpd]                   = useState(settings?.lgpd ?? true)
  const [analytics, setAnalytics]         = useState(settings?.analytics ?? true)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-olive border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-tertiary">Carregando configurações...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="card p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-3xl text-error">error</span>
            <p className="text-sm font-bold text-text-primary">Erro ao carregar configurações</p>
            <p className="text-xs text-text-tertiary">Tente novamente mais tarde.</p>
          </div>
        </div>
      </div>
    )
  }

  function showToast(msg = 'Configurações salvas!') {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleSave() {
    updateSettings.mutate({
      clinicName, clinicPhone, clinicAddress,
      sessionDuration: Number(sessionDuration),
      notifSessao, notifReport, notifPagamento, notifWhatsapp, notifEmail,
      iaTranscricao, iaRelatorio, iaLembrete, iaSugestao,
      pixKey, cobAutomatica, lgpd, analytics,
    })
    showToast()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-dark text-neon shadow-[var(--shadow-dark)] text-sm font-bold">
          <span className="material-symbols-outlined text-base" style={{fontVariationSettings:'"FILL" 1'}}>check_circle</span>
          {toast}
        </div>
      )}

      <div>
        <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Configurações</h1>
        <p className="text-sm text-text-secondary mt-0.5">Personalize seu ambiente de trabalho</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar de navegação */}
        <div className="card p-2 flex flex-col gap-1 lg:h-fit">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold transition-colors text-left ${
                section === s.id
                  ? 'bg-dark text-neon'
                  : 'text-text-secondary hover:bg-surface-low hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:`"FILL" ${section === s.id ? 1 : 0}`}}>
                {s.icon}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">

          {section === 'clinica' && (
            <div className="card p-6 flex flex-col gap-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">Dados da Clínica</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1.5">Nome da clínica</label>
                  <input value={clinicName} onChange={e => setClinicName(e.target.value)} className="input w-full" />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Telefone</label>
                  <input value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} className="input w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="section-label block mb-1.5">Endereço</label>
                  <input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} className="input w-full" />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Duração padrão da sessão (min)</label>
                  <select value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} className="input w-full">
                    {['30','45','50','60'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-1.5">Fuso horário</label>
                  <select className="input w-full">
                    <option>America/Sao_Paulo (GMT-3)</option>
                    <option>America/Manaus (GMT-4)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary">Salvar alterações</button>
              </div>
            </div>
          )}

          {section === 'notificacoes' && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary mb-4">Notificações</h2>
              <SettingRow label="Lembrete de sessão" description="Notificar antes de cada sessão iniciar">
                <Toggle checked={notifSessao} onChange={setNotifSessao} />
              </SettingRow>
              <SettingRow label="Relatório pendente" description="Avisar quando houver relatórios aguardando revisão">
                <Toggle checked={notifReport} onChange={setNotifReport} />
              </SettingRow>
              <SettingRow label="Cobrança pendente" description="Notificar sobre pagamentos vencidos">
                <Toggle checked={notifPagamento} onChange={setNotifPagamento} />
              </SettingRow>
              <SettingRow label="WhatsApp automático" description="Enviar lembretes de sessão aos pacientes via WhatsApp">
                <Toggle checked={notifWhatsapp} onChange={setNotifWhatsapp} />
              </SettingRow>
              <SettingRow label="Resumo por e-mail" description="Receber resumo semanal de atividades por e-mail">
                <Toggle checked={notifEmail} onChange={setNotifEmail} />
              </SettingRow>
              <div className="flex justify-end pt-4 border-t border-border-soft mt-4">
                <button onClick={handleSave} className="btn-primary">Salvar</button>
              </div>
            </div>
          )}

          {section === 'ia' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">IA & Automações</h2>
                <span className="text-[9px] font-bold uppercase tracking-wide text-olive bg-neon-surface px-2 py-0.5 rounded">Beta</span>
              </div>
              <SettingRow label="Transcrição automática" description="Transcrever o áudio da sessão em tempo real com IA">
                <Toggle checked={iaTranscricao} onChange={setIaTranscricao} />
              </SettingRow>
              <SettingRow label="Geração de relatório" description="Gerar relatório clínico automaticamente após cada sessão">
                <Toggle checked={iaRelatorio} onChange={setIaRelatorio} />
              </SettingRow>
              <SettingRow label="Lembretes inteligentes" description="IA sugere lembretes com base nos padrões da agenda">
                <Toggle checked={iaLembrete} onChange={setIaLembrete} />
              </SettingRow>
              <SettingRow label="Sugestões clínicas" description="Receber sugestões de condutas baseadas na evolução do paciente">
                <Toggle checked={iaSugestao} onChange={setIaSugestao} />
              </SettingRow>
              <div className="flex justify-end pt-4 border-t border-border-soft mt-4">
                <button onClick={handleSave} className="btn-primary">Salvar</button>
              </div>
            </div>
          )}

          {section === 'pagamentos' && (
            <div className="card p-6 flex flex-col gap-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">Pagamentos</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="section-label block mb-1.5">Chave PIX</label>
                  <input value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" className="input w-full" />
                </div>
                <SettingRow label="Cobrança automática" description="Gerar cobrança automaticamente após cada sessão concluída">
                  <Toggle checked={cobAutomatica} onChange={setCobAutomatica} />
                </SettingRow>
                <div>
                  <label className="section-label block mb-1.5">Valor padrão por sessão</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">R$</span>
                    <input type="number" placeholder="0,00" className="input w-full pl-8" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="btn-primary">Salvar</button>
              </div>
            </div>
          )}

          {section === 'privacidade' && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary mb-4">Privacidade & LGPD</h2>
              <SettingRow label="Conformidade LGPD" description="Manter consentimento dos pacientes registrado conforme a LGPD">
                <Toggle checked={lgpd} onChange={setLgpd} />
              </SettingRow>
              <SettingRow label="Análise de uso" description="Compartilhar dados de uso anônimos para melhorar o sistema">
                <Toggle checked={analytics} onChange={setAnalytics} />
              </SettingRow>
              <div className="flex justify-end pt-4 border-t border-border-soft mt-4">
                <button onClick={handleSave} className="btn-primary">Salvar</button>
              </div>
              <div className="mt-6 p-4 bg-danger-surface rounded border border-danger/20 flex flex-col gap-3">
                <p className="text-sm font-bold text-danger">Zona de perigo</p>
                <p className="text-xs text-text-secondary">Estas ações são irreversíveis. Tenha certeza antes de prosseguir.</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 border border-danger/40 text-danger text-xs font-bold rounded hover:bg-danger/10 transition-colors">
                    Exportar todos os dados
                  </button>
                  <button className="px-4 py-2 border border-danger text-danger text-xs font-bold rounded hover:bg-danger hover:text-white transition-colors">
                    Excluir conta
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
