import type { Bounty } from "wasp/entities";
import type {
  RegisterBounty,
  ClaimBounty,
  CancelBounty,
} from "wasp/server/operations";
import { HttpError } from "wasp/server";
import { getBountyService } from "../chain/mintBounty";

/**
 * Acciones de Bounty.
 *
 * Diseño:
 * - openBounty (firma desde wallet del postor) lo hace el FRONTEND directo
 *   contra el contract con viem. El backend NO custodia las PKs de postores.
 * - Después del openBounty, el frontend llama a `registerBounty` para que
 *   el backend guarde el bounty en DB (con nftBountyTokenId, txHash, etc.).
 * - claimBounty: backend valida + dispara on-chain claim() con la vault PK
 *   (sólo el owner del contract puede invocar claim, y es Alivia).
 * - cancelBounty: lo hace el postor desde su wallet (igual que open).
 */

export type RegisterBountyInput = {
  nftBountyTokenId: string;
  targetCaseId: string;
  description: string;
  amountTsys: number;
  claimCriteria: string;
  postedBy: string;
  expiresAt: string;
};

export const registerBounty: RegisterBounty<RegisterBountyInput, Bounty> = async (args, context) => {
  if (!args.nftBountyTokenId || !args.targetCaseId || !args.description) {
    throw new HttpError(400, "Faltan campos obligatorios");
  }
  return context.entities.Bounty.create({
    data: {
      id: `bnt-${Date.now()}`,
      nftBountyTokenId: args.nftBountyTokenId,
      targetNodeId: args.targetCaseId,  // simplificación: target = caso o nodo
      description: args.description,
      amountTsys: args.amountTsys,
      claimCriteria: args.claimCriteria,
      postedBy: args.postedBy,
      status: "open",
    },
  });
};

export type ClaimBountyInput = {
  bountyId: string;
  claimerAddress: string;
  claimerPseudonym: string;
  evidenceCaseId: string;
};

export const claimBounty: ClaimBounty<ClaimBountyInput, Bounty> = async (args, context) => {
  if (!args.bountyId || !args.claimerAddress || !args.claimerAddress.startsWith("0x")) {
    throw new HttpError(400, "Datos invalidos");
  }
  const bounty = await context.entities.Bounty.findUnique({ where: { id: args.bountyId } });
  if (!bounty) throw new HttpError(404, "Bounty no encontrado");
  if (bounty.status !== "open") throw new HttpError(409, "Bounty no está abierto");
  if (!bounty.nftBountyTokenId) throw new HttpError(500, "Bounty sin tokenId on-chain");

  // Dispara el claim on-chain (transfiere TSYS al claimer).
  const svc = getBountyService();
  const txHash = await svc.claim(BigInt(bounty.nftBountyTokenId), args.claimerAddress as `0x${string}`);

  return context.entities.Bounty.update({
    where: { id: args.bountyId },
    data: {
      status: "claimed",
      claimedBy: args.claimerPseudonym,
      claimedAt: new Date(),
    },
  });
};

export type CancelBountyInput = { bountyId: string };

export const cancelBounty: CancelBounty<CancelBountyInput, Bounty> = async (args, context) => {
  const bounty = await context.entities.Bounty.findUnique({ where: { id: args.bountyId } });
  if (!bounty) throw new HttpError(404, "Bounty no encontrado");
  if (bounty.status !== "open") throw new HttpError(409, "Bounty no está abierto");
  return context.entities.Bounty.update({
    where: { id: args.bountyId },
    data: { status: "cancelled" },
  });
};
