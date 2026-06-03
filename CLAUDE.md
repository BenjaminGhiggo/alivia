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

## Spec-Driven Development

Todo cambio no trivial (feature nueva, refactor con efectos en API/DB, integración externa) **arranca con una spec** en `specs/<feature-slug>/`:

- `requirements.md` — problema, alcance, criterios de aceptación.
- `design.md` — entidades (mapean a `app/schema.prisma`), routes/pages/operations/jobs (mapean a `app/main.wasp`), side effects (email, payments, blockchain), firmas de queries/actions.
- `tasks.md` — checklist ordenada de cambios; cada item apunta a archivo concreto.

La spec se commitea **antes** de tocar código. Si la implementación diverge, se actualiza la spec en el mismo PR — la spec es fuente de verdad, no documentación post-hoc.

### Por qué SDD encaja con Wasp

`main.wasp` ya es una spec ejecutable: lo que defines en `design.md` como rutas, operations, jobs o auth se traduce 1:1 a bloques de Wasp. `schema.prisma` cumple el mismo rol para datos. El loop queda:

1. `requirements.md` → criterios de aceptación.
2. `design.md` → bloques nuevos en `main.wasp` + entidades en `schema.prisma`.
3. `tasks.md` → handlers TypeScript en `app/src/` (un archivo por operation, página, job).
4. `wasp build` y validar.

No editar `app/.wasp/out/` — es output generado en cada build.

## Convenciones del repo

- Branch principal: `main`. Trabajo activo: `dev01`.
- Las migrations Prisma viven en [app/migrations/](app/migrations/) y se commitean al repo.
- Secretos en `.env.server` y `.env.client` (gitignored). Sólo se commitean `*.example`.
- El install-script genera `/opt/<host>.txt` con credenciales (postgres password, paths, versiones) — fuera del repo.
