# ─────────────────────────────────────────────────────────────────────────
# Postgres backup pipeline.
#
# - Bucket S3 com versioning + lifecycle (Glacier após 30d, expira em 365d)
# - IAM user de backup (key/secret) usado pelo workflow GitHub Actions
# - Restrição: somente PutObject + ListBucket no próprio bucket
# ─────────────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "pg_backups" {
  bucket = "evolua-pg-backups-${var.aws_region}"
}

resource "aws_s3_bucket_versioning" "pg_backups" {
  bucket = aws_s3_bucket.pg_backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "pg_backups" {
  bucket = aws_s3_bucket.pg_backups.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "pg_backups" {
  bucket                  = aws_s3_bucket.pg_backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "pg_backups" {
  bucket = aws_s3_bucket.pg_backups.id

  rule {
    id     = "tier-and-expire"
    status = "Enabled"
    filter {}

    # STANDARD → DEEP_ARCHIVE (mais barato que Glacier: ~$0.001/GB/mês).
    # Recuperação 12h é OK pra DR; pra dia-a-dia usamos Supabase PITR.
    transition {
      days          = 7
      storage_class = "DEEP_ARCHIVE"
    }

    # 90 dias mantém ~3 meses de histórico em ~150MB (50MB × 3 cópias quentes).
    # Free tier S3 = 5GB → ficamos 30× abaixo do limite.
    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

# ── IAM user dedicado para CI ────────────────────────────────────────────
resource "aws_iam_user" "pg_backup" {
  name = "evolua-pg-backup-ci"
}

resource "aws_iam_access_key" "pg_backup" {
  user = aws_iam_user.pg_backup.name
}

data "aws_iam_policy_document" "pg_backup" {
  statement {
    sid       = "WriteBackups"
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:AbortMultipartUpload"]
    resources = ["${aws_s3_bucket.pg_backups.arn}/*"]
  }
  statement {
    sid       = "ListBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket", "s3:GetBucketLocation"]
    resources = [aws_s3_bucket.pg_backups.arn]
  }
}

resource "aws_iam_user_policy" "pg_backup" {
  name   = "pg-backup-write"
  user   = aws_iam_user.pg_backup.name
  policy = data.aws_iam_policy_document.pg_backup.json
}

output "pg_backup_bucket" {
  value = aws_s3_bucket.pg_backups.id
}

output "pg_backup_aws_access_key_id" {
  value     = aws_iam_access_key.pg_backup.id
  sensitive = true
}

output "pg_backup_aws_secret_access_key" {
  value     = aws_iam_access_key.pg_backup.secret
  sensitive = true
}
