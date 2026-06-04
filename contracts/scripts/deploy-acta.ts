import { ethers, run } from "hardhat";

/**
 * Deploy de AliviaActa a la red configurada en hardhat.config.ts.
 * Por defecto `zksysTestnet` (chainId 5701).
 *
 * Uso:
 *   cd contracts
 *   npm run deploy:zksys
 *
 * Tras el deploy, copiar la dirección impresa a:
 * - app/.env.server  → ALIVIA_ACTA_CONTRACT=0x...
 * - docs/specs/04-nfts.md §7 (tabla de direcciones)
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`[deploy] Network: ${network.name} (chainId ${network.chainId})`);
  console.log(`[deploy] Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`[deploy] Balance: ${ethers.formatEther(balance)} TSYS`);

  const AliviaActa = await ethers.getContractFactory("AliviaActa");
  const contract = await AliviaActa.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();
  console.log(`[deploy] AliviaActa desplegado en: ${address}`);
  console.log(`[deploy] Tx hash: ${tx?.hash}`);
  console.log(`[deploy] Próximo paso: ALIVIA_ACTA_CONTRACT=${address} en app/.env.server`);

  // Verify automático en explorer si la red está configurada para etherscan
  if (network.chainId !== 31337n) {
    try {
      console.log(`[deploy] Esperando 5 bloques antes de verify...`);
      await contract.deploymentTransaction()?.wait(5);
      await run("verify:verify", { address, constructorArguments: [] });
      console.log(`[deploy] Verify OK`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[deploy] Verify falló (no bloqueante): ${msg}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
