import type { Contracts } from "wasp/server/api";

/**
 * GET /api/contracts
 *
 * Listado público de los 4 contratos de Alivia con sus direcciones en
 * Tanenbaum testnet. El bot lo usa para responder /contratos y
 * /trazabilidad. Cualquier persona puede usar este endpoint para
 * verificar que los addresses que dice Alivia son los que dice.
 */

export const contracts: Contracts = async (_req, res, _context) => {
  const explorerBase = (process.env.ZKSYS_EXPLORER_URL ?? "https://tanenbaum.io").replace(/\/$/, "");
  const chain = {
    name: "Syscoin Tanenbaum Testnet",
    chainId: parseInt(process.env.ZKSYS_CHAIN_ID ?? "5700", 10),
    chainIdHex: process.env.ZKSYS_CHAIN_ID_HEX ?? "0x1644",
    rpc: process.env.ZKSYS_RPC_URL ?? "https://rpc.tanenbaum.io",
    explorer: explorerBase,
  };

  const list = [
    {
      name: "AliviaActa",
      role: "Sello inmutable de cada aporte ciudadano publicado",
      address: process.env.ALIVIA_ACTA_CONTRACT ?? null,
    },
    {
      name: "AliviaAportante",
      role: "Identidad cívica soulbound del aportante (acumula reputación)",
      address: process.env.ALIVIA_APORTANTE_CONTRACT ?? null,
    },
    {
      name: "AliviaBounty",
      role: "Custodia de TSYS bloqueados como recompensa por evidencia",
      address: process.env.ALIVIA_BOUNTY_CONTRACT ?? null,
    },
    {
      name: "AliviaLlave",
      role: "Suscripción B2B con expiración (compliance, banca, medios)",
      address: process.env.ALIVIA_LLAVE_CONTRACT ?? null,
    },
  ].map((c) => ({
    ...c,
    explorerUrl: c.address ? `${explorerBase}/address/${c.address}` : null,
  }));

  res.json({ chain, contracts: list });
};
