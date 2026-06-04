---
title: QA · Checklist de demo
description: Lista enumerada para validar end-to-end que ALIVIA está lista para el demo. Marcar con [x] lo que pasó.
---

> **Cómo usar este doc.** Cada item tiene `- [ ]`. Reemplaza por `- [x]` al validarlo. Si algo falla, pega el output abajo del item y abre un ticket SB-N para arreglarlo. Toda la batería debería pasar **antes del demo del jueves 4 jun 15:00 Lima (T-3h)**.
>
> Convención: comandos como `curl …` se ejecutan desde el VPS (`/opt/alivia.sbs`). Comandos de Telegram desde tu teléfono.

---

## A · Infra base (5 min)

- [ ] **1.** Los 5 containers están `Up`:
   ```bash
   sudo docker ps --filter "name=alivia_sbs" --format "{{.Names}}\t{{.Status}}"
   ```
   Esperado: `postgres_alivia_sbs`, `server_alivia_sbs`, `client_alivia_sbs`, `docs_alivia_sbs`, `bot_telegram_alivia_sbs` — todos `Up`.

- [ ] **2.** `healthz` devuelve `200` con creds cargadas:
   ```bash
   curl -s https://api.alivia.sbs/healthz | python3 -m json.tool
   ```
   Esperado: `status: ok`, `hasOpenAIKey: true`, `hasBotSharedSecret: true`.

- [ ] **3.** Landing pública carga sin 403:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://alivia.sbs
   ```
   Esperado: `200`.

- [ ] **4.** Las 6 rutas internas responden `200`:
   ```bash
   for p in /grafo /casos /chat /bounties /elecciones /licitaciones; do
     printf "%-15s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://alivia.sbs$p"
   done
   ```
   Esperado: las 6 con `200`.

- [ ] **5.** Whitepaper público accesible:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://docs.alivia.sbs/whitepaper/
   ```
   Esperado: `200`.

---

## B · Base de datos (2 min)

- [ ] **6.** Migración aplicada — las 7 tablas Alivia existen:
   ```bash
   sudo docker exec postgres_alivia_sbs psql -U wasp -d alivia -c '\dt' | \
     grep -E "Node|Edge|Case|Contributor|Evidence|Bounty|ChatSession"
   ```
   Esperado: las 7 listadas.

- [ ] **7.** Seed cargado — 65 nodos del grafo base:
   ```bash
   sudo docker exec postgres_alivia_sbs psql -U wasp -d alivia -tA \
     -c 'SELECT type, count(*) FROM "Node" GROUP BY type ORDER BY type;'
   ```
   Esperado:
   ```
   CARGO|10
   CONTRATO|5
   EMPRESA|15
   FAMILIA|5
   PERSONA|30
   ```

- [ ] **8.** Aristas seed presentes (≥ 12):
   ```bash
   sudo docker exec postgres_alivia_sbs psql -U wasp -d alivia -tA \
     -c 'SELECT count(*) FROM "Edge";'
   ```
   Esperado: `12` (o más si ya hubo aportes).

---

## C · Agente conversacional (5 min)

Cada test mete un mensaje vía API y verifica que la respuesta sea **no canned** (Alivia con voz propia).

- [ ] **9.** Smoke E2E del agente — los 7 checks oficiales:
   ```bash
   /opt/alivia.sbs/scripts/e2e-agent.sh
   ```
   Esperado: `=== resultado: 7 pass · 0 fail ===`.

Si querés probarlos uno por uno desde Telegram (`@alivia_sbs_bot`):

- [ ] **10.** `/start` → Alivia se presenta con voz natural (no template).
- [ ] **11.** `quien eres` → responde *"Soy Alivia, una agente de inteligencia ciudadana…"* o equivalente desde `instinct.md`.
- [ ] **12.** `como funcionas?` → explicación conversacional, NO la frase canned *"Recibo pistas ciudadanas y respondo consultas…"*.

---

## D · Consulta del grafo (3 min)

- [ ] **13.** Consulta con match — `quien es Juan Pérez Quispe`:
   - Esperado: dossier estructurado con vínculos (`es_pariente_de`, `designo`) y "Casos asociados: N".
- [ ] **14.** Consulta con match alternativo — `quien es Roberto Castillo Ríos`:
   - Esperado: dossier con relación familiar (hija Lucía Castillo Vargas).
- [ ] **15.** Consulta sin match — `quien es Fulano Inventado XYZ`:
   - Esperado: *"No tengo registros sobre… si tienes información, escríbeme"* (R5 honestidad).
- [ ] **16.** Consulta de empresa — `quien es Constructora Norte`:
   - Esperado: dossier devuelto OK aunque con menos vínculos.

---

## E · Flujo de denuncia + NFT (10 min — el demo real)

