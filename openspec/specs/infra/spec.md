# Infrastructure Domain

## Infrastructure
- **Frontend**: Vercel (app.useevolua.com.br)
- **Landing**: Vercel (useevolua.com.br)
- **API**: Render web service (api.useevolua.com.br)
- **AI Service**: Render web service (ai.useevolua.com.br)
- **Database**: Supabase Postgres (sa-east-1)
- **Terraform**: AWS infra (state remote S3 + DynamoDB pending)
- **CI/CD**: GitHub Actions with manual gate for production

## Current Gaps
- **CSP fix not deployed**: landing-core/vercel.json fix pushed but Vercel hasn't redeployed
- **Terraform state remote**: Code ready in `terraform/bootstrap/`, apply not done
- **Backup automation**: `pg-backup.yml` workflow not deployed
- **Dev/prod Supabase**: Not yet separated
- **WhatsApp not paired**: Evolution instance exists, QR never scanned
- **HMAC webhook**: Not enforced in production
- **Credential rotation**: Not executed (documented in CREDENTIAL-ROTATION.md)
