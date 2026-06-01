-- =============================================================================
-- 20260531000001_add_templates_automations_scales.sql
-- Novos modelos: DocumentTemplate, WhatsAppAutomation, ClinicalScale/Result
-- =============================================================================

-- =============================================================================
-- A. Document Templates
-- =============================================================================

create table if not exists public.document_templates (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid references public.clinics(id) on delete set null,
  title      text not null,
  type       text not null check (type in ('laudo', 'encaminhamento', 'parecer', 'atestado')),
  subtype    text,
  content    text not null,
  is_system  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_document_templates_clinic_type on public.document_templates(clinic_id, type);
create index idx_document_templates_type_subtype on public.document_templates(type, subtype);

-- Seed: 9 system templates (4 laudos + 5 encaminhamentos)

insert into public.document_templates (title, type, subtype, content, is_system) values
-- Laudos
('Alta', 'laudo', 'alta',
 'Paciente: {{patientName}}\n'
 || 'CRFA: {{therapistCrfa}}\n\n'
 || 'Data de alta: {{date}}\n\n'
 || '{{patientName}}, {{patientAge}} anos, esteve em acompanhamento fonoaudiológico desde {{startDate}}. '
 || 'Apresentou evolução satisfatória dos aspectos trabalhados, atingindo os objetivos propostos no plano terapêutico. '
 || 'Recebe alta fonoaudiológica com orientações de manutenção.\n\n'
 || '{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Evolução', 'laudo', 'evolucao',
 'Paciente: {{patientName}}\n'
 || 'CRFA: {{therapistCrfa}}\n\n'
 || 'Data: {{date}}\n\n'
 || 'Sessão nº {{sessionNumber}}\n\n'
 || 'Paciente compareceu à sessão de terapia fonoaudiológica. {{patientName}} apresentou {{statusDescription}}. '
 || 'Foram realizadas atividades de {{activities}} com duração de {{duration}} minutos.\n\n'
 || 'Conduta: manutenção da frequência e continuidade das atividades propostas.\n\n'
 || '{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Parecer Fonoaudiológico', 'laudo', 'parecer',
 'Paciente: {{patientName}}\n'
 || 'CRFA: {{therapistCrfa}}\n\n'
 || 'Data: {{date}}\n\n'
 || 'Solicitante: {{requester}}\n\n'
 || 'Motivo: {{reason}}\n\n'
 || 'Após avaliação fonoaudiológica realizada em {{evaluationDate}}, conclui-se que {{patientName}} '
 || 'apresenta {{diagnosis}}, necessitando de acompanhamento fonoaudiológico com frequência {{frequency}}.\n\n'
 || '{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Avaliação', 'laudo', 'avaliacao',
 'Paciente: {{patientName}}\n'
 || 'CRFA: {{therapistCrfa}}\n\n'
 || 'Data da avaliação: {{date}}\n\n'
 || 'História clínica: {{clinicalHistory}}\n\n'
 || 'Aspectos avaliados:\n'
 || '- Linguagem: {{languageAspect}}\n'
 || '- Motricidade orofacial: {{oromyofacialAspect}}\n'
 || '- Deglutição: {{swallowingAspect}}\n'
 || '- Voz: {{voiceAspect}}\n'
 || '- Audição: {{hearingAspect}}\n\n'
 || 'Hipótese diagnóstica: {{diagnosis}}\n\n'
 || 'Conduta: {{conduct}}\n\n'
 || '{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),

-- Encaminhamentos
('Encaminhamento Escolar', 'encaminhamento', 'escola',
 'Encaminho {{patientName}}, {{patientAge}} anos, para avaliação/ acompanhamento '
 || 'especializado na área de {{area}}.\n\n'
 || 'Motivo: {{reason}}\n\n'
 || 'Atenciosamente,\n{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Encaminhamento Médico', 'encaminhamento', 'medico',
 'Prezado(a) Dr(a). {{doctorName}},\n\n'
 || 'Encaminho {{patientName}}, {{patientAge}} anos, para avaliação em {{specialty}}.\n\n'
 || 'Motivo: {{reason}}\n\n'
 || 'Atenciosamente,\n{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Encaminhamento Neuropediatra', 'encaminhamento', 'neuropediatra',
 'Prezado(a) Dr(a). {{doctorName}},\n\n'
 || 'Encaminho {{patientName}}, {{patientAge}} anos, paciente em acompanhamento fonoaudiológico desde {{startDate}}, '
 || 'para avaliação neurológica devido a {{reason}}.\n\n'
 || 'Atenciosamente,\n{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Encaminhamento Psicólogo', 'encaminhamento', 'psicologo',
 'Prezado(a) {{professionalName}},\n\n'
 || 'Encaminho {{patientName}}, {{patientAge}} anos, para acompanhamento psicológico.\n\n'
 || 'Motivo: {{reason}}\n\n'
 || 'Atenciosamente,\n{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true),
('Parecer Interdisciplinar', 'encaminhamento', 'parecer-interdisciplinar',
 'Paciente: {{patientName}}\n'
 || 'Idade: {{patientAge}}\n\n'
 || 'Equipe envolvida:\n'
 || '- Fonoaudiologia: {{therapistName}} (CRFA: {{therapistCrfa}})\n'
 || '- {{otherProfessional}}: {{otherName}}\n\n'
 || 'Este parecer tem como objetivo integrar as observações das diferentes especialidades '
 || 'que acompanham {{patientName}}, visando alinhar condutas e potencializar resultados.\n\n'
 || 'Atenciosamente,\n{{therapistName}}\nCRFA: {{therapistCrfa}}',
 true);

-- =============================================================================
-- B. WhatsApp Automations
-- =============================================================================

create table if not exists public.whatsapp_automations (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  label       text not null,
  description text,
  trigger     text not null check (trigger in ('welcome', 'appointment_reminder_24h', 'appointment_reminder_1h', 'post_session', 'inactive_30d')),
  active      boolean not null default true,
  template    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(clinic_id, trigger)
);

create index idx_whatsapp_automations_clinic_active on public.whatsapp_automations(clinic_id, active);

-- =============================================================================
-- C. Clinical Scales
-- =============================================================================

create table if not exists public.clinical_scales (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text not null check (category in ('voz', 'degluticao', 'linguagem', 'fluencia', 'audicao')),
  type        text not null check (type in ('numeric', 'categorical')),
  domain      jsonb not null default '{}',
  is_system   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_clinical_scales_category on public.clinical_scales(category);
create index idx_clinical_scales_name on public.clinical_scales(name);

create table if not exists public.clinical_scale_results (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.patients(id) on delete cascade,
  scale_id       uuid not null references public.clinical_scales(id) on delete cascade,
  therapist_id   uuid references public.users(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  score          jsonb not null default '{}',
  notes          text,
  conducted_at   timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create index idx_clinical_scale_results_patient_scale on public.clinical_scale_results(patient_id, scale_id, conducted_at);
create index idx_clinical_scale_results_patient_conducted on public.clinical_scale_results(patient_id, conducted_at desc);

-- Seed: 5 clinical scales

insert into public.clinical_scales (name, description, category, type, domain, is_system) values
(
  'GRBAS',
  'Escala GRBAS — avaliação perceptivo-auditiva da qualidade vocal. '
  || 'Classifica o grau geral (G), áspero (R), soproso (B), astênico (A) e tenso (S) em 4 níveis de severidade.',
  'voz', 'categorical',
  '{"options": ["0 - Normal", "1 - Leve", "2 - Moderado", "3 - Severo"], "dimensions": ["G - Grau geral", "R - Áspero", "B - Soproso", "A - Astênico", "S - Tenso"]}',
  true
),
(
  'VHI-10',
  'Voice Handicap Index (versão reduzida de 10 itens) — questionário autoavaliativo '
  || 'que mede o impacto do distúrbio vocal na qualidade de vida. Cada item é pontuado de 0 a 4.',
  'voz', 'numeric',
  '{"min": 0, "max": 40, "unit": "pontos", "interpretation": {"0-10": "Impacto leve", "11-20": "Impacto moderado", "21-30": "Impacto moderado a severo", "31-40": "Impacto severo"}, "items": ["Minha voz faz com que eu me sinta em desvantagem", "As pessoas têm dificuldade em me ouvir", "As pessoas me pedem para repetir o que falei", "Sinto-me tenso ao falar ao telefone", "Sou menos extrovertido por causa da minha voz", "Sinto-me excluído de conversas", "Meu problema de voz me estressa", "Evito falar ao telefone", "Minha voz soa pior no fim do dia", "Peço as pessoas para repetirem o que disseram"]}',
  true
),
(
  'DOSS',
  'Dysphagia Outcome and Severity Scale — escala funcional de deglutição '
  || 'que classifica a severidade da disfagia em 7 níveis, do normal à alimentação não oral.',
  'degluticao', 'categorical',
  '{"options": ["1 - Deglutição normal", "2 - Disfagia funcional leve", "3 - Disfagia leve", "4 - Disfagia leve a moderada", "5 - Disfagia moderada", "6 - Disfagia moderada a severa", "7 - Disfagia severa"]}',
  true
),
(
  'ABFW',
  'Teste de Linguagem Infantil ABFW — avaliação padronizada do desenvolvimento '
  || 'fonológico, vocabulário, fluência e pragmática em crianças de 2 a 12 anos.',
  'linguagem', 'categorical',
  '{"options": ["Adequado", "Leve alteração", "Moderada alteração", "Severa alteração"], "subtests": ["Fonologia", "Vocabulário", "Fluência", "Pragmática"]}',
  true
),
(
  'ASHA NOMS',
  'American Speech-Language-Hearing Association National Outcomes Measurement System — '
  || 'mede o nível funcional de comunicação e deglutição em 7 níveis.',
  'linguagem', 'categorical',
  '{"options": ["1 - Dependência total", "2 - Assistência máxima", "3 - Assistência moderada", "4 - Assistência mínima", "5 - Supervisão", "6 - Independência modificada", "7 - Independência funcional"], "domains": ["Comunicação", "Deglutição"]}',
  true
);

-- RLs policies (copiam padrão existente: leitura para usuários autenticados, escrita admin, etc.)

-- Document Templates
alter table public.document_templates enable row level security;

create policy "Document templates: select authenticated"
  on public.document_templates for select
  using (auth.role() = 'authenticated');

create policy "Document templates: insert admin"
  on public.document_templates for insert
  with check (auth.role() = 'service_role');

create policy "Document templates: update admin"
  on public.document_templates for update
  using (auth.role() = 'service_role');

create policy "Document templates: delete admin"
  on public.document_templates for delete
  using (auth.role() = 'service_role');

-- WhatsApp Automations
alter table public.whatsapp_automations enable row level security;

create policy "WhatsApp automations: select own"
  on public.whatsapp_automations for select
  using (auth.role() = 'authenticated');

create policy "WhatsApp automations: insert own"
  on public.whatsapp_automations for insert
  with check (auth.role() = 'authenticated');

create policy "WhatsApp automations: update own"
  on public.whatsapp_automations for update
  using (auth.role() = 'authenticated');

create policy "WhatsApp automations: delete own"
  on public.whatsapp_automations for delete
  using (auth.role() = 'authenticated');

-- Clinical Scales
alter table public.clinical_scales enable row level security;

create policy "Clinical scales: select authenticated"
  on public.clinical_scales for select
  using (auth.role() = 'authenticated');

-- Clinical Scale Results
alter table public.clinical_scale_results enable row level security;

create policy "Clinical scale results: select own"
  on public.clinical_scale_results for select
  using (auth.role() = 'authenticated');

create policy "Clinical scale results: insert own"
  on public.clinical_scale_results for insert
  with check (auth.role() = 'authenticated');

create policy "Clinical scale results: delete own"
  on public.clinical_scale_results for delete
  using (auth.role() = 'authenticated');
