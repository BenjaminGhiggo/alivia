# 00 · Overview · Alivia

> **Documento ancla.** Define qué es Alivia, qué resuelve, para quién, y qué entra y qué no entra en el MVP de la hackathon Syscoin Builders LatAm.
> Toda decisión de producto, técnica o de negocio debe ser consistente con este documento. Si una decisión rompe con esto, se actualiza este documento primero.

---

## 1. Visión

Alivia es una **agente IA autónoma** que recibe pistas ciudadanas de corrupción, construye un **grafo público de vínculos** entre personas, cargos, empresas, contratos y parentescos en LatAm, y sella cada caso en **Syscoin** como evidencia inmutable y citable.

### Tagline principal

> **Tú das la pista. Alivia conecta los puntos. La blockchain lo recuerda.**

### Línea de apoyo (para X, YouTube y whitepaper)

> *Una agente IA que convierte denuncias dispersas en una red pública y verificable de corrupción en LatAm.*

### Por qué esta tagline funciona

- **Regla de tres**: nombra a los tres actores del sistema (ciudadano, IA, blockchain) en una sola línea.
- **Verbos potentes y simples**: *das, conecta, recuerda*. No hay jerga técnica.
- **Ritmo de eslogan**: corta, memorizable, traducible.
- **Posicionamiento implícito**: la pista la pone la gente, no Alivia (humildad), y la blockchain es memoria, no veredicto (cobertura ética).

---

## 2. El problema que resolvemos

1. **Denuncias dispersas.** Las pistas de corrupción viven sueltas en X, TikTok, grupos de WhatsApp y notas de periódico. Nadie cruza los puntos entre casos distintos.
2. **Memoria pública frágil.** Un caso revienta, dura una semana en el discurso, se olvida. No queda registro estructurado, citable y compartido.
3. **Cobertura LatAm pobre en inteligencia de compliance.** Plataformas como Sayari y OpenCorporates cubren bien EE.UU. y Europa, mal LatAm. Bancos, exportadores y firmas de due diligence vuelan a ciegas en la región.
4. **Trabajo cognitivo no escalable.** Periodistas y ONGs no pueden entrevistar a cada denunciante 24/7 ni cruzar a mano miles de nombres, cargos y empresas. Es exactamente el trabajo que una IA bien diseñada puede sostener.

---

## 3. Quiénes son los usuarios

### Lado gratuito — generan el valor (el grafo)

| Usuario | Qué hace en Alivia |
|---|---|
| Ciudadano denunciante | Aporta pistas vía Telegram/Discord, el agente las entrevista y estructura |
| Ciudadano consultante | Pregunta *"¿quién es X?"* antes de votar, contratar o investigar |
| Periodista de investigación | Consulta el grafo, exporta dossiers, levanta cazarrecompensas |
| ONG anti-corrupción | Modera, verifica, financia investigaciones con bounties |
| Académico / investigador | Consume data agregada para estudios |

### Lado pagado — capturan valor (año 2+)

| Cliente | Por qué paga |
|---|---|
| Compliance / Due Diligence | Screening de contraparte en LatAm con data que Sayari no tiene |
| Banca y exportadores | KYC/AML aumentado con señal ciudadana |
| Medios premium | Acceso a API + alertas + grafo histórico |
| Gobierno (fiscalías, contralorías) | Canal estructurado de señal ciudadana |

---

## 4. Propuesta de valor por segmento

| Segmento | Valor |
|---|---|
| **Ciudadano** | Voz sin exponerse + buscador en lenguaje natural de personas, cargos y empresas + huella pública verificable de su aporte |
| **Periodista / ONG** | Dossier OSINT instantáneo con evidencia timestampeada y citable + cazarrecompensas para financiar investigaciones |
| **Compliance / Banca** | Inteligencia de riesgo en LatAm con cobertura y profundidad que las alternativas no tienen |
| **Gobierno honesto** | Señal ciudadana estructurada y verificable, en lugar de denuncias sueltas en redes |

---

## 5. Alcance del MVP (lo que demostramos el jueves 4)

### Sí entra

