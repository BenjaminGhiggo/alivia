# 04 · NFTs · Alivia

> **Los cuatro tipos de NFT de Alivia: comportamiento, contrato, metadata y ciclo de vida.**
> Todos los NFTs viven en **Syscoin** (capa NEVM, testnet zkSYS para el MVP). En el demo del jueves se mintea en vivo al menos un `NFT-Acta`; los otros tres se documentan completos y se muestran como UI mockup.

---

## 1. Filosofía

Los NFTs no son coleccionables ni decoración. En Alivia tienen **funciones de producto** específicas:

1. **NFT-Acta** → **Memoria pública**. Un caso cerrado se vuelve inalterable y citable.
2. **NFT-Aportante** → **Identidad cívica**. La reputación del ciudadano se acumula on-chain, sin transferencia.
3. **NFT-Bounty** → **Mercado de investigación**. Convierte la atención ciudadana en incentivo monetario para descubrir verdad.
4. **NFT-Llave** → **Acceso al producto B2B**. La suscripción comercial se materializa como NFT.

Cada uno justifica por qué Alivia necesita blockchain — no es "porque sí", es porque sin estas garantías el producto no funciona.

---

## 2. Resumen comparado

| Atributo | NFT-Acta | NFT-Aportante | NFT-Bounty | NFT-Llave |
|---|---|---|---|---|
| Estándar base | ERC-721 | ERC-5114 (soulbound) | ERC-721 + custodia | ERC-721 + expiración |
| Transferible | No (locked-by-design) | No (soulbound) | Sí (claim transfer) | Sí (puede revenderse) |
| Quemable | No | No (ciclo de vida humano) | Sí (cancelación o expiración) | Sí (al expirar) |
| Tiene fondos bloqueados | No | No | Sí (TSYS) | No |
| Quién lo posee | Aportante o `0xAliviaVault` | El ciudadano | Postor (hasta claim), luego investigador | Cliente B2B |
| Cuándo se mintea | Caso cerrado y publicado | Primer aporte verificado | Postor lo crea | Cliente compra suscripción |
| Cuántos por caso | 1 por aporte | 1 por persona (de por vida) | 1 por bounty | 1 por seat o por institución |
| Despliegue MVP | **Sí, en vivo** | Documentado + UI mockup | Documentado + UI mockup | Documentado |

---

## 3. NFT-Acta

### 3.1 · Propósito
Sellar un caso cerrado como evidencia inmutable, timestampeada y citable.

### 3.2 · Estándar
ERC-721 sobre Syscoin NEVM (zkSYS testnet para MVP). Locked-by-design: el `transferFrom` revierte salvo desde una dirección autorizada de migración (para futuras versiones).

### 3.3 · Cuándo se mintea
Cuando un `Case` cierra con `status = published` y `corroboration_score ≥ 0.40`.

### 3.4 · Quién lo posee
Por defecto, el aportante (si registró wallet) o la wallet de bóveda `0xAliviaVault` que custodia los NFTs de aportantes sin wallet propia.

### 3.5 · Metadata (on-chain + IPFS)

```json
{
  "name": "Alivia · Acta del Caso alv-2026-06-04-0001",
  "description": "Señalamiento ciudadano sobre nepotismo en designación pública. Registrado por aportante-7f3a el 04 de junio de 2026.",
  "image": "ipfs://Qm.../acta-cover.png",
  "external_url": "https://alivia.sbs/casos/alv-2026-06-04-0001",
  "attributes": [
    { "trait_type": "Tipo de caso", "value": "nepotismo" },
    { "trait_type": "Fecha", "value": "2026-06-04" },
    { "trait_type": "Score de corroboración", "value": 0.62 },
    { "trait_type": "Estado", "value": "publicado" },
    { "trait_type": "País", "value": "PE" }
  ],
  "evidence_hash": "0xabc123...",
  "case_snapshot_ipfs": "ipfs://Qm.../case-alv-2026-06-04-0001.json",
  "graph_snapshot_root": "0xdef456..."
}
```

