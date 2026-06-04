# ALIVIA

Plataforma de votación digital basada en Open SaaS / Wasp. Monorepo con tres paquetes:

- [app/](app/) — App Wasp 0.23 (React + Node + Prisma + Postgres). Reglas específicas del framework en [app/CLAUDE.md](app/CLAUDE.md).
- [blog/](blog/) — Docs y blog en Astro + Starlight. Sitio: `https://docs.<dominio>`.
- [e2e-tests/](e2e-tests/) — Suite Playwright contra el app.

## Despliegue

VPS Linux + Docker. Tres subdominios detrás de un único proxy `rash07/nginx-proxy:4.0` que enruta por `VIRTUAL_HOST`:

| Servicio | Subdominio | Contenedor | Origen |
| --- | --- | --- | --- |
| Cliente Vite (SPA) | `<host>` | `client_$N` (nginx) | `app/.wasp/out/web-app/build` |
| Server Wasp (Node) | `api.<host>` | `server_$N` | `app/.wasp/out/Dockerfile` |
| Docs Astro | `docs.<host>` | `docs_$N` (nginx) | `blog/dist` |
| Postgres | — | `postgres_$N` | imagen `postgres:16` |

Postgres vive en docker-compose. **No usar `wasp start db`** (eso es de dev) en producción.

### Scripts

- `/opt/install-alivia.sh` — instalación one-shot sobre VPS limpio. Crea red `proxynet`, levanta el proxy, instala Node 24 + Wasp CLI, clona repo, genera `.env.server`, escribe `docker-compose.yml`, hace `wasp build` + `vite build` + `astro build`, pide certs Let's Encrypt vía DNS-01 wildcard `*.<host>`, copia certs a `/opt/certs/<host>.{crt,key}`, `api.<host>.{crt,key}`, `docs.<host>.{crt,key}`.
- [script-update.sh](script-update.sh) — actualización por rama. Hace `git pull` → `wasp build` → detecta protocolo desde `.env.server` → `vite build` con `REACT_APP_API_URL` correcto → `astro build` del blog → `docker-compose up -d --build --force-recreate` → espera al server.

## Gotchas no obvios

- **`docker-compose restart` no recarga `.env.server`.** `env_file:` se hornea en `docker create`, así que tras editar variables hay que **recrear** el contenedor: `docker-compose up -d --force-recreate server_$N`.
- **`client_$N` requiere `--force-recreate` en cada update.** `wasp build` reemplaza la carpeta `.wasp/out/web-app/build/`, y como nginx la tiene bind-mounted, sin recrear el contenedor sigue apuntando al inode viejo y sirve 403/404 en rutas SPA.
- **`emailSender provider: Dummy` rompe el build de prod.** El install-script lo parchea a `SendGrid` en `main.wasp`. Si se reemplaza por otro provider, mantener el patch.
- **`nginx-proxy` busca cert por `VIRTUAL_HOST` exacto.** Un cert wildcard `*.<host>` cubre los SAN, pero hay que copiarlo a `/opt/certs/<vhost>.{crt,key}` con el nombre exacto del subdominio.
- **Blog Astro hornea el dominio en build-time.** [blog/astro.config.mjs](blog/astro.config.mjs) tiene `site: "https://docs.<host>"`. Cambiar el dominio implica rebuild del blog, no sólo cambiar nginx.
- **Cliente Vite hornea la URL de API en build-time.** Se pasa por `REACT_APP_API_URL`. Cambiar de HTTP a HTTPS o de host requiere rebuild + force-recreate del cliente.
- **Migrations corren solas al boot del server.** El `Dockerfile` generado por `wasp build` ejecuta `prisma migrate deploy` en el entrypoint. No correr `wasp db migrate-dev` en el servidor.

## Configuración Syscoin / zkSYS

Esta sección está dividida en dos capas: **patrones agnósticos** (sirven para cualquier red EVM-style de Syscoin) y **parámetros de cada red** (devnet de referencia + testnet de Alivia).

### Patrones agnósticos (válidos para cualquier red Syscoin)

#### Wallets soportadas

