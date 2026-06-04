# ALIVIA

> **La corrupción solo se sostiene en el olvido. Alivia es lo contrario del olvido.**

Plataforma de inteligencia ciudadana anti-corrupción para LatAm: agente IA autónomo que vive en Telegram (canal principal) y Discord, entrevista a ciudadanos, extrae entidades (personas, cargos, empresas, contratos, vínculos) y las consolida en un **grafo público consultable**, con casos anclados como NFT en Syscoin (zkSYS).

El alma del agente vive en [docs/SOUL.md](docs/SOUL.md). Su voz operativa en [docs/instinct.md](docs/instinct.md).

Construido sobre [Open SaaS](https://opensaas.sh) + [Wasp](https://wasp.sh).

## Estructura

| Paquete | Stack | Rol |
| --- | --- | --- |
| [app/](app/) | Wasp 0.23, React, Node, Prisma, Postgres | Web app: landing, dashboard, API, jobs |
| [blog/](blog/) | Astro + Starlight | **Sitio público** publicado en `docs.<host>` |
| [docs/](docs/) | Markdown | **Documentación interna del proyecto** — SOUL, instinct, specs |
| [e2e-tests/](e2e-tests/) | Playwright | Suite E2E contra `app/` |

`docs/` y `blog/` son cosas distintas pese al nombre del subdominio:
- `docs/` vive sólo en el repo; es la fuente de verdad técnica/ética para el equipo y los agentes IA.
- `blog/` es el sitio Astro que se publica en `https://docs.<host>` para el público externo (whitepaper, guías, posts).

## Documentación interna (`docs/`)

| Archivo | Qué define |
| --- | --- |
| [docs/SOUL.md](docs/SOUL.md) | Constitución ética. Misión, principios no negociables, qué no somos. |
| [docs/instinct.md](docs/instinct.md) | Voz operativa. Cómo habla, escucha y decide Alivia en los grises. |
| [docs/specs/](docs/specs/) | Specs técnicas numeradas (`01-agent-behavior.md`, `05-architecture.md`, etc.). Spec-Driven Development — ver convención en [CLAUDE.md](CLAUDE.md). |

## Desarrollo local

Requisitos: Node 24 + Wasp CLI + Docker (para Postgres dev).

```bash
# App Wasp
cd app
wasp start db        # Postgres dev en Docker (sólo dev)
wasp start           # corre client + server con hot-reload

# Blog
cd blog
npm install
npm run dev
```

## Despliegue

Producción sobre VPS Linux con Docker. Tres subdominios detrás de un único `nginx-proxy`:

- `https://<host>` — SPA Vite
- `https://api.<host>` — server Wasp
- `https://docs.<host>` — blog Astro (público)

Instalación inicial: `/opt/install-alivia.sh` (one-shot sobre VPS limpio).
Actualizaciones: [script-update.sh](script-update.sh) `[rama] [service_number]`.

Gotchas de deploy y modelo de datos en [CLAUDE.md](CLAUDE.md). Reglas específicas de Wasp/Open SaaS en [app/CLAUDE.md](app/CLAUDE.md).

## Convenciones

- Branches: `main` (producción) ◀ `dev` (integración) ◀ `SB-N` (feature Kanban) ◀ `SB-N-vK` (iteraciones de bugfix). Detalle del flujo en [CLAUDE.md → Flujo Git](CLAUDE.md).
- Cambios no triviales arrancan con una spec en [docs/specs/](docs/specs/) — ver sección Spec-Driven en [CLAUDE.md](CLAUDE.md).
- Migrations Prisma en [app/migrations/](app/migrations/), commiteadas al repo.
- Secretos en `.env.server` / `.env.client` (gitignored). Sólo se commitean `*.example`.

## Licencia

MIT.
