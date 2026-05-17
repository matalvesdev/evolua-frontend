# ─────────────────────────────────────────────────────────────────────────
# Bootstrap do backend remoto Terraform.
#
# Cria S3 (state) + DynamoDB (lock) usando tfstate LOCAL.
# Roda UMA VEZ. Depois disso, este módulo se autogerencia normalmente.
#
# Uso:
#   cd terraform/bootstrap
#   terraform init
#   terraform apply
#
# Em seguida:
#   - Atualizar terraform/main.tf com o bloco `backend "s3"` (já incluso, comentado)
#   - cd terraform && terraform init -migrate-state
# ─────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "Evolua CRM"
      Environment = "shared"
      ManagedBy   = "Terraform"
      Purpose     = "tfstate-backend"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "sa-east-1"
}

variable "state_bucket_name" {
  type        = string
  description = "Nome global do bucket (precisa ser único na AWS)"
  default     = "evolua-terraform-state"
}

variable "lock_table_name" {
  type    = string
  default = "evolua-terraform-locks"
}

# ── Bucket de state ──────────────────────────────────────────────────────
resource "aws_s3_bucket" "tfstate" {
  bucket        = var.state_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# ── Tabela de lock ───────────────────────────────────────────────────────
# PAY_PER_REQUEST + free tier: 25 RCU/WCU + 25GB grátis FOREVER (não expira).
# Locks são objetos efêmeros < 1KB → custo zero.
resource "aws_dynamodb_table" "tflock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  # PITR custaria ~$0.20/GB/mês. Locks são throwaway, não precisa.
  point_in_time_recovery {
    enabled = false
  }
}

output "bucket" {
  value = aws_s3_bucket.tfstate.id
}

output "lock_table" {
  value = aws_dynamodb_table.tflock.id
}

output "backend_block" {
  value = <<-EOT
    Adicione em terraform/main.tf:

    terraform {
      backend "s3" {
        bucket         = "${aws_s3_bucket.tfstate.id}"
        key            = "evolua/prod/terraform.tfstate"
        region         = "${var.aws_region}"
        dynamodb_table = "${aws_dynamodb_table.tflock.id}"
        encrypt        = true
      }
    }

    Depois rode:
      cd terraform && terraform init -migrate-state
  EOT
}
