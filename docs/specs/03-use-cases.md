# 03 · Use Cases · Alivia

> **Los cinco casos de uso del MVP, con criterios de aceptación verificables.**
> Cada caso lista actores, precondiciones, flujo principal, flujos alternativos, postcondiciones y qué se crea en el grafo / en Syscoin.

---

## Resumen

| # | Caso de uso | Estado MVP | Disparador |
|---|---|---|---|
| 1 | Denuncia ciudadana | **En vivo en el demo** | Mensaje del usuario en Telegram/Discord |
| 2 | Consulta pre-voto | **En vivo en el demo** | Pregunta del usuario en Telegram/Discord |
| 3 | Cazarrecompensas (NFT-Bounty) | **Mockup visible en web** | Acción del usuario en `alivia.sbs` |
| 4 | Verificación de actas electorales | **Mockup visible en web** | Foto de acta subida por el usuario |
| 5 | Monitoreo proactivo de licitaciones | **Mockup visible en web** | Ingestión programada (cron) |

---

## Caso de uso 1 · Denuncia ciudadana

### Actores
- **Aportante** (ciudadano que reporta).
- **Alivia** (agente IA).
- **Grafo** (sistema).
- **zkSYS testnet** (Syscoin).

### Precondiciones
- El aportante tiene acceso al bot de Telegram `@AliviaBot` (o al canal de Discord).
- El backend de Alivia está operativo y conectado al grafo y a Syscoin.

### Flujo principal

1. El aportante escribe a Alivia en lenguaje natural describiendo un hecho de corrupción.
2. Alivia saluda, valida que el aportante esté en un lugar seguro para conversar y captura el hecho principal (R1, ver `01-agent-behavior.md`).
3. Alivia entrevista por estructuración: nombre del señalado, cargo, institución, ventana temporal, evidencia.
4. Alivia valida los mínimos. Si faltan, pregunta una vez más.
5. Alivia consulta el grafo y busca coincidencias con nodos existentes.
6. Si encuentra coincidencias, las muestra al aportante como **alerta de conexión**.
7. Alivia pide confirmación textual para publicar el aporte.
8. Alivia inserta los nodos y aristas en el grafo, calcula el `corroboration_score` y crea el registro `Case`.
9. Alivia mintea el **NFT-Acta** en zkSYS testnet con el hash de evidencia.
10. Alivia entrega al aportante el hash de la transacción y agradece.

### Flujos alternativos

- **A1 · Aporte incompleto**: si después de una repregunta sigue faltando un dato crítico, el caso queda en `status = watchlist` y no se mintea NFT.
- **A2 · Lenguaje injurioso**: Alivia reframea (R9) y solicita hechos. Si el usuario insiste sin aportar hechos, cierra la conversación sin publicar.
- **A3 · Conexión múltiple**: si el aporte conecta con tres o más nodos previos, eleva el caso con marca `cruce_fuerte` y prioridad de revisión.
- **A4 · Fallo de minteo en Syscoin**: el caso se publica igual en el grafo con `nft_token_id = null` y se reintenta el minteo en segundo plano hasta 3 veces.

### Postcondiciones
- Un registro `Case` con `status = published` o `status = watchlist`.
- Cero o más nuevos nodos `Persona`, `Cargo`, `Empresa`, `Contrato` o `Familia`.
- Cero o más nuevas aristas conectándolos.
- Si `published` y minteo exitoso: un `NFT-Acta` en zkSYS testnet con su `token_id` y `tx_hash`.
- Un incremento en `Contributor.total_contributions`.

### Criterios de aceptación

| ID | Criterio | Cómo se verifica |
|---|---|---|
| AC1.1 | Alivia responde el primer mensaje del aportante en ≤ 5 segundos | Métrica en logs |
| AC1.2 | El JSON del aporte cumple el esquema de `01-agent-behavior.md §6` | Validación con schema |
| AC1.3 | El `corroboration_score` se calcula según la fórmula de `01-agent-behavior.md §7` | Test unitario |
| AC1.4 | Si hay coincidencia en el grafo, la alerta se muestra al usuario antes de la confirmación | Test E2E |
| AC1.5 | El NFT-Acta se mintea en zkSYS y devuelve `tx_hash` válido | Test contra testnet |
| AC1.6 | El hash de evidencia es reproducible (mismo input → mismo hash) | Test unitario |
| AC1.7 | El aportante recibe el `tx_hash` en el mensaje de cierre | Test E2E |

