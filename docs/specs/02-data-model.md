# 02 · Data Model · Alivia

> **El esquema del grafo de Alivia: nodos, aristas, propiedades, restricciones e implementación.**
> Este modelo es la fuente de verdad del producto. El agente (`01-agent-behavior.md`) lee y escribe sobre este esquema. La vista web (`05-architecture.md`) lo visualiza. Los NFTs (`04-nfts.md`) hashean snapshots de él.

---

## 1. Decisiones de diseño

1. **Grafo dirigido y tipado.** Cada arista tiene origen, destino y tipo. No es un grafo libre.
2. **Postgres + Prisma, no Neo4j.** Para el MVP basta una tabla de nodos y una de aristas con índices. Más simple de desplegar, suficiente para los volúmenes del demo.
3. **Esquema mínimo viable.** 5 tipos de nodo y 7 tipos de arista. Cualquier ampliación se documenta acá antes de implementarse.
4. **Todo nodo y toda arista son auditables.** Tienen `created_at`, `created_by`, `source_case_id` y `evidence_hash` cuando aplica.
5. **Inmutabilidad por capas.** Los datos se pueden corregir, pero cada cambio queda versionado y el snapshot del aporte original queda hasheado en el NFT-Acta.

---

## 2. Tipos de nodo

Cinco tipos. Cada nodo tiene un `id` único, un `type`, un `label` legible, un objeto `properties` específico al tipo, y los metadatos de auditoría.

### 2.1 · Persona

Una persona física. Funcionarios, candidatos, empresarios, familiares.

| Propiedad | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `full_name` | string | sí | Nombres y apellidos completos. |
| `aliases` | string[] | no | Variaciones, apodos, nombres anteriores. |
| `dni` | string | no | Solo si se confirma. Hasheado al guardar. |
| `nationality` | string | no | Default `PE` para MVP. |
| `birth_year` | int | no | Si está disponible. |
| `public_role_summary` | string | no | *"Ex-regidor de Lima Norte, 2018-2022"*. |
| `risk_flags` | string[] | no | Marcadores agregados por el agente (`vinculo_familiar_publico`, `licitacion_dudosa`, etc.). |

### 2.2 · Cargo

Un puesto público o privado relevante para el análisis.

| Propiedad | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | string | sí | *"Gerente de obras públicas"*, *"Ministro de salud"*. |
| `institution_node_id` | string | sí | Apunta al nodo Empresa o Institución. |
| `start_date` | date | no | Si conocida. |
| `end_date` | date | no | Si conocida. |
| `appointment_basis` | enum | no | `eleccion`, `designacion`, `concurso`, `desconocido`. |

### 2.3 · Empresa

Empresa privada, ONG, fundación o institución pública. (Por simplicidad MVP, unificamos público y privado bajo el mismo tipo; distinguimos por `sector`.)

| Propiedad | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `legal_name` | string | sí | Razón social. |
| `aliases` | string[] | no | Nombres comerciales, abreviaturas. |
| `ruc` | string | no | Identificador tributario peruano. |
| `sector` | enum | sí | `publica`, `privada`, `mixta`, `ong`. |
| `country` | string | sí | Default `PE`. |
| `incorporation_year` | int | no | |
| `status` | enum | no | `activa`, `inactiva`, `disuelta`, `desconocido`. |

### 2.4 · Contrato

Una licitación, contrato, convenio o adjudicación pública.

| Propiedad | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | string | sí | Objeto del contrato. |
| `reference_code` | string | no | Código SEACE, número de expediente. |
| `awarder_node_id` | string | sí | Empresa o entidad que adjudica. |
| `awardee_node_id` | string | sí | Empresa que recibe la adjudicación. |
| `amount` | decimal | no | Monto en PEN. |
| `amount_currency` | string | no | Default `PEN`. |
| `awarded_at` | date | no | |
| `risk_flags` | string[] | no | `postor_unico`, `monto_anomalo`, `plazo_corto`, etc. |

### 2.5 · Familia

Un núcleo familiar declarado o inferido. Es un nodo "puente" que conecta personas con relaciones de parentesco.

| Propiedad | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `family_label` | string | sí | *"Familia Pérez-Quispe"* (inferido del apellido compartido). |
| `inferred` | boolean | sí | `true` si se infiere por apellido, `false` si declarado en evidencia. |
| `evidence_node_ids` | string[] | no | Casos o aportes que sustentan la inferencia. |

