# EC2 t2.micro - Backend NestJS (free tier: 750h/mês)
# Elastic IP para manter endpoint estável da API no DNS da HostGator
#
# ⚠️  MIGRAÇÃO EM ANDAMENTO: t2.micro (x86) → t4g.micro (ARM Graviton)
# Ver docs/migration-t2micro-to-graviton.md
# Quando enable_backend_v2 = true, aws_instance.backend_arm é provisionado em
# paralelo. Após cutover do EIP, este recurso `backend` é destruído.

resource "aws_instance" "backend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  subnet_id                   = data.aws_subnets.default.ids[0]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 20 # GB (free tier: até 30GB gp2)
    volume_type           = "gp2"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-backend-volume"
    }
  }

  user_data = templatefile("${path.module}/user-data/backend-init.sh", {
    supabase_url              = var.supabase_url
    supabase_anon_key         = var.supabase_anon_key
    supabase_service_role_key = var.supabase_service_role_key
    database_url              = var.database_url
    cors_origins              = var.cors_origins
    frontend_url              = var.frontend_url
    backend_domain            = "api.useevolua.online"
  })

  # IMDSv2 obrigatório (segurança)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "${var.project_name}-backend"
    Role = "backend-api"
  }

  lifecycle {
    create_before_destroy = true
    # Trava AMI/user-data: t2.micro está em produção (i-0cc95731e636e1275)
    # e será substituída pela migração ARM (backend_arm) via blue/green.
    # Não permitir replace acidental por drift do AMI mais recente.
    ignore_changes = [ami, user_data]
  }
}

# Elastic IP associado à instância (sem custo enquanto associado)
# Necessário para o DNS do Route53 não mudar a cada restart
#
# ⚠️  Durante migração blue/green (t2.micro → t4g.micro ARM), o EIP é
# reassociado manualmente via `aws ec2 associate-address` para o ARM
# (i-0592c784f5e0f0b6f). `ignore_changes = [instance]` impede o TF de
# reverter a associação enquanto o t2.micro antigo ainda existe no state.
# Remover após terminar o t2.micro e ajustar `instance = aws_instance.backend_arm[0].id`.
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-backend-eip"
  }

  depends_on = [aws_instance.backend]

  lifecycle {
    ignore_changes = [instance]
  }
}

# ──────────────────────────────────────────────────────────────────────────
# Backend V2 — t4g.micro (ARM Graviton, gp3 8GB)
# Provisionado em paralelo durante migração blue/green.
# Validar via IP público direto antes de mover o EIP.
# ──────────────────────────────────────────────────────────────────────────
resource "aws_instance" "backend_arm" {
  count = var.enable_backend_v2 ? 1 : 0

  ami                         = data.aws_ami.ubuntu_arm64.id
  instance_type               = var.instance_type_arm64
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  subnet_id                   = data.aws_subnets.default.ids[0]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.root_volume_size_arm64
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-backend-arm-volume"
    }
  }

  user_data = templatefile("${path.module}/user-data/backend-init.sh", {
    supabase_url              = var.supabase_url
    supabase_anon_key         = var.supabase_anon_key
    supabase_service_role_key = var.supabase_service_role_key
    database_url              = var.database_url
    cors_origins              = var.cors_origins
    frontend_url              = var.frontend_url
    backend_domain            = "api.useevolua.online"
  })

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "${var.project_name}-backend-arm"
    Role = "backend-api"
    Arch = "arm64"
  }

  lifecycle {
    create_before_destroy = true
  }
}
