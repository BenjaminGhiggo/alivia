---
title: Inicio rápido
---

Guía para desplegar ALIVIA en un VPS limpio.

## Requisitos

- VPS con Ubuntu 24.04 (o superior)
- Dominio propio (ej: alivia.sbs)
- Docker y docker-compose

## Instalación

```bash
git clone https://github.com/BenjaminGhiggo/alivia.git
cd alivia
chmod +x install-alivia.sh
./install-alivia.sh
```

El script te guiará por:

1. Ingresar el dominio
2. Elegir número de servicio (1 para primera instalación)
3. Instalación de dependencias (docker, nvm, node, wasp-cli)
4. Clonado del repositorio
5. Configuración de variables de entorno
6. Compilación del proyecto Wasp
7. Build del cliente estático
8. Levantar contenedores (postgres + server + client)
9. Configuración SSL opcional con Let's Encrypt

## Post-instalación

- Completar credenciales en `app/.env.server` (Stripe, SendGrid, OpenAI, etc.)
- Configurar DNS: `$HOST` y `api.$HOST` apuntando a la IP del VPS
