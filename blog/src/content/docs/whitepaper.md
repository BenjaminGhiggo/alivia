---
title: Whitepaper · ALIVIA
description: Inteligencia ciudadana anti-corrupción para LatAm
---

> **Tú das la pista. Alivia conecta los puntos. La blockchain lo recuerda.**

ALIVIA es una agente IA autónoma que recibe pistas ciudadanas de corrupción, construye un **grafo público de vínculos** entre personas, cargos, empresas, contratos y parentescos en LatAm, y sella cada caso en **Syscoin** como evidencia inmutable y citable.

Este documento es la versión pública del MVP presentado en la hackathon **Syscoin Builders LatAm — junio 2026**.

---

## 1. El problema

1. **Denuncias dispersas.** Las pistas de corrupción viven sueltas en X, TikTok, grupos de WhatsApp y notas de periódico. Nadie cruza los puntos entre casos distintos.
2. **Memoria pública frágil.** Un caso revienta, dura una semana en el discurso, se olvida. No queda registro estructurado, citable y compartido.
3. **Cobertura LatAm pobre en inteligencia de compliance.** Plataformas como Sayari y OpenCorporates cubren bien EE.UU. y Europa, mal LatAm. Bancos, exportadores y firmas de due diligence vuelan a ciegas en la región.
4. **Trabajo cognitivo no escalable.** Periodistas y ONGs no pueden entrevistar a cada denunciante 24/7 ni cruzar a mano miles de nombres, cargos y empresas. Es exactamente el trabajo que una IA bien diseñada puede sostener.

---

## 2. La solución

ALIVIA es una agente conversacional que vive en Telegram y Discord. Recibe a un ciudadano, lo entrevista en español natural sin pedir nombre real, extrae entidades, las consolida en el grafo público, y mintea un NFT-Acta en Syscoin como sello inalterable del aporte.

### El loop básico

```
Ciudadano → Telegram/Discord/Web
                ↓
            Alivia entrevista (gpt-4o-mini)
                ↓
       Extracción de entidades + cruce con grafo
                ↓
     "Tu aporte conecta con el caso de marzo"
                ↓
        Confirmación explícita del ciudadano
                ↓
   Aporte cristaliza como Case + sellado on-chain
                ↓
       NFT-Acta en Syscoin Tanenbaum Testnet
```

### Lo que la diferencia

- **El grafo crece con cada aporte.** Network effect real. El moat se profundiza solo.
- **Identidad cívica seudónima (`aportante-XXXX`)**, sin PII, soulbound por diseño.
- **Score de corroboración** agregado (0–1), sin veredictos. Es señal, no juicio.
- **Memoria inmutable.** Una vez sellado el NFT-Acta, el caso no se borra ni se reescribe.

---

## 3. Para quién

### Lado gratuito — generan el valor (el grafo)

| Usuario | Qué hace |
|---|---|
| Ciudadano denunciante | Aporta pistas vía Telegram/Discord, el agente las entrevista |
| Ciudadano consultante | Pregunta *"¿quién es X?"* antes de votar, contratar o investigar |
| Periodista de investigación | Consulta el grafo, exporta dossiers, levanta cazarrecompensas |
| ONG anti-corrupción | Modera, verifica, financia investigaciones con bounties |
| Académico | Consume data agregada para estudios |

### Lado pagado — capturan valor (año 2+)

| Cliente | Por qué paga |
|---|---|
| Compliance / Due Diligence | Screening de contraparte en LatAm con data que Sayari no tiene |
| Banca y exportadores | KYC/AML aumentado con señal ciudadana |
| Medios premium | Acceso a API + alertas + grafo histórico |
| Gobierno honesto | Canal estructurado de señal ciudadana |

---

## 4. Cómo se monetiza

