import type { Edge, EdgeType, Node, NodeType, PrismaClient } from "@prisma/client";
import { normalizeLabel } from "./queries";

/**
 * Mutaciones del grafo. Upserts con dedup soft basado en label normalizado.
 * Spec: docs/specs/02-data-model.md §8 (estrategia de dedup MVP).
 */

export interface UpsertNodeInput {
  type: NodeType;
  label: string;
  properties: Record<string, unknown>;
  createdBy: string;
  sourceCaseId?: string;
}

/**
 * Dedup soft: si existe un nodo del mismo tipo con label normalizado igual,
 * lo devolvemos sin crear duplicado. La fusión semántica fina queda para
 * post-MVP (02 §8): aquí sólo evitamos duplicar exactos.
 */
export async function upsertNode(
  prisma: PrismaClient,
  input: UpsertNodeInput,
): Promise<Node> {
  const normalized = normalizeLabel(input.label);
  const existing = await prisma.node.findFirst({
    where: {
      type: input.type,
      // Coincidencia por label original o normalizada
      OR: [
        { label: input.label },
        { label: { equals: normalized, mode: "insensitive" } },
      ],
    },
  });
  if (existing) return existing;

  return prisma.node.create({
    data: {
      type: input.type,
      label: input.label,
      properties: input.properties as object,
      createdBy: input.createdBy,
      sourceCaseId: input.sourceCaseId,
    },
  });
}

export interface CreateEdgeInput {
  type: EdgeType;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: Record<string, unknown>;
  confidence?: number;
  createdBy: string;
  sourceCaseId?: string;
}

export async function createEdge(
  prisma: PrismaClient,
  input: CreateEdgeInput,
): Promise<Edge> {
  // Evita duplicar arista idéntica del mismo aporte
  if (input.sourceCaseId) {
    const existing = await prisma.edge.findFirst({
      where: {
        type: input.type,
        sourceNodeId: input.sourceNodeId,
        targetNodeId: input.targetNodeId,
        sourceCaseId: input.sourceCaseId,
      },
    });
    if (existing) return existing;
  }

  return prisma.edge.create({
    data: {
      type: input.type,
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      properties: (input.properties ?? {}) as object,
      confidence: input.confidence ?? 0.5,
      createdBy: input.createdBy,
      sourceCaseId: input.sourceCaseId,
    },
  });
}
