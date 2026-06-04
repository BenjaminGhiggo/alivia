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
 * Cliente para AliviaLlave.sol. Spec: 04-nfts §6.
 * Operaciones admin-only desde el backend de Alivia.
 */

const RPC_URL = process.env.ZKSYS_RPC_URL ?? "https://rpc.tanenbaum.io";

const LLAVE_ABI = parseAbi([
  "function issue(address to, uint8 tier, uint64 expiresAt, string clientName, string tokenURI_) returns (uint256)",
  "function isValid(uint256 tokenId) view returns (bool)",
  "function llaves(uint256 tokenId) view returns (uint8 tier, uint64 issuedAt, uint64 expiresAt, string clientName)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function revoke(uint256 tokenId, string reason)",
  "event LlaveIssued(uint256 indexed tokenId, address indexed to, uint8 tier, uint64 expiresAt, string clientName)",
]);

export enum LlaveTier {
  LECTURA = 0,
  INVESTIGADOR = 1,
  ENTERPRISE = 2,
}

export interface IssueLlaveInput {
  to: Address;
  tier: LlaveTier;
  validForDays: number;
  clientName: string;
  tokenURI: string;
}

export interface LlaveRecord {
  tier: number;
  issuedAt: bigint;
  expiresAt: bigint;
  clientName: string;
  owner: Address;
  isValid: boolean;
}

export interface LlaveService {
  issue(input: IssueLlaveInput): Promise<{ txHash: Hash; tokenId: string }>;
  readLlave(tokenId: bigint): Promise<LlaveRecord>;
  isValid(tokenId: bigint): Promise<boolean>;
}

class RealLlaveService implements LlaveService {
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

  async issue(input: IssueLlaveInput): Promise<{ txHash: Hash; tokenId: string }> {
    const expiresAt = BigInt(Math.floor(Date.now() / 1000) + input.validForDays * 86_400);
    const txHash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: LLAVE_ABI,
      functionName: "issue",
      args: [input.to, input.tier, expiresAt, input.clientName, input.tokenURI],
      gas: 400_000n,
      gasPrice: parseGwei("100"),
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 600_000,
    });
    const logs = await this.publicClient.getContractEvents({
      address: this.contractAddress,
      abi: LLAVE_ABI,
      eventName: "LlaveIssued",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });
    const tokenId = logs[0]?.args.tokenId?.toString() ?? "0";
    return { txHash, tokenId };
  }

  async readLlave(tokenId: bigint): Promise<LlaveRecord> {
    const [llaveData, owner, validity] = await Promise.all([
      this.publicClient.readContract({
        address: this.contractAddress,
        abi: LLAVE_ABI,
        functionName: "llaves",
        args: [tokenId],
      }) as Promise<readonly [number, bigint, bigint, string]>,
      this.publicClient.readContract({
        address: this.contractAddress,
        abi: LLAVE_ABI,
        functionName: "ownerOf",
        args: [tokenId],
      }) as Promise<Address>,
      this.publicClient.readContract({
        address: this.contractAddress,
        abi: LLAVE_ABI,
        functionName: "isValid",
        args: [tokenId],
      }) as Promise<boolean>,
    ]);
    return {
      tier: llaveData[0],
      issuedAt: llaveData[1],
      expiresAt: llaveData[2],
      clientName: llaveData[3],
      owner,
      isValid: validity,
    };
  }

  async isValid(tokenId: bigint): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: LLAVE_ABI,
      functionName: "isValid",
      args: [tokenId],
    }) as Promise<boolean>;
  }
}

class MockLlaveService implements LlaveService {
  async issue(_input: IssueLlaveInput): Promise<{ txHash: Hash; tokenId: string }> {
    return { txHash: "0x" as Hash, tokenId: "0" };
  }
  async readLlave(_tokenId: bigint): Promise<LlaveRecord> {
    return {
      tier: 0,
      issuedAt: 0n,
      expiresAt: 0n,
      clientName: "mock",
      owner: "0x0000000000000000000000000000000000000000",
      isValid: false,
    };
  }
  async isValid(_tokenId: bigint): Promise<boolean> {
    return false;
  }
}

let cached: LlaveService | null = null;
export function getLlaveService(): LlaveService {
  if (cached) return cached;
  const pk = process.env.ALIVIA_VAULT_PRIVATE_KEY;
  const contract = process.env.ALIVIA_LLAVE_CONTRACT;
  if (!pk || !contract || !pk.startsWith("0x") || !contract.startsWith("0x")) {
    console.warn("[chain] ALIVIA_LLAVE_CONTRACT ausente, modo mock.");
    cached = new MockLlaveService();
    return cached;
  }
  cached = new RealLlaveService(pk as `0x${string}`, contract as Address);
  return cached;
}

export { LLAVE_ABI };
