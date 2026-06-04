# 07 · Implementation Checklist · Alivia

> **Checklist viviente del MVP** para la hackathon Syscoin Builders LatAm.
> Las decisiones de **qué** construir viven en `00-overview` → `06-demo-acceptance`. Este doc convierte esas decisiones en **tareas accionables** con checkboxes y demo gates.
> Cada `[x]` se marca en el PR que cierra la task. Cada fase tiene un demo gate: lo cerrado ya es demoable aunque las siguientes no existan.

---

## Cronograma (de 05-architecture §12)

- **T0** = miércoles 3 jun ~20:00
- **T+19** = jueves 4 jun 15:00 → **demo en vivo**
- **T+24** = jueves 4 jun 20:00 → cierre de entregables

| Tiempo | Fase | Specs de referencia |
| --- | --- | --- |
| T0–T2 | F0 — Setup + Voz | éste, [SOUL](../SOUL.md), [instinct](../instinct.md) |
| T2–T4 | F1 — Schema + Migración + Seed mínimo | [02-data-model](02-data-model.md) |
| T4–T8 | F2 — Agente + Router + Tools | [01-agent-behavior](01-agent-behavior.md), [05-architecture](05-architecture.md) |
| T8–T12 | F3 — Bots Telegram + Discord | [05-architecture §3.1](05-architecture.md) |
| T12–T14 | F4 — Contrato AliviaActa + Mint | [04-nfts §3](04-nfts.md) |
| T14–T17 | F5 — Vista web del grafo + páginas | [03-use-cases](03-use-cases.md), [05-architecture §3.8](05-architecture.md) |
| T17–T19 | F6 — Seed completo + Mockups | [02-data-model §9](02-data-model.md), [03-use-cases casos 3-5](03-use-cases.md) |
| T19→ | F7 — Smoke + Ensayo | [06-demo-acceptance §5](06-demo-acceptance.md) |
| post-demo | F8 — Video YouTube | [06-demo-acceptance](06-demo-acceptance.md) |
| post-demo | F9 — Whitepaper + X + MIT + push | [06-demo-acceptance §8](06-demo-acceptance.md) |

---

## Fases

### F0 — Setup + Voz (T0–T2) [4/4] ✅

- [x] **0.1** Branch `dev` al día con `main`. Workflow `SB-N-vK` activo (ver [CLAUDE.md → Flujo Git](../../CLAUDE.md)).
- [x] **0.2** `LICENSE` MIT en la raíz del repo. Repo público en GitHub.
- [x] **0.3** Verificar `docs/SOUL.md` y `docs/instinct.md` commiteados.
- [x] **0.4** Compilar system prompt del agente desde `instinct.md` + R1–R10 de `01-agent-behavior §8` → `app/src/server/agent/prompts/alivia-system.es.md`.

**Demo gate:** repo público con LICENSE; voz del agente lista en disco para inyectar al LLM.

---

### F1 — Schema Prisma + Migración + Seed mínimo (T2–T4) [5/5] ✅

Referencia: [02-data-model.md §6](02-data-model.md).

- [x] **1.1** Enums `NodeType` y `EdgeType` agregados a `app/schema.prisma`.
- [x] **1.2** Modelos `Node` y `Edge` con índices.
- [x] **1.3** Modelos `Case`, `Contributor`, `Evidence`, `Bounty`, más `ChatSession` para estado de conversación.
- [x] **1.4** Migración: `app/migrations/20260604031049_alivia_graph_init/migration.sql` generada via `prisma migrate diff`. Se aplica sola al boot del server por `prisma migrate deploy`.
- [x] **1.5** `app/src/server/scripts/seedGraph.ts` (Wasp seed) con 4 personas + 2 empresas + 2 cargos + 1 familia + 4 aristas. Registrado en `main.wasp`. Seed full OSINT real va en F6.

**Demo gate:** `wasp db studio` muestra el grafo seed; `SELECT count(*) FROM "Node"` ≥ 10.

---

### F2 — Agente + Router + Tools (T4–T8) [0/8]

Referencias: [01-agent-behavior](01-agent-behavior.md), [05-architecture §3.2–3.4](05-architecture.md).

- [ ] **2.1** `app/src/server/agent/router.ts` — clasifica intent con `gpt-4o-mini` en `response_format: json_object`.
- [ ] **2.2** `app/src/server/agent/alivia.ts` — agente principal con system prompt + few-shot.
- [ ] **2.3** `app/src/server/agent/tools.ts` — 6 tools function-calling: `extract_entities`, `query_graph`, `compute_corroboration_score`, `request_user_confirmation`, `persist_case`, `mint_acta`.
- [ ] **2.4** `app/src/server/graph/queries.ts` — consultas críticas de 02 §7.
- [ ] **2.5** `app/src/server/graph/mutations.ts` — upsert Node/Edge/Case con dedup soft (02 §8).
- [ ] **2.6** Persistencia del estado de la conversación por `chat_session_id`.
- [ ] **2.7** **(demo-critical, test-first)** Unit test del cálculo `corroboration_score` (fórmula 01 §7).
- [ ] **2.8** **(demo-critical, test-first)** Unit test del schema JSON del aporte vs `01-agent-behavior §6`.