---

## 3. Tipos de arista

Siete tipos. Cada arista es dirigida (`source → target`), tipada, y carga metadatos de auditoría.

| Tipo | De → A | Significado |
|---|---|---|
| `designo` | Persona → Persona, vía Cargo | A nombró a B en un cargo. |
| `ocupa_cargo` | Persona → Cargo | A ejerce o ejerció ese cargo. |
| `es_pariente_de` | Persona → Persona | Vínculo familiar, con grado en propiedad. |
| `es_dueño_de` | Persona → Empresa | Titularidad, participación accionaria o control. |
| `gano` | Empresa → Contrato | Adjudicación recibida. |
| `denunciado_por` | Persona/Empresa → Aporte | Aporte ciudadano que la menciona. |
| `mencionado_en` | Persona/Empresa/Cargo/Contrato → Aporte/Caso/Documento | Mención en evidencia. |

**Propiedades comunes a toda arista**:

| Propiedad | Tipo | Notas |
|---|---|---|
| `id` | string | UUID. |
| `type` | enum | Uno de los 7 anteriores. |
| `source_node_id` | string | |
| `target_node_id` | string | |
| `properties` | json | Específicas al tipo (ej. `grado_familiar`, `porcentaje_titularidad`). |
| `source_case_id` | string | Aporte que originó la arista. |
| `evidence_hash` | string | Hash de la evidencia que la sustenta. |
| `confidence` | decimal | 0-1, qué tan firme es la arista. |
| `created_at` | timestamp | |
| `created_by` | string | Pseudónimo del aportante o `system` si es OSINT. |

### Propiedades específicas por tipo de arista

**`es_pariente_de`**: `grado_familiar` ∈ {*conyuge, padre, madre, hijo, hija, hermano, hermana, primo, tio, suegro, cuñado, otro*}, `confirmado` ∈ {true, false, declarado_en_aporte}.

**`es_dueño_de`**: `porcentaje_titularidad` (decimal 0-100), `rol` ∈ {*titular, accionista, gerente, representante_legal, testaferro_sospechado*}.

**`designo`**: `via_cargo_id` (referencia al cargo creado), `fecha_designacion`, `resolucion_referencia`.

**`gano`**: `fecha_adjudicacion`, `numero_postores`, `monto_adjudicado`.

---

## 4. Entidad: Aporte (Case)

Aporte es la unidad de evidencia que el agente cierra y mintea. No es un nodo del grafo, es una entidad paralela que **produce nodos y aristas** y queda referenciada por ellas.

Es exactamente el JSON definido en `01-agent-behavior.md §6`. Se persiste en la tabla `cases`:

```
cases
├── id (string, PK, formato alv-YYYY-MM-DD-NNNN)
├── case_type (enum: nepotismo, licitacion, electoral, otro)
├── subject_node_id (FK a Persona)
├── facts (json array)
├── evidence (json array)
├── graph_connections (json array)
├── corroboration_score (decimal 0-1)
├── reporter_pseudonym (string)
├── status (enum: watchlist, published, archived, refuted)
├── evidence_hash (string, sha256)
├── nft_token_id (string, nullable)
├── nft_tx_hash (string, nullable)
├── created_at (timestamp)
└── published_at (timestamp, nullable)
```

---

## 5. Entidades auxiliares

### 5.1 · Aportante

Pseudónimo persistente. No guarda PII del ciudadano. Lleva la reputación on-chain (NFT-Aportante).

```
contributors
├── pseudonym (string, PK, formato aportante-XXXX)
├── soulbound_token_id (string, nullable)
├── trust_score (decimal 0-1)
├── total_contributions (int)
├── total_corroborated (int)
├── first_seen_at (timestamp)
└── last_seen_at (timestamp)
```

### 5.2 · Documento / Evidencia

Pieza de evidencia individual. Puede estar referenciada por múltiples aportes.

```
evidences
├── id (string, PK)
├── type (enum: link, image, document_reference, expediente, audio, video)
├── value (string, URL o referencia)
├── content_hash (string, sha256)
├── contributed_by (FK a contributors)
├── verified (boolean)
└── created_at (timestamp)
```

### 5.3 · Bounty

Recompensa abierta para investigar un caso. Detalle en `04-nfts.md`.

