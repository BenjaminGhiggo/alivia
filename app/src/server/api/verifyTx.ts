import type { VerifyTx } from "wasp/server/api";
import { createPublicClient, http } from "viem";
import { zkSysTestnet } from "../chain/mintActa";

/**
 * GET /api/verify/:txHash
 *
 * Verifica una tx contra Tanenbaum directamente vía RPC. Útil para que
 * el usuario (vía bot o web) confirme que un hash que Alivia le dio
 * realmente existe on-chain y no es inventado.
 */

const ALIVIA_CONTRACTS = new Set(
  [
    process.env.ALIVIA_ACTA_CONTRACT,
    process.env.ALIVIA_APORTANTE_CONTRACT,
    process.env.ALIVIA_BOUNTY_CONTRACT,
    process.env.ALIVIA_LLAVE_CONTRACT,
  ]
    .filter(Boolean)
    .map((a) => (a as string).toLowerCase()),
);

export const verifyTx: VerifyTx = async (req, res, _context) => {
  const txHashParam = req.params.txHash;
  const txHash = Array.isArray(txHashParam) ? txHashParam[0] : txHashParam;
  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    res.status(400).json({ error: "txHash inválido (esperado 0x + 64 hex)" });
    return;
  }

  const explorerBase = (process.env.ZKSYS_EXPLORER_URL ?? "https://tanenbaum.io").replace(/\/$/, "");
  const pub = createPublicClient({ chain: zkSysTestnet, transport: http() });

  try {
    const tx = await pub.getTransaction({ hash: txHash as `0x${string}` });
    const receipt = await pub.getTransactionReceipt({ hash: txHash as `0x${string}` }).catch(() => null);

    const involvedAlivia =
      (tx.to && ALIVIA_CONTRACTS.has(tx.to.toLowerCase())) ||
      (receipt?.contractAddress && ALIVIA_CONTRACTS.has(receipt.contractAddress.toLowerCase()));

    res.json({
      txHash,
      exists: true,
      confirmed: !!receipt && !!receipt.blockNumber,
      blockNumber: receipt?.blockNumber?.toString() ?? null,
      status: receipt?.status ?? "pending",
      from: tx.from,
      to: tx.to,
      contractDeployed: receipt?.contractAddress ?? null,
      involvedAliviaContract: involvedAlivia,
      explorerUrl: `${explorerBase}/tx/${txHash}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: "Tx no encontrada en Tanenbaum", detail: msg, txHash });
  }
};
