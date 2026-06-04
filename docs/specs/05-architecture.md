# 05 · Architecture · Alivia

> **Arquitectura técnica del MVP: stack, componentes, flujos de datos, integraciones externas y operación.**
> Este documento sirve como contrato técnico entre los roles de tech lead, backend, frontend, AI/agente, e infra. Cualquier cambio de stack o de integración se actualiza acá primero.

---

## 1. Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework fullstack | **Wasp** (wasp.sh) | Ya está en VPS, integra React + Node + Prisma con menos boilerplate |
| Frontend | React + TypeScript + Tailwind | Standard de Wasp + plantilla OpenSaaS adaptada |
| Visualización del grafo | React Flow o Cytoscape.js | React Flow es más simple y suficiente para el demo |
| Backend | Node.js (TypeScript) sobre Wasp | Operations y queries de Wasp |
| Base de datos | Postgres | Standard de Wasp |
| ORM | Prisma | Standard de Wasp |
| LLM | **OpenAI `gpt-4o-mini`** (router + agente + extracción) | Modelo único en MVP: rápido, barato, suficiente para entrevista guiada y extracción con few-shot. SDK: `openai` v4+. |
| Bot Telegram | `grammY` (TypeScript) | Más moderno y mejor DX que `node-telegram-bot-api` |
| Bot Discord | `discord.js` v14 | Estándar de facto |
| Blockchain | **Syscoin NEVM (zkSYS testnet)** | Requisito de la hackathon + soporte EVM completo |
| Cliente EVM | `viem` | Más liviano y tipado que ethers, soporte excelente para chains custom |
| Wallet de usuario recomendada | **Pali Wallet** (oficial de Syscoin) | Soporta UTXO + NEVM nativamente; integración vía `window.pali` o WalletConnect |
| Almacenamiento de metadata NFT | IPFS vía `NFT.storage` o `web3.storage` | Estándar alineado con SPT (Syscoin Platform Tokens) |
| Despliegue | VPS Linux (el que ya tienen) | Ya está |
| Reverse proxy + TLS | Caddy o Nginx + Let's Encrypt | Para `alivia.sbs` |
| Process manager | PM2 o systemd | Mantener bots y backend up |

### Alineamiento con el ecosistema Syscoin

Toda actividad **on-chain** del proyecto vive en Syscoin: smart contracts en NEVM (zkSYS testnet), NFTs (Acta, Aportante, Bounty, Llave), TSYS como token de bounties y fees, y Pali Wallet como wallet recomendada para el usuario final. El resto del stack (LLM, base de datos, bots de chat, frontend) es **off-chain** y agnóstico — esto es estándar en cualquier dApp y no contradice la regla de "Syscoin ecosystem", que aplica a la capa blockchain del proyecto.

---

## 2. Diagrama de componentes

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              ALIVIA · MVP                                  │
│                                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Telegram Bot │    │  Discord Bot │    │  Web Browser │                  │
│  │   @grammY    │    │ discord.js   │    │    React     │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                          │
│         └─────────┬─────────┴───────────┬───────┘                          │
│                   │                     │                                  │
│         ┌─────────▼──────────┐  ┌───────▼────────┐                         │
│         │  Chat Adapter      │  │  Web API       │                         │
│         │  (normaliza        │  │  (Wasp ops)    │                         │
│         │   eventos)         │  └────────┬───────┘                         │
│         └─────────┬──────────┘           │                                 │
│                   │                      │                                 │
│                   └──────────┬───────────┘                                 │
│                              │                                             │
│         ┌────────────────────▼─────────────────────┐                       │
│         │           ROUTER DE INTENCIÓN            │                       │
│         │       (OpenAI gpt-4o-mini, ~300ms)       │                       │
│         │  intent ∈ {denuncia, consulta, bounty,   │                       │
│         │     acta, monitoreo, fuera_alcance}      │                       │
│         └─────┬──────────────┬────────────┬────────┘                       │
│               │              │            │                                │
│      ┌────────▼─────┐  ┌─────▼──────┐  ┌──▼──────────┐                     │
│      │ AGENTE       │  │ DOSSIER    │  │  Otros      │                     │
│      │ (gpt-4o-mini)│  │ BUILDER    │  │  flujos     │                     │
│      │ + tools      │  │ (queries   │  │             │                     │
│      │              │  │  grafo)    │  │             │                     │
│      └──┬───────────┘  └─────┬──────┘  └─────────────┘                     │
│         │                    │                                             │
│         │   ┌────────────────┴───────────────┐                             │
│         │   │                                │                             │
│         ▼   ▼                                ▼                             │
│   ┌─────────────────┐                ┌──────────────┐                      │
│   │   GRAFO         │                │   IPFS       │                      │
│   │   Postgres      │                │ (metadata    │                      │
│   │   + Prisma      │                │  NFT)        │                      │
│   └────────┬────────┘                └──────────────┘                      │
│            │                                                               │
│            ▼                                                               │
│   ┌─────────────────────┐                                                  │
│   │  zkSYS testnet      │                                                  │
│   │  (Syscoin NEVM)     │                                                  │
│   │  AliviaActa.sol     │                                                  │
│   └─────────────────────┘                                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Componentes

