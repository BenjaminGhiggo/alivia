# 🐛 Bugs detectados en producción — 4 jun 2026, 15:30

> Validación end-to-end realizada con MCP browser sobre `alivia.sbs`. Tres bugs encontrados, todos fixables antes del demo del **jueves 4 jun, 3pm**. Detalle ampliado en `presentacion/presentacion.md §A4-A5`.

---

## 🔴 Bug #1 · Link de NFT-Acta apunta a explorer muerto

**Dónde se ve**: en `/casos/alv-2026-06-04-0001` y en `/elecciones`, los hashes de tx tienen links a:

```
https://explorer-test-zk.syscoin.org/tx/...
```

**El problema**: ese dominio **no resuelve DNS** desde junio 2026 (es el explorer del antiguo zkSYS Testnet, está caído).

**Verificación**:
```bash
curl -I https://explorer-test-zk.syscoin.org/
# Resultado: ERR_NAME_NOT_RESOLVED
```

**Fix**: cambiar la URL base del explorer a la testnet correcta donde sí están las txs:

```diff
- https://explorer-test-zk.syscoin.org
+ https://explorer.tanenbaum.io
```

Buscar `explorer-test-zk` en el repo (probablemente en `app/src/client/`).

**Impacto**: si el jurado hace click esperando ver la prueba on-chain, ve página rota.

---

## 🔴 Bug #2 · Chat web devuelve 405

**Dónde se ve**: en `/chat`, al enviar cualquier mensaje, el agente responde *"Tuve un problema. Volvé a intentar."*

**El problema exacto** (capturado con DevTools network):

```
POST https://alivia.sbs/api/agent/turn    → 405 Method Not Allowed
GET  https://api.alivia.sbs/auth/me        → 304 OK
```

El frontend del chat hace POST al dominio raíz (nginx servidor estático, no acepta POST), en vez de hacerlo al subdominio del backend.

**Fix**: en el componente de `/chat`, cambiar la URL a:

```diff
- fetch('/api/agent/turn', { method: 'POST', ... })
+ fetch(`${import.meta.env.REACT_APP_API_URL}/api/agent/turn`, { method: 'POST', ... })
```

Verificar que `REACT_APP_API_URL=https://api.alivia.sbs` esté en el build de producción del cliente.

**Impacto**: el plan B documentado en `06-demo-acceptance.md §6 (B1)` ("Si Telegram falla, usar `alivia.sbs/chat` como respaldo") **está caído**. Sin Telegram, no hay backup en vivo.

---

## 🟡 Bug #3 · `/bounties` vacío (debería tener 3 mockups)

**Dónde se ve**: `/bounties` solo muestra *"Aún no hay bounties activos. Sé el primero en publicar uno →"*.

**Lo que pide la spec**: `03-use-cases.md §AC3.2` dice *"Existen al menos 3 bounties de ejemplo pre-cargados para el demo."*

**Fix**: agregar 3 entradas mock al seed. Sugeridas:

```ts
const bountiesMock = [
  {
    id: "BNT-2026-06-04-0001",
    title: "Copia firmada del contrato 123-2026-MLN",
    target_case: "alv-2026-06-04-0001",
    amount_tsys: 100,
    deadline_days: 30,
    status: "open",
    posted_by: "Proética",
    criteria: "PDF de la resolución de designación con firma del alcalde",
  },
  {
    id: "BNT-2026-06-03-0002",
    title: "Evidencia de vínculo familiar en LIC-2026-06-03-0001",
    amount_tsys: 250,
    deadline_days: 45,
    status: "open",
    posted_by: "Convoca",
    criteria: "Documento público que confirme parentesco entre adjudicador y postor",
  },
  {
    id: "BNT-2026-05-30-0003",
    title: "Auditoría de costos · Suministro hospitalario regional",
    amount_tsys: 500,
    deadline_days: 60,
    status: "claimed",
    claimed_by: "aportante-9c4e",
    criteria: "Comparativo de precios de mercado vs adjudicado",
    claimed_at: "2026-06-02",
  },
];
```

**Impacto**: durante el tour de casos de uso del demo (`06-demo-acceptance.md §2`, minuto 3:30–4:15), `/bounties` queda vacío. Se pierde uno de los hooks Syscoin-nativos más fuertes del pitch.

---

## ⏱ Estimación total

| Bug | Tiempo |
|---|---|
| #1 | 5 min |
| #2 | 10 min |
| #3 | 15 min |
| **Total** | **30 min** |

Hacerlos antes del smoke test de las 12:00 jueves.

---

## ✅ Lo que SÍ funciona perfecto (no tocar)

- Landing pública (`alivia.sbs`): 9 secciones, FAQ, footer con 6 redes, sin errores de consola.
- Grafo público (`alivia.sbs/grafo`): 65 nodos, 14 aristas, render React Flow correcto.
- Feed de casos (`alivia.sbs/casos`): NFT #1 visible.
- Detalle de caso: muestra hechos, vínculos en grafo, Token ID, evidence hash (sólo bug en el link del tx).
- `/elecciones`: 2 mockups con 1 coincidencia y 1 discrepancia.
- `/licitaciones`: 3 alertas con H1-H5 explícitas.
- `docs.alivia.sbs`: Astro + Starlight con whitepaper completo publicado.
- `docs.alivia.sbs/whitepaper`: documento maestro con 10 secciones, **incluye address del contrato AliviaActa**.
- Contrato `AliviaActa (ALV-ACTA)` en `0xce3528c75e4b7ae7c842d400c273b20eef4372a3` verificado on-chain.
- Wallet Alivia Vault: 8 txns, 2 NFTs, 34.45 tSYS de gas.

---

> Validación realizada con sesión interactiva de MCP browser. Screenshots en `presentacion/imagenes/live-*.png`.