> Hacer todo en una sola conversación (mismo chat con `@alivia_sbs_bot`), turnos seguidos.

- [ ] **17.** Turno 1 (denuncia con datos del seed):
   ```
   Reporto que Juan Pérez Quispe nombró a su prima Ana Pérez Quispe
   como subgerente en marzo 2026. Resolución 123-2026-MLN, link en
   https://convoca.pe/caso-x
   ```
   Esperado: Alivia agradece + hace 1-2 preguntas de follow-up (R1 mínimos, fecha exacta o evidencia).

- [ ] **18.** Turno 2 (opcional, responder follow-up):
   ```
   El nombramiento fue el 15 de marzo, ella era su prima hermana.
   ```
   Esperado: Alivia agradece o pide algún detalle más.

- [ ] **19.** Turno 3 — finalize:
   ```
   publicar
   ```
   Esperado: **resumen estructurado** con:
   - Sujeto: `Juan Pérez Quispe`
   - Score de corroboración ≥ `0.40`
   - **Línea: "Conexión detectada con nodo previo: 'Juan Pérez Quispe'."**  ← momento "wow" del demo
   - Pregunta: *"¿Confirmas que publique este aporte y mintee el NFT-Acta?"*

- [ ] **20.** Turno 4 — confirmación R10:
   ```
   sí, confirmo
   ```
   Esperado:
   - *"Listo. Tu aporte queda registrado con id alv-YYYY-MM-DD-NNNN…"*
   - *"El NFT-Acta se minteará en Syscoin en segundos…"*

- [ ] **21.** Case persistido en DB (correr ~5s después del turno 4):
   ```bash
   sudo docker exec postgres_alivia_sbs psql -U wasp -d alivia \
     -c 'SELECT id, "corroborationScore", status, "nftTxHash" FROM "Case" ORDER BY "createdAt" DESC LIMIT 1;'
   ```
   Esperado: 1 fila con `status='published'` y `corroborationScore ≥ 0.40`. `nftTxHash` puede estar `NULL` por unos segundos.

- [ ] **22.** NFT minteado on-chain (esperar 60-120s tras turno 4):
   ```bash
   sudo docker exec postgres_alivia_sbs psql -U wasp -d alivia -tA \
     -c 'SELECT "nftTokenId", "nftTxHash" FROM "Case" ORDER BY "createdAt" DESC LIMIT 1;'
   ```
   Esperado: `tokenId` numérico y `txHash` no nulo.

- [ ] **23.** Tx visible en explorer Tanenbaum:
   - Abrir `https://tanenbaum.io/tx/<txHash>` del paso 22.
   - Esperado: bloque confirmado, status `Success`, contract `0xce3528c75e4b7ae7c842d400c273b20eef4372a3`.

- [ ] **24.** `/casos` muestra el case nuevo arriba con badge NFT:
   - Abrir `https://alivia.sbs/casos` en el browser.
   - Esperado: el caso aparece arriba con score color-coded y badge `NFT #N`.

- [ ] **25.** `/casos/<id>` muestra detalle con link al explorer:
   - Click en el caso.
   - Esperado: hechos, evidencias, vínculos, link clickable a `tanenbaum.io/tx/...`.

---

## F · Reglas operativas del agente (R1–R10)

- [ ] **26.** **R3 especificidad** — `todos saben que el alcalde de Lima Norte es un sinvergüenza`
   - Esperado: Alivia reframea pidiendo hechos verificables, NO publica.

- [ ] **27.** **R1 mínimos a watchlist** — `Quiero denunciar a una empresa de Lima` + `publicar`
   - Esperado: *"Para publicar necesito al menos un nombre o entidad…"* o el case queda en `status=watchlist` (no se mintea NFT).

- [ ] **28.** **R6 lenguaje no inflamatorio** — pedir un dossier de cualquier persona del seed.
   - Esperado: Alivia usa *"señalado"*, *"vinculado"*, *"figura en el aporte"*. Nunca *"corrupto"*, *"ladrón"*, *"sinvergüenza"*.

- [ ] **29.** **R10 cancelación** — En el turno de confirmación, responder `no`.
   - Esperado: *"Cancelado. Si quieres retomar, vuelve a escribirme."* El case NO se persiste.

- [ ] **30.** **R5 honestidad** — Consulta sobre alguien no-existente (ver item 15).
   - Esperado: *"No tengo registros…"*, NO inventa nombres ni cargos.

- [ ] **31.** **R2 anonimato** — Verificar en DB que el `reporterPseudonym` del Case (item 21) tiene formato `aportante-XXXX` y NO contiene el username/id de Telegram.

---

## G · Vista web del grafo (3 min)

