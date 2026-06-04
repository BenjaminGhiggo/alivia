import type { Case, Edge, Node } from "wasp/entities";
import type {
  GetGraphData,
  GetRecentCases,
  GetCaseById,
} from "wasp/server/operations";
import { getRecentGraph } from "../graph/queries";

/**
 * Wasp queries para la vista web de F5. Spec: 05-architecture §3.8 + 03-use-cases.
 */

export interface GraphData {
  nodes: Pick<Node, "id" | "type" | "label">[];
  edges: Pick<Edge, "id" | "type" | "sourceNodeId" | "targetNodeId" | "confidence">[];
}

export const getGraphData: GetGraphData<void, GraphData> = async (_args, context) => {
  const { nodes, edges } = await getRecentGraph(context.entities.Node.$prisma ?? context.prisma, 100);
  return {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label })),
    edges: edges.map((e) => ({
      id: e.id,
      type: e.type,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      confidence: e.confidence,
    })),
  };
};

export const getRecentCases: GetRecentCases<{ limit?: number }, Case[]> = async (
  args,
  context,
) => {
  const limit = Math.min(args?.limit ?? 20, 100);
  return context.entities.Case.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
};

export const getCaseById: GetCaseById<{ id: string }, Case | null> = async (args, context) => {
  if (!args.id) return null;
  return context.entities.Case.findUnique({ where: { id: args.id } });
};