**Lo que el hash y el snapshot garantizan**: dada cualquier disputa futura, se puede comparar el contenido del `Case` y el subgrafo asociado contra los hashes almacenados en el NFT.

### 3.6 · Eventos del contrato

| Evento | Cuándo se dispara | Datos clave |
|---|---|---|
| `ActaMinted` | Al mintear | `tokenId`, `caseId`, `evidenceHash`, `aportantePseudonym` |
| `ActaUpdated` | Si se corrige el caso (caso edge) | `tokenId`, `oldHash`, `newHash` (prohibido en MVP) |
| `ActaDisputed` | Si la comunidad marca dispute | `tokenId`, `disputeId` (futuro) |

### 3.7 · Esqueleto del contrato (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AliviaActa is ERC721, Ownable {
    struct Acta {
        string caseId;
        bytes32 evidenceHash;
        bytes32 graphSnapshotRoot;
        string aportantePseudonym;
        uint64 mintedAt;
    }

    mapping(uint256 => Acta) public actas;
    mapping(string => uint256) public caseIdToToken;

    event ActaMinted(
        uint256 indexed tokenId,
        string caseId,
        bytes32 evidenceHash,
        string aportantePseudonym
    );

    uint256 private _nextId;

    constructor() ERC721("Alivia Acta", "ALV-ACTA") Ownable(msg.sender) {}

    function mint(
        address to,
        string calldata caseId,
        bytes32 evidenceHash,
        bytes32 graphSnapshotRoot,
        string calldata aportantePseudonym,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        require(caseIdToToken[caseId] == 0, "Acta ya minteada para este caso");
        tokenId = ++_nextId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        actas[tokenId] = Acta({
            caseId: caseId,
            evidenceHash: evidenceHash,
            graphSnapshotRoot: graphSnapshotRoot,
            aportantePseudonym: aportantePseudonym,
            mintedAt: uint64(block.timestamp)
        });
        caseIdToToken[caseId] = tokenId;
        emit ActaMinted(tokenId, caseId, evidenceHash, aportantePseudonym);
    }

    // Locked-by-design: las actas no se transfieren.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Acta intransferible");
        return super._update(to, tokenId, auth);
    }
}
```

> Nota: en MVP `onlyOwner` mintea desde el backend de Alivia. Post-MVP se puede modular con roles.

---

## 4. NFT-Aportante (soulbound)

### 4.1 · Propósito
Identidad cívica del ciudadano dentro de Alivia. Acumula reputación on-chain.

### 4.2 · Estándar
ERC-5114 (Soulbound). No transferible, no quemable por terceros, asociado a un único `address` y al pseudónimo del aportante.

### 4.3 · Cuándo se mintea
La primera vez que el ciudadano cierra un aporte que pasa filtro de mínimos.

### 4.4 · Cómo evoluciona
La metadata del NFT-Aportante **se actualiza** con cada aporte adicional (nivel, conteos, score de confianza). El `tokenURI` apunta a un endpoint dinámico que sirve la metadata actualizada (`tokenURI` se reemplaza en cada actualización significativa).

### 4.5 · Metadata

```json
{
  "name": "Alivia · Aportante aportante-7f3a",
  "description": "Identidad cívica anti-corrupción. Acumula reputación por aportes ciudadanos verificables.",
  "image": "ipfs://Qm.../aportante-default.png",
  "external_url": "https://alivia.sbs/aportantes/aportante-7f3a",
  "attributes": [
    { "trait_type": "Nivel", "value": "Vigilante" },
    { "trait_type": "Aportes totales", "value": 14 },
    { "trait_type": "Aportes corroborados", "value": 9 },
    { "trait_type": "Score de confianza", "value": 0.74 },
    { "trait_type": "Antigüedad", "value": "2026-05-10" }
  ]
}
```

### 4.6 · Niveles propuestos

| Nivel | Requisito |
|---|---|
| Testigo | 1 aporte cerrado |
| Vigilante | 5 aportes, 50% corroborados |
| Investigador | 20 aportes, 60% corroborados |
| Cronista | 50 aportes, 70% corroborados |
| Guardiana | 100 aportes, 75% corroborados, sin violaciones reportadas |

### 4.7 · Estado MVP
**Documentado + UI mockup.** No se despliega contrato en el demo. Se muestra la vista del perfil aportante y el contador, sin minteo real. El despliegue real entra en sprint post-hackathon.

---

## 5. NFT-Bounty

### 5.1 · Propósito
Convertir TSYS en un compromiso público de recompensa por evidencia específica.

### 5.2 · Estándar
ERC-721 + lógica de custodia de TSYS. El NFT actúa como recibo del bounty y como vehículo de claim.

### 5.3 · Ciclo de vida

```
[postor crea bounty]
        ↓