- [ ] **32.** `/grafo` muestra el grafo seed:
   - Abrir `https://alivia.sbs/grafo` en browser.
   - Esperado: nodos coloridos por tipo (azul personas, ámbar cargos, verde empresas, rojo contratos, violeta familias), aristas conectándolos, header indica `Nodos: 65+ · Aristas: 12+`.

- [ ] **33.** Refresh cada 3s funciona:
   - Hacer un aporte nuevo desde Telegram.
   - Dentro de ~3 segundos el grafo en `/grafo` debe actualizar el contador.

- [ ] **34.** Mockups recorribles:
   - `/bounties` → 3 bounties con TSYS (Caso Lima Norte 100 TSYS, etc.)
   - `/elecciones` → 2 actas (Mesa 003421 ✓ coincide, Mesa 007812 ⚠ discrepancia)
   - `/licitaciones` → 3 alertas con heurísticas H1–H5

- [ ] **35.** Chat web (plan B5) responde sin necesidad de Telegram:
   - Abrir `https://alivia.sbs/chat`.
   - Mandar "Hola Alivia".
   - Esperado: respuesta del agente con voz natural, identidad `aportante-XXXX` visible en header.

---

## H · Bot Discord (opcional · sólo si está dockerizado)

> Skip si todavía no se aplicó el prompt 2 de OpenCode (dockerizar Discord).

- [ ] **36.** Container Discord Up:
   ```bash
   sudo docker ps --filter "name=bot_discord" --format "{{.Names}}\t{{.Status}}"
   ```

- [ ] **37.** Slash command `/preguntar nombre:Juan Pérez Quispe` en el server de demo → dossier devuelto.

- [ ] **38.** DM al bot Discord con un saludo → respuesta natural.

---

## I · Smoke test cross-cutting (T-30 min al demo)

Correrlos en orden:

- [ ] **39.** `./scripts/e2e-agent.sh` → 7/7 PASS.
- [ ] **40.** Flujo completo manual desde Telegram (items 17–25) — al menos una vez, con éxito.
- [ ] **41.** El video Backup (06-demo-acceptance §6 plan B5) está grabado y subido por si la red se cae:
   - `https://youtube.com/watch?v=<id>` accesible.
- [ ] **42.** Plan B5 verificado: si el bot Telegram se cae, `https://alivia.sbs/chat` sigue procesando aportes vía mismo `/api/agent/turn`.

---

## J · Entregables del hackathon (operativos · no de código)

- [ ] **43.** Video YouTube ≤5 min público con URL en README.
- [ ] **44.** Whitepaper PDF público en Drive con link en README.
- [ ] **45.** Cuenta `@alivia_sbs` en X creada, con ≥ 3 posts y pinned con tagline *"Tú das la pista. Alivia conecta los puntos. La blockchain lo recuerda."*
- [ ] **46.** Repo público en GitHub con MIT visible.
- [ ] **47.** Slot de demo en Discord oficial Syscoin confirmado para el jueves 3 pm Lima.
- [ ] **48.** Asignación de roles del equipo cerrada (Presentador 1, Presentador 2, Operador bot, Operador backend, Curador grafo, Apoyo redes — ver [06-demo-acceptance §3](https://github.com/BenjaminGhiggo/alivia/blob/dev/docs/specs/06-demo-acceptance.md)).

---

## Si algo falla

| Síntoma | Comando de diagnóstico | Probable fix |
|---|---|---|
| 403/500 en `alivia.sbs` | `sudo docker logs --tail=30 client_alivia_sbs` | `vite build` + `--force-recreate client_1` (gotcha CLAUDE.md) |
| Agent timeout o error 500 | `sudo docker logs --tail=30 server_alivia_sbs` | revisar `OPENAI_API_KEY` en `.env.server`, force-recreate server_1 |
| Bot Telegram no responde | `sudo docker logs --tail=20 bot_telegram_alivia_sbs` | verificar `TELEGRAM_BOT_TOKEN`, force-recreate bot_telegram_1 |
| Mint NFT no avanza | Ver `nftTxHash` en DB, consultar tx en `tanenbaum.io` | Tanenbaum suele tardar 60-120s; si la red está caída, mostrar el case con NFT pendiente y un mint previo del seed como backup |
| `/casos` 500 | logs del client + `ls .wasp/out/web-app/build/` | regenerar con `vite build` y `--force-recreate client_1` |
| Respuestas canned del agente | `/opt/alivia.sbs/scripts/e2e-agent.sh` para detectar | revisar `runConversational` en `app/src/server/agent/alivia.ts` |

---

## Resultado

Cuando los **48 items estén marcados**, ALIVIA está lista para el demo de las 15:00.

Mínimos absolutos para considerar el demo exitoso (06-demo-acceptance §9): items **9, 17, 19, 20, 22, 23, 24, 32** — esos 8 son no negociables.

> **La corrupción solo se sostiene en el olvido. Alivia es lo contrario del olvido.**
