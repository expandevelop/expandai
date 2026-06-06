#!/usr/bin/env bash
set -euo pipefail

WEB_BASE="http://34.73.25.196:3000"
API_BASE="http://34.238.172.151/api/v1"
EMAIL="admin@expandai.com"
PASSWORD="Expand@123"
OUT="/home/ubuntu/expandai/tmp_mvp_validation"
mkdir -p "$OUT"

check_route() {
  local route="$1"
  local target="${WEB_BASE}${route}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$target")
  printf '%s %s\n' "$route" "$code"
}

{
  echo "[web_routes]"
  check_route "/"
  check_route "/clientes"
  check_route "/catalogo"
  check_route "/oportunidades"
  check_route "/vendas"
  check_route "/financeiro"
  echo

  echo "[login]"
  LOGIN_JSON=$(curl -sS -X POST "${API_BASE}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")
  echo "$LOGIN_JSON" > "$OUT/login.json"
  ACCESS_TOKEN=$(node -e "const fs=require('fs');const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(payload.accessToken||'');" "$OUT/login.json")
  REFRESH_TOKEN=$(node -e "const fs=require('fs');const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(payload.refreshToken||'');" "$OUT/login.json")
  USER_ROLE=$(node -e "const fs=require('fs');const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(payload.user?.role||'');" "$OUT/login.json")
  echo "role=${USER_ROLE}"
  echo "access_token_present=$([ -n "$ACCESS_TOKEN" ] && echo yes || echo no)"
  echo "refresh_token_present=$([ -n "$REFRESH_TOKEN" ] && echo yes || echo no)"
  echo

  echo "[protected_me]"
  curl -sS "${API_BASE}/users/me" -H "Authorization: Bearer ${ACCESS_TOKEN}" > "$OUT/me.json"
  node -e "const fs=require('fs');const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(JSON.stringify({id:payload.id,email:payload.email,role:payload.role,status:payload.status},null,2));" "$OUT/me.json"
  echo

  echo "[refresh]"
  REFRESH_JSON=$(curl -sS -X POST "${API_BASE}/auth/refresh" \
    -H 'Content-Type: application/json' \
    -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")
  echo "$REFRESH_JSON" > "$OUT/refresh.json"
  node -e "const fs=require('fs');const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(JSON.stringify({hasAccessToken:Boolean(payload.accessToken),hasRefreshToken:Boolean(payload.refreshToken),role:payload.user?.role||null},null,2));" "$OUT/refresh.json"
  echo

  echo "[business_routes]"
  for endpoint in /clients /product-catalogs /operators /partners /opportunities /sales /finance/billing-records; do
    code=$(curl -s -o /dev/null -w '%{http_code}' "${API_BASE}${endpoint}" -H "Authorization: Bearer ${ACCESS_TOKEN}")
    printf '%s %s\n' "$endpoint" "$code"
  done
} | tee "$OUT/summary.txt"
