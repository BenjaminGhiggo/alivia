// Deploy genérico resiliente: envía con gas alto, polea inclusión,
// reenvía con bump si la tx se cae del mempool.
//
// Uso: node scripts/deploy-robust.mjs <ContractName>

import { readFile } from "node:fs/promises";
import { createPublicClient, createWalletClient, defineChain, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config({ path: "../app/.env.server" });

const name = process.argv[2];
if (!name) {
  console.error("Uso: node deploy-robust.mjs <ContractName>");
  process.exit(1);
}

const chain = defineChain({
  id: 5700,
  name: "Tanenbaum",
  nativeCurrency: { name: "tSYS", symbol: "tSYS", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.tanenbaum.io"] } },
});
const account = privateKeyToAccount(process.env.ALIVIA_VAULT_PRIVATE_KEY);
const pub = createPublicClient({ chain, transport: http() });
const wallet = createWalletClient({ account, chain, transport: http() });

const artifact = JSON.parse(
  await readFile(`./artifacts/contracts/${name}.sol/${name}.json`, "utf-8"),
);

let attempts = 0;
let receipt = null;
let lastHash = null;
let gasGwei = 100;

while (!receipt && attempts < 4) {
  attempts++;
  const baseNonce = await pub.getTransactionCount({
    address: account.address,
    blockTag: "pending",
  });
  console.log(`[${name}] intento ${attempts} · nonce ${baseNonce} · gas ${gasGwei} gwei`);
  lastHash = await wallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
    gas: 3_000_000n,
    gasPrice: parseGwei(String(gasGwei)),
    nonce: baseNonce,
  });
  console.log(`[${name}] tx: ${lastHash}`);

  const start = Date.now();
  while (Date.now() - start < 8 * 60 * 1000) {
    await new Promise((r) => setTimeout(r, 12_000));
    try {
      const r = await pub.getTransactionReceipt({ hash: lastHash });
      if (r && r.blockNumber) {
        receipt = r;
        break;
      }
    } catch {
      // not yet
    }
    // Check if still in mempool
    const tx = await pub.getTransaction({ hash: lastHash }).catch(() => null);
    if (!tx) {
      console.log(`[${name}] tx desapareció del mempool, resend con gas más alto`);
      break;
    }
    process.stdout.write(".");
  }

  if (!receipt) {
    gasGwei = Math.floor(gasGwei * 1.5);
    console.log(`\n[${name}] sin receipt, retry con gas ${gasGwei} gwei`);
  }
}

if (!receipt) {
  console.error(`\n[${name}] FAIL: 4 intentos sin éxito`);
  process.exit(1);
}

console.log(`\n[${name}] OK · status ${receipt.status} · address ${receipt.contractAddress} · block ${receipt.blockNumber}`);
console.log(`\nALIVIA_${name.toUpperCase().replace("ALIVIA","")}_CONTRACT=${receipt.contractAddress}`);
