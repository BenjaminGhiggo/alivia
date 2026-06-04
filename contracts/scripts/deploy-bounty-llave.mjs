// Deploy Bounty + Llave en paralelo (Aportante ya está deployado).
// Tanenbaum es lento: enviamos las 2 txs casi simultáneo y esperamos cada una.

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
  { name: "AliviaBounty", env: "ALIVIA_BOUNTY_CONTRACT" },
  { name: "AliviaLlave",  env: "ALIVIA_LLAVE_CONTRACT" },
];

const nonceBase = await publicClient.getTransactionCount({ address: account.address, blockTag: "pending" });
console.log(`[deploy] base nonce: ${nonceBase}`);

const txs = [];
for (let i = 0; i < CONTRACTS.length; i++) {
  const c = CONTRACTS[i];
  const artifact = JSON.parse(
    await readFile(`./artifacts/contracts/${c.name}.sol/${c.name}.json`, "utf-8"),
  );
  console.log(`[${c.name}] enviando con nonce ${nonceBase + i}...`);
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
    gas: 3_500_000n,
    gasPrice: parseGwei("50"),
    nonce: nonceBase + i,
  });
  console.log(`[${c.name}] tx: ${hash}`);
  txs.push({ ...c, hash });
}

console.log("");
console.log("Esperando receipts (Tanenbaum es lento, ~5-10 min)...");

for (const t of txs) {
  console.log(`[${t.name}] aguardando ${t.hash}...`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: t.hash, timeout: 1_200_000 });
  if (receipt.status !== "success") {
    console.error(`[${t.name}] FAIL status=${receipt.status}`);
    process.exit(1);
  }
  console.log(`[${t.name}] OK · address ${receipt.contractAddress} · block ${receipt.blockNumber}`);
  t.address = receipt.contractAddress;
}

console.log("");
console.log("================ Append a .env.server ================");
for (const t of txs) console.log(`${t.env}=${t.address}`);
console.log("");
for (const t of txs) console.log(`${t.name}: https://tanenbaum.io/tx/${t.hash}`);
