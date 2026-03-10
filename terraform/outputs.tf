# Outputs

output "app_instance_id" {
  description = "ID da instância EC2 da aplicação"
  value       = aws_instance.app.id
}

output "app_public_ip" {
  description = "IP público da aplicação"
  value       = aws_eip.app.public_ip
}

output "app_domain" {
  description = "Domínio da aplicação"
  value       = var.app_domain
}

output "landing_domain" {
  description = "Domínio da landing page"
  value       = var.landing_domain
}

output "route53_nameservers" {
  description = "Name servers do Route53 (configure no seu registrador de domínio)"
  value       = aws_route53_zone.main.name_servers
}

output "ssh_command" {
  description = "Comando SSH para conectar ao servidor"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_eip.app.public_ip}"
}

output "app_url" {
  description = "URL da aplicação"
  value       = "https://${var.app_domain}"
}

output "landing_url" {
  description = "URL da landing page"
  value       = "https://${var.landing_domain}"
}

output "cloudwatch_dashboard_url" {
  description = "URL do dashboard CloudWatch"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "sns_topic_arn" {
  description = "ARN do tópico SNS para alertas"
  value       = aws_sns_topic.alerts.arn
}

output "security_group_id" {
  description = "ID do Security Group da aplicação"
  value       = aws_security_group.app_sg.id
}

# Instruções pós-deploy
output "next_steps" {
  description = "Próximos passos após o deploy"
  value = <<-EOT
  
  ✅ Infraestrutura criada com sucesso!
  
  📋 PRÓXIMOS PASSOS:
  
  1. Configure os Name Servers no seu registrador de domínio:
     ${join("\n     ", aws_route53_zone.main.name_servers)}
  
  2. Conecte ao servidor via SSH:
     ssh -i ${var.key_name}.pem ubuntu@${aws_eip.app.public_ip}
  
  3. Aguarde o user-data completar (5-10 minutos):
     tail -f /var/log/cloud-init-output.log
  
  4. Configure SSL para os domínios:
     sudo certbot --nginx -d ${var.app_domain}
     sudo certbot --nginx -d ${var.landing_domain}
     sudo certbot --nginx -d www.${var.landing_domain}
  
  5. Verifique a aplicação:
     https://${var.app_domain}
     https://${var.landing_domain}
  
  6. Confirme a inscrição no SNS (verifique seu email):
     ${var.alert_email}
  
  📊 Monitoramento:
     CloudWatch Dashboard: ${aws_cloudwatch_dashboard.main.dashboard_name}
  
  🔐 Segurança:
     - SSH permitido apenas de: ${var.allowed_ssh_cidr}
     - HTTPS configurado com Let's Encrypt
     - Security Groups configurados
  
  EOT
}
