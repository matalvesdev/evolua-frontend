# Outputs

output "backend_public_ip" {
  description = "IP publico do backend (Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "backend_instance_id" {
  description = "ID da instancia EC2"
  value       = aws_instance.backend.id
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
    • Backend: api.useevolua.online (EC2)

    1. Configure domínios no Vercel:
     - Adicione: useevolua.com.br, www.useevolua.com.br
     - Adicione: useevolua.online, www.useevolua.online
      - Use DNS da HostGator apontando para Vercel

    2. Configure DNS na HostGator:
      - A useevolua.com.br      -> 76.76.21.21
      - CNAME www.useevolua.com.br -> cname.vercel-dns.com
      - A useevolua.online      -> 76.76.21.21
      - CNAME www.useevolua.online -> cname.vercel-dns.com
      - A api.useevolua.online  -> ${aws_eip.backend.public_ip}

    3. Conecte ao backend via SSH:
     ssh -i ${var.key_name}.pem ubuntu@${aws_eip.backend.public_ip}

    4. Aguarde setup completar (~5 min):
     tail -f /var/log/user-data.log

    5. Configure SSL no backend (ambos domínios):
     sudo certbot --nginx -d api.useevolua.online

    6. Configure NEXT_PUBLIC_API_URL no Vercel:
     https://api.useevolua.online/api

  EOT
}
