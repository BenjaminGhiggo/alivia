// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AliviaLlave — Suscripción B2B como NFT con vigencia
 * @notice Alivia (backend) mintea al cliente una llave con expiresAt.
 *         La API del backend verifica ownerOf + vigencia para autorizar
 *         accesos premium (compliance, banca, gobierno, medios).
 *
 * Spec: docs/specs/04-nfts.md §6
 *
 * Niveles (uint8):
 *   0 = LECTURA       (API read-only, queries limitadas)
 *   1 = INVESTIGADOR  (API + export + alertas)
 *   2 = ENTERPRISE    (todo + grafo histórico + seats)
 */
contract AliviaLlave is ERC721, ERC721URIStorage, Ownable {
    struct Llave {
        uint8 tier;            // 0..2
        uint64 issuedAt;
        uint64 expiresAt;
        string clientName;     // identificador comercial (no PII de personas)
    }

    mapping(uint256 => Llave) public llaves;

    event LlaveIssued(uint256 indexed tokenId, address indexed to, uint8 tier, uint64 expiresAt, string clientName);
    event LlaveRevoked(uint256 indexed tokenId, string reason);

    uint256 private _nextId;

    constructor() ERC721("Alivia Llave", "ALV-LLAVE") Ownable(msg.sender) {}

    function issue(
        address to,
        uint8 tier,
        uint64 expiresAt,
        string calldata clientName,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        require(tier <= 2, "Tier invalido");
        require(expiresAt > block.timestamp, "expiresAt en pasado");
        require(bytes(clientName).length > 0, "clientName vacio");
        tokenId = ++_nextId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        llaves[tokenId] = Llave({
            tier: tier,
            issuedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            clientName: clientName
        });
        emit LlaveIssued(tokenId, to, tier, expiresAt, clientName);
    }

    /// La API consulta esto antes de autorizar requests del cliente B2B.
    function isValid(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        return block.timestamp <= llaves[tokenId].expiresAt;
    }

    /// Alivia puede revocar (caso compliance, violación de términos, etc.).
    function revoke(uint256 tokenId, string calldata reason) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token no existe");
        llaves[tokenId].expiresAt = uint64(block.timestamp); // expira ya
        emit LlaveRevoked(tokenId, reason);
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
