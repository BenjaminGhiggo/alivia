import type { CaseStatus } from "wasp/server/api";

/**
 * GET /api/case/:caseId/status
 *
 * Estado on-chain + DB de un Case. Público (no requiere auth) porque
 * todos los casos son citables. Patrón de transparencia (regla R4 SOUL).
 *
 * El bot lo usa para hacer poll y notificar al usuario cuando el mint
 * del NFT-Acta confirma en Tanenbaum.
 */

export const caseStatus: CaseStatus = async (req, res, context) => {
  const caseIdParam = req.params.caseId;
  const caseId = Array.isArray(caseIdParam) ? caseIdParam[0] : caseIdParam;
  if (!caseId || typeof caseId !== "string") {
    res.status(400).json({ error: "caseId requerido" });
    return;
  }

  const c = await context.entities.Case.findUnique({ where: { id: caseId } });
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }

  const explorerBase = process.env.ZKSYS_EXPLORER_URL ?? "https://tanenbaum.io";
  const actaContract = process.env.ALIVIA_ACTA_CONTRACT ?? null;

  res.json({
    caseId: c.id,
    caseType: c.caseType,
    status: c.status,
    corroborationScore: c.corroborationScore,
    reporterPseudonym: c.reporterPseudonym,
    createdAt: c.createdAt.toISOString(),
    publishedAt: c.publishedAt?.toISOString() ?? null,
    nft: c.nftTokenId
      ? {
          tokenId: c.nftTokenId,
          txHash: c.nftTxHash,
          contract: actaContract,
          explorerTx: c.nftTxHash ? `${explorerBase.replace(/\/$/, "")}/tx/${c.nftTxHash}` : null,
          explorerToken: actaContract && c.nftTokenId
            ? `${explorerBase.replace(/\/$/, "")}/token/${actaContract}?a=${c.nftTokenId}`
            : null,
        }
      : null,
    caseUrl: `https://alivia.sbs/casos/${c.id}`,
  });
};
