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

## Documentación del proyecto

`docs/` es la fuente de verdad interna (no se publica). `blog/` es lo público (se publica en `docs.<host>`).

```
docs/
├── SOUL.md           ← constitución ética del agente (no negociables)
├── instinct.md       ← voz operativa (cómo habla, escucha, decide)
└── specs/            ← specs técnicas numeradas (SDD)
    ├── 00-mvp-roadmap.md     ← índice + checklist viviente por fases
    ├── 01-agent-behavior.md  ← reglas R1..R10 del agente
    ├── 02-data-model.md      ← entidades del grafo (→ schema.prisma)
    ├── 03-operations.md      ← queries/actions/jobs (→ main.wasp)
    ├── 04-nft-contracts.md   ← NFT-Aporte / NFT-Caso en zkSYS
    └── 05-architecture.md    ← stack, integraciones, deploy
```

## Spec-Driven Development

Todo cambio no trivial **arranca con una spec** en `docs/specs/`. La numeración es estable: cada doc tiene un rol fijo, no se reordena. Features nuevas se agregan como `06-`, `07-`… o se reflejan dentro del doc temático correspondiente (ej. nuevo flow de bot → actualiza `01-agent-behavior.md`).

Cada spec contiene tres bloques:

- **Requirements** — problema, alcance, criterios de aceptación.
- **Design** — entidades (→ `app/schema.prisma`), routes/pages/operations/jobs (→ `app/main.wasp`), side effects (LLM, blockchain, email).
- **Tasks** — checklist con `[ ]` / `[x]` agrupado por fases atómicas demoables.

[docs/specs/00-mvp-roadmap.md](docs/specs/00-mvp-roadmap.md) es el **checklist viviente del proyecto** — se marca con cada PR, vista global del avance.

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

## Convenciones del repo

- Branch principal: `main`. Trabajo activo: `dev01`.
- Las migrations Prisma viven en [app/migrations/](app/migrations/) y se commitean al repo.
- Secretos en `.env.server` y `.env.client` (gitignored). Sólo se commitean `*.example`.
- El install-script genera `/opt/<host>.txt` con credenciales (postgres password, paths, versiones) — fuera del repo.
