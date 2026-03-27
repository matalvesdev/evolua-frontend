# Outputs

output "backend_public_ip" {
  description = "IP publico do backend (Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "backend_instance_id" {
  description = "ID da instancia EC2"
  value       = aws_instance.backend.id
}

output "api_url_br" {
  description = "URL da API backend (.com.br)"
  value       = "https://api.useevolua.com.br"
}

output "api_url_online" {
  description = "URL da API backend (.online)"
  value       = "https://api.useevolua.online"
}

output "frontend_url_br" {
  description = "URL do frontend (Vercel) .com.br"
  value       = "https://useevolua.com.br"
}

output "frontend_url_online" {
  description = "URL do frontend (Vercel) .online"
  value       = "https://useevolua.online"
}

output "route53_nameservers_br" {
  description = "Name servers do Route53 (.com.br) - configure no registrador"
  value       = aws_route53_zone.main_br.name_servers
}

output "route53_nameservers_online" {
  description = "Name servers do Route53 (.online) - configure no registrador"
  value       = aws_route53_zone.main_online.name_servers
}

output "ssh_command" {
  description = "Comando SSH para conectar ao backend"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_eip.backend.public_ip}"
}

output "next_steps" {
  description = "Proximos passos apos o deploy"
  value       = <<-EOT

  ✅ Infraestrutura criada!

  DOMÍNIOS CONFIGURADOS:
    • Frontend: useevolua.com.br + useevolua.online (Vercel)
    • Backend: api.useevolua.com.br + api.useevolua.online (EC2)

  1. Configure Name Servers (.com.br) no registrador:
     ${join("\n     ", aws_route53_zone.main_br.name_servers)}

  2. Configure Name Servers (.online) no registrador:
     ${join("\n     ", aws_route53_zone.main_online.name_servers)}

  3. Configure domínios no Vercel:
     - Adicione: useevolua.com.br, www.useevolua.com.br
     - Adicione: useevolua.online, www.useevolua.online
     - DNS já aponta para Vercel (76.76.21.21)

  4. Conecte ao backend via SSH:
     ssh -i ${var.key_name}.pem ubuntu@${aws_eip.backend.public_ip}

  5. Aguarde setup completar (~5 min):
     tail -f /var/log/user-data.log

  6. Configure SSL no backend (ambos domínios):
     sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online

  7. Configure NEXT_PUBLIC_API_URL no Vercel:
     https://api.useevolua.com.br/api

  EOT
}
