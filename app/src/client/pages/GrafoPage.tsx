import { useEffect, useMemo, useState } from "react";
import { useQuery } from "wasp/client/operations";
import { getGraphData } from "wasp/client/operations";
import {
  Background,
  Controls,
  ReactFlow,
  type Edge as FlowEdge,
  type Node as FlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/**
 * Vista del grafo en vivo. Spec: 05-architecture §3.8 + 03-use-cases caso 1.
 * Layout force-directed circular simple (sin libs extra). Refresca cada 3s
 * para que el demo muestre el grafo creciendo cuando un aporte entra.
 */

const NODE_COLOR: Record<string, string> = {
  PERSONA: "#60a5fa",
  CARGO: "#fbbf24",
  EMPRESA: "#34d399",
  CONTRATO: "#f87171",
  FAMILIA: "#a78bfa",
};

function circularLayout(items: { id: string }[], radius: number = 360) {
  const center = { x: 480, y: 320 };
  const step = (2 * Math.PI) / Math.max(items.length, 1);
  return new Map(
    items.map((item, i) => [
      item.id,
      {
        x: center.x + radius * Math.cos(i * step),
        y: center.y + radius * Math.sin(i * step),
      },
    ]),
  );
}

export default function GrafoPage() {
  const { data, isLoading, error, refetch } = useQuery(getGraphData);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      refetch();
      setRefreshTick((n) => n + 1);
    }, 3000);
    return () => clearInterval(t);
  }, [refetch]);

  const { nodes, edges } = useMemo<{ nodes: FlowNode[]; edges: FlowEdge[] }>(() => {
    if (!data) return { nodes: [], edges: [] };
    const positions = circularLayout(data.nodes);
    return {
      nodes: data.nodes.map((n): FlowNode => ({
        id: n.id,
        position: positions.get(n.id) ?? { x: 0, y: 0 },
        data: { label: `${n.label}\n(${n.type})` },
        style: {
          background: NODE_COLOR[n.type] ?? "#94a3b8",
          color: "#0f172a",
          fontSize: 12,
          border: "1px solid #1e293b",
          padding: 8,
          borderRadius: 8,
          width: 160,
          textAlign: "center" as const,
          whiteSpace: "pre-line" as const,
        },
      })),
      edges: data.edges.map((e): FlowEdge => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.type.toLowerCase(),
        animated: e.confidence > 0.7,
        style: { stroke: "#64748b", strokeWidth: Math.max(1, e.confidence * 3) },
        labelStyle: { fontSize: 10, fill: "#475569" },
      })),
    };
  }, [data]);

  if (error) {
    return <div className="p-8 text-red-500">Error cargando el grafo: {String(error)}</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Grafo público de Alivia
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Nodos: {data?.nodes.length ?? 0} · Aristas: {data?.edges.length ?? 0} · Refresh #
          {refreshTick}
        </p>
      </header>
      <div className="flex-1">
        {isLoading && !data ? (
          <div className="p-8 text-slate-500">Cargando...</div>
        ) : (
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
