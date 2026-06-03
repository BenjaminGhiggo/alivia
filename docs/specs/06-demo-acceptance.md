# 06 · Demo Acceptance · Alivia

> **El contrato con el reloj. Lo que debe funcionar el jueves 4 jun 2026 a las 3pm.**
> Si todo lo de este documento sale bien, ganamos. Si algo falla, hay plan B aquí mismo.

---

## 1. Objetivo del demo

Demostrar en **≤ 5 minutos** que Alivia es una agente IA autónoma operativa que:
1. Conversa en español natural con un ciudadano.
2. Convierte una pista en un nodo del grafo público.
3. Detecta una conexión con casos previos.
4. Sella el caso como NFT-Acta en Syscoin.
5. Permite consultar el grafo en lenguaje natural.

**Mensaje único a transmitir**: *"Tú das la pista. Alivia conecta los puntos. La blockchain lo recuerda."*

---

## 2. Guion del demo (5 minutos)

| Tiempo | Sección | Qué se muestra | Quién habla |
|---|---|---|---|
| 0:00 – 0:30 | **Apertura** | Pantalla con titular real de corrupción en Perú (últimas 2 semanas). Voz en off: *"Cada semana hay una nueva. Pero, ¿quién las conecta?"* | Presentador 1 |
| 0:30 – 1:00 | **Visión** | Logo Alivia + tagline. Voz: *"Alivia es una agente IA que escucha al ciudadano, conecta los puntos que el poder esconde, y deja cada caso en blockchain."* | Presentador 1 |
| 1:00 – 2:30 | **Demo en vivo · denuncia** | Pantalla dividida: Telegram a la izquierda, vista del grafo `alivia.sbs/grafo` a la derecha. Un actor escribe una denuncia. Alivia entrevista. El grafo crece en vivo. **Alerta de conexión** dispara. Mint del NFT-Acta en zkSYS. Hash devuelto. | Presentador 1 + actor |
| 2:30 – 3:30 | **Demo en vivo · consulta** | Otro actor pregunta en Discord: *"¿quién es Juan Pérez?"*. Alivia devuelve dossier con cargos, vínculos, contratos, aportes citados con sus NFTs. | Presentador 2 + actor |
| 3:30 – 4:15 | **Tour de casos de uso** | Click rápido por `alivia.sbs`: feed de casos, Observatorio Electoral, Bounties activos, Monitor de licitaciones. *"Y esto recién empieza."* | Presentador 1 |
| 4:15 – 4:45 | **Modelo de negocio en una línea** | Slide: Sayari factura $29M/año vendiendo lo que Alivia hace en LatAm — pero con data ciudadana. NFT-Llave como vehículo de la suscripción comercial. | Presentador 2 |
| 4:45 – 5:00 | **Cierre + CTA** | *"Alivia.sbs. La memoria pública de LatAm contra la corrupción. $SYS es el camino."* | Presentador 1 |

**Si se acaba el tiempo**: cortamos el tour (3:30–4:15) y vamos directo al modelo + cierre.

---

## 3. Roles del equipo durante el demo

| Rol | Responsabilidad |
|---|---|
| Presentador 1 | Voz principal, controla el flujo del guion |
| Presentador 2 | Voz secundaria, hace consulta en Discord, cierra el negocio |
| Operador del bot Telegram | Asegura que el bot está conectado, monitorea logs |
| Operador del backend | Monitorea logs en VPS, dispara fallback si algo falla |
| Curador del grafo | Tiene preparados los datos sembrados, verifica el pre-state |
| Apoyo de redes | Tuitea durante y después, captura clip para Instagram |

> Asignación nombre → rol: a definir entre los 6 miembros del equipo. Sugerencia: que Benjamín opere el backend, que las voces sean dos personas distintas, y que Valeria + Hillary cubran redes en tiempo real.

---

## 4. Componentes que deben estar vivos

### 4.1 · Críticos (sin esto no hay demo)