**Demo gate:** integration test mockeado: mensaje → router → agente → tools → `Case` con status `published` y `nft_token_id = null` (pendiente F4).

---

### F3 — Bots Telegram + Discord (T8–T12) [0/6]

Referencia: [05-architecture §3.1](05-architecture.md).

- [ ] **3.1** Crear `@AliviaBot` en BotFather (Telegram), guardar token en `.env` como `TELEGRAM_BOT_TOKEN`.
- [ ] **3.2** `bots/telegram/index.ts` con `grammY` + adapter a `IncomingMessage` común.
- [ ] **3.3** Crear app Discord en developer portal, invitar al server de demo. `.env` con `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`.
- [ ] **3.4** `bots/discord/index.ts` con `discord.js` v14, slash command `/preguntar`.
- [ ] **3.5** Cola in-memory secuencial por `chat_session_id` (un message a la vez por conversación).
- [ ] **3.6** Endpoint `GET /healthz` verifica bots + DB + RPC zkSYS.

**Demo gate:** `/start` en Telegram responde en ≤5s; `/preguntar X` en Discord devuelve dossier; aporte E2E desde Telegram crea `Case` en DB.

---

### F4 — Contrato AliviaActa + Mint (T12–T14) [0/5]

Referencias: [04-nfts §3](04-nfts.md), [05-architecture §3.6](05-architecture.md).

- [ ] **4.1** Setup Hardhat en `contracts/`, configurar red zkSYS testnet (chainId + RPC).
- [ ] **4.2** `contracts/AliviaActa.sol` siguiendo skeleton 04 §3.7 (ERC-721 locked-by-design, mint `onlyOwner`).
- [ ] **4.3** `contracts/scripts/deploy-acta.ts` → deploy a zkSYS testnet. Registrar dirección en [04-nfts §7](04-nfts.md) y `.env` como `ALIVIA_ACTA_CONTRACT`.
- [ ] **4.4** `app/src/server/chain/mintActa.ts` con `viem`, lee `ALIVIA_VAULT_PRIVATE_KEY` del `.env`.
- [ ] **4.5** `app/src/server/chain/ipfs.ts` sube metadata vía `web3.storage`. Token en `WEB3_STORAGE_TOKEN`.

**Demo gate:** `scripts/mint-test-acta.ts` mintea un acta de prueba; tx hash y tokenId visibles en explorer zkSYS testnet.

---

### F5 — Vista web del grafo + Páginas (T14–T17) [0/7]

Referencias: [03-use-cases](03-use-cases.md), [05-architecture §3.8](05-architecture.md).

- [ ] **5.1** `app/src/client/pages/Grafo.tsx` con React Flow, layout force-directed.
- [ ] **5.2** Endpoint SSE `GET /events/graph` emite `graph_updated` en cada mutación de F2.5.
- [ ] **5.3** `app/src/client/pages/Casos.tsx` — feed paginado por `published_at desc`.
- [ ] **5.4** `app/src/client/pages/Caso.tsx` — detalle por id con evidencias + enlace al explorer del NFT.
- [ ] **5.5** `app/src/client/pages/Aportante.tsx` — perfil pseudónimo con nivel (mockup, niveles de 04 §4.6).
- [ ] **5.6** Routes en `main.wasp` para `/grafo`, `/casos`, `/casos/:id`, `/aportantes/:pseudonym`.
- [ ] **5.7** `app/src/client/pages/Chat.tsx` como **plan B5** (formulario web invocando al agente, fallback si bots caen).

**Demo gate:** `alivia.sbs/grafo` muestra grafo seed; al hacer aporte por Telegram, el grafo crece en pantalla en ≤2 segundos.

---

### F6 — Seed completo + Mockups (T17–T19) [0/4]

Referencias: [02-data-model §9](02-data-model.md), [03-use-cases casos 3–5](03-use-cases.md).

- [ ] **6.1** Seed completo: 30 personas + 15 empresas + 10 cargos + 5 contratos + 5 familias + ~80 aristas. CSVs en `data/seed/`.
- [ ] **6.2** `app/src/client/pages/Bounties.tsx` — mockup con 3 bounties pre-cargados (AC3.2).
- [ ] **6.3** `app/src/client/pages/Elecciones.tsx` — mockup con 2 actas verificadas pre-cargadas (AC4.1).
- [ ] **6.4** `app/src/client/pages/Licitaciones.tsx` — mockup con 3 alertas pre-generadas (AC5.1).

**Demo gate:** `alivia.sbs` recorrible: grafo poblado + 4 páginas mockup con contenido.

