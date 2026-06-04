import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  parseGwei,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zkSysTestnet } from "./mintActa";

/**
 * Cliente de mint para NFT-Aportante (soulbound).
 * Spec: 04-nfts §4 + AliviaAportante.sol.
 *
 * Diseño:
 * - Al PRIMER aporte verificado de un pseudónimo, mintea su NFT-Aportante
 *   custodiado en el vault de Alivia (post-MVP: claim por wallet del aportante).
 * - En cada aporte adicional, llama updateStats para actualizar level
 *   y contadores según fórmula de 04-nfts §4.6.
 *
 * Fail-soft: si faltan creds o el contract address no está, devuelve mock
 * para que el flow del agente no se cuelgue.
 */

const RPC_URL = process.env.ZKSYS_RPC_URL ?? "https://rpc.tanenbaum.io";

const APORTANTE_ABI = parseAbi([
  "function mint(address to, string pseudonym, string tokenURI_) returns (uint256)",
  "function updateStats(uint256 tokenId, uint8 level, uint32 totalContributions, uint32 totalCorroborated, string tokenURI_)",
  "function pseudonymToToken(string pseudonym) view returns (uint256)",
  "event AportanteMinted(uint256 indexed tokenId, string pseudonym, uint8 level)",
]);

export interface MintAportanteInput {
  pseudonym: string;
  tokenURI: string;
}

export interface UpdateAportanteInput {
  tokenId: bigint;
  level: number;
  totalContributions: number;
  totalCorroborated: number;
  tokenURI: string;
}

export interface MintAportanteResult {
  txHash: Hash;
  tokenId: string;
  isNew: boolean; // true si fue mint, false si fue update
}

export interface AportanteService {
  ensureMinted(input: MintAportanteInput): Promise<MintAportanteResult>;
  update(input: UpdateAportanteInput): Promise<Hash>;
  getTokenId(pseudonym: string): Promise<bigint>;
}

class RealAportanteService implements AportanteService {
  private readonly contractAddress: Address;
  private readonly account;
  private readonly walletClient;
  private readonly publicClient;

  constructor(privateKey: `0x${string}`, contractAddress: Address) {
    this.contractAddress = contractAddress;
    this.account = privateKeyToAccount(privateKey);
    this.publicClient = createPublicClient({ chain: zkSysTestnet, transport: http(RPC_URL) });
    this.walletClient = createWalletClient({
      account: this.account,
      chain: zkSysTestnet,
      transport: http(RPC_URL),
    });
  }

  async getTokenId(pseudonym: string): Promise<bigint> {
    const id = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: APORTANTE_ABI,
      functionName: "pseudonymToToken",
      args: [pseudonym],
    });
    return id as bigint;
  }

  async ensureMinted(input: MintAportanteInput): Promise<MintAportanteResult> {
    const existing = await this.getTokenId(input.pseudonym);
    if (existing > 0n) {
      return { txHash: "0x" as Hash, tokenId: existing.toString(), isNew: false };
    }
    const txHash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: APORTANTE_ABI,
      functionName: "mint",
      args: [this.account.address, input.pseudonym, input.tokenURI],
      gas: 400_000n,
      gasPrice: parseGwei("100"),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 300_000 });
    const tokenId = await this.getTokenId(input.pseudonym);
    return { txHash, tokenId: tokenId.toString(), isNew: true };
  }

  async update(input: UpdateAportanteInput): Promise<Hash> {
    const txHash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: APORTANTE_ABI,
      functionName: "updateStats",
      args: [
        input.tokenId,
        input.level,
        input.totalContributions,
        input.totalCorroborated,
        input.tokenURI,
      ],
      gas: 300_000n,
      gasPrice: parseGwei("100"),
    });
    return txHash;
  }
}

class MockAportanteService implements AportanteService {
  async ensureMinted(input: MintAportanteInput): Promise<MintAportanteResult> {
    console.warn("[chain:mock] mintAportante mock para", input.pseudonym);
    return { txHash: "0x" as Hash, tokenId: "0", isNew: false };
  }
  async update(_input: UpdateAportanteInput): Promise<Hash> {
    return "0x" as Hash;
  }
  async getTokenId(_pseudonym: string): Promise<bigint> {
    return 0n;
  }
}

let cached: AportanteService | null = null;
export function getAportanteService(): AportanteService {
  if (cached) return cached;
  const pk = process.env.ALIVIA_VAULT_PRIVATE_KEY;
  const contract = process.env.ALIVIA_APORTANTE_CONTRACT;
  if (!pk || !contract || !pk.startsWith("0x") || !contract.startsWith("0x")) {
    console.warn("[chain] ALIVIA_APORTANTE_CONTRACT ausente, modo mock.");
    cached = new MockAportanteService();
    return cached;
  }
  cached = new RealAportanteService(pk as `0x${string}`, contract as Address);
  return cached;
}

/**
 * Calcula el level según la fórmula de 04-nfts §4.6:
 *   0 Testigo, 1 Vigilante, 2 Investigador, 3 Cronista, 4 Guardiana.
 * Para MVP simplificamos: la antigüedad (1 año Oro, 6 meses Plata) la ignoramos
 * porque el demo es nuevo; sólo cuento aportes/corroborados.
 */
export function computeAportanteLevel(totalContributions: number, totalCorroborated: number): number {
  const ratio = totalContributions > 0 ? totalCorroborated / totalContributions : 0;
  if (totalContributions >= 100 && ratio >= 0.75) return 4;
  if (totalContributions >= 50 && ratio >= 0.70) return 3;
  if (totalContributions >= 20 && ratio >= 0.60) return 2;
  if (totalContributions >= 5 && ratio >= 0.50) return 1;
  return 0;
}
