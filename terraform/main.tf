# Evolua CRM - Infraestrutura AWS (custo mínimo)
# Backend NestJS no EC2 t2.micro (free tier)
# DNS gerenciado externamente (HostGator)
# Frontend -> Vercel (gratuito, fora da AWS)

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ── State remoto S3 + lock DynamoDB ────────────────────────────────────
  # Pré-requisito: rodar `terraform/bootstrap` UMA VEZ para criar bucket + tabela.
  # Migração inicial do state local: `terraform init -migrate-state`.
  backend "s3" {
    bucket         = "evolua-terraform-state"
    key            = "evolua/prod/terraform.tfstate"
    region         = "sa-east-1"
    dynamodb_table = "evolua-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Evolua CRM"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# AMI ARM64 para inst\u00e2ncias Graviton (t4g.*)
data "aws_ami" "ubuntu_arm64" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}