| Wallet | Prioridad | Notas |
| --- | --- | --- |
| **Pali Wallet** | 1 — recomendada | Oficial de Syscoin. Soporta UTXO + NEVM nativamente. Inyecta `window.ethereum`. |
| **MetaMask** | 2 — fallback | EVM-only. Inyecta `window.ethereum` también. |

#### Patrón de auto-switch al conectar

Pseudocódigo agnóstico (los placeholders `TARGET_CHAIN_ID_HEX` y `TARGET_NETWORK_CONFIG` se rellenan con los valores de la red que estés usando — ver tablas más abajo):

```ts
async function ensureCorrectNetwork(ethereum) {
  const current = await ethereum.request({ method: 'eth_chainId' })  // ← devuelve string hex
  if (current === TARGET_CHAIN_ID_HEX) return

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: TARGET_CHAIN_ID_HEX }],
    })
  } catch (err) {
    if (err.code === 4902) {
      // Red no agregada en la wallet → agregar y reintentar
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [TARGET_NETWORK_CONFIG],  // EIP-3085 shape
      })
    } else {
      throw err
    }
  }
}
```

#### Eventos de wallet a escuchar

- `accountsChanged` — si `accounts.length === 0`, el usuario se desconectó; limpiar estado.
- `chainChanged` — reload de la página es lo más seguro (instancias de contrato en memoria pueden quedar apuntando a la red vieja).

#### Gotchas validados

- **`eth_chainId` devuelve string hex, no number.** Comparar siempre contra `'0xDED2'` (o el hex de tu red), nunca contra `57042` o el decimal.
- **Las testnets/devnets de Syscoin no vienen pre-agregadas** en Pali ni MetaMask. El fallback `4902 → wallet_addEthereumChain` es obligatorio.
- **El RPC tiene latencia variable** — usar reintentos exponenciales en escrituras (ver [05-architecture §11](docs/specs/05-architecture.md)). Plan B2 de [06-demo-acceptance §6](docs/specs/06-demo-acceptance.md) cubre el caso de mint fallido en vivo.
- **Hardhat networks**: configurar `customChain` con el chainId correcto para que `npx hardhat verify` funcione contra el explorer de Syscoin. Sin esto, verify intenta contra Etherscan y falla.
- **Contratos**: compilar con Solidity `0.8.24` + OpenZeppelin v5. OZ v5 cambió la API de `Ownable` — constructor ahora requiere `Ownable(msg.sender)` explícito.
- **Cliente EVM de Alivia: `viem`** (ver [05-architecture §1](docs/specs/05-architecture.md)). Los snippets de arriba están en `window.ethereum` crudo; en viem equivale a `createWalletClient({ chain, transport: custom(window.ethereum) })` + `walletClient.switchChain` / `addChain`.

### Red de referencia · zkSYS PoB Devnet (validada en 0xSonata)

