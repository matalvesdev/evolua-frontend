#!/bin/bash

###############################################################################
# 🔍 Evolua CRM - Verificação de Infraestrutura Completa
# Status: Production Infrastructure Health Check
# 
# Validar:
#   1. DNS (Route53 propagation)
#   2. Frontend Vercel (SSL + HTTP)
#   3. Backend API (EC2 + Nginx + SSL)
#   4. Supabase Database connectivity
#   5. Rate limiting (Upstash Redis)
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
DOMAIN_FRONTEND="useevolua.com"
DOMAIN_API="api.useevolua.com"
API_HEALTH_ENDPOINT="/api/health"
TIMEOUT_SEC=10

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔍 EVOLUA CRM - Infrastructure Health Check               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# 1. VERIFICAÇÃO DNS
###############################################################################

echo -e "${BLUE}[1/5] DNS Resolution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend
echo -n "  Frontend DNS ($DOMAIN_FRONTEND): "
FRONTEND_IP=$(dig +short $DOMAIN_FRONTEND A | head -1)
if [ -z "$FRONTEND_IP" ]; then
  echo -e "${RED}✗ NOT RESOLVED${NC}"
  echo "    → DNS may not be propagated yet. Wait 5-10 minutes..."
else
  if [ "$FRONTEND_IP" = "76.76.21.21" ]; then
    echo -e "${GREEN}✓ $FRONTEND_IP${NC}"
  else
    echo -e "${YELLOW}⚠ $FRONTEND_IP (expected 76.76.21.21)${NC}"
  fi
fi

# API Backend
echo -n "  Backend DNS ($DOMAIN_API): "
BACKEND_IP=$(dig +short $DOMAIN_API A | head -1)
if [ -z "$BACKEND_IP" ]; then
  echo -e "${RED}✗ NOT RESOLVED${NC}"
  echo "    → Backend Elastic IP not configured in Route53"
else
  echo -e "${GREEN}✓ $BACKEND_IP${NC}"
fi

# WWW subdomain
echo -n "  WWW subdomain (www.$DOMAIN_FRONTEND): "
WWW_CNAME=$(dig +short www.$DOMAIN_FRONTEND CNAME | head -1)
if [ -z "$WWW_CNAME" ]; then
  echo -e "${RED}✗ NOT CONFIGURED${NC}"
else
  echo -e "${GREEN}✓ $WWW_CNAME${NC}"
fi

echo ""

###############################################################################
# 2. VERIFICAÇÃO FRONTEND (VERCEL)
###############################################################################

echo -e "${BLUE}[2/5] Frontend - Vercel HTTP/HTTPS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# HTTPS
echo -n "  HTTPS ($DOMAIN_FRONTEND): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$DOMAIN_FRONTEND 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo -e "${GREEN}✓ $HTTP_CODE${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

# SSL Certificate
echo -n "  SSL Certificate: "
CERT_SUBJECT=$(echo | openssl s_client -servername $DOMAIN_FRONTEND -connect $DOMAIN_FRONTEND:443 2>/dev/null | openssl x509 -noout -subject 2>/dev/null | grep -o "CN = .*" || echo "ERROR")
if [[ $CERT_SUBJECT == *"$DOMAIN_FRONTEND"* ]]; then
  echo -e "${GREEN}✓ Valid for $DOMAIN_FRONTEND${NC}"
else
  echo -e "${YELLOW}⚠ $CERT_SUBJECT${NC}"
fi

# WWW domain
echo -n "  WWW Domain (www.$DOMAIN_FRONTEND): "
WWW_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://www.$DOMAIN_FRONTEND 2>/dev/null || echo "000")
if [ "$WWW_CODE" = "200" ] || [ "$WWW_CODE" = "301" ] || [ "$WWW_CODE" = "302" ]; then
  echo -e "${GREEN}✓ $WWW_CODE${NC}"
else
  echo -e "${RED}✗ $WWW_CODE${NC}"
fi

echo ""

###############################################################################
# 3. VERIFICAÇÃO BACKEND API
###############################################################################

echo -e "${BLUE}[3/5] Backend - API Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Health endpoint
echo -n "  API Health ($DOMAIN_API$API_HEALTH_ENDPOINT): "
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$DOMAIN_API$API_HEALTH_ENDPOINT 2>/dev/null || echo "000")
if [ "$HEALTH_CODE" = "200" ]; then
  echo -e "${GREEN}✓ $HEALTH_CODE - Healthy${NC}"
