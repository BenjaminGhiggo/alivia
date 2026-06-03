# ALIVIA

Plataforma de inteligencia ciudadana anti-corrupción para LatAm: agente IA autónomo que entrevista a ciudadanos por WhatsApp/Discord, extrae entidades (personas, cargos, empresas, contratos, vínculos) y las consolida en un grafo público consultable, con casos anclados como NFT en Syscoin (zkSYS).

Construido sobre [Open SaaS](https://opensaas.sh) + [Wasp](https://wasp.sh).

## Estructura

| Paquete | Stack | Rol |
| --- | --- | --- |
| [app/](app/) | Wasp 0.23, React, Node, Prisma, Postgres | Web app: landing, dashboard, API |
| [blog/](blog/) | Astro + Starlight | Docs + whitepaper (`docs.<host>`) |
| [e2e-tests/](e2e-tests/) | Playwright | Suite E2E contra `app/` |
| [specs/](specs/) | Markdown | Specs por feature (Spec-Driven Development) |

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
- `https://docs.<host>` — blog Astro

Instalación inicial: `/opt/install-alivia.sh` (one-shot sobre VPS limpio).
Actualizaciones: [script-update.sh](script-update.sh) `[rama] [service_number]`.

Detalles, gotchas de deploy y modelo de datos en [CLAUDE.md](CLAUDE.md). Reglas específicas de Wasp/Open SaaS en [app/CLAUDE.md](app/CLAUDE.md).

## Convenciones

- Branches: `main` (estable) · `dev01` (trabajo activo).
- Cambios no triviales arrancan con una spec en [specs/](specs/) — ver sección Spec-Driven en [CLAUDE.md](CLAUDE.md).
- Migrations Prisma viven en [app/migrations/](app/migrations/) y se commitean.
- Secretos en `.env.server` / `.env.client` (gitignored). Sólo se commitean `*.example`.

## Licencia

MIT.
