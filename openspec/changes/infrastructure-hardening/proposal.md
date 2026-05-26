# Infrastructure Hardening

## Why
Several infrastructure items are incomplete: Terraform state not applied, WhatsApp not paired, credential rotation not executed, backups not automated.

## What
- Execute Terraform state migration (S3 + DynamoDB)
- Pair WhatsApp Evolution instance
- Automate pg_backup workflow
- Document credential rotation execution steps
- Trigger CSP fix deployment via Vercel

## Non-Goals
- Full production migration
- Multi-region deployment
