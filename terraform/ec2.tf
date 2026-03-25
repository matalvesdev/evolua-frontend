# EC2 t2.micro - Backend NestJS (free tier: 750h/mês)
# Sem Elastic IP para evitar cobrança quando parado
# IP público automático é suficiente (Route53 atualizado via script se mudar)

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
    backend_domain            = "api.${var.landing_domain}"
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
  }
}

# Elastic IP associado à instância (sem custo enquanto associado)
# Necessário para o DNS do Route53 não mudar a cada restart
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-backend-eip"
  }

  depends_on = [aws_instance.backend]
}
