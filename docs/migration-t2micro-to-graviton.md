# Migração EC2 t2.micro (x86) → t4g.micro (ARM Graviton)

> **Objetivo**: reduzir custo do backend de ~$10.90/mês → ~$4.71/mês (57% off) **mantendo a mesma stack AWS, sem alterar código da aplicação**.
>
> **Estratégia**: blue/green com swap de Elastic IP (zero downtime, rollback em <2 min).

---

## 1. Por que migrar

### Estado atual (auditado em 14/05/2026)
- Instância: `i-0cc95731e636e1275`, `t2.micro` x86_64, Ubuntu 22.04 LTS
- Uptime contínuo: 41 dias
- RAM em uso: **259 MiB / 957 MiB** (~27%)
- Swap usado: **74 MiB / 2 GiB** (mínimo)
- Disco: **5.8 GB / 20 GB** (30%)
- CPU média (14d): **3.2–3.8%**; picos máximos 9–33%
- Aplicação: Node 22 + NestJS via PM2 cluster (1 worker, 74.6 MB)

### Custo (pós AWS Free Tier 12 meses)

| Item | t2.micro atual | t4g.micro novo |
|---|---:|---:|
| Instância on-demand | $8.50 | $6.15 |
| Instância com Compute Savings Plan 1y | — | $3.94 |
| EBS root | $2.40 (20GB gp2) | $0.77 (8GB gp3) |
| Elastic IP (atachado) | $0 | $0 |
| **Total/mês** | **$10.90** | **$4.71** |

**Economia**: $6.19/mês = **~$74/ano (57%)**.

### Por que t4g.micro e não t4g.nano

t4g.nano tem só **512 MB RAM**. Uso atual é 259 MB em regime, mas:
- Build (`npm ci`, `prisma generate`, `npm run build`) consome >400 MB
- PM2 reload duplica o processo Node temporariamente (~150 MB extra)
- Updates `apt upgrade` + snap refresh consomem ~200 MB pico
- Margem zero → risco de OOM kill em prod

**t4g.micro** mantém os mesmos 1 GB da instância atual com upgrade pra 2 vCPUs (vs 1 do t2.micro) — risco zero, performance melhor.

---

## 2. Pré-requisitos

- [ ] AWS CLI autenticado (`aws sts get-caller-identity`)
- [ ] Terraform `>= 1.0` instalado
- [ ] Acesso SSH ao EC2 atual (`ssh-keygen -y -f ~/.ssh/evolua-key.pem` deve bater com `aws ec2 describe-key-pairs --key-names evolua-key`)
- [ ] tfstate remoto já migrado pra S3 (ou backup local em `terraform/terraform.tfstate.backup`)
- [ ] Janela de manutenção: opcional, migração é zero-downtime
- [ ] Snapshot recente do EBS atual (rollback de última instância — ver §7)

```bash
# Snapshot prévio (custa ~$0.05/GB/mês, deletar após migração estável)
aws ec2 create-snapshot \
  --volume-id $(aws ec2 describe-instances --instance-ids i-0cc95731e636e1275 \
    --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text) \
  --description "Pre-migration t2micro snapshot $(date +%Y%m%d)" \
  --region sa-east-1
```

---

## 3. Fase 1 — Provisionar instância ARM em paralelo

### 3.1. Habilitar flag no Terraform

Em `terraform/terraform.tfvars`:

```hcl
enable_backend_v2       = true
instance_type_arm64     = "t4g.micro"
root_volume_size_arm64  = 8
```

### 3.2. Apply

```bash
cd terraform
terraform init   # se ainda não tiver feito o migrate-state pro S3
terraform plan -out=tfplan-v2
terraform apply tfplan-v2
```

Saída esperada:
- `aws_instance.backend_arm[0]` criado
- Outputs `backend_arm_public_ip` e `backend_arm_ssh_command` populados
- `aws_instance.backend` **intocado** (instância antiga continua servindo tráfego)

### 3.3. Aguardar user-data completar (~5–8 min)

```bash
IP_NEW=$(terraform output -raw backend_arm_public_ip)
ssh -i ~/.ssh/evolua-key.pem ubuntu@$IP_NEW 'tail -f /var/log/user-data.log'
```

Procurar por `=== Setup concluido: ...` ao final.

---

## 4. Fase 2 — Validação da nova instância

### 4.1. Smoke tests via IP público direto

```bash
IP_NEW=$(terraform output -raw backend_arm_public_ip)

# Health check direto (porta 8080 do PM2, sem nginx)
curl -fsS "http://$IP_NEW/api/health" | jq .

# Header Host pra simular DNS apontando aqui
curl -fsS -H "Host: api.useevolua.online" "http://$IP_NEW/api/health"
```

