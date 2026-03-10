# EC2 Instances

# EC2 para Aplicação (app.evolua.com)
resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.app_sg.id]
  
  # Usar primeira subnet disponível
  subnet_id = data.aws_subnets.default.ids[0]

  # Storage
  root_block_device {
    volume_size           = 30 # GB (free tier: 30GB)
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-app-root-volume"
    }
  }

  # User data para setup inicial
  user_data = templatefile("${path.module}/user-data/app-init.sh", {
    supabase_url      = var.supabase_url
    supabase_anon_key = var.supabase_anon_key
    app_domain        = var.app_domain
    github_repo       = var.github_repo
  })

  # Metadata options (IMDSv2)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name        = "${var.project_name}-app"
    Domain      = var.app_domain
    Application = "CRM"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# EC2 para Landing Page (useevolua.com) - Opcional
# Descomente se quiser EC2 separado para landing
# resource "aws_instance" "landing" {
#   ami           = data.aws_ami.ubuntu.id
#   instance_type = "t2.micro"
#   key_name      = var.key_name
#
#   vpc_security_group_ids = [aws_security_group.landing_sg.id]
#   subnet_id              = data.aws_subnets.default.ids[0]
#
#   root_block_device {
#     volume_size           = 20
#     volume_type           = "gp3"
#     delete_on_termination = true
#     encrypted             = true
#   }
#
#   user_data = file("${path.module}/user-data/landing-init.sh")
#
#   tags = {
#     Name        = "${var.project_name}-landing"
#     Domain      = var.landing_domain
#     Application = "Landing Page"
#   }
# }

# Elastic IP para App
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name   = "${var.project_name}-app-eip"
    Domain = var.app_domain
  }

  depends_on = [aws_instance.app]
}

# Elastic IP para Landing (se usar EC2 separado)
# resource "aws_eip" "landing" {
#   instance = aws_instance.landing.id
#   domain   = "vpc"
#
#   tags = {
#     Name   = "${var.project_name}-landing-eip"
#     Domain = var.landing_domain
#   }
#
#   depends_on = [aws_instance.landing]
# }