```
bounties
├── id (string, PK)
├── target_node_id (FK a Persona/Empresa/Caso)
├── description (string)
├── amount_tsys (decimal)
├── nft_bounty_token_id (string)
├── status (enum: open, claimed, expired, cancelled)
├── claim_criteria (string)
├── posted_by (FK a contributors)
├── claimed_by (FK a contributors, nullable)
├── posted_at (timestamp)
└── claimed_at (timestamp, nullable)
```

---

## 6. Esquema Prisma (extracto)

Esquema mínimo para arrancar. Se ajusta en implementación según convenciones de Wasp/Prisma.

```prisma
model Node {
  id            String   @id @default(cuid())
  type          NodeType
  label         String
  properties    Json
  riskFlags     String[]
  createdAt     DateTime @default(now())
  createdBy     String
  sourceCaseId  String?
  evidenceHash  String?

  outgoingEdges Edge[] @relation("source")
  incomingEdges Edge[] @relation("target")

  @@index([type])
  @@index([label])
}

enum NodeType {
  PERSONA
  CARGO
  EMPRESA
  CONTRATO
  FAMILIA
}

model Edge {
  id            String   @id @default(cuid())
  type          EdgeType
  sourceNodeId  String
  targetNodeId  String
  properties    Json
  sourceCaseId  String?
  evidenceHash  String?
  confidence    Float    @default(0.5)
  createdAt     DateTime @default(now())
  createdBy     String

  source        Node @relation("source", fields: [sourceNodeId], references: [id])
  target        Node @relation("target", fields: [targetNodeId], references: [id])

  @@index([type])
  @@index([sourceNodeId])
  @@index([targetNodeId])
}

enum EdgeType {
  DESIGNO
  OCUPA_CARGO
  ES_PARIENTE_DE
  ES_DUEÑO_DE
  GANO
  DENUNCIADO_POR
  MENCIONADO_EN
}

model Case {
  id                  String   @id
  caseType            String
  subjectNodeId       String
  facts               Json
  evidence            Json
  graphConnections    Json
  corroborationScore  Float
  reporterPseudonym   String
  status              String
  evidenceHash        String
  nftTokenId          String?
  nftTxHash           String?
  createdAt           DateTime @default(now())
  publishedAt         DateTime?

  @@index([status])
  @@index([reporterPseudonym])
}

model Contributor {
  pseudonym            String   @id
  soulboundTokenId     String?
  trustScore           Float    @default(0.5)
  totalContributions   Int      @default(0)
  totalCorroborated    Int      @default(0)
  firstSeenAt          DateTime @default(now())
  lastSeenAt           DateTime @default(now())
}

model Evidence {
  id            String   @id @default(cuid())
  type          String
  value         String
  contentHash   String
  contributedBy String
  verified      Boolean  @default(false)
  createdAt     DateTime @default(now())
}

model Bounty {
  id                String   @id @default(cuid())
  targetNodeId      String
  description       String
  amountTsys        Float
  nftBountyTokenId  String?
  status            String   @default("open")
  claimCriteria     String
  postedBy          String
  claimedBy         String?
  postedAt          DateTime @default(now())
  claimedAt         DateTime?

  @@index([status])
  @@index([targetNodeId])
}
```

---

## 7. Consultas críticas (para el agente y la vista)

El agente y la vista web ejecutan estas consultas con frecuencia. Deben ser rápidas (todas con índices).

### 7.1 · "¿existe esta persona en el grafo?"

```sql
SELECT * FROM "Node"
WHERE "type" = 'PERSONA'
  AND (
    lower("label") LIKE lower($1)
    OR "properties"->>'full_name' ILIKE $1
    OR "properties"->'aliases' ? $1
  )
LIMIT 5;
```

### 7.2 · "dame el dossier de este nodo"

Una consulta del nodo + dos hops de aristas, agregando aportes y NFTs relacionados.

```sql
WITH target AS (SELECT * FROM "Node" WHERE id = $1)
SELECT
  t.*,
  (SELECT json_agg(e.*) FROM "Edge" e WHERE e."sourceNodeId" = t.id OR e."targetNodeId" = t.id) AS edges,
  (SELECT json_agg(c.*) FROM "Case" c WHERE c."subjectNodeId" = t.id) AS cases
FROM target t;
```

### 7.3 · "¿este aporte nuevo conecta con algo previo?"

Dado un set de entidades extraídas, busca coincidencias por nombre, apellido, RUC, cargo + institución.

