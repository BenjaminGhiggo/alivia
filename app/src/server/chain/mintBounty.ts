import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zkSysTestnet } from "./mintActa";

/**
 * Cliente para AliviaBounty.sol. Operaciones server-side (claim, expire).
 * El openBounty se firma desde el FRONTEND con la wallet del postor — el server
 * no custodia la PK del postor, sólo valida + dispara claim cuando corresponde.
 *
 * Spec: 04-nfts §5.
 */

const RPC_URL = process.env.ZKSYS_RPC_URL ?? "https://rpc.tanenbaum.io";

const BOUNTY_ABI = parseAbi([
  "function openBounty(string targetCaseId, uint64 expiresIn, string tokenURI_) payable returns (uint256)",
  "function claim(uint256 tokenId, address claimer)",
  "function cancel(uint256 tokenId)",
  "function expire(uint256 tokenId)",
  "function bounties(uint256 tokenId) view returns (address postor, uint256 amount, uint64 expiresAt, uint8 status, address claimer, string targetCaseId)",
  "event BountyOpened(uint256 indexed tokenId, address indexed postor, uint256 amount, string targetCaseId)",
  "event BountyClaimed(uint256 indexed tokenId, address indexed claimer, uint256 amount)",
]);

export interface BountyRecord {
  postor: Address;
  amount: bigint;
  expiresAt: bigint;
  status: number; // 0 OPEN, 1 CLAIMED, 2 EXPIRED, 3 CANCELLED
  claimer: Address;
  targetCaseId: string;
}

export interface BountyService {
  readBounty(tokenId: bigint): Promise<BountyRecord>;
  claim(tokenId: bigint, claimer: Address): Promise<Hash>;
}

class RealBountyService implements BountyService {
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

  async readBounty(tokenId: bigint): Promise<BountyRecord> {
    const res = (await this.publicClient.readContract({
      address: this.contractAddress,
      abi: BOUNTY_ABI,
      functionName: "bounties",
      args: [tokenId],
    })) as readonly [Address, bigint, bigint, number, Address, string];
    return {
      postor: res[0],
      amount: res[1],
      expiresAt: res[2],
      status: res[3],
      claimer: res[4],
      targetCaseId: res[5],
    };
  }

  async claim(tokenId: bigint, claimer: Address): Promise<Hash> {
    return this.walletClient.writeContract({
      address: this.contractAddress,
      abi: BOUNTY_ABI,
      functionName: "claim",
      args: [tokenId, claimer],
    });
  }
}

class MockBountyService implements BountyService {
  async readBounty(_tokenId: bigint): Promise<BountyRecord> {
    return {
      postor: "0x0000000000000000000000000000000000000000",
      amount: 0n,
      expiresAt: 0n,
      status: 0,
      claimer: "0x0000000000000000000000000000000000000000",
      targetCaseId: "",
    };
  }
  async claim(_tokenId: bigint, _claimer: Address): Promise<Hash> {
    return "0x" as Hash;
  }
}

let cached: BountyService | null = null;
export function getBountyService(): BountyService {
  if (cached) return cached;
  const pk = process.env.ALIVIA_VAULT_PRIVATE_KEY;
  const contract = process.env.ALIVIA_BOUNTY_CONTRACT;
  if (!pk || !contract || !pk.startsWith("0x") || !contract.startsWith("0x")) {
    console.warn("[chain] ALIVIA_BOUNTY_CONTRACT ausente, modo mock.");
    cached = new MockBountyService();
    return cached;
  }
  cached = new RealBountyService(pk as `0x${string}`, contract as Address);
  return cached;
}

/**
 * El frontend usa el ABI directamente para llamar openBounty desde la wallet
 * del postor. Exportamos para que la página /bounties/new lo importe.
 */
export { BOUNTY_ABI };