| Componente | Estado esperado | Cómo verificar |
|---|---|---|
| Bot Telegram `@AliviaBot` | Responde en ≤ 5s | `/start` desde otro teléfono |
| Bot Discord en servidor de demo | Responde a `/preguntar` | Comando en canal de prueba |
| Backend Wasp + agente | `POST /healthz` → 200 | `curl https://alivia.sbs/healthz` |
| Postgres con grafo sembrado | ≥ 30 nodos Persona, ≥ 5 Contrato | `SELECT count(*) FROM "Node"` |
| Frontend `alivia.sbs/grafo` con SSE | Conecta y recibe eventos | Abrir en browser, ver consola |
| Contrato `AliviaActa.sol` desplegado | Dirección verificada en zkSYS | Bloque explorer de Syscoin |
| Wallet de bóveda con TSYS | ≥ 5 TSYS de gas | Saldo en wallet |
| RPC de zkSYS | Responde `eth_chainId` | `curl` al RPC |

### 4.2 · Importantes (mejoran el demo)

| Componente | Estado esperado |
|---|---|
| Mockups visibles | `/bounties`, `/elecciones`, `/licitaciones` con seed data |
| Vista de caso individual `/casos/:id` | Render correcto del último caso minteado |
| Vista de aportante `/aportantes/:pseudonym` | Muestra histórico (con mock) |
| Cuenta X `@alivia_sbs` | Creada y con 3 posts |
| Pinned tweet con tagline | Listo |

### 4.3 · Buenos a tener (no bloqueantes)

- Página `/whitepaper` con link al PDF en Drive.
- Sección de equipo en landing actualizada.
- Botón "conecta tu wallet" en el header (puede estar disabled).

---

## 5. Smoke test pre-demo (T-3 horas)

Ejecutar 3 horas antes del demo. Si algo falla, hay margen para resolverlo.

```
# 1. Bot Telegram
   Enviar /start a @AliviaBot → respuesta esperada.

# 2. Agente conversacional
   "Quiero reportar un caso de nepotismo" → Alivia entrevista.
   Completar entrevista con datos de prueba.
   Verificar que se crea Case en DB con status=published.

# 3. Mint NFT-Acta
   El caso anterior dispara mint.
   Verificar txHash en explorer de zkSYS.
   Verificar que el case tiene nft_token_id no nulo.

# 4. Conexión con grafo
   Hacer un segundo aporte que coincida con el primero.
   Verificar que Alivia muestra alerta de conexión.

# 5. Consulta
   Preguntar por una persona pre-sembrada vía Telegram y vía Discord.
   Verificar que dossier llega completo.

# 6. Vista web
   Abrir alivia.sbs/grafo. Verificar que aparece el grafo poblado.
   Hacer un aporte y ver el grafo crecer en vivo.

# 7. Mockups
   Recorrer /bounties, /elecciones, /licitaciones.
   Verificar que cada uno tiene contenido.
```

Si **alguno** de 1-6 falla, se trabaja sobre eso. Si 7 falla, no bloquea el demo.

---

## 6. Planes B (si algo se cae en vivo)

### B1 · Bot Telegram no responde
- Cambiar a Discord para todo el demo. El guion lo permite.
- Si Discord también falla: ir a `alivia.sbs/chat` (formulario web que invoca al agente) — debe quedar implementado como respaldo.

### B2 · RPC de zkSYS caído / mint falla
- El agente continúa, persiste el caso con `nft_token_id = null`, y muestra mensaje *"NFT pendiente de minteo"* en el cierre.
- Mostrar un NFT-Acta previo del seed con su explorador abierto, para evidenciar que el flujo funciona.

### B3 · LLM rate-limit o lento
- Tener segunda API key precargada como fallback.
- Si todo lo de LLM falla: usar una **conversación grabada** y mostrarla como video embebido. No es ideal pero salva el demo.

### B4 · Frontend de grafo no actualiza
- Refrescar manualmente la página entre aportes.
- Pre-grabar un GIF del grafo creciendo como fallback visual.

### B5 · Caída total del VPS
- Tener un screen recording completo del demo grabado el miércoles en la noche, listo para reproducir.
- Si pasa esto, presentamos el video y explicamos que el VPS se cayó (transparencia gana al silencio).

---

## 7. Setup técnico de la transmisión

