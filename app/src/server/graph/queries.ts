import type { Edge, Node, PrismaClient } from "@prisma/client";
import type { NodeType } from "@prisma/client";

/**
 * Queries de lectura del grafo. Spec: docs/specs/02-data-model.md §7.
 * Cada función toma PrismaClient como primer arg (testeable, sin estado global).
 */

/** Normaliza nombre para búsqueda fuzzy básica (02 §8). MVP: lowercase + sin diacríticos. */
export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/** 02 §7.1: "¿existe esta persona en el grafo?" */
export async function findNodesByLabel(
  prisma: PrismaClient,
  query: string,
  type?: NodeType,
  limit: number = 5,
): Promise<Node[]> {
  const normalized = normalizeLabel(query);
  return prisma.node.findMany({
    where: {
      ...(type && { type }),
      OR: [
        { label: { contains: query, mode: "insensitive" } },
        { label: { contains: normalized, mode: "insensitive" } },
      ],
    },
    take: limit,
  });
}

export interface NodeDossier {
  node: Node;
  outgoingEdges: Edge[];
  incomingEdges: Edge[];
  cases: Awaited<ReturnType<PrismaClient["case"]["findMany"]>>;
}

/** 02 §7.2: dossier completo de un nodo (1 hop de aristas + casos donde es sujeto). */
export async function getDossier(
  prisma: PrismaClient,
  nodeId: string,
): Promise<NodeDossier | null> {
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) return null;

  const [outgoingEdges, incomingEdges, cases] = await Promise.all([
    prisma.edge.findMany({ where: { sourceNodeId: nodeId } }),
    prisma.edge.findMany({ where: { targetNodeId: nodeId } }),
    prisma.case.findMany({ where: { subjectNodeId: nodeId } }),
  ]);

  return { node, outgoingEdges, incomingEdges, cases };
}

/**
 * 02 §7.3: dada una lista de nombres extraídos del aporte, busca coincidencias.
 * Devuelve nodos cuyo label normalizado coincide con cualquier nombre.
 * Base de la detección de convergencia (R4).
 */
export async function findMatchingEntities(
  prisma: PrismaClient,
  names: string[],
): Promise<Node[]> {
  if (names.length === 0) return [];
  const normalized = names.map(normalizeLabel);
  // Filtrado simple: traemos candidatos y filtramos en memoria (MVP).
  const candidates = await prisma.node.findMany({ take: 200 });
  return candidates.filter((n) =>
    normalized.some((q) => normalizeLabel(n.label) === q),
  );
}

export interface Neighborhood {
  nodes: Node[];
  edges: Edge[];
}

/**
 * 02 §7.4: subgrafo en N hops desde un nodo central. MVP: 1 hop (suficiente
 * para la vista web en F5). Tope de 200 nodos para evitar explosión.
 */
export async function getNeighborhood(
  prisma: PrismaClient,
  centerNodeId: string,
  maxNodes: number = 200,
): Promise<Neighborhood> {
  const center = await prisma.node.findUnique({ where: { id: centerNodeId } });
  if (!center) return { nodes: [], edges: [] };

  const edges = await prisma.edge.findMany({
    where: {
      OR: [{ sourceNodeId: centerNodeId }, { targetNodeId: centerNodeId }],
    },
    take: maxNodes,
  });

  const neighborIds = new Set<string>();
  for (const e of edges) {
    if (e.sourceNodeId !== centerNodeId) neighborIds.add(e.sourceNodeId);
    if (e.targetNodeId !== centerNodeId) neighborIds.add(e.targetNodeId);
  }

  const neighbors = await prisma.node.findMany({
    where: { id: { in: [...neighborIds] } },
  });

  return { nodes: [center, ...neighbors], edges };
}

/** Subgrafo global reciente para la vista del grafo (F5.1). */
export async function getRecentGraph(
  prisma: PrismaClient,
  nodeLimit: number = 100,
): Promise<Neighborhood> {
  const nodes = await prisma.node.findMany({
    orderBy: { createdAt: "desc" },
    take: nodeLimit,
  });
  const nodeIds = nodes.map((n) => n.id);
  const edges = await prisma.edge.findMany({
    where: {
      OR: [{ sourceNodeId: { in: nodeIds } }, { targetNodeId: { in: nodeIds } }],
    },
    take: nodeLimit * 3,
  });
  return { nodes, edges };
}