### Datos creados (ejemplo)

Para un aporte sobre el nombramiento de un primo del alcalde X:

- Nodo `Persona`: el primo nombrado (nuevo).
- Nodo `Persona`: el alcalde X (puede existir o ser nuevo).
- Nodo `Cargo`: el cargo otorgado.
- Nodo `Empresa`: la municipalidad.
- Nodo `Familia`: agrupación inferida por apellido si coincide.
- Aristas: `designo` (alcalde → primo, vía cargo), `ocupa_cargo` (primo → cargo), `es_pariente_de` (alcalde → primo, grado `primo`), `denunciado_por` (cargo o municipalidad → aporte).
- Registro `Case` con todo lo anterior.
- NFT-Acta en zkSYS con `evidence_hash`.

---

## Caso de uso 2 · Consulta pre-voto

### Actores
- **Consultante** (ciudadano que pregunta).
- **Alivia**.
- **Grafo**.

### Precondiciones
- El grafo está sembrado con OSINT pre-cargado y aportes ciudadanos.
- El consultante tiene acceso a Telegram/Discord.

### Flujo principal

1. El consultante escribe una pregunta como *"¿quién es Juan Pérez?"* o *"qué sabes del candidato X"*.
2. Alivia identifica que es una consulta (intent: `consulta_persona`).
3. Si el nombre es ambiguo (más de un nodo coincide), Alivia pregunta para desambiguar.
4. Alivia consulta el grafo: nodo + 2 hops de aristas, agrega aportes y NFTs relacionados.
5. Alivia compone un **dossier estructurado** con: cargos, familia, empresas, contratos, aportes ciudadanos, alertas.
6. Alivia entrega el dossier en formato markdown con enlaces a los NFT-Acta citados.
7. Alivia invita al consultante a contribuir si tiene información nueva.

### Flujos alternativos

- **A2.1 · Sujeto no en grafo**: *"No tengo registros sobre esa persona. Si tienes información, puedes ser el primero en aportarla."*
- **A2.2 · Sujeto con muchos registros**: paginar o resumir los más relevantes por `corroboration_score`.
- **A2.3 · Consulta sobre empresa o cargo**: misma lógica, distinto tipo de nodo de entrada.

### Postcondiciones
- Cero modificaciones al grafo.
- Una entrada en el log de consultas (para métricas).
- Posible flujo de denuncia (caso 1) si el consultante decide aportar.

### Criterios de aceptación

| ID | Criterio | Cómo se verifica |
|---|---|---|
| AC2.1 | Alivia entrega el dossier en ≤ 8 segundos | Métrica en logs |
| AC2.2 | El dossier incluye al menos: cargos conocidos, vínculos familiares, aportes con su score | Test E2E |
| AC2.3 | Cada aporte citado en el dossier tiene un enlace al NFT-Acta correspondiente | Test E2E |
| AC2.4 | Si hay ambigüedad de nombre, Alivia pregunta antes de responder | Test E2E |
| AC2.5 | Si no hay nodo, Alivia responde *"no tengo registros"* y no inventa | Test E2E (R5) |

---

## Caso de uso 3 · Cazarrecompensas (NFT-Bounty)

> **Estado MVP**: mockup funcional en `alivia.sbs`. El flujo end-to-end del minteo y claim se documenta acá y se demuestra como prototipo no transaccional.

### Actores
- **Postor** (ciudadano, ONG o medio que pone la recompensa).
- **Investigador** (aportante que la reclama).
- **Alivia** (custodia el bounty y modera el cierre).
- **zkSYS testnet**.