Esta es la red sobre la que el mismo equipo desplegó [0xSonata](https://github.com/BenjaminGhiggo/0xSonata). Sirve como **referencia funcional** de los patrones de arriba — todos los patrones están probados acá. **No es la red de Alivia.**

| Parámetro | Valor |
| --- | --- |
| Chain ID (decimal) | `57042` |
| Chain ID (hex) | `0xDED2` |
| RPC URL | `https://rpc-pob.dev11.top` |
| Explorer | `https://explorer-pob.dev11.top` |
| Token nativo | `tSYS` (18 decimales) |
| Contrato verificado de ref. | `0x01c9A88bFe2a2B3729c3d97279Ca88F7cC3Ef373` (ERC-721) |

```ts
const ZKSYS_POB_DEVNET = {
  chainId: '0xDED2',
  chainName: 'zkSYS PoB Devnet',
  nativeCurrency: { name: 'tSYS', symbol: 'tSYS', decimals: 18 },
  rpcUrls: ['https://rpc-pob.dev11.top'],
  blockExplorerUrls: ['https://explorer-pob.dev11.top'],
}
```

Uso recomendado de esta red para Alivia: **testing local / interno** durante implementación F1–F3 si la testnet oficial está caída o lenta. **No usar para el demo del jueves** — el demo va contra la testnet del hackathon.

### Red de Alivia · zkSYS Testnet

Red pública oficial de Syscoin, confirmada en el [anuncio de lanzamiento](https://syscoin.org/news/zksys-testnet-launch).

| Parámetro | Valor |
| --- | --- |
| Chain ID (decimal) | `5701` |
| Chain ID (hex) | `0x1645` |
| RPC URL | `https://rpc-test-zk.syscoin.org/` |
| Explorer | `https://explorer-test-zk.syscoin.org/` |
| Bridge | `https://bridge-test-zk.syscoin.org/` |
| Faucet | `https://faucet-test-zk.syscoin.org/` |
| Token nativo | `TSYS` (18 decimales) |

```ts
const ZKSYS_TESTNET = {
  chainId: '0x1645',
  chainName: 'zkSYS Testnet',
  nativeCurrency: { name: 'TSYS', symbol: 'TSYS', decimals: 18 },
  rpcUrls: ['https://rpc-test-zk.syscoin.org/'],
  blockExplorerUrls: ['https://explorer-test-zk.syscoin.org/'],
}
```

#### Gotchas específicos de zkSYS Testnet

- **Arquitectura**: zkSYS es una **Validium / edgechain** powered by zkSync zkStack + Zeeve RaaS. **NO** se settle en Ethereum — anchora directo a Syscoin L1 (Bitcoin-backed). Esto cambia el modelo de gas y finality vs Tanenbaum o Rollux.
- **Faucet vs airdrop del hackathon**: el faucet público (link arriba) reparte TSYS de testnet. Si el organizador (Fer) prometió un airdrop adicional de 10 tSYS, va por canal aparte — confirmar en Discord.
- **No confundir con redes hermanas**:
  - `Rollux Testnet` (chainId `57000`) — rollup distinto.
  - `Syscoin Tanenbaum` (chainId `5700`) — NEVM L1 testnet.
  - `zkSYS PoB Devnet` (chainId `57042`) — la red dev del programa Proof-of-Builders (la que usó 0xSonata).
  - **Alivia → `5701` (zkSYS Testnet)**, no las anteriores.

### Variables de entorno

Ver [05-architecture §6](docs/specs/05-architecture.md). Valores reales:

```dotenv
ZKSYS_RPC_URL=https://rpc-test-zk.syscoin.org/
ZKSYS_CHAIN_ID=5701
ZKSYS_CHAIN_ID_HEX=0x1645
ZKSYS_EXPLORER_URL=https://explorer-test-zk.syscoin.org/
ZKSYS_FAUCET_URL=https://faucet-test-zk.syscoin.org/
ALIVIA_VAULT_PRIVATE_KEY=0x...      # cifrada, NUNCA al repo
ALIVIA_ACTA_CONTRACT=0x...          # se llena tras deploy de 04-nfts §3
```

## Documentación del proyecto

`docs/` es la fuente de verdad interna (no se publica). `blog/` es lo público (se publica en `docs.<host>`).

```
docs/
├── SOUL.md           ← constitución ética del agente (no negociables)
├── instinct.md       ← voz operativa (cómo habla, escucha, decide)
└── specs/            ← specs técnicas numeradas (SDD)
    ├── 00-overview.md                 ← visión, problema, usuarios, alcance MVP, métricas
    ├── 01-agent-behavior.md           ← reglas R1..R10 del agente
    ├── 02-data-model.md               ← Node polimórfico + Edge + Case + Contributor (→ schema.prisma)
    ├── 03-use-cases.md                ← 5 casos de uso con criterios de aceptación
    ├── 04-nfts.md                     ← 4 NFTs: Acta, Aportante, Bounty, Llave
    ├── 05-architecture.md             ← stack (Wasp + gpt-4o-mini + viem + zkSYS), integraciones, deploy
    ├── 06-demo-acceptance.md          ← qué debe estar vivo el jueves 3pm + planes B
    └── 07-implementation-checklist.md ← tareas granulares por fases con demo gates
```

## Spec-Driven Development

Todo cambio no trivial **arranca con una spec** en `docs/specs/`. La numeración 00–06 es estable: cada doc tiene un rol fijo, no se reordena. El doc 07 es checklist de implementación (puede crecer con sub-checklists por feature). Features nuevas se reflejan dentro del doc temático correspondiente (ej. nuevo flow de bot → actualiza `01-agent-behavior.md` + tasks en `07`).

Cada spec contiene tres bloques:

- **Requirements** — problema, alcance, criterios de aceptación.
- **Design** — entidades (→ `app/schema.prisma`), routes/pages/operations/jobs (→ `app/main.wasp`), side effects (LLM, blockchain, email).
- **Tasks** — checklist con `[ ]` / `[x]` agrupado por fases atómicas demoables (vive en `07`).

[docs/specs/07-implementation-checklist.md](docs/specs/07-implementation-checklist.md) es el **checklist viviente** del MVP — se marca con cada PR, vista global del avance.

La spec se commitea antes de tocar código. Si la implementación diverge, se actualiza la spec en el mismo PR — la spec es fuente de verdad, no documentación post-hoc.

### Por qué SDD encaja con Wasp

`main.wasp` ya es una spec ejecutable: lo que defines en design como rutas, operations, jobs o auth se traduce 1:1 a bloques de Wasp. `schema.prisma` cumple el mismo rol para datos. El loop queda:

1. Requirements → criterios de aceptación.
2. Design → bloques nuevos en `main.wasp` + entidades en `schema.prisma`.
3. Tasks → handlers TypeScript en `app/src/` (un archivo por operation, página, job).
4. `wasp build` y validar.

No editar `app/.wasp/out/` — es output generado en cada build.

### Reglas operativas del checklist

- Cada commit referencia su task: `feat(grafo): submitReport — closes 03.F1.2`.
- Marcar `[x]` se hace en el mismo PR que cierra la task, no en batch.
- Cada fase tiene un "demo gate": al cerrar la fase, hay algo demoable aunque las siguientes no existan.
- Si una task no entra en ≤2h, se rompe en sub-tasks.

## Convenciones de código

Aplican a todo TypeScript bajo `app/src/`. No aplican a `app/.wasp/out/` (generado), `app/migrations/`, ni archivos de seed.

### Principios

- **Open/Closed.** Nuevas capacidades se agregan creando archivos nuevos, no editando los existentes. Concretamente en Wasp:
  - Nuevo operation → nuevo archivo en `src/operations/<dominio>/`, nueva línea en `main.wasp`. Nunca pegar lógica nueva en un operation que ya hace algo distinto.
  - Comportamiento variable (LLM provider, chain provider, scoring algo) → interfaz + estrategia inyectada por argumento. Cambiar Claude por GPT debe ser un solo `new GPTProvider()`, no editar el caller.
- **Clean Code.** Naming verb-first para acciones (`submitReport`, `detectConvergence`), noun para entidades. Funciones idealmente < 20 líneas, una responsabilidad. Sin código comentado. Magic numbers a constantes con nombre.
- **Errores en bordes.** Validar input en el operation; pasar data confiada a funciones internas. No defensive coding interno innecesario.

### Modularización

- **Límite blando: 200 líneas por archivo.** Al acercarse, extraer helpers a co-located:
  ```
  src/operations/grafo/submitReport.ts          ← entrypoint del operation
  src/operations/grafo/_helpers/dedupEntity.ts  ← lógica pura testeable
  src/operations/grafo/_helpers/linkEdges.ts
  ```
- Excepciones legítimas al límite (no forzar split):
  - Schemas Zod / type definitions cohesivos.
  - Seed data o fixtures.
  - Un componente React con markup grande pero una sola responsabilidad.
- Helpers en `_helpers/` (prefijo underscore) para distinguir lo importado por `main.wasp` de lo interno.

### Estructura de carpetas

Layout autoritativo en [docs/specs/05-architecture.md §5](docs/specs/05-architecture.md). Resumen:

```
app/src/
├── auth/
├── client/           ← React: pages/ + components/
└── server/
    ├── agent/        ← router, alivia, tools, prompts/
    ├── graph/        ← queries, mutations, dossier
    ├── chain/        ← viemClient, mintActa, ipfs
    └── operations.ts ← operations que main.wasp expone

bots/                 ← bots/telegram + bots/discord (procesos separados)
contracts/            ← AliviaActa.sol + Hardhat
scripts/              ← seed-graph, smoke, mint-test-acta
data/seed/            ← CSVs OSINT pre-cargados
```

Helpers internos de un módulo van en `_helpers/` co-located (prefijo underscore para distinguir de archivos importados por `main.wasp`). Si un módulo lo usa un solo consumidor, vive co-located, no en lib/ global.

### Tests

Tests-first sólo para tasks marcadas demo-critical en [docs/specs/07-implementation-checklist.md](docs/specs/07-implementation-checklist.md). Resto: código directo + Playwright E2E que recorre el flujo demo. Vitest para unit (`wasp test`), Playwright en [e2e-tests/](e2e-tests/) para end-to-end.

## Flujo Git

Branching modelo Kanban. Cada feature del backlog tiene un ID `SB-N` y un árbol de versiones `SB-N-vK` que itera hasta dejar el feature sin bugs.

```
main ◀─── dev ◀─── SB-N ◀─── SB-N-v1 ◀─── SB-N-v2 ◀─── … ◀─── SB-N-vK
                  (feature)    (impl)       (fix)                (fix final)
```

### Jerarquía de ramas

| Rama | Rol | Recibe merges desde |
| --- | --- | --- |
| `main` | Producción. Lo que está desplegado en VPS. | `dev` |
| `dev` | Integración. Estable, no productiva. | `SB-N` (features cerrados sin bugs) |
| `SB-N` | Feature del Kanban (ej. `SB-1`, `SB-2`). Sale de `dev`. | `SB-N-vK` (la última versión limpia) |
| `SB-N-v1` | Implementación inicial del feature. Sale de `SB-N`. Aquí va el código del feature. | — |
| `SB-N-v2`…`SB-N-vK` | Iteraciones de bugfix sucesivas. Cada una sale de la anterior. | — |

### Ciclo de vida de un feature

1. Crear ticket `SB-N` en el Kanban.
2. `git checkout dev && git pull && git checkout -b SB-N`.
3. `git checkout -b SB-N-v1` — branch de implementación.
4. Implementar hasta cerrar el alcance del feature. Commits en `SB-N-v1`.
5. Validar: tests + smoke + revisión.
6. Si hay bugs: `git checkout -b SB-N-v2` desde `SB-N-v1`, resolver bugs, validar.
7. Repetir paso 6 con `v3`, `v4`, …, `vK` hasta validación limpia.
8. Merge `SB-N-vK` → `SB-N` (la última versión limpia consolida el feature).
9. Merge `SB-N` → `dev` (el feature entra a integración).
10. Periódicamente, merge `dev` → `main` (release a producción).

### Reglas duras

- **Nunca** commitear directo a `main` ni a `dev`. Sólo reciben merges.
- **Nunca** commitear directo a `SB-N`. Los commits viven siempre en `SB-N-vK`.
- **K es bugfix, no feature nuevo.** Si el alcance crece, abrir `SB-M` (otro ticket), no agregar versiones.
- **Branch name coincide con el ticket del Kanban exacto** (`SB-1-v3`, no `sb1-v3` ni `SB1-fix`).
- **Una task de [07-implementation-checklist](docs/specs/07-implementation-checklist.md) por commit** cuando sea posible. Si abarca varias, listarlas todas.

### Convención de commits

```
<tipo>(<area>): <descripción> · SB-N[-vK] [· 07.F<n>.<m>]
```

Ejemplos:

- `feat(graph): submitReport con dedup soft · SB-1-v1 · 07.F2.5`
- `fix(agent): reintento ante JSON inválido · SB-1-v2`
- `test(score): unit del cálculo de corroboración · SB-1-v1 · 07.F2.7`

Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

## Convenciones del repo

- Las migrations Prisma viven en [app/migrations/](app/migrations/) y se commitean al repo.
- Secretos en `.env.server` y `.env.client` (gitignored). Sólo se commitean `*.example`.
- El install-script genera `/opt/<host>.txt` con credenciales (postgres password, paths, versiones) — fuera del repo.