### 3.1 · Adaptadores de chat
- **Telegram Bot** (`apps/bot-telegram`): recibe updates vía long-polling o webhook. Normaliza a `IncomingMessage` y dispara `handleMessage()`.
- **Discord Bot** (`apps/bot-discord`): cliente Gateway con `discord.js`. Normaliza a `IncomingMessage`.
- Ambos publican a una **cola in-memory** que el agente consume secuencialmente por conversación.

### 3.2 · Router de intención
- Modelo: **OpenAI `gpt-4o-mini`** (modo `response_format: json_object` para garantizar salida estructurada).
- Input: el mensaje + breve historial (últimos 3 turnos).
- Output: una de `{denuncia, consulta, bounty_crear, bounty_reclamar, acta_subir, fuera_alcance}`.
- Cache: si el intent ya está fijado en la sesión activa, se mantiene salvo señal explícita de cambio.

### 3.3 · Agente principal
- Modelo: **OpenAI `gpt-4o-mini`** con system prompt definido en `01-agent-behavior.md §8`.
- Tradeoff conocido: `gpt-4o-mini` es rápido y barato pero más liviano que GPT-4o en extracción compleja. Mitigación: prompts con few-shot examples y validación estricta del JSON de salida vs el schema; si el JSON falla validación, se reintenta una vez.
- Tools (function calling):
  - `extract_entities(text) → JSON`
  - `query_graph(name, role?, institution?) → Node[]`
  - `compute_corroboration_score(case) → number`
  - `request_user_confirmation(text) → bool`
  - `persist_case(case) → caseId`
  - `mint_acta(caseId, evidenceHash, snapshotRoot, aportantePseudonym) → txHash`
- Estado de la conversación: persistido en Postgres por `chat_session_id`. Permite recuperar contexto entre desconexiones.

### 3.4 · Dossier builder
- Función pura que toma un `nodeId` y ejecuta las queries de `02-data-model.md §7`.
- Retorna un objeto estructurado que el agente convierte en mensaje natural.

### 3.5 · Grafo (Postgres + Prisma)
- Esquema en `02-data-model.md §6`.
- Migraciones en `app/migrations/`.
- Seed en `scripts/seed-graph.ts`.

### 3.6 · Integración Syscoin
- Cliente **viem** apuntando a RPC de zkSYS testnet.
- Contrato `AliviaActa.sol` (ver `04-nfts.md §3.7`).
- Wallet de bóveda en `.env` como `ALIVIA_VAULT_PRIVATE_KEY` (cifrada).
- Función de minteo:

```ts
import { createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.ALIVIA_VAULT_PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({
  account,
  transport: http(process.env.ZKSYS_RPC_URL),
});

export async function mintActa(input: MintActaInput): Promise<`0x${string}`> {
  const abi = parseAbi(['function mint(address,string,bytes32,bytes32,string,string) returns (uint256)']);
  return client.writeContract({
    address: process.env.ALIVIA_ACTA_CONTRACT as `0x${string}`,
    abi,
    functionName: 'mint',
    args: [input.to, input.caseId, input.evidenceHash, input.graphSnapshotRoot, input.aportantePseudonym, input.tokenUri],
  });
}
```

