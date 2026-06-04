// Deploy directo de AliviaActa con viem. Bypasses Hardhat's tx/verify machinery
// que se colgó contra Tanenbaum. Lee el artifact ya compilado por hardhat.
//
// Uso: node scripts/deploy-viem.mjs
// Requiere env: ALIVIA_VAULT_PRIVATE_KEY, ZKSYS_RPC_URL, ZKSYS_CHAIN_ID

import { readFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseGwei,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config({ path: "../app/.env.server" });

const PRIVATE_KEY = process.env.ALIVIA_VAULT_PRIVATE_KEY;
const RPC_URL = process.env.ZKSYS_RPC_URL ?? "https://rpc.tanenbaum.io";
const CHAIN_ID = parseInt(process.env.ZKSYS_CHAIN_ID ?? "5700", 10);

if (!PRIVATE_KEY) {
  console.error("ALIVIA_VAULT_PRIVATE_KEY falta en .env.server");
  process.exit(1);
}

const chain = defineChain({
  id: CHAIN_ID,
  name: "Syscoin Tanenbaum Testnet",
  nativeCurrency: { name: "tSYS", symbol: "tSYS", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  testnet: true,
});

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account, chain, transport: http(RPC_URL) });

const artifactJson = JSON.parse(
  await readFile("./artifacts/contracts/AliviaActa.sol/AliviaActa.json", "utf-8"),
);

console.log(`[deploy-viem] Deployer: ${account.address}`);
const balance = await publicClient.getBalance({ address: account.address });
console.log(`[deploy-viem] Balance: ${Number(balance) / 1e18} tSYS`);

const gasPrice = await publicClient.getGasPrice();
console.log(`[deploy-viem] Gas price: ${Number(gasPrice) / 1e9} gwei`);

console.log(`[deploy-viem] Enviando tx de deploy...`);
const hash = await walletClient.deployContract({
  abi: artifactJson.abi,
  bytecode: artifactJson.bytecode,
  args: [], // constructor() no toma args
  gas: 2_500_000n,
  // Tanenbaum usa legacy gas pricing (no EIP-1559 plenamente)
  gasPrice: parseGwei("50"),
});
console.log(`[deploy-viem] Tx enviada: ${hash}`);

console.log(`[deploy-viem] Esperando receipt...`);
const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
console.log(`[deploy-viem] Block: ${receipt.blockNumber}`);
console.log(`[deploy-viem] Status: ${receipt.status}`);
console.log(`[deploy-viem] Contract address: ${receipt.contractAddress}`);
console.log(`[deploy-viem] Explorer: https://tanenbaum.io/address/${receipt.contractAddress}`);
console.log(``);
console.log(`Próximo paso: agregar a /opt/alivia.sbs/app/.env.server`);
console.log(`  ALIVIA_ACTA_CONTRACT=${receipt.contractAddress}`);