### 4.2. Validação dentro da VM

```bash
ssh -i ~/.ssh/evolua-key.pem ubuntu@$IP_NEW <<'EOF'
echo "=== ARCH ===" && uname -m  # esperado: aarch64
echo "=== NODE ===" && node --version
echo "=== PM2 ===" && pm2 list
echo "=== RAM ===" && free -h
echo "=== DISK ===" && df -h /
echo "=== HEALTH ===" && curl -sf http://localhost:8080/api/health
EOF
```

Critérios de aceite:
- [ ] `uname -m` retorna `aarch64`
- [ ] Node 22.x rodando
- [ ] PM2 com `evolua-backend` em status `online`
- [ ] Health check 200 OK
- [ ] RAM disponível > 500 MB (regime ocioso)
- [ ] Disco root 8 GB (não 20)
- [ ] nginx escutando 80/443

### 4.3. Teste via subdomínio temporário (opcional, recomendado)

Adicionar entrada DNS provisória na HostGator:
```
api-v2.useevolua.online   A   <IP_NEW>   TTL 60s
```

Aguardar 1–2 min e testar com TLS válido:
```bash
# Certbot já rodou no user-data, mas refazer pro novo subdomínio se quiser HTTPS
ssh -i ~/.ssh/evolua-key.pem ubuntu@$IP_NEW \
  'sudo certbot --nginx -d api-v2.useevolua.online --non-interactive --agree-tos --email admin@useevolua.com'

curl -fsS https://api-v2.useevolua.online/api/health
```

Apontar 10% do tráfego do frontend Vercel via env var por algumas horas se quiser canary.

---

## 5. Fase 3 — Cutover (swap do Elastic IP)

> **Janela**: ~30 segundos. Conexões em curso caem; clientes refazem.

### 5.1. Capturar IDs

```bash
cd terraform
OLD_ID=$(terraform output -raw backend_instance_id)
NEW_ID=$(terraform output -raw backend_arm_instance_id)
EIP_ALLOC=$(aws ec2 describe-addresses --region sa-east-1 \
  --filters "Name=instance-id,Values=$OLD_ID" \
  --query 'Addresses[0].AllocationId' --output text)

echo "OLD: $OLD_ID | NEW: $NEW_ID | EIP: $EIP_ALLOC"
```

### 5.2. Desassociar EIP da antiga, associar à nova

```bash
ASSOC_ID=$(aws ec2 describe-addresses --region sa-east-1 \
  --filters "Name=instance-id,Values=$OLD_ID" \
  --query 'Addresses[0].AssociationId' --output text)

aws ec2 disassociate-address --association-id $ASSOC_ID --region sa-east-1
aws ec2 associate-address --allocation-id $EIP_ALLOC --instance-id $NEW_ID --region sa-east-1
```

> ⚠️ **NÃO faça isso via Terraform** ainda — o tfstate ficaria inconsistente. Faremos reconciliação na Fase 4.

### 5.3. Validar imediatamente

```bash
EIP=$(terraform output -raw backend_public_ip)

# Deve responder pela instância NOVA agora
curl -fsS "https://api.useevolua.online/api/health" | jq .

# Confirmar resolução
ssh -i ~/.ssh/evolua-key.pem ubuntu@$EIP 'uname -m'  # aarch64 = sucesso
```

---

## 6. Fase 4 — Limpeza (após 24–48h estável)

### 6.1. Atualizar Terraform pra promover ARM como padrão

Em `terraform/ec2.tf`, **substituir** o recurso `aws_instance.backend` (x86) pelo conteúdo de `aws_instance.backend_arm`, mudando o nome de volta pra `backend` e removendo o `count`:

```hcl
resource "aws_instance" "backend" {
  ami                         = data.aws_ami.ubuntu_arm64.id
  instance_type               = var.instance_type_arm64
  # ... resto idêntico ao backend_arm ...
  root_block_device {
    volume_size = var.root_volume_size_arm64
    volume_type = "gp3"
    # ...
  }
}
```

Remover o bloco `aws_instance.backend_arm` inteiro.

### 6.2. Reconciliar tfstate via state mv + import

```bash
cd terraform

# Remover o recurso antigo do state (instância antiga ainda existe na AWS)
terraform state rm aws_instance.backend

# Mover o backend_arm pro nome canônico
terraform state mv 'aws_instance.backend_arm[0]' aws_instance.backend

# Confirmar
terraform plan   # deve mostrar "No changes" exceto possíveis tags
```

