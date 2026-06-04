// Deploy con ethers v6 directo (viem da 'cannot unmarshal common.Hash' raro).
// Uso: node scripts/deploy-ethers.mjs <ContractName>

import { readFile } from "node:fs/promises";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "../app/.env.server" });

const name = process.argv[2];
if (!name) {
  console.error("Uso: node deploy-ethers.mjs <ContractName>");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider("https://rpc.tanenbaum.io");
const wallet = new ethers.Wallet(process.env.ALIVIA_VAULT_PRIVATE_KEY, provider);

console.log(`[${name}] deployer:`, await wallet.getAddress());
console.log(`[${name}] balance:`, ethers.formatEther(await provider.getBalance(wallet.address)), "tSYS");

const artifact = JSON.parse(
  await readFile(`./artifacts/contracts/${name}.sol/${name}.json`, "utf-8"),
);

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

console.log(`[${name}] enviando deploy...`);
const contract = await factory.deploy({
  gasLimit: 3_000_000n,
  gasPrice: ethers.parseUnits("100", "gwei"),
});
const tx = contract.deploymentTransaction();
console.log(`[${name}] tx: ${tx.hash}`);
console.log(`[${name}] esperando confirmación...`);

await contract.waitForDeployment();
const addr = await contract.getAddress();
console.log(`[${name}] address: ${addr}`);
console.log(`[${name}] explorer: https://tanenbaum.io/address/${addr}`);

console.log("");
console.log(`ALIVIA_${name.replace(/^Alivia/, "").toUpperCase()}_CONTRACT=${addr}`);