mint NFT-Bounty (status=open) + bloqueo de TSYS en contrato
        ↓
[investigador presenta evidencia que cumple criterios]
        ↓
Alivia valida → release de TSYS al investigador
        ↓
NFT-Bounty pasa a status=claimed, claimer=investigador
        ↓
(si vence sin claim) status=expired, TSYS regresan al postor
```

### 5.4 · Metadata

```json
{
  "name": "Alivia · Bounty BNT-2026-06-04-0001",
  "description": "Recompensa: copia del contrato firmado N° 123-2026 de la municipalidad X.",
  "image": "ipfs://Qm.../bounty-cover.png",
  "external_url": "https://alivia.sbs/bounties/bnt-2026-06-04-0001",
  "attributes": [
    { "trait_type": "Estado", "value": "abierto" },
    { "trait_type": "Recompensa (TSYS)", "value": 100 },
    { "trait_type": "Plazo", "value": "30 días" },
    { "trait_type": "Caso objetivo", "value": "alv-2026-06-03-0042" },
    { "trait_type": "Postor", "value": "aportante-aa01" }
  ]
}
```

### 5.5 · Eventos del contrato

| Evento | Cuándo | Datos clave |
|---|---|---|
| `BountyOpened` | Al mintear con fondos bloqueados | `tokenId`, `caseTarget`, `amount`, `postor` |
| `BountyClaimed` | Al validar evidencia y liberar fondos | `tokenId`, `claimer`, `evidenceCaseId` |
| `BountyExpired` | Al vencer el plazo sin claim | `tokenId`, `refundedTo` |
| `BountyCancelled` | Si el postor cancela antes de cualquier aporte vinculado | `tokenId` |

### 5.6 · Estado MVP
**Documentado + UI mockup.** Se muestran 3 bounties de ejemplo en `alivia.sbs/bounties`. Si queda tiempo, se mintea uno real en testnet sin claim (solo bloqueo de TSYS).

---

## 6. NFT-Llave

### 6.1 · Propósito
Materializar la suscripción comercial B2B (compliance, banca, medios) como NFT con expiración.

### 6.2 · Estándar
ERC-721 con campo de expiración. Verificable on-chain por la API de Alivia para autorizar requests.

### 6.3 · Niveles

| Llave | Acceso | Precio anual indicativo (USD) |
|---|---|---|
| `LLAVE_LECTURA` | API read-only, hasta N queries/mes | 3,000 |
| `LLAVE_INVESTIGADOR` | API + exportación + alertas + 1 seat dashboard | 8,000 |
| `LLAVE_ENTERPRISE` | Todo lo anterior + grafo histórico + soporte + N seats | 15,000+ |

### 6.4 · Metadata

```json
{
  "name": "Alivia · Llave INVESTIGADOR · Banco Falabella PE",
  "description": "Acceso anual al grafo de Alivia, nivel investigador.",
  "image": "ipfs://Qm.../llave-investigador.png",
  "external_url": "https://alivia.sbs/llaves/llv-2026-06-04-0001",
  "attributes": [
    { "trait_type": "Nivel", "value": "INVESTIGADOR" },
    { "trait_type": "Cliente", "value": "Banco Falabella PE" },
    { "trait_type": "Vigencia desde", "value": "2026-07-01" },
    { "trait_type": "Vigencia hasta", "value": "2027-06-30" },
    { "trait_type": "Seats", "value": 1 }
  ]
}
```

### 6.5 · Verificación de acceso (backend)
La API de Alivia verifica en cada request:
1. El cliente firma con la wallet titular del NFT-Llave.
2. El backend lee on-chain `ownerOf(tokenId)` y `expiresAt(tokenId)`.
3. Si vigente, autoriza. Si expirado o no es el dueño, deniega.

### 6.6 · Estado MVP
**Documentado.** No hay UI ni contrato desplegado en el demo. El whitepaper lo describe como el vehículo del revenue B2B.

---

## 7. Direcciones de contrato (zkSYS testnet)

A llenar durante el despliegue. Mantener actualizado.

| Contrato | Dirección zkSYS testnet | Verificado | Notas |
|---|---|---|---|
| `AliviaActa` | `0xce3528c75e4b7ae7c842d400c273b20eef4372a3` | Tanenbaum chainId 5700 | Deployed 2026-06-04, tx `0xb51c778c…` |
| `AliviaAportante` | _post-MVP_ | – | – |
| `AliviaBounty` | _post-MVP_ | – | – |
| `AliviaLlave` | _post-MVP_ | – | – |

---

## 8. Manejo de wallets y custodia

### 8.1 · Wallet del aportante
**Opcional para MVP.** Por defecto, los NFT-Acta se mintean a la wallet de bóveda `0xAliviaVault`. El aportante puede vincular su wallet propia más adelante para recibir transferencia (pendiente de implementar, fuera de alcance MVP).

### 8.2 · Wallet de bóveda
`0xAliviaVault` es la wallet operada por Alivia que custodia NFTs y, eventualmente, fondos de bounties no reclamados. Multi-firma en futuro; en MVP es una wallet única del equipo.

### 8.3 · Pago de gas
Para MVP, **Alivia paga el gas** de todos los minteos. Los 10 TSYS del airdrop sostienen el demo. Post-MVP se considera modelo de gas meta-transactions o gas-relay.

---

## 9. Anti-abuso

1. **Rate limit por aportante** (no más de N aportes por hora).
2. **Validación de mínimos** en el agente antes de mintear (R1).
3. **Hash colision check**: si el `evidence_hash` ya existe, no se mintea otro NFT-Acta (deduplicación).
4. **Bounty caps** en MVP: máximo 500 TSYS por bounty para evitar drenaje de testnet.

---

## 10. Roadmap NFTs post-MVP

- Despliegue real de `AliviaAportante` (soulbound) y `AliviaBounty` en testnet.
- Migración a Syscoin NEVM mainnet cuando la fase de hackathon habilite integración blockchain.
- Royalty estándar (EIP-2981) en NFT-Acta si surge mercado secundario para colecciones de casos.
- Mecanismo de governance sobre los criterios de cierre de Bounty (votación de holders de Aportante).

---

## 11. Dependencias con otros docs

- **`00-overview.md`** — propósito de cada NFT en el modelo de negocio.
- **`01-agent-behavior.md`** — la regla R7 obliga a entregar hash al usuario; R10 obliga a confirmación antes del minteo.
- **`02-data-model.md`** — `Case`, `Contributor`, `Bounty` son los modelos que se sellan en NFTs.
- **`03-use-cases.md`** — cuándo cada caso de uso dispara cada NFT.
- **`05-architecture.md`** — integración técnica con zkSYS, gestión de wallet, IPFS para metadata.
