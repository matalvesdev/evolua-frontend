# WhatsApp Evolution API — Pareamento

> Requer o celular com o número oficial do Evolua.

## Passos

1. Acessar https://manager.evolution-api.com
2. Login com as credenciais da conta
3. Ir em **Instances** → clicar na instance `8f5b20ee-...` (nome: `evolua`)
4. Clicar em **Connect** ou **QR Code**
5. No WhatsApp Business do celular:
   - Menu (três pontos) → **Dispositivos conectados** → **Conectar dispositivo**
   - Escanear o QR code
6. Aguardar status mudar para **Connected**

## Testar envio

```bash
curl -X POST https://wa.useevolua.com.br/message/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_INTERNAL_API_TOKEN" \
  -d '{"number":"5511999999999","text":"Teste Evolua CRM"}'
```

## Troubleshooting

- **QR expirou:** Gerar novo QR no dashboard
- **Disconnect:** Repetir processo
- **Webhook não chega:** Verificar `WHATSAPP_WEBHOOK_URL` e `WHATSAPP_WEBHOOK_HMAC_SECRET`
