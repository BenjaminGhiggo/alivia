// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AliviaAportante — Identidad cívica soulbound del aportante
 * @notice Mintea 1 NFT por pseudónimo único. Soulbound: no transferible.
 *         Acumula level + estadísticas con cada aporte verificado.
 *
 * Spec: docs/specs/04-nfts.md §4
 *
 * Niveles (04 §4.6):
 *   0 = Testigo       (1 aporte)
 *   1 = Vigilante     (5 aportes, 50% corroborados)
 *   2 = Investigador  (20 aportes, 60% corroborados)
 *   3 = Cronista      (50 aportes, 70% corroborados)
 *   4 = Guardiana     (100 aportes, 75% corroborados, sin violaciones)
 *
 * El backend de Alivia es el `onlyOwner` y administra la progresión.
 */
contract AliviaAportante is ERC721, ERC721URIStorage, Ownable {
    struct Aportante {
        string pseudonym;             // aportante-XXXX
        uint8 level;                  // 0..4
        uint32 totalContributions;
        uint32 totalCorroborated;
        uint64 firstSeenAt;
    }

    mapping(uint256 => Aportante) public aportantes;
    mapping(string => uint256) public pseudonymToToken;

    event AportanteMinted(uint256 indexed tokenId, string pseudonym, uint8 level);
    event AportanteUpdated(uint256 indexed tokenId, uint8 level, uint32 totalContributions);

    uint256 private _nextId;

    constructor() ERC721("Alivia Aportante", "ALV-APORTANTE") Ownable(msg.sender) {}

    function mint(
        address to,
        string calldata pseudonym,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        require(pseudonymToToken[pseudonym] == 0, "Aportante ya minteado");
        tokenId = ++_nextId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        aportantes[tokenId] = Aportante({
            pseudonym: pseudonym,
            level: 0,
            totalContributions: 1,
            totalCorroborated: 0,
            firstSeenAt: uint64(block.timestamp)
        });
        pseudonymToToken[pseudonym] = tokenId;
        emit AportanteMinted(tokenId, pseudonym, 0);
    }

    function updateStats(
        uint256 tokenId,
        uint8 level,
        uint32 totalContributions,
        uint32 totalCorroborated,
        string calldata tokenURI_
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token no existe");
        Aportante storage a = aportantes[tokenId];
        a.level = level;
        a.totalContributions = totalContributions;
        a.totalCorroborated = totalCorroborated;
        _setTokenURI(tokenId, tokenURI_);
        emit AportanteUpdated(tokenId, level, totalContributions);
    }

    /// Soulbound: prohibir transferencias humanas. Solo mint (from=0) y burn (to=0).
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Aportante soulbound: no transferible");
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
