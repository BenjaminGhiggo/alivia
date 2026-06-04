// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AliviaActa — Memoria pública de aportes ciudadanos contra la corrupción
 * @notice Sello notarial inmutable de un caso cerrado en Alivia.
 *         Locked-by-design: las actas no se transfieren (memoria, no coleccionable).
 *         Mint sólo por el owner (backend de Alivia, vault wallet).
 *
 * Spec: docs/specs/04-nfts.md §3
 * Red:  zkSYS Testnet (chainId 5701) según docs/specs/05-architecture.md §1
 */
contract AliviaActa is ERC721, ERC721URIStorage, Ownable {
    struct Acta {
        string caseId;                 // alv-YYYY-MM-DD-NNNN
        bytes32 evidenceHash;          // sha256 del bundle de evidencia
        bytes32 graphSnapshotRoot;     // raíz del subgrafo asociado (futuro)
        string aportantePseudonym;     // aportante-XXXX
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

    /**
     * @notice Mintea un acta para un caso publicado.
     * @dev Reverts si el caseId ya tiene acta. R10 (confirmación) y umbral
     *      0.40 los hace cumplir el backend antes de llamar a este mint.
     */
    function mint(
        address to,
        string calldata caseId,
        bytes32 evidenceHash,
        bytes32 graphSnapshotRoot,
        string calldata aportantePseudonym,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        require(caseIdToToken[caseId] == 0, "Acta ya minteada para este caso");
        require(evidenceHash != bytes32(0), "evidenceHash invalido");

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

    /// @notice Locked-by-design: las actas no se transfieren.
    /// @dev Override del hook _update de ERC721 v5. Permite mint (from=0) y
    ///      burn (to=0) si jamás lo agregamos, pero bloquea transfer normal.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Acta intransferible");
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
