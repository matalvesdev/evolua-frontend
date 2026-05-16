# Outputs

output "backend_public_ip" {
  description = "IP publico do backend (Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "backend_instance_id" {
  description = "ID da instancia EC2 ARM em produção"
  value       = length(aws_instance.backend_arm) > 0 ? aws_instance.backend_arm[0].id : null
}

output "api_url" {
  description = "URL principal da API"
  value       = "https://api.useevolua.com.br"
}

output "api_url_legacy" {
  description = "URL legada da API (redirect 308 → .com.br)"
  value       = "https://api.useevolua.online"
}

output "frontend_url" {
  description = "URL principal do app (Vercel)"
  value       = "https://app.useevolua.com.br"
}

output "landing_url" {
  description = "URL da landing (Vercel)"
  value       = "https://useevolua.com.br"
}

output "ssh_command" {
  description = "Comando SSH para conectar ao backend"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_eip.backend.public_ip}"
}

output "next_steps" {
  description = "Status do deploy"
  value       = <<-EOT

  ✅ Backend ARM v2 em produção
    • API:        https://api.useevolua.com.br
    • API legacy: https://api.useevolua.online (308 → .com.br)
    • App:        https://app.useevolua.com.br
    • Landing:    https://useevolua.com.br

  EOT
}
