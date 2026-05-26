# Tasks — Infrastructure Hardening

## Terraform
- [ ] Run `terraform apply` in `terraform/bootstrap/`
- [ ] Verify state migration to S3 + DynamoDB
- [ ] Document new state backend in CREDENTIAL-ROTATION.md

## WhatsApp
- [ ] Start Evolution API stack via docker-compose
- [ ] Scan QR code from manager UI
- [ ] Enable HMAC webhook secret
- [ ] Test message send/receive

## Deployments
- [ ] Trigger Vercel deploy for landing-core (CSP fix)
- [ ] Verify CSP headers on production landing
- [ ] Verify Render deploys for API + AI service

## Backups
- [ ] Enable pg-backup.yml workflow in GitHub Actions
- [ ] Test backup restore process
- [ ] Document in runbook
