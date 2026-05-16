# Variables - Evolua CRM (custo mínimo)

variable "aws_region" {
  description = "AWS region (sa-east-1 = São Paulo)"
  type        = string
  default     = "sa-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "evolua-crm"
}

variable "landing_domain" {
  description = "Domínio principal"
  type        = string
  default     = "useevolua.com.br"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro = free tier; t4g.micro = ARM Graviton p\u00f3s free tier)"
  type        = string
  default     = "t2.micro"
}

# Migra\u00e7\u00e3o blue/green: criar inst\u00e2ncia ARM em paralelo \u00e0 t2.micro atual.
# Quando true e instance_type_arm64 != "", cria recurso aws_instance.backend_arm.
# Ap\u00f3s cutover do EIP, definir enable_backend_v2 = false e remover bloco backend antigo.
variable "enable_backend_v2" {
  description = "Provisiona inst\u00e2ncia ARM (t4g.*) em paralelo \u00e0 t2.micro para migra\u00e7\u00e3o blue/green"
  type        = bool
  default     = false
}

variable "instance_type_arm64" {
  description = "EC2 instance type ARM (Graviton). Use t4g.micro (1GB) ou t4g.nano (0.5GB)."
  type        = string
  default     = "t4g.micro"
}

variable "root_volume_size_arm64" {
  description = "Tamanho do EBS root da inst\u00e2ncia ARM em GB (gp3)"
  type        = number
  default     = 8
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "DEPRECATED: use allowed_ssh_cidrs (lista). Mantido para retro-compat."
  type        = string
  default     = ""
}

variable "allowed_ssh_cidrs" {
  description = "Lista de CIDRs com acesso SSH direto ao backend"
  type        = list(string)
  default     = ["201.13.9.241/32", "201.93.36.190/32"]
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "database_url" {
  description = "Supabase PostgreSQL connection string (pooler)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cors_origins" {
  description = "CORS origins permitidas (URL do Vercel)"
  type        = string
  default     = "https://useevolua.com.br,https://www.useevolua.com.br,https://useevolua.online,https://www.useevolua.online"
}

variable "frontend_url" {
  description = "URL do frontend no Vercel"
  type        = string
  default     = "https://useevolua.com.br"
}
