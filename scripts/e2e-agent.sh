#!/bin/bash
# E2E smoke del agente Alivia contra el server en vivo.
# Falla rápido si alguna respuesta es canned o vacía.
#
# Uso: ./scripts/e2e-agent.sh
#      ./scripts/e2e-agent.sh https://api.alivia.sbs

set -euo pipefail

BASE_URL="${1:-https://api.alivia.sbs}"
SECRET=$(grep "^ALIVIA_BOT_SHARED_SECRET=" /opt/alivia.sbs/app/.env.server | cut -d= -f2)
PASS=0
FAIL=0
CANNED="Recibo pistas ciudadanas de corrupción y respondo consultas sobre personas, cargos o empresas"

check() {
  local name="$1"
  local user_id="$2"
  local msg="$3"
  local expected_regex="$4"

  local response
  response=$(curl -s -X POST "$BASE_URL/api/agent/turn" \
    -H "Content-Type: application/json" \
    -H "X-Alivia-Bot-Token: $SECRET" \
    -d "{\"channel\":\"web\",\"externalUserId\":\"$user_id\",\"message\":\"$msg\"}")
  local text
  text=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('text',''))" 2>/dev/null || echo "")

  printf "[%-30s] " "$name"

  if [ -z "$text" ]; then
    echo "FAIL · respuesta vacía"
    echo "  raw: $response"
    FAIL=$((FAIL+1))
    return
  fi
  if echo "$text" | grep -qE "^${CANNED}"; then
    echo "FAIL · respuesta canned"
    echo "  text: $text"
    FAIL=$((FAIL+1))
    return
  fi
  if ! echo "$text" | grep -qiE "$expected_regex"; then
    echo "FAIL · no matchea /$expected_regex/i"
    echo "  text: $text"
    FAIL=$((FAIL+1))
    return
  fi
  echo "PASS"
  PASS=$((PASS+1))
}

USER_BASE="e2e-$(date +%s)"

echo "=== Alivia E2E agent smoke (base=$BASE_URL) ==="

# 1) saludo → Alivia se presenta usando system prompt
check "saludo"           "${USER_BASE}-a" "Hola Alivia"           "alivia|hola|soy"

# 2) "quien eres" → identidad desde instinct.md
check "quien_eres"       "${USER_BASE}-b" "quien eres"            "alivia|agente|ciudadan|corrupci"

# 3) follow-up arbitrario → conversación natural, NO canned
check "follow_up"        "${USER_BASE}-c" "como que?"             "."

# 4) consulta de nombre que NO está en grafo → cae a conversacional
check "consulta_sin_match" "${USER_BASE}-d" "quien es Fulano Inventado XYZ" "alivia|registr|no tengo|inform"

# 5) consulta de nombre del seed → debe devolver dossier
check "consulta_con_match" "${USER_BASE}-e" "quien es Juan Pérez Quispe" "dossier|persona|vínculo|persona|cargo|conexion|familia"

# 6) reset con /start desde el agente
check "reset_start"      "${USER_BASE}-f" "/start"                "alivia|hola|en qu"

# 7) denuncia inicial → entra en flujo entrevista
check "denuncia_intro"   "${USER_BASE}-g" "quiero reportar nepotismo del gerente Juan Pérez Quispe que designó a su prima Ana Pérez Quispe en marzo 2026" "evidenc|fecha|detalle|cuent|conex"

echo ""
echo "=== resultado: $PASS pass · $FAIL fail ==="
[ "$FAIL" -eq 0 ]
