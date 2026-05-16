# VPC - usa a default VPC (sem custo adicional)

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group para o backend NestJS
resource "aws_security_group" "backend_sg" {
  name        = "${var.project_name}-backend-sg"
  description = "Backend NestJS - permite HTTP, HTTPS e SSH"
  vpc_id      = data.aws_vpc.default.id

  # SSH restrito ao seu IP
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # SSH via EC2 Instance Connect (managed prefix list sa-east-1)
  # Permite Console browser-based Connect button. Para `ec2-instance-connect ssh`
  # CLI funcionar de qualquer IP, criar um EIC Endpoint (free) na VPC default.
  ingress {
    description     = "SSH via EC2 Instance Connect (Console)"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    prefix_list_ids = ["pl-029debe66aa9d13b3"]
  }

  # HTTP (Nginx → redireciona para HTTPS)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound irrestrito"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-backend-sg"
  }
}
