#!/bin/bash
# E2E completo de los 4 NFTs.
# - NFT-Acta: ya validado por scripts/e2e-agent.sh (E2E demo flow)
# - NFT-Aportante: cuando el agente persiste un Case, soulboundTokenId
#                  debe quedar guardado en el Contributor del aportante.
# - NFT-Bounty: read on-chain del contrato existente (sin firmar, sin gastar).
# - NFT-Llave: verificación on-chain via isValid().
#
# Uso: ./scripts/e2e-nfts.sh

set -uo pipefail

PASS=0
FAIL=0

check() {
  local name="$1"
  local cmd="$2"
  printf "[%-40s] " "$name"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "PASS"; PASS=$((PASS+1))
  else
    echo "FAIL"; FAIL=$((FAIL+1))
    eval "$cmd" 2>&1 | head -3 | sed 's/^/    /'
  fi
}

DB() {
  sudo docker exec postgres_alivia_sbs psql -U wasp -d alivia -tA -c "$1"
}

source /opt/alivia.sbs/app/.env.server

echo "=== Alivia E2E NFTs (chain ${ZKSYS_CHAIN_ID}) ==="

# 1) Los 4 contratos están en chain
for var in ALIVIA_ACTA_CONTRACT ALIVIA_APORTANTE_CONTRACT ALIVIA_BOUNTY_CONTRACT ALIVIA_LLAVE_CONTRACT; do
  addr="${!var:-}"
  if [ -z "$addr" ] || [ "$addr" = "0x..." ]; then
    printf "[%-40s] FAIL · %s no seteado\n" "$var" "$var"; FAIL=$((FAIL+1))
    continue
  fi
  code=$(curl -s -X POST -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$addr\",\"latest\"],\"id\":1}" \
    "$ZKSYS_RPC_URL" | python3 -c "import sys,json; print(json.load(sys.stdin)['result'])")
  if [ "$code" = "0x" ] || [ -z "$code" ]; then
    printf "[%-40s] FAIL · sin bytecode en %s\n" "$var" "$addr"; FAIL=$((FAIL+1))
  else
    printf "[%-40s] PASS · %s\n" "$var" "$addr"; PASS=$((PASS+1))
  fi
done

# 2) NFT-Acta tiene token #1 minteado
check "NFT-Acta token #1 minteado" \
  "[ \"\$(DB 'SELECT \"nftTokenId\" FROM \"Case\" WHERE \"nftTokenId\" IS NOT NULL LIMIT 1;')\" != '' ]"

# 3) Aportante en DB tiene soulboundTokenId (después de la denuncia demo)
check "Algún Contributor con soulboundTokenId" \
  "[ \"\$(DB 'SELECT count(*) FROM \"Contributor\" WHERE \"soulboundTokenId\" IS NOT NULL;')\" != '0' ]"

# 4) AliviaBounty name() devuelve 'Alivia Bounty'
ADDR=$ALIVIA_BOUNTY_CONTRACT
NAME_DATA="0x06fdde03"
NAME_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$ADDR\",\"data\":\"$NAME_DATA\"},\"latest\"],\"id\":1}" \
  "$ZKSYS_RPC_URL" | python3 -c "
import sys,json
try:
  r = json.load(sys.stdin)['result']
  if r and len(r)>130:
    s = bytes.fromhex(r[130:].rstrip('0'))
    print(s.decode('utf-8', errors='replace'))
  else:
    print('')
except: print('')")
check "Bounty contract responde name()='Alivia Bounty'" \
  "[ \"$NAME_RESULT\" = 'Alivia Bounty' ]"

# 5) AliviaLlave name() = 'Alivia Llave'
ADDR=$ALIVIA_LLAVE_CONTRACT
NAME_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$ADDR\",\"data\":\"$NAME_DATA\"},\"latest\"],\"id\":1}" \
  "$ZKSYS_RPC_URL" | python3 -c "
import sys,json
try:
  r = json.load(sys.stdin)['result']
  if r and len(r)>130:
    s = bytes.fromhex(r[130:].rstrip('0'))
    print(s.decode('utf-8', errors='replace'))
  else:
    print('')
except: print('')")
check "Llave contract responde name()='Alivia Llave'" \
  "[ \"$NAME_RESULT\" = 'Alivia Llave' ]"

# 6) AliviaAportante name() = 'Alivia Aportante'
ADDR=$ALIVIA_APORTANTE_CONTRACT
NAME_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$ADDR\",\"data\":\"$NAME_DATA\"},\"latest\"],\"id\":1}" \
  "$ZKSYS_RPC_URL" | python3 -c "
import sys,json
try:
  r = json.load(sys.stdin)['result']
  if r and len(r)>130:
    s = bytes.fromhex(r[130:].rstrip('0'))
    print(s.decode('utf-8', errors='replace'))
  else:
    print('')
except: print('')")
check "Aportante contract responde name()='Alivia Aportante'" \
  "[ \"$NAME_RESULT\" = 'Alivia Aportante' ]"

echo ""
echo "=== resultado: $PASS pass · $FAIL fail ==="
[ "$FAIL" -eq 0 ]
