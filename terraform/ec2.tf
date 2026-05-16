# EC2 t4g.micro ARM Graviton — Backend Fastify v2 (Free Tier elegível)
# Elastic IP estável para DNS HostGator / Route53.
#
# Histórico: migração blue/green t2.micro (x86) → t4g.micro (ARM) concluída
# em 2026-05-16. Instância legada terminada manualmente e removida do state.
# Ver docs/migration-t2micro-to-graviton.md

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
    backend_domain            = "api.useevolua.com.br"
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
    # user_data foi customizado pós-deploy (nginx, certbot, PM2 v2).
    # Não permitir replace por drift do AMI ou template.
    ignore_changes = [ami, user_data]
  }
}

# Elastic IP estável (sem custo enquanto associado a instância running)
resource "aws_eip" "backend" {
  instance = var.enable_backend_v2 ? aws_instance.backend_arm[0].id : null
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-backend-eip"
  }
}
