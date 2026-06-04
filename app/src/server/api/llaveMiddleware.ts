import type { Request, Response, NextFunction } from "express";
import { getLlaveService } from "../chain/mintLlave";

/**
 * Middleware Express para gateway de API B2B.
 * Spec: 04-nfts §6.5.
 *
 * Clientes B2B presentan su token ID en header `X-Alivia-Llave-Token`.
 * El middleware:
 * - Verifica que el token existe y está vigente on-chain.
 * - Adjunta a req.aliviaLlave los metadatos (tier, expiresAt, clientName).
 * - 401 si falta header, 403 si token revocado/expirado, 404 si no existe.
 *
 * Uso: aplicar a endpoints premium (futuro: /api/b2b/graph-export, etc.).
 */

export interface LlaveContext {
  tokenId: bigint;
  tier: number;
  expiresAt: bigint;
  clientName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      aliviaLlave?: LlaveContext;
    }
  }
}

export async function llaveMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("X-Alivia-Llave-Token");
  if (!header) {
    res.status(401).json({ error: "X-Alivia-Llave-Token header missing" });
    return;
  }
  let tokenId: bigint;
  try {
    tokenId = BigInt(header);
    if (tokenId <= 0n) throw new Error("invalid tokenId");
  } catch {
    res.status(400).json({ error: "tokenId inválido" });
    return;
  }

  try {
    const svc = getLlaveService();
    const llave = await svc.readLlave(tokenId);
    if (!llave.isValid) {
      res.status(403).json({ error: "Llave expirada o revocada" });
      return;
    }
    req.aliviaLlave = {
      tokenId,
      tier: llave.tier,
      expiresAt: llave.expiresAt,
      clientName: llave.clientName,
    };
    next();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: "Llave no encontrada", detail: msg });
  }
}
