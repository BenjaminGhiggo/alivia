import type { IssueLlave } from "wasp/server/operations";
import { HttpError } from "wasp/server";
import { getLlaveService, LlaveTier } from "../chain/mintLlave";

/**
 * Acción admin-only: emite una NFT-Llave a un cliente B2B.
 * Spec: 04-nfts §6.
 *
 * Auth: requiere User.isAdmin === true.
 */

export type IssueLlaveInput = {
  to: string;
  tier: number;
  validForDays: number;
  clientName: string;
};

export type IssueLlaveResult = {
  tokenId: string;
  txHash: string;
  explorerUrl: string;
};

export const issueLlave: IssueLlave<IssueLlaveInput, IssueLlaveResult> = async (
  args,
  context,
) => {
  if (!context.user) throw new HttpError(401, "Auth requerida");
  if (!context.user.isAdmin) throw new HttpError(403, "Sólo admin puede emitir llaves");
  if (!args.to?.startsWith("0x")) throw new HttpError(400, "Wallet address inválido");
  if (args.tier < 0 || args.tier > 2) throw new HttpError(400, "Tier inválido");
  if (args.validForDays <= 0 || args.validForDays > 730) {
    throw new HttpError(400, "validForDays debe ser 1..730");
  }
  if (!args.clientName) throw new HttpError(400, "clientName requerido");

  const svc = getLlaveService();
  const result = await svc.issue({
    to: args.to as `0x${string}`,
    tier: args.tier as LlaveTier,
    validForDays: args.validForDays,
    clientName: args.clientName,
    tokenURI: `https://alivia.sbs/llaves/${args.clientName.replace(/\s+/g, "-").toLowerCase()}/metadata.json`,
  });

  const explorerBase = process.env.ZKSYS_EXPLORER_URL ?? "https://tanenbaum.io";
  return {
    tokenId: result.tokenId,
    txHash: result.txHash,
    explorerUrl: `${explorerBase.replace(/\/$/, "")}/tx/${result.txHash}`,
  };
};
