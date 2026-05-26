# Design — Infrastructure Hardening

## Terraform State Migration
1. Navigate to `terraform/bootstrap/`
2. Run `terraform init` with S3 backend config
3. Run `terraform apply` to create S3 bucket + DynamoDB table
4. Run `terraform init -reconfigure` to migrate state to S3

## WhatsApp Pairing
1. Start Evolution API docker-compose
2. Access manager at http://localhost:8080/manager
3. Generate QR code for instance `evolua`
4. Scan with WhatsApp app
5. Enable HMAC webhook verification

## CSP Fix Deployment
1. The fix is in `landing-core/vercel.json` (commit dfbe62a)
2. If auto-deploy didn't trigger: manual deploy in Vercel dashboard
3. Verify: https://useevolua.com.br/blog should load without CSP errors