```sql
SELECT id, label, properties
FROM "Node"
WHERE "type" = 'PERSONA'
  AND (
    lower("label") IN (SELECT lower(name) FROM unnest($1::text[]) AS name)
    OR "properties"->'aliases' ?| $1
  );
```

### 7.4 · "vista del grafo: nodos y aristas conectados"

Para la visualización web, en un radio de N hops desde un nodo central o desde aportes recientes.

```sql
WITH RECURSIVE neighborhood AS (
  SELECT id, type, label FROM "Node" WHERE id = $1
  UNION
  SELECT n.id, n.type, n.label
  FROM "Node" n
  JOIN "Edge" e ON (e."sourceNodeId" = n.id OR e."targetNodeId" = n.id)
  JOIN neighborhood nb ON (e."sourceNodeId" = nb.id OR e."targetNodeId" = nb.id)
)
SELECT DISTINCT * FROM neighborhood LIMIT 200;
```

---

## 8. Desambiguación y deduplicación

Problema real: dos personas con el mismo nombre, dos empresas con razones sociales parecidas.

**Estrategia MVP** (suficiente para el demo, mejorable después):

1. **Match exacto sobre `full_name`** = candidato fuerte.
2. **Match sobre alias o sobre apellido + cargo** = candidato medio. El agente pregunta al usuario para desambiguar.
3. **Nunca fusionar automáticamente.** El merge de nodos es decisión humana, no automática.
4. **Marcador `aliases`** se usa generosamente: cualquier variante encontrada se acumula.
5. **RUC y DNI hasheados** son los identificadores fuertes cuando existen.

Para post-MVP: embeddings de nombre + cargo + institución, score de similitud, cola de revisión humana.

---

## 9. Datos sembrados (OSINT pre-cargado para el demo)

Para que el demo no muestre un grafo vacío, sembramos al menos:

- **30 nodos Persona**: candidatos y funcionarios de coyuntura electoral peruana junio 2026.
- **15 nodos Empresa**: ministerios, municipalidades clave, y empresas mencionadas en investigaciones públicas recientes.
- **10 nodos Cargo**: cargos públicos relevantes ejercidos por los nodos Persona.
- **5 nodos Contrato**: licitaciones recientes con cobertura mediática.
- **5 nodos Familia**: agrupaciones inferidas por apellido para los nodos sembrados.
- **~80 aristas** conectando los anteriores según data pública.

Fuentes de seed: Convoca, OjoPúblico, IDL-Reporteros, SEACE, INFOgob, El Comercio. El proceso de scraping y normalización vive en `scripts/seed-graph.ts` (a desarrollar).

---

## 10. Validaciones y restricciones

1. **Todo nodo Persona** debe tener `full_name`.
2. **Todo nodo Cargo** debe tener `institution_node_id` válido.
3. **Toda arista `gano`** debe tener `Contrato` como `target`.
4. **Toda arista `es_pariente_de`** debe tener `grado_familiar` declarado.
5. **Toda arista** debe tener `source_case_id` o `created_by = 'system'` (para los seeds OSINT).
6. **Todo `Case` publicado** (`status = published`) debe tener `evidence_hash` y `corroboration_score ≥ 0.40`.
7. **Todo `Case` con NFT minteado** debe tener `nft_token_id` y `nft_tx_hash` no nulos.

---

## 11. Cambios y versionado del esquema

Cualquier modificación del modelo:

1. Se actualiza este documento primero.
2. Se genera migración Prisma.
3. Se versiona la migración con fecha y descripción corta.
4. Cambios que rompen compatibilidad con NFTs ya minteados están **prohibidos** post-MVP (los NFT hashean snapshots inmutables del esquema vigente al momento del minteo).

**Versión actual del esquema**: `v0.1` (MVP hackathon).

---

## 12. Dependencias con otros docs

- **`00-overview.md`** — quiénes generan el dato (lado gratuito) y quiénes lo consumen (lado pagado).
- **`01-agent-behavior.md`** — el agente es el productor principal de nodos y aristas; el esquema JSON de aportes alimenta este modelo.
- **`03-use-cases.md`** — cada caso de uso genera nodos/aristas específicos.
- **`04-nfts.md`** — los NFTs hashean snapshots de este grafo.
- **`05-architecture.md`** — implementación Postgres + Prisma + queries.