**Comparable real**: [Sayari Labs](https://sayari.com) factura **USD 29M/año (2023, +30% YoY)** vendiendo inteligencia de riesgo a bancos y gobiernos. Su cobertura LatAm es débil porque dependen de scraping de registros oficiales. **Ese es nuestro hueco**: ALIVIA tiene una capa ciudadana que Sayari no puede replicar.

| Stream | Activación | Comparable |
|---|---|---|
| Suscripción B2B compliance/banca (NFT-Llave anual) | Año 2+ | Sayari ($29M), OpenCorporates (£3K-12K/seat) |
| Contratos B2G (fiscalías, contralorías) | Año 2-3 | Sayari tiene gobiernos como cliente |
| Fees de minteo (NFT-Aporte, NFT-Caso) | Día 1 | Crypto-nativo, complementa el modelo |
| Grants (NED, Tinker, CIVICUS, Omidyar) | Año 1-2 | OCCRP Aleph Pro pivot post-USAID 2025 |
| Free tier ciudadanos/periodistas/ONGs | Día 1 | Sostiene el moat |

---

## 5. Arquitectura técnica

| Capa | Tecnología |
|---|---|
| Framework fullstack | [Wasp](https://wasp.sh) 0.23 |
| Frontend | React + TypeScript + Tailwind |
| Visualización del grafo | `@xyflow/react` |
| Backend | Node.js + Wasp + Prisma |
| Base de datos | PostgreSQL 16 (grafo polimórfico Node+Edge) |
| LLM | OpenAI `gpt-4o-mini` |
| Bot Telegram | `grammy` (`@alivia_sbs_bot`) |
| Bot Discord | `discord.js` v14 |
| Blockchain | Syscoin NEVM (Tanenbaum Testnet, chain 5700) |
| Cliente EVM | `viem` |
| Wallet recomendada | Pali Wallet (oficial Syscoin) |
| Smart contract | `AliviaActa` ERC-721 (locked-by-design, OZ v5) |
| Storage de metadata NFT | IPFS vía web3.storage |

### Contrato desplegado

`AliviaActa` está vivo en Syscoin Tanenbaum Testnet:
- **Address**: `0xce3528c75e4b7ae7c842d400c273b20eef4372a3`
- **Tx de deploy**: `0xb51c778ccb71a4a6efc2cd3cdb0ff01841ca82d62aad93c1e932e56e72fb22de`
- **Explorer**: [tanenbaum.io](https://tanenbaum.io/address/0xce3528c75e4b7ae7c842d400c273b20eef4372a3)

---

## 6. NFTs como producto

| NFT | Función | Estado MVP |
|---|---|---|
| **NFT-Acta** | Sello notarial de un caso cerrado, hash de evidencia | **En vivo** en Tanenbaum |
| **NFT-Aportante** (soulbound) | Identidad cívica del ciudadano, acumula reputación | Documentado, UI mockup |
| **NFT-Bounty** | Recompensa bloqueada por evidencia específica | Documentado, UI mockup |
| **NFT-Llave** | Suscripción comercial B2B con vigencia anual | Documentado |

Los NFTs no son coleccionables ni decoración: cada uno justifica por qué ALIVIA necesita blockchain. Sin esas garantías el producto no funciona.

---

## 7. Cobertura ética y legal

ALIVIA **no emite veredictos**. Publica **señalamientos ciudadanos con score de corroboración**. La verificación final de las denuncias es de medios, autoridades o tribunales — ALIVIA agrega señal y transparencia.

Reglas operativas duras del agente (R1–R10):

- **R1** mínimos antes de publicar (nombre + cargo/relación + fecha + pista de evidencia)
- **R2** anonimato del aportante por defecto, sin PII
- **R3** especificidad obligatoria (sin opiniones genéricas)
- **R4** cruce contra grafo antes de publicar
- **R5** honestidad sobre la incertidumbre (*"no tengo registros"* es válido)
- **R6** lenguaje no inflamatorio (*"señalado"*, no *"corrupto"*)
- **R7** cierre con hash de tx
- **R8** sin promesas legales
- **R9** filtro de injuria con reframing
- **R10** confirmación explícita antes de mintear

---

## 8. Roadmap

| Fase | Cuándo | Qué |
|---|---|---|
| MVP hackathon | Jun 2026 | Bot Telegram + grafo + NFT-Acta + 30 nodos seed |
| Post-hackathon | Q3 2026 | Migración a Syscoin NEVM mainnet · NFT-Aportante soulbound · seed real OSINT curado |
| Año 1 | Q4 2026 - Q2 2027 | API B2B beta · primer cliente compliance · grant ancla (NED/Tinker) |
| Año 2 | 2027 | Federación multipaís (Colombia, Argentina) · NFT-Bounty con TSYS reales |
| Año 5 | 2031 | Red de instancias en cada democracia de LatAm · ingresos B2B sostenibles |

---

## 9. Visión a 10 años

En 2036:

- Cada democracia de LatAm tiene su instancia de ALIVIA o una red federada.
- Cualquier ciudadano sabe que tiene una compañera de memoria a la que puede aportar y consultar.
- El grafo público de corrupción regional **supera al de cualquier empresa de inteligencia privada**.
- Compliance, banca y gobierno honesto pagan por API + dashboard, sosteniendo el costo del lado gratuito.
- Cuando un periodista abre un caso, parte de ALIVIA. Cuando un fiscal honesto arma una causa, cita NFTs de ALIVIA.
- *"$SYS es el camino"* habrá significado, en parte, que la blockchain dio memoria pública a las democracias frágiles.

---

## 10. Referencias

- **Constitución ética del agente** (no negociables): `docs/SOUL.md` en el repo
- **Voz operativa de Alivia**: `docs/instinct.md`
- **Specs técnicas**: `docs/specs/00-overview.md` … `07-implementation-checklist.md`
- **Comparables de negocio**: [Sayari Labs](https://sayari.com), [OpenCorporates](https://opencorporates.com), [OCCRP Aleph Pro](https://aleph.occrp.org)
- **Wedge**: segunda vuelta electoral peruana, junio 2026
- **Código fuente**: [github.com/BenjaminGhiggo/alivia](https://github.com/BenjaminGhiggo/alivia) (MIT)
- **Demo**: https://alivia.sbs · Bot: [@alivia_sbs_bot](https://t.me/alivia_sbs_bot)

---

> **La corrupción solo se sostiene en el olvido. Alivia es lo contrario del olvido.**
