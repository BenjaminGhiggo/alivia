import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseAbi,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Cliente de minteo de NFT-Acta sobre zkSYS Testnet.
 * Spec: 04-nfts §3 + 05-architecture §3.6 + CLAUDE.md "Configuración Syscoin".
 *
 * Fail-soft: si faltan creds (ALIVIA_VAULT_PRIVATE_KEY o ALIVIA_ACTA_CONTRACT),
 * el módulo expone un mock que devuelve un hash dummy. Esto permite que el
 * agente complete su flow sin colgarse en demos donde la chain no está lista.
 */

const RPC_URL = process.env.ZKSYS_RPC_URL ?? "https://rpc-test-zk.syscoin.org/";
const CHAIN_ID = parseInt(process.env.ZKSYS_CHAIN_ID ?? "5701", 10);
const EXPLORER_URL = process.env.ZKSYS_EXPLORER_URL ?? "https://explorer-test-zk.syscoin.org/";

export const zkSysTestnet = defineChain({
  id: CHAIN_ID,
  name: "zkSYS Testnet",
  nativeCurrency: { name: "TSYS", symbol: "TSYS", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: "zkSYS Explorer", url: EXPLORER_URL } },
  testnet: true,
});

export interface MintActaInput {
  to: Address;
  caseId: string;
  evidenceHash: `0x${string}`;     // sha256 del bundle (tools.hashEvidenceBundle)
  graphSnapshotRoot: `0x${string}`; // futuro; en MVP repetimos evidenceHash
  aportantePseudonym: string;
  tokenURI: string;                 // ipfs://Qm... (ipfs.ts)
}

export interface MintActaResult {
  txHash: Hash;
  tokenId: string;
  explorerUrl: string;
}

const ABI = parseAbi([
  "function mint(address to, string caseId, bytes32 evidenceHash, bytes32 graphSnapshotRoot, string aportantePseudonym, string tokenURI_) returns (uint256)",
  "event ActaMinted(uint256 indexed tokenId, string caseId, bytes32 evidenceHash, string aportantePseudonym)",
]);

export interface MintActaService {
  mint(input: MintActaInput): Promise<MintActaResult>;
}

class RealMintActaService implements MintActaService {
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

  async mint(input: MintActaInput): Promise<MintActaResult> {
    const txHash = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: ABI,
      functionName: "mint",
      args: [
        input.to,
        input.caseId,
        input.evidenceHash,
        input.graphSnapshotRoot,
        input.aportantePseudonym,
        input.tokenURI,
      ],
    });

    // Esperar el receipt + leer el ActaMinted event para sacar tokenId
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
    const logs = await this.publicClient.getContractEvents({
      address: this.contractAddress,
      abi: ABI,
      eventName: "ActaMinted",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });
    const tokenId = logs[0]?.args.tokenId?.toString() ?? "0";

    return {
      txHash,
      tokenId,
      explorerUrl: `${EXPLORER_URL.replace(/\/$/, "")}/tx/${txHash}`,
    };
  }
}

class MockMintActaService implements MintActaService {
  async mint(input: MintActaInput): Promise<MintActaResult> {
    const fakeTx = `0x${"0".repeat(63)}1` as Hash;
    console.warn("[chain:mock] mintActa devolviendo hash dummy (no chain real).");
    return {
      txHash: fakeTx,
      tokenId: "0",
      explorerUrl: `${EXPLORER_URL.replace(/\/$/, "")}/tx/${fakeTx}`,
    };
  }
}

/**
 * Singleton lazy. Si faltan creds, devuelve mock (no falla); el agente
 * sigue funcionando y el caller registra el "pending" en logs.
 */
let cached: MintActaService | null = null;
export function getMintActaService(): MintActaService {
  if (cached) return cached;

  const pk = process.env.ALIVIA_VAULT_PRIVATE_KEY;
  const contract = process.env.ALIVIA_ACTA_CONTRACT;
  if (!pk || !contract || !pk.startsWith("0x") || !contract.startsWith("0x")) {
    console.warn(
      "[chain] ALIVIA_VAULT_PRIVATE_KEY o ALIVIA_ACTA_CONTRACT ausentes/inválidos. " +
        "mintActa modo mock.",
    );
    cached = new MockMintActaService();
    return cached;
  }

  cached = new RealMintActaService(pk as `0x${string}`, contract as Address);
  return cached;
}
