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
  description = "EC2 instance type (t2.micro = free tier)"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR do seu IP para acesso SSH"
  type        = string
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
