import type { Case } from "wasp/entities";
import type {
  GetGraphData,
  GetRecentCases,
  GetCaseById,
} from "wasp/server/operations";

/**
 * Wasp queries para la vista web de F5. Spec: 05-architecture §3.8 + 03-use-cases.
 *
 * Las queries usan `context.entities.<Model>` directamente (no inyectamos un
 * PrismaClient global). Los helpers de graph/queries.ts viven al lado para
 * uso desde tools/jobs internos que sí instancian Prisma.
 */

export type GraphNode = {
  id: string;
  type: string;
  label: string;
};

export type GraphEdge = {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  confidence: number;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export const getGraphData: GetGraphData<void, GraphData> = async (_args, context) => {
  const nodes = await context.entities.Node.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const nodeIds = nodes.map((n) => n.id);
  const edges = await context.entities.Edge.findMany({
    where: {
      OR: [
        { sourceNodeId: { in: nodeIds } },
        { targetNodeId: { in: nodeIds } },
      ],
    },
    take: 300,
  });
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
