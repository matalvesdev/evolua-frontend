# Route53 DNS para useevolua.com
# Custo: $0.50/mes pela hosted zone

resource "aws_route53_zone" "main" {
  name = var.landing_domain

  tags = {
    Name = "${var.project_name}-hosted-zone"
  }
}

# useevolua.com -> Vercel (IP principal do Vercel: 76.76.21.21)
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.landing_domain
  type    = "A"
  ttl     = 300
  records = ["76.76.21.21"]
}

# www.useevolua.com -> Vercel
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.landing_domain}"
  type    = "CNAME"
  ttl     = 300
  records = ["cname.vercel-dns.com"]
}

# api.useevolua.com -> EC2 backend NestJS
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.landing_domain}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.backend.public_ip]
}