### 6.3. Atualizar `terraform.tfvars`

```hcl
instance_type      = "t4g.micro"    # era t2.micro
enable_backend_v2  = false           # desabilita flag de migração
```

### 6.4. Destruir instância x86 antiga

```bash
aws ec2 terminate-instances --instance-ids $OLD_ID --region sa-east-1
```

Aguardar terminação (~1 min). Snapshot do EBS antigo continua disponível pra rollback.

### 6.5. Comprar Compute Savings Plan 1y (manual no console)

Pelo console AWS:
1. **Billing → Savings Plans → Purchase**
2. Tipo: **Compute Savings Plans**
3. Commitment: **$0.0054/hora** (cobre t4g.micro 24/7 com folga)
4. Term: **1 year**
5. Payment: **No upfront**
6. Confirmar — economia ~36% aplicada imediatamente

> Não é gerenciável via Terraform com segurança (commitment financeiro).

### 6.6. Limpar snapshot pré-migração (após 7 dias estável)

```bash
SNAP_ID=$(aws ec2 describe-snapshots --owner-ids self --region sa-east-1 \
  --filters "Name=description,Values=Pre-migration*" \
  --query 'Snapshots[0].SnapshotId' --output text)

aws ec2 delete-snapshot --snapshot-id $SNAP_ID --region sa-east-1
```

---

## 7. Plano de rollback

### Cenário A — Nova instância não sobe corretamente (Fase 1/2)

Antes do cutover do EIP, basta:
```bash
cd terraform
# Definir enable_backend_v2 = false em terraform.tfvars
terraform apply
```
Tráfego nunca foi afetado.

### Cenário B — Nova instância tem bug em produção (após cutover, Fase 3)

**Reverter EIP em <2 min**:
```bash
ASSOC_ID=$(aws ec2 describe-addresses --region sa-east-1 \
  --filters "Name=instance-id,Values=$NEW_ID" \
  --query 'Addresses[0].AssociationId' --output text)

aws ec2 disassociate-address --association-id $ASSOC_ID --region sa-east-1
aws ec2 associate-address --allocation-id $EIP_ALLOC --instance-id $OLD_ID --region sa-east-1
```

Tráfego volta pra instância x86 antiga em segundos.

### Cenário C — Tudo perdido (instância antiga já foi destruída, Fase 4)

Restaurar do snapshot pré-migração:
```bash
# 1. Criar volume do snapshot
VOL=$(aws ec2 create-volume \
  --snapshot-id $SNAP_ID \
  --availability-zone sa-east-1c \
  --volume-type gp3 \
  --region sa-east-1 \
  --query 'VolumeId' --output text)

# 2. Lançar instância t2.micro nova com esse volume
# (mais simples: temporariamente reverter terraform.tfvars pra t2.micro,
#  setar enable_backend_v2=false, terraform apply, depois copiar volume)
```

RTO estimado: ~20 min.

---

## 8. Checklist final

- [ ] Snapshot pré-migração criado
- [ ] `enable_backend_v2 = true`, `terraform apply` ok
- [ ] User-data completou na instância ARM (`tail /var/log/user-data.log`)
- [ ] Smoke tests via IP direto passaram
- [ ] (Opcional) Canary via `api-v2.useevolua.online` validado
- [ ] EIP movido para instância ARM
- [ ] Health check via `https://api.useevolua.online` retorna 200
- [ ] Login funcional no frontend prod
- [ ] Logs PM2 limpos por 24h (sem crashes, sem OOM)
- [ ] Métricas CloudWatch (CPU, MemoryUtilization se CloudWatch Agent ativo) ok
- [ ] Terraform reconciliado (state mv + plan limpo)
- [ ] `terraform.tfvars` atualizado pra `t4g.micro`
- [ ] Instância x86 antiga terminada
- [ ] Compute Savings Plan 1y comprado
- [ ] Snapshot pré-migração removido após 7d estável
- [ ] ROADMAP atualizado

---

## 9. Métricas pós-migração (preencher após 7 dias)

| Métrica | t2.micro (antes) | t4g.micro (depois) | Delta |
|---|---|---|---|
| Custo/mês | $10.90 | _____ | _____ |
| CPU média | 3.5% | _____ | _____ |
| RAM em uso | 259 MB | _____ | _____ |
| Latência p50 /api/health | ~ms | _____ | _____ |
| Latência p99 /api/health | ~ms | _____ | _____ |
| Restarts PM2 / 7d | 0 | _____ | _____ |
