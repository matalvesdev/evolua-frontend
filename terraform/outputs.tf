# Outputs

output "backend_public_ip" {
  description = "IP publico do backend (Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "backend_instance_id" {
  description = "ID da instancia EC2"
  value       = aws_instance.backend.id
}

output "api_url" {
  description = "URL da API backend"
  value       = "https://api.${var.landing_domain}"
}

output "frontend_url" {
  description = "URL do frontend (Vercel)"
  value       = "https://${var.landing_domain}"
}

output "route53_nameservers" {
  description = "Name servers do Route53 - configure no registrador do dominio"
  value       = aws_route53_zone.main.name_servers
}

output "ssh_command" {
  description = "Comando SSH para conectar ao backend"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_eip.backend.public_ip}"
}

output "next_steps" {
  description = "Proximos passos apos o deploy"
  value       = <<-EOT

  Infraestrutura criada!

  1. Configure os Name Servers no registrador do dominio useevolua.com:
     ${join("\n     ", aws_route53_zone.main.name_servers)}

  2. Configure o dominio no Vercel:
     - Adicione useevolua.com no painel do Vercel
     - O DNS ja aponta para o Vercel (76.76.21.21)

  3. Conecte ao backend via SSH:
     ssh -i ${var.key_name}.pem ubuntu@${aws_eip.backend.public_ip}

  4. Aguarde o setup completar (~5 min):
     tail -f /var/log/user-data.log

  5. Configure SSL no backend:
     sudo certbot --nginx -d api.${var.landing_domain}

  6. Configure NEXT_PUBLIC_API_URL no Vercel:
     https://api.${var.landing_domain}/api

  EOT
}
