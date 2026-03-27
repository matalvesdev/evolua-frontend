# Route53 DNS para useevolua.com.br + useevolua.online
# Custo: $0.50/mes por hosted zone (2 zones = $1/mes)
# Updated: 2026-03-26 (migração de useevolua.com)

# ==================== HOSTED ZONES ====================

resource "aws_route53_zone" "main_br" {
  name = "useevolua.com.br"

  tags = {
    Name = "${var.project_name}-hosted-zone-br"
    Domain = "useevolua.com.br"
  }
}

resource "aws_route53_zone" "main_online" {
  name = "useevolua.online"

  tags = {
    Name = "${var.project_name}-hosted-zone-online"
    Domain = "useevolua.online"
  }
}

# ==================== useevolua.com.br RECORDS ====================

# Root: useevolua.com.br -> Vercel (IP principal do Vercel: 76.76.21.21)
resource "aws_route53_record" "root_br" {
  zone_id = aws_route53_zone.main_br.zone_id
  name    = "useevolua.com.br"
  type    = "A"
  ttl     = 300
  records = ["76.76.21.21"]
}

# WWW: www.useevolua.com.br -> Vercel
resource "aws_route53_record" "www_br" {
  zone_id = aws_route53_zone.main_br.zone_id
  name    = "www.useevolua.com.br"
  type    = "CNAME"
  ttl     = 300
  records = ["cname.vercel-dns.com"]
}

# API: api.useevolua.com.br -> EC2 backend NestJS
resource "aws_route53_record" "api_br" {
  zone_id = aws_route53_zone.main_br.zone_id
  name    = "api.useevolua.com.br"
  type    = "A"
  ttl     = 300
  records = [aws_eip.backend.public_ip]
}

# ==================== useevolua.online RECORDS ====================

# Root: useevolua.online -> Vercel
resource "aws_route53_record" "root_online" {
  zone_id = aws_route53_zone.main_online.zone_id
  name    = "useevolua.online"
  type    = "A"
  ttl     = 300
  records = ["76.76.21.21"]
}

# WWW: www.useevolua.online -> Vercel
resource "aws_route53_record" "www_online" {
  zone_id = aws_route53_zone.main_online.zone_id
  name    = "www.useevolua.online"
  type    = "CNAME"
  ttl     = 300
  records = ["cname.vercel-dns.com"]
}

# API: api.useevolua.online -> EC2 backend NestJS
resource "aws_route53_record" "api_online" {
  zone_id = aws_route53_zone.main_online.zone_id
  name    = "api.useevolua.online"
  type    = "A"
  ttl     = 300
  records = [aws_eip.backend.public_ip]
}