#!/bin/bash

###############################################################################
# 🔍 Evolua CRM - Validação de Novos Domínios
# useevolua.com.br + useevolua.online
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAINS_FRONTEND=("useevolua.com.br" "useevolua.online")
DOMAINS_API=("api.useevolua.com.br" "api.useevolua.online")
API_HEALTH="/api/health"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔍 EVOLUA - Domain Migration Check                       ║${NC}"
echo -e "${BLUE}║  Domains: useevolua.com.br + useevolua.online             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# DNS Check
echo -e "${BLUE}[1/3] DNS Resolution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for domain in "${DOMAINS_FRONTEND[@]}"; do
  echo -n "  $domain: "
  IP=$(dig +short $domain A | head -1)
  if [ -z "$IP" ]; then
    echo -e "${RED}✗ NOT RESOLVED${NC}"
  else
    if [ "$IP" = "76.76.21.21" ]; then
      echo -e "${GREEN}✓ $IP (Vercel)${NC}"
    else
      echo -e "${YELLOW}⚠ $IP${NC}"
    fi
  fi
done

for domain in "${DOMAINS_API[@]}"; do
  echo -n "  $domain: "
  IP=$(dig +short $domain A | head -1)
  if [ -z "$IP" ]; then
    echo -e "${RED}✗ NOT RESOLVED${NC}"
  else
    echo -e "${GREEN}✓ $IP (Backend)${NC}"
  fi
done

echo ""

# Frontend HTTPS Check
echo -e "${BLUE}[2/3] Frontend - HTTPS + SSL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for domain in "${DOMAINS_FRONTEND[@]}"; do
  echo -n "  HTTPS ($domain): "
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$domain 2>/dev/null || echo "000")
  
  if [ "$CODE" = "200" ] || [ "$CODE" = "301" ] || [ "$CODE" = "302" ]; then
    echo -e "${GREEN}✓ $CODE${NC}"
  else
    echo -e "${RED}✗ $CODE${NC}"
  fi
done

echo ""

# Backend API Check
echo -e "${BLUE}[3/3] Backend - API Health${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for domain in "${DOMAINS_API[@]}"; do
  echo -n "  $domain$API_HEALTH: "
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$domain$API_HEALTH 2>/dev/null || echo "000")
  
  if [ "$CODE" = "200" ]; then
    echo -e "${GREEN}✓ $CODE - Healthy${NC}"
  elif [ "$CODE" = "000" ]; then
    echo -e "${RED}✗ Connection failed${NC}"
  else
    echo -e "${YELLOW}⚠ $CODE${NC}"
  fi
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✓ Check complete                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