- **Plataforma**: Discord oficial de Syscoin, según convocatoria.
- **Resolución mínima**: 1080p.
- **Audio**: micrófono externo si es posible. Sin eco.
- **Pantallas a mostrar**:
  - Pantalla 1: Telegram desktop con `@AliviaBot`.
  - Pantalla 2: navegador con `alivia.sbs/grafo`.
  - Pantalla 3 (opcional): bloque explorer de zkSYS para mostrar el mint.
- **Captura**: OBS Studio o el screen share nativo del Discord.
- **Grabación local**: redundante, para subir al YouTube como video oficial (≤ 5 min).

---

## 8. Materiales que deben existir antes del demo

| Material | Responsable | Deadline | Estado |
|---|---|---|---|
| Repo GitHub público | Tech lead | Mié 23:00 | – |
| Licencia MIT en repo | Tech lead | Mié 23:00 | – |
| README.md con descripción y demo | Producto y contenido | Jue 12:00 | – |
| Cuenta X `@alivia_sbs` con 3 posts | Marketing | Mié 22:00 | – |
| Pinned post X con tagline | Marketing | Mié 22:00 | – |
| Video de demo grabado en YouTube ≤ 5 min | Producto + Tech | Jue 13:00 | – |
| Whitepaper PDF en Drive | Producto y contenido | Jue 14:00 | – |
| Link público al whitepaper | Producto | Jue 14:00 | – |
| Slide de cierre con tagline y URLs | Producto | Jue 14:00 | – |
| Datos sembrados verificados | Curador grafo | Jue 11:00 | – |
| Wallet de bóveda con saldo | Backend / infra | Mié 22:00 | – |
| Contrato `AliviaActa` desplegado | Tech lead | Jue 09:00 | – |

---

## 9. Criterios de aceptación del demo

El demo se considera **exitoso** si:

| ID | Criterio |
|---|---|
| AD1 | Se hizo al menos un aporte completo en vivo desde Telegram o Discord |
| AD2 | El grafo en `alivia.sbs/grafo` mostró el nuevo nodo o arista durante la transmisión |
| AD3 | Se disparó al menos una alerta de conexión visible |
| AD4 | Se minteó al menos un NFT-Acta en zkSYS testnet con txHash visible |
| AD5 | Se ejecutó al menos una consulta y se devolvió un dossier estructurado |
| AD6 | Se mostró el modelo de negocio con Sayari como comparable |
| AD7 | El demo duró ≤ 5:30 (5 min con tolerancia de 30s) |
| AD8 | El video del demo está publicado en YouTube como entregable |

Si se cumplen **6 de 8**, el demo se considera exitoso. Mínimos absolutos: AD1, AD2, AD4 o AD5, AD8.

---

## 10. Post-demo (vie 5 – mar 9)

| Día | Acción |
|---|---|
| Vie 5 | Compartir video y link a la plataforma masivamente. Activar la cuenta X. Pedir votos. |
| Sáb 6 – Dom 7 | Mantener Alivia operativa. Atender aportes ciudadanos reales que lleguen. |
| Lun 8 | Último día de votaciones. Push final en redes. |
| Mar 9 | Anuncio de ganadores. Sea cual sea el resultado, agradecer y publicar siguientes pasos. |

---

## 11. Asignación de roles del equipo (placeholder)

> Llenar antes del miércoles 22:00. Cada uno de los 6 miembros toma uno o más roles. Se coordina por el chat del equipo.

| Persona | Rol(es) durante implementación | Rol(es) durante demo |
|---|---|---|
| Benjamín | _por definir_ | _por definir_ |
| Néstor Velarde | _por definir_ | _por definir_ |
| Kevin Pinto | _por definir_ | _por definir_ |
| Valeria | _por definir_ | _por definir_ |
| Hillary | _por definir_ | _por definir_ |
| Edwin | _por definir_ | _por definir_ |

---

## 12. Dependencias con otros docs

- **`00-overview.md`** — define el alcance que aterrizamos en este demo.
- **`01-agent-behavior.md`** — comportamiento del agente que se muestra en vivo.
- **`02-data-model.md`** — esquema que se ve creciendo en el grafo.
- **`03-use-cases.md`** — los 5 casos de uso que recorre el demo.
- **`04-nfts.md`** — el NFT-Acta minteado en vivo.
- **`05-architecture.md`** — componentes que deben estar vivos en T-3 horas.
