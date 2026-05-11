---
title: Inicio rápido
---

Guía para comenzar a usar ALIVIA como plataforma de votación digital.

## Requisitos del sistema

| Componente | Requisito mínimo |
|---|---|
| Servidor | VPS con Ubuntu 24.04+ / 2 vCPU / 4 GB RAM |
| Runtime | Node.js 24+ |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker + docker-compose v2 |
| Dominio | Dominio propio con acceso a configuración DNS |
| SSL | Let's Encrypt (automatizado vía DNS-01) |

## Stack tecnológico

ALIVIA utiliza las siguientes tecnologías:

- **TypeScript** — Tipado estático en frontend y backend
- **React 19** — Interfaz de usuario reactiva
- **Vite** — Bundler de última generación para el cliente
- **Node.js** — Runtime del servidor API
- **Prisma** — ORM para acceso seguro a la base de datos
- **PostgreSQL 16** — Base de datos relacional con soporte transaccional
- **Syscoin NEVM** — Blockchain para registro inmutable de votos
- **Docker** — Contenedores para despliegue reproducible
- **nginx** — Proxy reverso con SSL y enrutamiento por subdominio

## Servicios desplegados

Una instalación de ALIVIA levanta los siguientes servicios:

| Servicio | Descripción | Subdominio |
|---|---|---|
| Cliente web | SPA React con Vite (estático) | `tudominio.com` |
| API server | Node.js con Prisma y autenticación | `api.tudominio.com` |
| Documentación | Astro Starlight (estático) | `docs.tudominio.com` |
| Base de datos | PostgreSQL 16 con volumen persistente | interno |

## Proceso de instalación

1. Configurar DNS: apuntar `tudominio.com` y `*.tudominio.com` a la IP del VPS
2. Ejecutar el instalador automatizado en el servidor
3. Ingresar el dominio y número de servicio
4. El instalador configura dependencias, compila el proyecto y levanta contenedores
5. Opcionalmente configurar SSL con Let's Encrypt (DNS-01 wildcard)

## Post-instalación

Tras la instalación, se requiere configurar:

- **Credenciales de servicios externos** (pasarela de pagos, email, OAuth) en el archivo de variables de entorno
- **DNS** verificar que los subdominios `api.*` y `docs.*` resuelvan correctamente
- **Integración con Syscoin** — Configurar nodo RPC o provider para interacción con la blockchain