### Precondiciones
- El postor tiene wallet conectada a `alivia.sbs` con saldo en TSYS.
- Existe un caso o nodo objetivo (o se crea como `caso_abierto`).

### Flujo principal

1. El postor entra a `alivia.sbs/bounties/new`.
2. Selecciona el caso o nodo objetivo (autocompletar desde el grafo).
3. Define la descripción de lo que busca: *"Pago 100 TSYS por copia del contrato firmado N° 123-2026"*.
4. Define los criterios de cierre: qué evidencia gatilla el pago.
5. Define el plazo: por defecto 30 días.
6. Confirma y firma: se mintea el **NFT-Bounty** con los TSYS bloqueados en el contrato.
7. Alivia notifica a aportantes con `trust_score ≥ 0.7` y publica el bounty en el feed.
8. Un investigador aporta la evidencia vía caso 1 (denuncia) referenciando el `bounty_id`.
9. Alivia valida que la evidencia cumple los criterios de cierre.
10. Si cumple, Alivia desbloquea los TSYS y los transfiere al investigador. El NFT-Bounty pasa a estado `claimed`.
11. Si no cumple, el bounty queda abierto y la evidencia se publica como aporte regular.
12. Si vence el plazo sin claim válido, los TSYS regresan al postor.

### Flujos alternativos

- **A3.1 · Múltiples aportes**: el primero que cumple criterios reclama. Aportes posteriores quedan publicados sin claim.
- **A3.2 · Disputa sobre cumplimiento**: ventana de revisión de 48 horas en que la comunidad puede objetar. Si hay objeción razonada, el bounty pasa a revisión manual.
- **A3.3 · Cancelación por el postor**: solo posible antes de que llegue cualquier aporte vinculado.

### Postcondiciones
- Un registro `Bounty` en estado `open`, `claimed`, `expired` o `cancelled`.
- Si `claimed`: TSYS transferidos al investigador, `NFT-Bounty` actualizado.
- Si `claimed`: la evidencia que cerró el bounty queda enlazada como `Case` y mintea su propio `NFT-Acta`.

### Criterios de aceptación (MVP-mockup)

| ID | Criterio | Cómo se verifica |
|---|---|---|
| AC3.1 | La UI de creación de bounty está visible en `alivia.sbs/bounties` | Test E2E visual |
| AC3.2 | Existen al menos 3 bounties de ejemplo pre-cargados para el demo | Seed data |
| AC3.3 | El flujo completo está documentado en el whitepaper | Revisión |
| AC3.4 | Si hay tiempo: minteo real de un NFT-Bounty en testnet con TSYS bloqueados | Test contra testnet |

---

## Caso de uso 4 · Verificación de actas electorales

> **Estado MVP**: mockup en `alivia.sbs`. Se muestra el flujo y dos casos de ejemplo verificados.

### Actores
- **Observador** (ciudadano en una mesa de votación).
- **Alivia**.
- **Dataset oficial ONPE** (pre-cargado).

### Precondiciones
- Alivia tiene cargado el dataset oficial de actas de una elección (real o simulada para el demo).
- El observador tiene acceso al bot o a la web.

### Flujo principal

1. El observador toma foto del acta de su mesa de votación.
2. Sube la foto vía Telegram, Discord o la web.
3. Alivia ejecuta OCR sobre la foto y extrae: número de mesa, candidatos, votos por candidato.
4. Alivia cruza con el dataset oficial pre-cargado.
5. Si hay discrepancia, Alivia genera una alerta visible en el grafo (nodo `Discrepancia` o flag en mesa) y mintea un **NFT-Acta de Verificación**.
6. Si coincide, Alivia confirma y registra la verificación (también con NFT, marcado como `verificada_sin_discrepancia`).

### Flujos alternativos

- **A4.1 · OCR falla**: Alivia pide al observador que ingrese los datos manualmente.
- **A4.2 · Mesa duplicada**: si llegan dos verificaciones contradictorias de la misma mesa, ambas quedan registradas con alerta de conflicto, ninguna se considera autoritativa.

