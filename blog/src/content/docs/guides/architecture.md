---
title: Arquitectura
---

ALIVIA está desplegada como un conjunto de contenedores Docker orquestados con docker-compose.

## Componentes

- **`server`**: Servidor Node.js generado por Wasp, corre en puerto 3001. Expone la API REST y maneja autenticación, base de datos y lógica de negocio.
- **`client`**: Cliente estático (React + Vite) servido por nginx:alpine. Se comunica con el server vía HTTP.
- **`postgres`**: Base de datos PostgreSQL 16 con volumen persistente.

## Redes

- `proxynet` (external): Red compartida con el proxy nginx reverso que maneja SSL y enrutamiento por VIRTUAL_HOST.
- `alivia-net-N` (internal): Red bridge para comunicación entre server y postgres.

## Flujo de una petición

```
Usuario → nginx-proxy (443) → client (80) → API calls → server (3001) → postgres (5432)
```

## Blockchain

Los votos se registran en Syscoin NEVM mediante smart contracts. El server interactúa con la red Syscoin a través de su RPC. Cada transacción queda visible en el explorador de bloques para auditoría pública.
