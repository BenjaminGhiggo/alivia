import type { Case, Contributor } from "wasp/entities";
import type {
  GetGraphData,
  GetRecentCases,
  GetCaseById,
  GetAportante,
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

export type AportanteProfile = {
  pseudonym: string;
  level: number;                // 0..4
  levelLabel: string;           // Testigo, Vigilante, ...
  totalContributions: number;
  totalCorroborated: number;
  trustScore: number;
  soulboundTokenId: string | null;
  firstSeenAt: string;
  recentCases: { id: string; createdAt: string; status: string; corroborationScore: number }[];
};

const LEVEL_LABELS = ["Testigo", "Vigilante", "Investigador", "Cronista", "Guardiana"];

function inferLevel(totalContributions: number, totalCorroborated: number): number {
  const ratio = totalContributions > 0 ? totalCorroborated / totalContributions : 0;
  if (totalContributions >= 100 && ratio >= 0.75) return 4;
  if (totalContributions >= 50 && ratio >= 0.70) return 3;
  if (totalContributions >= 20 && ratio >= 0.60) return 2;
  if (totalContributions >= 5 && ratio >= 0.50) return 1;
  return 0;
}

import type { Bounty } from "wasp/entities";

export const getBounties: import("wasp/server/operations").GetBounties<void, Bounty[]> = async (
  _args,
  context,
) => {
  return context.entities.Bounty.findMany({
    orderBy: { postedAt: "desc" },
    take: 50,
  });
};

export const getAportante: GetAportante<{ pseudonym: string }, AportanteProfile | null> = async (
  args,
  context,
) => {
  if (!args.pseudonym) return null;
  const c = (await context.entities.Contributor.findUnique({
    where: { pseudonym: args.pseudonym },
  })) as Contributor | null;
  if (!c) return null;
  const cases = await context.entities.Case.findMany({
    where: { reporterPseudonym: c.pseudonym },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, createdAt: true, status: true, corroborationScore: true },
  });
  const level = inferLevel(c.totalContributions, c.totalCorroborated);
  return {
    pseudonym: c.pseudonym,
    level,
    levelLabel: LEVEL_LABELS[level],
    totalContributions: c.totalContributions,
    totalCorroborated: c.totalCorroborated,
    trustScore: c.trustScore,
    soulboundTokenId: c.soulboundTokenId,
    firstSeenAt: c.firstSeenAt.toISOString(),
    recentCases: cases.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      status: r.status,
      corroborationScore: r.corroborationScore,
    })),
  };
};
