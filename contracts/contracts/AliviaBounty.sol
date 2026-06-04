// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AliviaBounty — Recompensa pública por evidencia
 * @notice Postor bloquea TSYS al crear; Alivia (backend, `onlyOwner`) valida
 *         la evidencia y libera al investigador, o devuelve al postor si vence.
 *
 * Spec: docs/specs/04-nfts.md §5
 *
 * Estados (uint8): 0 OPEN, 1 CLAIMED, 2 EXPIRED, 3 CANCELLED.
 *
 * Diseño minimalista: la validación de la evidencia (criterios de claim) la
 * hace el backend off-chain con su criterio (R1 mínimos, R4 cruce, score).
 * El contrato sólo custodia y obedece al backend.
 */
contract AliviaBounty is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    enum Status { OPEN, CLAIMED, EXPIRED, CANCELLED }

    struct Bounty {
        address postor;
        uint256 amount;            // TSYS bloqueados (wei)
        uint64 expiresAt;          // unix seconds
        Status status;
        address claimer;           // wallet del investigador (si CLAIMED)
        string targetCaseId;       // referencia al Case o nodo objetivo
    }

    mapping(uint256 => Bounty) public bounties;

    event BountyOpened(uint256 indexed tokenId, address indexed postor, uint256 amount, string targetCaseId);
    event BountyClaimed(uint256 indexed tokenId, address indexed claimer, uint256 amount);
    event BountyExpired(uint256 indexed tokenId, address indexed refundedTo, uint256 amount);
    event BountyCancelled(uint256 indexed tokenId, address indexed refundedTo, uint256 amount);

    uint256 private _nextId;
    uint256 public constant MIN_AMOUNT = 1 ether; // 1 TSYS mínimo
    uint256 public constant MAX_AMOUNT = 500 ether; // 500 TSYS cap (anti-drenaje testnet, 04 §9)
    uint64 public constant MAX_EXPIRY = 180 days;

    constructor() ERC721("Alivia Bounty", "ALV-BOUNTY") Ownable(msg.sender) {}

    /// Crea un bounty bloqueando msg.value TSYS. Cualquiera puede postear.
    function openBounty(
        string calldata targetCaseId,
        uint64 expiresIn,
        string calldata tokenURI_
    ) external payable returns (uint256 tokenId) {
        require(msg.value >= MIN_AMOUNT, "Amount < MIN");
        require(msg.value <= MAX_AMOUNT, "Amount > MAX");
        require(expiresIn > 0 && expiresIn <= MAX_EXPIRY, "Expiry invalido");
        require(bytes(targetCaseId).length > 0, "targetCaseId vacio");

        tokenId = ++_nextId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        bounties[tokenId] = Bounty({
            postor: msg.sender,
            amount: msg.value,
            expiresAt: uint64(block.timestamp) + expiresIn,
            status: Status.OPEN,
            claimer: address(0),
            targetCaseId: targetCaseId
        });
        emit BountyOpened(tokenId, msg.sender, msg.value, targetCaseId);
    }

    /// Alivia valida off-chain y libera TSYS al claimer.
    function claim(uint256 tokenId, address claimer) external onlyOwner nonReentrant {
        Bounty storage b = bounties[tokenId];
        require(b.status == Status.OPEN, "Bounty no esta OPEN");
        require(claimer != address(0), "claimer 0x0");
        require(block.timestamp <= b.expiresAt, "Bounty vencido");
        b.status = Status.CLAIMED;
        b.claimer = claimer;
        (bool ok, ) = claimer.call{value: b.amount}("");
        require(ok, "Transfer al claimer fallo");
        emit BountyClaimed(tokenId, claimer, b.amount);
    }

    /// El postor puede cancelar si nadie ha reclamado todavía y aún no expiró.
    /// (En MVP la regla es más simple: postor cancela en cualquier momento si OPEN.)
    function cancel(uint256 tokenId) external nonReentrant {
        Bounty storage b = bounties[tokenId];
        require(b.status == Status.OPEN, "Bounty no esta OPEN");
        require(msg.sender == b.postor, "Solo postor puede cancelar");
        b.status = Status.CANCELLED;
        (bool ok, ) = b.postor.call{value: b.amount}("");
        require(ok, "Refund al postor fallo");
        emit BountyCancelled(tokenId, b.postor, b.amount);
    }

    /// Cualquiera puede gatillar el refund si el bounty venció sin claim.
    function expire(uint256 tokenId) external nonReentrant {
        Bounty storage b = bounties[tokenId];
        require(b.status == Status.OPEN, "Bounty no esta OPEN");
        require(block.timestamp > b.expiresAt, "Aun no vence");
        b.status = Status.EXPIRED;
        (bool ok, ) = b.postor.call{value: b.amount}("");
        require(ok, "Refund al postor fallo");
        emit BountyExpired(tokenId, b.postor, b.amount);
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