### 3.7 · IPFS
- Subida vía SDK de `web3.storage` (token gratuito).
- Estructura: cada acta genera dos uploads (la imagen estática + el JSON de metadata). El JSON referencia la imagen por CID.

### 3.8 · Frontend (`alivia.sbs`)
- **Landing**: ya existe, hereda de OpenSaaS.
- **Vista del grafo** (`/grafo`): React Flow con layout force-directed. Stream de actualizaciones vía Server-Sent Events o WebSocket para que el grafo crezca en vivo durante el demo.
- **Feed de casos** (`/casos`): lista paginada de aportes publicados, con score, fecha y enlace al NFT.
- **Página de caso** (`/casos/:id`): ficha del caso con evidencia, conexiones y enlace al NFT-Acta.
- **Página de aportante** (`/aportantes/:pseudonym`): perfil con nivel y aportes.
- **Bounties** (`/bounties`): listado y formulario de creación (mockup).
- **Observatorio Electoral** (`/elecciones`): mockup con actas verificadas.
- **Monitor de licitaciones** (`/licitaciones`): mockup con alertas.

---

## 4. Flujos de datos críticos

### 4.1 · Flujo de denuncia (caso de uso 1)

```
Telegram update
   ↓
Bot adapter → IncomingMessage
   ↓
Router (gpt-4o-mini) → intent="denuncia"
   ↓
Agente (gpt-4o-mini) → orquesta entrevista
   ↓ (tool calls)
extract_entities() → JSON
query_graph(entities) → coincidencias
compute_corroboration_score() → 0.62
request_user_confirmation() → true
persist_case() → caseId
mint_acta() → txHash en zkSYS
   ↓
Respuesta al usuario con txHash
   ↓ (en paralelo)
broadcast SSE "graph_updated" al frontend
```

### 4.2 · Flujo de consulta (caso de uso 2)

```
Mensaje "¿quién es X?"
   ↓
Router → intent="consulta"
   ↓
Agente arma plan de consulta
   ↓
query_graph(X) → 1 o más nodos
   ↓ (si ambiguo) preguntar al usuario
dossier_builder(nodeId)
   ↓
Agente formatea en español natural
   ↓
Respuesta al usuario
```

### 4.3 · Seed del grafo (one-shot pre-demo)

```
scripts/seed-graph.ts
   ↓
Lee CSVs / JSONs en data/seed/
   ↓
Para cada registro: upsert Node, Edge
   ↓
Reporta conteos finales
```

---

## 5. Repo structure (propuesta)

```
alivia.net/
├── app/                          # Wasp app (frontend + backend)
│   ├── main.wasp                 # Definiciones Wasp
│   ├── src/
│   │   ├── auth/
│   │   ├── client/               # React
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Grafo.tsx
│   │   │   │   ├── Casos.tsx
│   │   │   │   ├── Caso.tsx
│   │   │   │   ├── Aportante.tsx
│   │   │   │   ├── Bounties.tsx
│   │   │   │   ├── Elecciones.tsx
│   │   │   │   └── Licitaciones.tsx
│   │   │   └── components/
│   │   │       └── GraphView.tsx
│   │   └── server/
│   │       ├── agent/
│   │       │   ├── router.ts
│   │       │   ├── alivia.ts
│   │       │   ├── tools.ts
│   │       │   └── prompts/
│   │       │       └── alivia-system.es.md
│   │       ├── graph/
│   │       │   ├── queries.ts
│   │       │   ├── mutations.ts
│   │       │   └── dossier.ts
│   │       ├── chain/
│   │       │   ├── viemClient.ts
│   │       │   ├── mintActa.ts
│   │       │   └── ipfs.ts
│   │       └── operations.ts     # operations Wasp expone
│   ├── prisma/
│   │   └── schema.prisma
│   └── migrations/
│
├── bots/
│   ├── telegram/                 # @alivia_sbs_bot
│   │   ├── index.ts
│   │   └── handlers.ts
│   └── discord/
│       ├── index.ts
│       └── handlers.ts
│
├── contracts/
│   ├── AliviaActa.sol
│   ├── hardhat.config.ts
│   └── scripts/
│       └── deploy-acta.ts
│
├── scripts/
│   ├── seed-graph.ts
│   └── mint-test-acta.ts
│
├── data/
│   └── seed/                     # CSVs OSINT pre-cargados
│       ├── personas.csv
│       ├── cargos.csv
│       ├── empresas.csv
│       ├── contratos.csv
│       └── aristas.csv
│
├── docs/
│   ├── specs/
│   │   ├── 00-overview.md
│   │   ├── 01-agent-behavior.md
│   │   ├── 02-data-model.md
│   │   ├── 03-use-cases.md
│   │   ├── 04-nfts.md
│   │   ├── 05-architecture.md
│   │   └── 06-demo-acceptance.md
│   ├── instinct.md
│   ├── SOUL.md
│   └── whitepaper.md
│
├── blog/                         # ya existe
├── e2e-tests/                    # ya existe
├── recursos/                     # ya existe, contexto del equipo
├── LICENSE                       # MIT (a agregar)
└── README.md
```

