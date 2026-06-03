# 00 · MVP Roadmap

> Índice de specs + checklist viviente del MVP para la hackathon **Syscoin Builders LatAm**.
> Deadline demo: **jueves 4 jun 2026, 3 pm (Discord oficial Syscoin)**.
> Cada checkbox se marca en el PR que cierra la task. Cada fase tiene un *demo gate* — si el tiempo se acaba, lo cerrado ya es demoable.

---

## Specs hermanas

| # | Doc | Rol |
| --- | --- | --- |
| 01 | [01-agent-behavior.md](01-agent-behavior.md) | Reglas R1–R10 del agente: cómo entrevista, qué publica, cómo modera. |
| 02 | [02-data-model.md](02-data-model.md) | Entidades del grafo (Person, Position, Org, Contract, Edge…) → `app/schema.prisma`. |
| 03 | [03-operations.md](03-operations.md) | Queries/actions/jobs de Wasp → `app/main.wasp`. |
| 04 | [04-nft-contracts.md](04-nft-contracts.md) | NFT-Aporte y NFT-Caso en zkSYS testnet. |
| 05 | [05-architecture.md](05-architecture.md) | Stack, integraciones (Discord/WhatsApp/Syscoin/LLM), deploy. |

Las dependencias éticas y de voz están en [SOUL.md](../SOUL.md) e [instinct.md](../instinct.md) — toda decisión de producto debe defenderse contra esos dos docs.

---

## Criterios de aceptación del MVP (jueves 3 pm)

El demo debe poder mostrar, en ≤ 5 minutos, este flujo end-to-end:

1. Un ciudadano abre el bot de Discord (o WhatsApp) y reporta un caso real de nepotismo/licitación.
2. Alivia lo entrevista siguiendo el guion de [01-agent-behavior.md](01-agent-behavior.md).
3. El reporte estructurado se persiste en el grafo (Postgres + Prisma).
4. El grafo se ve actualizar vivo en `https://alivia.sbs/grafo` (Cytoscape/react-flow).
5. Alivia detecta que el nuevo aporte **conecta con un nodo previo** y dispara la alerta de convergencia. **Ese es el momento "wow" del demo.**
6. Se mintea un **NFT-Aporte** en zkSYS testnet. Hash visible en el explorador.
7. Cualquier asistente puede preguntar "¿quién es X?" al bot y recibir el dossier estructurado.

Lo que **no** entra al MVP (post-hackathon):
- WhatsApp Business API si Discord ya cubre el demo (Discord es suficiente).
- B2B dashboard / API comercial (es la visión, no el demo).
- Tier de scoring de corroboración avanzado.
- Federación multipaís.

---

## Fases — Checklist viviente

> **Convención:** `XX.FN.M` → spec XX, fase N, task M. Ej. `03.F1.2` = `03-operations.md`, fase 1, task 2.

### Fase 0 — Setup [0/4]

- [ ] **0.1** Crear branch `dev01` (si no existe) y limpiar landing template de Open SaaS.
- [ ] **0.2** Cerrar specs **02** (data-model) y **03** (operations) — sin código hasta que el design esté escrito.
- [ ] **0.3** Migración Prisma inicial con entidades base del grafo.
- [ ] **0.4** Seed con OSINT mínimo (5-10 nodos pre-cargados de fuentes públicas peruanas).

**Demo gate:** al terminar, `wasp start` corre y `select * from "Person"` devuelve datos seed. No hay UI todavía.

---

### Fase 1 — Grafo MVP [0/6]

- [ ] **1.1** Operation `submitReport` (input estructurado → crea/conecta entidades). → spec 03.
- [ ] **1.2** Operation `queryEntity` (consulta por nombre → dossier). → spec 03.
- [ ] **1.3** Page `/grafo` con visualización (Cytoscape o react-flow).
- [ ] **1.4** Page `/entity/:id` con dossier de un nodo + vínculos.
- [ ] **1.5** Job `detectConvergence` (cron 5 min) que detecta cuando un nuevo aporte conecta con ≥2 nodos previos.
- [ ] **1.6** Test e2e: submit → grafo actualiza → query devuelve dossier.