---

### F7 — Smoke + Ensayo (T19 = pre-demo) [0/4]

Referencia: [06-demo-acceptance §5](06-demo-acceptance.md).

- [ ] **7.1** `scripts/smoke.sh` ejecuta los 7 checks de 06 §5; falla rápido si algún componente está caído.
- [ ] **7.2** Verificar plan B5 (chat web en F5.7) funciona si bots caen.
- [ ] **7.3** Ensayo completo del guion 06 §2 con dos miembros del equipo (Presentador 1 + 2). Cronometrar ≤5:30.
- [ ] **7.4** Si algún check falla → fix → repetir smoke hasta verde.

**Demo gate:** smoke 100% verde; ensayo ≤5:30.

---

### F8 — Video YouTube (post-demo, T+21–T+23) [0/3]

- [ ] **8.1** Grabar siguiendo guion 06 §2 (≤5 min).
- [ ] **8.2** Editar (OBS o herramienta del equipo).
- [ ] **8.3** Subir a YouTube público; link en README + cuenta X.

---

### F9 — Entregables finales (T+23–T+24) [0/5]

- [ ] **9.1** Whitepaper PDF → Google Drive público → link en README.
- [ ] **9.2** Cuenta X `@alivia_sbs` con 3 posts + pinned con tagline.
- [ ] **9.3** README final: descripción, link demo YouTube, link whitepaper, link sitio, link Telegram bot.
- [ ] **9.4** `LICENSE` MIT verificado (F0.2).
- [ ] **9.5** `git push` final + tag `v0.1-hackathon`.

---

## Asignación de roles (bloqueante para mié 22:00)

Ver [06-demo-acceptance §11](06-demo-acceptance.md). Cada uno toma uno o más roles.

| Persona | Rol implementación | Rol demo |
| --- | --- | --- |
| Benjamín | _por definir_ | _por definir_ |
| Néstor Velarde | _por definir_ | _por definir_ |
| Kevin Pinto | _por definir_ | _por definir_ |
| Valeria | _por definir_ | _por definir_ |
| Hillary | _por definir_ | _por definir_ |
| Edwin | _por definir_ | _por definir_ |

---

## Estado global

```
F0 — Setup + Voz                      [██████████] 4/4 ✅
F1 — Schema + Migración + Seed        [██████████] 5/5 ✅
F2 — Agente + Router + Tools          [░░░░░░░░░░] 0/8
F3 — Bots Telegram + Discord          [░░░░░░░░░░] 0/6
F4 — Contrato + Mint                  [░░░░░░░░░░] 0/5
F5 — Vista web                        [░░░░░░░░░░] 0/7
F6 — Seed completo + Mockups          [░░░░░░░░░░] 0/4
F7 — Smoke + Ensayo                   [░░░░░░░░░░] 0/4
F8 — Video YouTube                    [░░░░░░░░░░] 0/3
F9 — Entregables finales              [░░░░░░░░░░] 0/5
                                      ─────────────
                                       0/51 tasks
```

51 tasks en ~19 horas hasta el demo, parallelizables entre 6 personas. Ningún día sin avance medible.

---

## Convención de commits

Los commits viven en una branch `SB-N-vK` (ver [CLAUDE.md → Flujo Git](../../CLAUDE.md)). El mensaje referencia el ticket del Kanban y opcionalmente la task del checklist:

```
<tipo>(<area>): <descripción> · SB-N[-vK] [· 07.F<n>.<m>]
```

Ejemplos:

- `feat(graph): submitReport con dedup soft · SB-1-v1 · 07.F2.5`
- `fix(agent): reintento ante JSON inválido · SB-1-v2`
- `test(score): unit del cálculo de corroboración · SB-1-v1 · 07.F2.7`

Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

> Una task de este checklist por commit cuando sea posible. Si varias caen juntas, listarlas todas: `… · 07.F1.1, 07.F1.2`.

---

## Reglas operativas

1. **Marcar `[x]` en el mismo PR que cierra la task** (no en batch al final del día).
2. **Si una task no entra en ≤2h, romperla** en sub-tasks aquí mismo antes de empezar.
3. **Test-first sólo en tasks marcadas demo-critical** (F2.7, F2.8 por ahora). Resto: código directo + smoke E2E al final.
4. **Cada fase tiene un demo gate**: si el tiempo se acaba, lo cerrado es demoable. No quedan fases a medias.
5. **Riesgos nuevos** descubiertos durante implementación → registrar en la sección abajo + mitigación.

---

## Riesgos abiertos

Riesgos macro ya cubiertos en [05-architecture §11](05-architecture.md) y [06-demo-acceptance §6](06-demo-acceptance.md) (planes B1–B5). Acá registramos sólo lo nuevo.

| Riesgo | Mitigación | Estado |
| --- | --- | --- |
| _ninguno por ahora_ | – | – |