### Postcondiciones
- Un registro `Case` de tipo `electoral`.
- Un `NFT-Acta` por verificación.
- Posible nodo o flag de `Discrepancia`.

### Criterios de aceptación (MVP-mockup)

| ID | Criterio | Cómo se verifica |
|---|---|---|
| AC4.1 | Hay 2 ejemplos de actas verificadas pre-cargadas en la web | Seed data |
| AC4.2 | La vista de "Observatorio Electoral" en `alivia.sbs/elecciones` muestra mapa o lista | Test E2E visual |
| AC4.3 | El flujo OCR está documentado aunque no se ejecute en vivo en el demo | Revisión |

---

## Caso de uso 5 · Monitoreo proactivo de licitaciones

> **Estado MVP**: mockup. Se demuestra con alertas pre-generadas sobre licitaciones reales (o simuladas) de SEACE.

### Actores
- **Alivia** (cron + heurísticas).
- **Grafo**.
- **Comunidad de aportantes** (valida o descarta alertas).

### Precondiciones
- Alivia tiene cargado un dataset de licitaciones de SEACE (descarga puntual para el demo, no scraping en vivo en MVP).

### Flujo principal

1. Job programado de Alivia recorre las licitaciones cargadas.
2. Aplica heurísticas de riesgo:
   - **H1**: postor único.
   - **H2**: plazo de postulación < 7 días.
   - **H3**: monto fuera de rango (percentil 95 del histórico).
   - **H4**: postor adjudicatario tiene vínculo previo en el grafo con alguien de la entidad adjudicadora.
   - **H5**: misma empresa adjudicada ≥ 3 veces por la misma entidad en 12 meses.
3. Por cada licitación marcada, Alivia crea un nodo `Contrato` con `risk_flags` y un aporte tipo `licitacion` con `corroboration_score` inicial bajo (0.30-0.50, no se publica como denuncia, se publica como **alerta**).
4. La alerta se muestra en el feed de `alivia.sbs/licitaciones`.
5. La comunidad puede aportar evidencia adicional o votar para descartar.

### Flujos alternativos

- **A5.1 · Falso positivo**: si la comunidad descarta con razón documentada, la alerta se archiva.
- **A5.2 · Confirmación**: si llegan aportes corroborantes, el caso escala y se mintea NFT-Acta.

### Postcondiciones
- Cero o más nuevos nodos `Contrato` con alertas.
- Cero o más nuevos `Case` con tipo `licitacion`.

### Criterios de aceptación (MVP-mockup)

| ID | Criterio | Cómo se verifica |
|---|---|---|
| AC5.1 | Hay 3 alertas de licitaciones pre-generadas en el feed | Seed data |
| AC5.2 | Cada alerta lista las heurísticas que la dispararon | UI |
| AC5.3 | La página `alivia.sbs/licitaciones` está navegable | Test E2E visual |

---

## Mapeo casos de uso ↔ NFTs

| Caso | NFT-Acta | NFT-Aportante | NFT-Bounty | NFT-Llave |
|---|---|---|---|---|
| 1 · Denuncia | ✅ siempre que `published` | ✅ incrementa | – | – |
| 2 · Consulta | – | – | – | requerida si B2B premium |
| 3 · Bounty | ✅ del aporte que cierra | ✅ del investigador | ✅ del postor | – |
| 4 · Acta electoral | ✅ por verificación | ✅ del observador | – | – |
| 5 · Licitación | ✅ cuando escala | ✅ de quien valida | – | – |

Detalle de comportamiento de cada NFT en `04-nfts.md`.

---

## Dependencias con otros docs

- **`00-overview.md`** — alcance MVP de cada caso de uso.
- **`01-agent-behavior.md`** — flujos conversacionales detallados de los casos 1 y 2.
- **`02-data-model.md`** — nodos y aristas que cada caso genera.
- **`04-nfts.md`** — contrato y ciclo de vida de los NFTs por caso.
- **`05-architecture.md`** — implementación técnica de jobs, webhooks, OCR.
- **`06-demo-acceptance.md`** — qué de cada caso se demuestra en vivo el jueves.