**Demo gate:** el grafo funciona vía web. Se puede demo aunque el bot no exista (usando un formulario directo a `submitReport`).

---

### Fase 2 — Agente conversacional [0/5]

- [ ] **2.1** Pipeline LLM de extracción de entidades (Claude/GPT vía API). Input texto libre → JSON estructurado validado contra schema 02.
- [ ] **2.2** Bot Discord (discord.js) con slash command `/reportar` y DM conversacional.
- [ ] **2.3** Guion de entrevista implementado siguiendo [instinct.md](../instinct.md) y reglas R1–R10 de spec 01.
- [ ] **2.4** Bot consulta: `/quien-es <nombre>` devuelve dossier del nodo.
- [ ] **2.5** (Opcional si hay tiempo) Bot WhatsApp vía Meta Cloud API.

**Demo gate:** demo completo de extremo a extremo en Discord. La detección de convergencia (1.5) se dispara visiblemente al cerrar el aporte.

---

### Fase 3 — NFTs Syscoin [0/4]

- [ ] **3.1** Integración zkSYS testnet: ethers.js + RPC + cuenta con TSYS del airdrop de Fer.
- [ ] **3.2** Contrato mínimo `AliviaNFT` (ERC-721 con metadata IPFS o data URI). → spec 04.
- [ ] **3.3** Mint **NFT-Aporte** al cerrar conversación con el bot. Hash de tx visible al ciudadano.
- [ ] **3.4** Mint **NFT-Caso** cuando `detectConvergence` cristaliza un expediente.

**Demo gate:** durante el demo, después de un aporte, se muestra la tx en el explorador de zkSYS testnet.

---

### Fase 4 — Entregables hackathon [0/5]

- [ ] **4.1** Whitepaper en `blog/src/content/docs/whitepaper.mdx`. Cubre: problema, modelo de negocio (Sayari benchmark), arquitectura, hoja de ruta.
- [ ] **4.2** Video demo ≤ 5 min en YouTube público. Guion alineado con criterios de aceptación.
- [ ] **4.3** Cuenta X del proyecto activa con ≥ 3 posts (alineados a tono de [instinct.md](../instinct.md)).
- [ ] **4.4** Repo público en GitHub con licencia MIT visible.
- [ ] **4.5** Slot agendado en Discord oficial Syscoin (jueves 3 pm) confirmado por el equipo.

**Demo gate:** todo lo anterior listo y revisado por al menos otro miembro del equipo (Néstor / Kevin / Valeria / Hillary).

---

## Riesgos abiertos

| Riesgo | Mitigación |
| --- | --- |
| Pipeline LLM de extracción no es preciso a tiempo | Fallback: formulario estructurado guiado en el bot, sin NER libre. El demo sigue siendo válido. |
| zkSYS testnet con latencia / fallo en demo | Pre-grabar tx + tener fallback de "mock mint" si la red se cae. Ser transparentes en el video. |
| Convergencia (1.5) no dispara con datos demo | Pre-sembrar deliberadamente nodos que conecten con el caso del demo. |
| Equipo desincronizado en deadline | Demo gate por fase + check diario corto. Ningún día sin avance medible. |

---

## Estado global

```
Fase 0 — Setup                  [░░░░░░░░░░] 0/4
Fase 1 — Grafo MVP              [░░░░░░░░░░] 0/6
Fase 2 — Agente conversacional  [░░░░░░░░░░] 0/5
Fase 3 — NFTs Syscoin           [░░░░░░░░░░] 0/4
Fase 4 — Entregables            [░░░░░░░░░░] 0/5
                                ───────────────
                                 0/24 tasks
```

Actualizar esta barra al cerrar cada PR. Es la línea de vida del MVP.