---

## 6. Variables de entorno

```dotenv
# LLM
OPENAI_API_KEY=sk-...
OPENAI_MODEL_AGENT=gpt-4o-mini
OPENAI_MODEL_ROUTER=gpt-4o-mini

# Telegram
TELEGRAM_BOT_TOKEN=...

# Discord
DISCORD_BOT_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...

# Syscoin Tanenbaum Testnet — zkSYS Testnet está DOWN (jun 2026), usamos Tanenbaum
# Detalle del cambio en CLAUDE.md → "Configuración Syscoin / zkSYS"
ZKSYS_RPC_URL=https://rpc.tanenbaum.io
ZKSYS_CHAIN_ID=5700               # decimal (Tanenbaum)
ZKSYS_CHAIN_ID_HEX=0x1644         # hex (lo que la wallet espera en wallet_switchEthereumChain)
ZKSYS_EXPLORER_URL=https://tanenbaum.io
ALIVIA_VAULT_PRIVATE_KEY=0x...
ALIVIA_ACTA_CONTRACT=0x...        # se llena tras deploy

# IPFS
WEB3_STORAGE_TOKEN=...

# DB
DATABASE_URL=postgresql://...

# App
PUBLIC_URL=https://alivia.sbs
NODE_ENV=production
```

**Reglas**:
- `.env` no se commitea.
- `.env.example` se mantiene con keys vacías y comentarios.
- Las claves de wallet se gestionan en un secreto separado del VPS, no en el repo de código.

---

## 7. Despliegue

### 7.1 · VPS
- Linux (ya está).
- Servicios:
  - `wasp-app` (frontend + backend Node)
  - `bot-telegram` (proceso separado)
  - `bot-discord` (proceso separado)
  - `postgres` (servicio del sistema)
  - `caddy` (reverse proxy + TLS para `alivia.sbs`)
- Gestor de procesos: PM2 o systemd. Logs a `/var/log/alivia/`.
- Backups: snapshot diario del DB a `/backups/`. Para MVP basta `pg_dump` por cron.

### 7.2 · Contratos
- Despliegue desde local con `hardhat run scripts/deploy-acta.ts --network zksys-testnet`.
- Dirección desplegada se registra en `docs/specs/04-nfts.md §7` y en `.env`.

### 7.3 · Frontend
- Build de Wasp se sirve desde el mismo VPS detrás de Caddy.
- Dominio `alivia.sbs` apunta al VPS.

---

## 8. Modelo de seguridad (MVP)

