---
title: Arquitectura
---

ALIVIA sigue una arquitectura de microservicios orquestada con Docker.

## Diagrama general

```
Votante → nginx-proxy (SSL) → Cliente React (SPA)
                             → API Node.js (REST) → PostgreSQL
                                                  → Syscoin NEVM (Blockchain)
```

## Capa de presentación

- **React 19** con **TypeScript** y **Tailwind CSS**
- Build estático generado con **Vite** y servido por nginx
- Single Page Application (SPA) con enrutamiento client-side
- Soporte completo para dark mode y diseño responsive

## Capa de aplicación

- **Node.js** como runtime del servidor
- **TypeScript** para tipado estricto en toda la API
- **Prisma ORM** para acceso seguro y tipado a la base de datos
- API REST con autenticación JWT (email/password + OAuth)
- Migraciones de base de datos automáticas al arranque del servidor

## Capa de datos

- **PostgreSQL 16** como base de datos relacional principal
- Almacena usuarios, elecciones, configuración y metadatos de votos
- Volumen Docker persistente para durabilidad
- Los votos en sí se registran en la blockchain, no en la base de datos

## Capa blockchain

- **Syscoin NEVM** — Blockchain EVM-compatible con merge-mining de Bitcoin
- Smart contracts en **Solidity** para registro inmutable de votos
- Cada voto se cifra de extremo a extremo antes de registrarse como transacción
- Costo por transacción: < $0.01 USD
- Finality: ~5 segundos
- Auditoría pública vía explorador de bloques de Syscoin

## Seguridad

| Capa | Mecanismo |
|---|---|
| Transporte | TLS 1.3 (Let's Encrypt wildcard) |
| Autenticación | JWT + verificación biométrica con IA |
| Voto | Cifrado E2E + Zero-Knowledge Proofs |
| Blockchain | Merge-mining con Bitcoin (hashrate compartido) |
| Infraestructura | Contenedores aislados + redes Docker bridge |

## Escalabilidad

- Cada instancia es independiente y se identifica por número de servicio
- Múltiples instancias pueden coexistir en el mismo servidor
- La blockchain de Syscoin soporta 1,000+ TPS
- El cliente estático se puede servir desde CDN para baja latencia global
