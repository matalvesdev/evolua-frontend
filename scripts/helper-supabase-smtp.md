# Supabase SMTP Setup (Fallback)

> Configure o SMTP no Supabase Dashboard como fallback
> quando os Auth Hooks falharem.

## Passos

1. **Acessar** https://supabase.com/dashboard/project/diiaoaboykraaiavgdqs
2. **Ir em** Authentication → Settings → **SMTP Settings**
3. **Preencher:**

| Campo | Valor |
|-------|-------|
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | `contatouseevolua@gmail.com.br` |
| Password | (senha de app do Gmail) |
| Sender email | `contatouseevolua@gmail.com.br` |
| Sender name | `Evolua CRM` |

> Alternativa: SendGrid, AWS SES, ou Resend.
> O backend já tem fallback via nodemailer nas env vars `SMTP_*`.