1. **Bots de chat**: token de cada bot en variables de entorno. No exponer.
2. **Wallet de bóveda**: clave privada en `.env` del VPS. Acceso al servidor limitado al equipo. Post-MVP migrar a HSM o multi-firma.
3. **LLM keys**: rate-limit por IP y por user en bot handlers. Quota mensual de OpenAI configurada en el dashboard.
4. **DB**: Postgres en localhost del VPS, no expuesto a internet. Cuenta dedicada de aplicación con permisos limitados.
5. **HTTPS** obligatorio para `alivia.sbs` (Caddy automatiza Let's Encrypt).
6. **No PII**: el sistema no guarda nombre real, email ni teléfono del aportante. El pseudónimo es derivado de un hash del ID de Telegram/Discord + sal local.
7. **Anti-abuso**: rate limit de N mensajes por user por minuto en cada bot.

---

## 9. Logging y observabilidad

- **Logs estructurados** (JSON) a stdout, capturados por systemd/PM2.
- **Eventos clave loggeados**: `agent_response`, `entity_extraction`, `graph_query`, `case_published`, `nft_minted`, `nft_mint_failed`, `bounty_created`.
- **Métricas** (MVP simple): contador agregado en Postgres tabla `events` para responder *"¿cuántos aportes, cuántos minteos, cuántas consultas hoy?"*.
- **Monitoreo de uptime**: cron + curl a `https://alivia.sbs/healthz`. Notificación por Telegram al chat interno del equipo si falla.

---

## 10. Estrategia de testing

- **Unit tests** (Vitest):
  - Cálculo de `corroboration_score`.
  - Validador del schema JSON del aporte.
  - Hash del evidence bundle (debe ser reproducible).
- **Integration tests**:
  - Pipeline router → agente → grafo en happy path.
  - Mint mockeado contra grafo (sin testnet real).
- **E2E (Playwright o `e2e-tests/` ya existente)**:
  - Aporte completo desde Telegram (mockeado) hasta hash devuelto.
  - Consulta de persona y dossier visible en web.
- **Smoke test pre-demo** (script):
  - Verifica que cada componente está vivo: bot telegram, bot discord, web, DB, RPC zkSYS, contrato accesible.

---

## 11. Riesgos técnicos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| RPC de zkSYS caído durante el demo | media | alto | Cliente con reintentos exponenciales; mintear en background si falla y avisar al usuario |
| OpenAI API rate limit en demo | baja | alto | Pre-warm con queries de smoke test; tener cuenta secundaria como fallback |
| Bot de Telegram congela por carga | baja | medio | Cola in-memory con N workers; rate limit por chat |
| Grafo demo vacío | media | alto | Seed obligatorio antes del demo; checklist en `06-demo-acceptance.md` |
| OCR de actas falla (caso 4) | alta | bajo | Es mockup en MVP, no es bloqueante |
| LLM extrae entidades mal | media | medio | Few-shot examples + validación de JSON schema; agente repregunta si falla |

---

## 12. Hitos de implementación (24 horas)

| Hora desde T0 | Hito |
|---|---|
| 0 - 2 | `instinct.md` + `SOUL.md` + system prompt en producción |
| 2 - 4 | Esquema Prisma + migración + seed script básico |
| 4 - 8 | Agente con tools + router + persistencia de caso |
| 8 - 12 | Bot Telegram funcional end-to-end + bot Discord básico |
| 12 - 14 | Contrato `AliviaActa.sol` desplegado en zkSYS testnet |
| 14 - 17 | Vista web del grafo + página de caso con NFT |
| 17 - 19 | Seed completo del grafo + mockups de bounties/elecciones/licitaciones |
| 19 - 21 | Smoke tests + ensayo del demo |
| 21 - 23 | Grabación del video YouTube + ajustes |
| 23 - 24 | Whitepaper, X, README, MIT, push final |

T0 = inicio de implementación (estimado miércoles 3 jun, ~20:00).
T+24 = jueves 4 jun, 20:00 (5 horas después del demo a las 15:00; el margen es para ensayos).

---

## 13. Dependencias con otros docs

- **`00-overview.md`** — alcance MVP determina qué se construye y qué no.
- **`01-agent-behavior.md`** — comportamiento que esta arquitectura ejecuta.
- **`02-data-model.md`** — esquema que Prisma implementa.
- **`03-use-cases.md`** — flujos que esta arquitectura soporta.
- **`04-nfts.md`** — contrato Solidity que esta arquitectura despliega.
- **`06-demo-acceptance.md`** — qué de esta arquitectura debe estar vivo el jueves.