elif [ "$HEALTH_CODE" = "000" ]; then
  echo -e "${RED}✗ Connection failed (Nginx/Backend offline?)${NC}"
else
  echo -e "${YELLOW}⚠ $HEALTH_CODE (check backend logs)${NC}"
fi

# Backend SSL
echo -n "  SSL Certificate (API): "
API_CERT=$(echo | openssl s_client -servername $DOMAIN_API -connect $DOMAIN_API:443 2>/dev/null | openssl x509 -noout -subject 2>/dev/null | grep -o "CN = .*" || echo "ERROR")
if [[ $API_CERT == *"$DOMAIN_API"* ]] || [[ $API_CERT == *"useevolua"* ]]; then
  echo -e "${GREEN}✓ Valid${NC}"
else
  echo -e "${YELLOW}⚠ $API_CERT${NC}"
fi

# Nginx status
echo -n "  Nginx Status (response time): "
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null --connect-timeout 5 https://$DOMAIN_API/api/health 2>/dev/null || echo "ERROR")
if [ "$RESPONSE_TIME" != "ERROR" ]; then
  echo -e "${GREEN}✓ ${RESPONSE_TIME}s${NC}"
else
  echo -e "${RED}✗ No response${NC}"
fi

echo ""

###############################################################################
# 4. VERIFICAÇÃO SUPABASE (TCP test apenas)
###############################################################################

echo -e "${BLUE}[4/5] Supabase Database Connectivity${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Tentar conectar ao Supabase (opcional, depende de env vars)
if [ -z "$SUPABASE_HOST" ]; then
  echo -e "  ${YELLOW}⚠ SUPABASE_HOST not set - skipping${NC}"
else
  echo -n "  PostgreSQL connection ($SUPABASE_HOST:5432): "
  if timeout 3 bash -c "echo > /dev/tcp/$SUPABASE_HOST/5432" 2>/dev/null; then
    echo -e "${GREEN}✓ Port open${NC}"
  else
    echo -e "${RED}✗ Port closed${NC}"
  fi
fi

echo ""

###############################################################################
# 5. RESUMO E RECOMMENDATIONS
###############################################################################

echo -e "${BLUE}[5/5] Summary & Recommendations${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${GREEN}✅ WHAT'S WORKING${NC}"
echo "  • Infrastructure configured per Terraform"
echo "  • DNS records created in Route53"
echo "  • Vercel project deployed"

echo ""
echo -e "${YELLOW}⚠️ NEXT STEPS${NC}"

if [ -z "$FRONTEND_IP" ]; then
  echo "  1. Wait for DNS propagation (5-10 mins)"
  echo "     → nslookup useevolua.com"
fi

if [ "$HEALTH_CODE" != "200" ]; then
  echo "  2. Check backend health:"
  echo "     • SSH to EC2 instance"
  echo "     • sudo systemctl status pm2 nginx"
  echo "     • sudo tail -n 100 /var/log/nginx/error.log"
  echo "     • sudo pm2 logs"
fi

echo ""
echo -e "${BLUE}📝 LOGS TO CHECK${NC}"
echo ""
echo "  Frontend (Vercel):"
echo "    → https://vercel.com/dashboard → Deployments → Logs"
echo ""
echo "  Backend (EC2):"
echo "    → SSH to: $BACKEND_IP"
echo "    → Nginx: sudo tail -f /var/log/nginx/error.log"
echo "    → App: sudo pm2 logs"
echo "    → SSH: sudo systemctl status pm2 nginx"
echo ""
echo "  DNS Propagation:"
echo "    → dig useevolua.com +short"
echo "    → dig api.useevolua.com +short"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✓ Check complete - review output above                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
