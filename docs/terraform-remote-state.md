# Migração do tfstate local → S3 + DynamoDB

> Stack: AWS já em uso (sa-east-1). Sem novas dependências.

## Por quê?

- `terraform.tfstate` hoje vive **commitado no repo** (péssimo: contém ARNs, IDs, etc.)
- Sem lock → 2 pessoas rodando `terraform apply` ao mesmo tempo corrompe o state
- Sem versioning → erro destrutivo é irreversível

## Solução

- **S3** com versioning + encryption + bloqueio público total → state
- **DynamoDB** PAY_PER_REQUEST + PITR → lock distribuído

## Procedimento (uma vez)

### 1. Bootstrap do backend remoto

```bash
cd terraform/bootstrap
terraform init
terraform apply
# Confirma criação do bucket evolua-terraform-state e tabela evolua-terraform-locks
```

### 2. Migrar o state existente

```bash
cd terraform   # diretório raiz, NÃO o bootstrap
terraform init -migrate-state
# Terraform pergunta: "Do you want to copy existing state to the new backend?" → yes
```

### 3. Limpar arquivos locais

```bash
rm terraform/terraform.tfstate terraform/terraform.tfstate.backup
git rm --cached terraform/terraform.tfstate terraform/terraform.tfstate.backup
git commit -m "chore(infra): migrate tfstate to S3 backend"
```

`.gitignore` já bloqueia `*.tfstate*` então futuras execuções locais não vão recommitar.

### 4. Validar

```bash
terraform plan   # deve dizer "No changes"
aws s3 ls s3://evolua-terraform-state/evolua/prod/
aws dynamodb scan --table-name evolua-terraform-locks --select COUNT
```

## Operação contínua

- Rodar `terraform apply` localmente continua funcionando (lê/escreve no S3 com suas creds AWS)
- CI futuro pode rodar `terraform plan` em PRs (read-only) sem risco de race
- Para quem chegar novo no time: basta `terraform init` (sem mais setup, ele descobre o backend)

## Rollback (emergência)

```bash
cd terraform
terraform state pull > local-recovered.tfstate
# Editar main.tf removendo o bloco backend "s3"
terraform init -migrate-state -force-copy
mv local-recovered.tfstate terraform.tfstate
```
