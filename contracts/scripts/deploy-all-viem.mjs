// Deploy de los 3 NFT extra (Aportante, Bounty, Llave) en Tanenbaum
// via viem standalone (Hardhat se colgaba con esta red).
//
// Uso: node scripts/deploy-all-viem.mjs

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

const CONTRACTS = [
  { name: "AliviaAportante", env: "ALIVIA_APORTANTE_CONTRACT" },
  { name: "AliviaBounty",    env: "ALIVIA_BOUNTY_CONTRACT" },
  { name: "AliviaLlave",     env: "ALIVIA_LLAVE_CONTRACT" },
];

console.log(`[deploy] Deployer: ${account.address}`);
const balance = await publicClient.getBalance({ address: account.address });
console.log(`[deploy] Balance: ${Number(balance) / 1e18} tSYS`);
console.log("");

const results = [];

for (const c of CONTRACTS) {
  const artifact = JSON.parse(
    await readFile(`./artifacts/contracts/${c.name}.sol/${c.name}.json`, "utf-8"),
  );
  console.log(`[${c.name}] enviando tx de deploy...`);
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
    gas: 3_000_000n,
    gasPrice: parseGwei("50"),
  });
  console.log(`[${c.name}] tx: ${hash}`);
  console.log(`[${c.name}] esperando receipt (Tanenbaum ~30-90s)...`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 300_000 });
  if (receipt.status !== "success") {
    console.error(`[${c.name}] DEPLOY FAILED, status=${receipt.status}`);
    process.exit(1);
  }
  console.log(`[${c.name}] address: ${receipt.contractAddress}`);
  console.log(`[${c.name}] block: ${receipt.blockNumber}`);
  console.log("");
  results.push({ name: c.name, env: c.env, address: receipt.contractAddress, tx: hash });
}

console.log("================================================");
console.log("Append esto a app/.env.server:");
console.log("================================================");
for (const r of results) {
  console.log(`${r.env}=${r.address}`);
}
console.log("");
console.log("Tx hashes:");
for (const r of results) {
  console.log(`  ${r.name}: https://tanenbaum.io/tx/${r.tx}`);
}