- **Agente conversacional** funcional en **Telegram** (prioridad 1) y **Discord** (prioridad 2). Telegram va primero porque su Bot API es libre, la comunidad crypto vive ahí, y es la vía más rápida para tener algo demoable en 24 horas.
- **Grafo** en Postgres con esquema mínimo: 5 tipos de nodo (Persona, Cargo, Empresa, Contrato, Familia) y 7 tipos de arista (designó, es-pariente-de, es-dueño-de, ganó, denunciado-por, mencionado-en, vinculado-a).
- **Vista web** del grafo en `alivia.sbs` con actualización en vivo.
- **2 casos de uso en vivo durante el demo**: denuncia ciudadana + consulta pre-voto.
- **3 casos de uso como mockup visible en la web**: cazarrecompensas, verificación de actas, monitoreo de licitaciones.
- **1 NFT funcional en zkSYS testnet**: NFT-Acta del caso cerrado.
- **3 NFTs definidos en docs y mostrados en UI**: NFT-Aportante (soulbound), NFT-Bounty, NFT-Llave.
- **OSINT pre-cargado**: mínimo 30 nodos sembrados con datos públicos de coyuntura electoral peruana.

### No entra (out of scope MVP, sí en roadmap)

- **Integración con WhatsApp Business API.** Requiere aprobación de Meta, cuesta por conversación y no es viable en 24 horas. Se incorpora en el roadmap post-hackathon como segundo canal masivo.
- Verificación de identidad real (la huella táctil se simula).
- Smart contracts complejos más allá del NFT-Acta básico.
- Integración con registros públicos en tiempo real (SEACE, ONPE, etc. — solo OSINT pre-cargado).
- Soporte multilingüe (solo español).
- Cobertura fuera de Perú.
- App móvil nativa (web responsive es suficiente).
- Anclaje legal de NFTs como prueba en tribunal.
- KYC/AML productivo para clientes B2B.

---

## 6. Casos de uso (referencia, detalle en `03-use-cases.md`)

1. **Denuncia ciudadana** → reportar → entrevistar → estructurar → conectar → mintear NFT-Acta.
2. **Consulta pre-voto** → preguntar por candidato/funcionario → recibir dossier.
3. **Cazarrecompensas** → ONG/ciudadano bloquea TSYS en NFT-Bounty → investigador aporta evidencia → reclama recompensa.
4. **Verificación de actas electorales** → ciudadano sube foto de acta → cruce con ONPE → discrepancias visibles + NFT-Acta por mesa.
5. **Monitoreo proactivo de licitaciones** → Alivia lee SEACE → alerta por patrones de riesgo → comunidad valida.

---

## 7. Tipos de NFT (referencia, detalle en `04-nfts.md`)

| NFT | Función | Transferible |
|---|---|---|
| **NFT-Acta** | Sello notarial de un caso cerrado, con hash de evidencias | No |
| **NFT-Aportante** | Identidad cívica del ciudadano, acumula reputación on-chain | No (soulbound) |
| **NFT-Bounty** | Recompensa bloqueada para investigar un caso específico | Sí (claim) |
| **NFT-Llave** | Acceso anual al grafo completo para clientes B2B | Sí |

---

## 8. Modelo de negocio (referencia, detalle en `whitepaper.md`)

- **Lado gratuito** sostiene el moat: el grafo crece con cada aporte ciudadano.
- **Lado pagado** sostiene el revenue: compliance/banca/gobierno compran NFT-Llave anual.
- **Fees de minteo** en zkSYS son el ángulo crypto-nativo del demo, no el pilar del modelo.
- **Comparable real**: Sayari Labs factura **USD 29M/año (2023)** vendiendo inteligencia de riesgo a bancos y gobiernos. Cobertura LatAm débil → ese es nuestro hueco.

---

## 9. Métricas de éxito del demo (jueves 4, 3pm)

Para considerar el demo exitoso, todo lo siguiente debe verse en vivo:

1. Conversación end-to-end con el agente vía Telegram (mínimo). Discord como segundo canal demostrable.
2. Extracción de entidades del mensaje del usuario, visible en logs o UI.
3. Inserción de nuevos nodos y aristas en el grafo, **visible en la vista web** que actualiza en vivo.
4. Detección automática de conexión con un nodo pre-existente y disparo de **alerta visible**.
5. Consulta en lenguaje natural (*"¿quién es X?"*) devuelve dossier estructurado.
6. Minteo real de un **NFT-Acta en zkSYS testnet** al cerrar el caso.
7. Tiempo total del demo grabado para YouTube: ≤ 5 minutos.

---

## 10. Métricas de éxito post-hackathon (3-12 meses)

- 500 ciudadanos aportantes activos (Perú).
- 5,000 nodos en el grafo.
- 3 medios o ONGs usando Alivia para investigaciones.
- 1 piloto comercial firmado con cliente B2B (compliance o banca).
- 1 grant de bridge (NED / Tinker / CIVICUS / Omidyar ALTEC).

---

## 11. Restricciones y supuestos

- **Fase de la hackathon**: agente autónomo, **no se exige integración con blockchain**. Nosotros la incluimos como ventaja diferencial.
- **Stack**: Wasp (wasp.sh) + Postgres + Prisma + React + **OpenAI `gpt-4o-mini`** para router de intención, agente conversacional y extracción de entidades + Syscoin zkSYS testnet para NFTs.
- **Equipo (6 personas, roles a asignar)**. Los roles requeridos por el proyecto son:
  1. **Tech lead / full-stack** — arquitectura, integración de piezas, decisiones técnicas finales.
  2. **Backend / infra** — Wasp, Postgres, Prisma, despliegue en VPS.
  3. **Frontend / UI** — vista web del grafo, dashboard, landing.
  4. **AI / agente** — prompts del agente, pipeline de extracción de entidades, integración LLM.
  5. **Producto y contenido** — guion del agente en español, textos, voz de marca, whitepaper.
  6. **Marketing, redes y curaduría OSINT** — Instagram, X, Telegram, recolección y validación de casos reales para sembrar el grafo.

  La asignación nombre → rol se cierra en `docs/specs/06-demo-acceptance.md` una vez que el equipo lo defina.

- **Miembros del equipo**: Benjamín, Néstor Velarde, Kevin Pinto, Valeria, Hillary, Edwin.

- **Recursos crypto**: 10 TSYS por dirección del airdrop post-reset de zkSYS.
- **Justificación de Telegram sobre WhatsApp**: el entregable original de la hackathon menciona WhatsApp, pero (a) la comunidad crypto-builder de Syscoin vive en Telegram, no en WhatsApp; (b) la Bot API de Telegram es libre y sin aprobación previa, mientras que WhatsApp Business API requiere onboarding con Meta y costos por conversación; (c) Telegram permite mini-apps y wallets integrados, lo que abre vías futuras con Syscoin. Decisión registrada para discusión con Fer si fuera necesario.

---

## 12. Cobertura legal y ética

- Alivia **no emite veredictos**. Publica **señalamientos ciudadanos con score de corroboración**.
- La verificación final de las denuncias es de medios, autoridades o tribunales — Alivia agrega señal y transparencia.
- Los aportes sin evidencia van a una capa de *watchlist*, no al feed público.
- El agente filtra lenguaje difamatorio y exige especificidad antes de elevar un caso a publicación.

---

## 13. Referencias

- **Artículo guía del jurado**: [Winners, Losers, and Strategies in the AI Revolution](https://www.develcuy.com/en/winners-losers-strategies-ai-revolution-tech-blockchain-startups) — Fernando Paredes (Syscoin LatAm)
- **Plantillas oficiales**: Business Model Canvas, Decision Matrix, Value Proposition Canvas (carpeta `recursos/`)
- **Comparables de negocio**: Sayari Labs, OpenCorporates, OCCRP Aleph Pro
- **Wedge**: segunda vuelta electoral peruana, junio 2026
- **Cronograma**:
  - Mié 3 jun 2026: fin de mentorías
  - Jue 4 jun 2026, 3pm: presentación final en Discord oficial de Syscoin
  - Vie 5 – Lun 8 jun: votaciones públicas
  - Mar 9 jun: anuncio de ganadores
