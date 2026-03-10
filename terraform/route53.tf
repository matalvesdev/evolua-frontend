# Route53 DNS Configuration

# Hosted Zone para useevolua.com
resource "aws_route53_zone" "main" {
  name = var.landing_domain

  tags = {
    Name = "${var.project_name}-hosted-zone"
  }
}

# A Record para Landing Page (useevolua.com)
resource "aws_route53_record" "landing" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.landing_domain
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip] # Usando mesmo IP por enquanto

  # Se tiver EC2 separado para landing, use:
  # records = [aws_eip.landing.public_ip]
}

# A Record para www.useevolua.com
resource "aws_route53_record" "landing_www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.landing_domain}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip]
}

# A Record para App (app.evolua.com)
resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.app_domain
  type    = "A"
  ttl     = 300
  records = [aws_eip.app.public_ip]
}

# CNAME para evolua.com -> useevolua.com (se necessário)
# resource "aws_route53_record" "root_redirect" {
#   zone_id = aws_route53_zone.main.zone_id
#   name    = "evolua.com"
#   type    = "CNAME"
#   ttl     = 300
#   records = [var.landing_domain]
# }

# MX Records para email (opcional)
# resource "aws_route53_record" "mx" {
#   zone_id = aws_route53_zone.main.zone_id
#   name    = var.landing_domain
#   type    = "MX"
#   ttl     = 300
#   records = [
#     "10 mail.${var.landing_domain}"
#   ]
# }

# TXT Record para SPF (opcional)
# resource "aws_route53_record" "spf" {
#   zone_id = aws_route53_zone.main.zone_id
#   name    = var.landing_domain
#   type    = "TXT"
#   ttl     = 300
#   records = [
#     "v=spf1 include:_spf.google.com ~all"
#   ]
# }
