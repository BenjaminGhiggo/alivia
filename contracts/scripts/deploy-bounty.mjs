// Deploy AliviaBounty solo. Sin nonce manual (viem lo maneja).

import { readFile } from "node:fs/promises";
import { createPublicClient, createWalletClient, defineChain, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config({ path: "../app/.env.server" });

const chain = defineChain({
  id: 5700,
  name: "Syscoin Tanenbaum Testnet",
  nativeCurrency: { name: "tSYS", symbol: "tSYS", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.tanenbaum.io"] } },
  testnet: true,
});

const account = privateKeyToAccount(process.env.ALIVIA_VAULT_PRIVATE_KEY);
const pub = createPublicClient({ chain, transport: http() });
const wallet = createWalletClient({ account, chain, transport: http() });

const artifact = JSON.parse(
  await readFile("./artifacts/contracts/AliviaBounty.sol/AliviaBounty.json", "utf-8"),
);

console.log("[bounty] deployer:", account.address);
console.log("[bounty] balance:", (await pub.getBalance({ address: account.address })).toString());
console.log("[bounty] enviando deploy...");

const hash = await wallet.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: [],
  gas: 3_000_000n,
  gasPrice: parseGwei("80"),
});
console.log("[bounty] tx hash:", hash);
console.log("[bounty] esperando confirmación (puede tardar 5+ min)...");

// Poll manual del receipt — viem v2 a veces resuelve a null cuando expira
// el timeout antes de que el receipt sea visible. Polling es más robusto.
let receipt = null;
const deadline = Date.now() + 25 * 60 * 1000;
while (!receipt && Date.now() < deadline) {
  try {
    receipt = await pub.getTransactionReceipt({ hash });
  } catch {}
  if (!receipt) await new Promise((r) => setTimeout(r, 10_000));
}
if (!receipt) {
  console.error("[bounty] timeout 25 min sin receipt");
  process.exit(1);
}
console.log("[bounty] status:", receipt.status);
console.log("[bounty] address:", receipt.contractAddress);
console.log("[bounty] block:", receipt.blockNumber.toString());
console.log("");
console.log(`ALIVIA_BOUNTY_CONTRACT=${receipt.contractAddress}`);
