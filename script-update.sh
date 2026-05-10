#!/bin/bash

# Script de actualización de ALIVIA (Wasp/Vite/Docker)
# Uso: ./script-update.sh [rama] [service_number]
# Ejemplo: ./script-update.sh main 1

BRANCH=${1:-'main'}
SERVICE_NUMBER=${2:-'1'}
APP_DIR="$(cd "$(dirname "$0")/app" && pwd)"

# nvm
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm use 24 2>/dev/null
fi

echo "=== Actualizando ALIVIA ==="
echo "Rama: $BRANCH | Service: $SERVICE_NUMBER"
echo ""

# 1. Bajar cambios
echo "📥 Bajando cambios de $BRANCH..."
git pull origin "$BRANCH"
if [ $? -ne 0 ]; then
    echo "❌ Error en git pull. Resuelve conflictos antes de continuar."
    exit 1
fi

# 2. Wasp build (server + migrations)
echo "🔨 Compilando wasp build..."
cd "$APP_DIR"
wasp build
if [ $? -ne 0 ]; then
    echo "❌ Error en wasp build."
    exit 1
fi

# 3. Detectar protocolo actual
PROTOCOL="http"
if grep -q "WASP_WEB_CLIENT_URL=https://" "$APP_DIR/.env.server" 2>/dev/null; then
    PROTOCOL="https"
fi
HOST=$(grep "WASP_WEB_CLIENT_URL=" "$APP_DIR/.env.server" | sed "s|WASP_WEB_CLIENT_URL=${PROTOCOL}://||")
echo "🌐 Protocolo: $PROTOCOL | Host: $HOST"

# 4. Rebuild cliente (Vite)
echo "🏗️  Rebuildeando cliente..."
cd "$APP_DIR"
REACT_APP_API_URL="${PROTOCOL}://api.${HOST}" npx vite build
if [ $? -ne 0 ]; then
    echo "❌ Error en vite build."
    exit 1
fi

# 5. Rebuild server Docker + force-recreate (aplica migrations automáticamente)
echo "🐳 Recreando contenedores..."
cd "$APP_DIR"
sudo docker-compose up -d --build --force-recreate

# 6. Esperar server
echo "⏳ Esperando que el server esté listo..."
for i in {1..60}; do
    if sudo docker-compose logs --tail=5 "server_$SERVICE_NUMBER" 2>/dev/null | grep -qi "listening\|ready\|started"; then
        echo "✅ Server listo"
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo "⚠️  Timeout esperando server. Revisa logs:"
        echo "  sudo docker-compose logs server_$SERVICE_NUMBER"
    fi
    sleep 3
done

# 7. Mostrar logs recientes
echo ""
echo "📋 Logs del server:"
sudo docker-compose logs --tail=10 "server_$SERVICE_NUMBER" 2>/dev/null

echo ""
echo "=== ✅ Actualización completada ==="
echo "Cliente: ${PROTOCOL}://${HOST}"
echo "API:     ${PROTOCOL}://api.${HOST}"
