import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow, Background, Controls, MiniMap, Panel,
  useNodesState, useEdgesState, type Node, type Edge,
  MarkerType, Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Compass, Loader2, X, ChevronRight, Network } from "lucide-react";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Badge } from "@/product-ui/components/ui/badge";
import { EmptyState } from "@/product-ui/components/shared/empty-state";
import { useModels, useModelDetail } from "@/product-ui/api/hooks";
import type { WorldModelSummary, WorldModelDetail, VariableDetail, EdgeDetail, EvidenceStrength, MeasurementStatus, VariableType } from "@/product-ui/api/client";
import { cn, capitalize } from "@/product-ui/lib/utils";

/* ─── Color Maps ─── */
const measurementColors: Record<MeasurementStatus, string> = {
  measured: "#22c55e",
  observable: "#3b82f6",
  latent: "#f59e0b",
};

const variableTypeColors: Record<VariableType, string> = {
  continuous: "#8b5cf6",
  discrete: "#06b6d4",
  binary: "#f97316",
  categorical: "#ec4899",
};

const strengthColors: Record<EvidenceStrength, string> = {
  strong: "#22c55e",
  moderate: "#3b82f6",
  hypothesis: "#f59e0b",
  contested: "#ef4444",
};

const strengthStroke: Record<EvidenceStrength, string> = {
  strong: "2.5",
  moderate: "2",
  hypothesis: "1.5",
  contested: "1.5",
};

/* ─── Dagre Layout ─── */
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 120 });
  nodes.forEach((n) => g.setNode(n.id, { width: 220, height: 70 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  const layouted = nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 110, y: pos.y - 35 }, targetPosition: direction === "TB" ? Position.Top : Position.Left, sourcePosition: direction === "TB" ? Position.Bottom : Position.Right } as Node;
  });
  return { nodes: layouted, edges };
}

function modelDetailToFlow(detail: WorldModelDetail) {
  const rawNodes: Node[] = detail.variables.map((v: VariableDetail) => {
    const color = variableTypeColors[v.var_type as VariableType] ?? measurementColors[v.measurement_status as MeasurementStatus] ?? "#3b82f6";
    return {
      id: v.variable_id,
      type: "default",
      data: { label: v.name, variable: v },
      position: { x: 0, y: 0 },
      style: {
        background: `${color}10`,
        border: `2px solid ${color}50`,
        borderRadius: "16px",
        padding: "10px 20px",
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text-primary)",
        minWidth: "160px",
        textAlign: "center" as const,
        boxShadow: `0 2px 8px ${color}15`,
      },
    };
  });
  const rawEdges: Edge[] = detail.edges.map((e: EdgeDetail, i: number) => {
    const strength = (e.strength ?? "hypothesis") as EvidenceStrength;
    return {
      id: `edge-${i}`,
      source: e.from_var,
      target: e.to_var,
      animated: strength === "hypothesis",
      style: {
        stroke: strengthColors[strength] ?? strengthColors.hypothesis,
        strokeWidth: Number(strengthStroke[strength] ?? "1.5"),
        strokeDasharray: strength === "contested" ? "6,4" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: strengthColors[strength] ?? strengthColors.hypothesis, width: 18, height: 18 },
      data: { edge: e },
      label: e.mechanism?.length > 35 ? e.mechanism.slice(0, 35) + "\u2026" : e.mechanism,
      labelStyle: { fontSize: 10, fill: "var(--text-tertiary)", fontWeight: 500 },
      labelBgStyle: { fill: "var(--bg-elevated)", fillOpacity: 0.95 },
      labelBgPadding: [6, 8] as [number, number],
      labelBgBorderRadius: 8,
    };
  });
  return getLayoutedElements(rawNodes, rawEdges);
}

export function ModelExplorerPage() {
  const { data: modelsData, isLoading: modelsLoading } = useModels();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { data: detailData, isLoading: modelLoading } = useModelDetail(selectedDomain ?? "");
  const [selectedNode, setSelectedNode] = useState<VariableDetail | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeDetail | null>(null);

  const models: WorldModelSummary[] = Array.isArray(modelsData) ? modelsData : [];

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!detailData) return { nodes: [], edges: [] };
    return modelDetailToFlow(detailData);
  }, [detailData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    if (layoutedNodes.length > 0) { setNodes(layoutedNodes); setEdges(layoutedEdges); }
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data.variable as VariableDetail); setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge.data?.edge as EdgeDetail); setSelectedNode(null);
  }, []);

  return (
    <div>
      <PageHeader title="Model Explorer" description="Visualize and inspect causal world models, their variables, and relationships." />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] lg:h-[calc(100vh-200px)]">
        {/* Model List */}
        <div className="w-full lg:w-72 shrink-0">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="flex items-center gap-2 text-[13px]">
                <Network className="w-4 h-4 text-[var(--color-accent-500)]" /> World Models
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2 p-4 pt-0">
              {modelsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
                </div>
              ) : models.length === 0 ? (
                <p className="text-[13px] text-[var(--text-tertiary)] text-center py-10">No models found. Build one first.</p>
              ) : (
                models.map((m) => (
                  <button
                    key={m.version_id ?? m.domain}
                    onClick={() => { setSelectedDomain(m.domain); setSelectedNode(null); setSelectedEdge(null); }}
                    className={cn(
                      "flex items-center gap-3 w-full p-4 rounded-xl text-left transition-all duration-200",
                      selectedDomain === m.domain
                        ? "bg-[var(--color-accent-500)]/10 text-[var(--color-accent-500)] shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                        : "hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate">{m.domain}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                        {m.node_count} vars · {m.edge_count} edges
                      </p>
                    </div>
                    <Badge
                      variant={m.status === "active" ? "success" : m.status === "review" ? "warning" : "secondary"}
                      className="text-[10px] shrink-0"
                    >
                      {m.status}
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 relative rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden shadow-[var(--shadow-md)] min-h-[400px]">
          {!selectedDomain ? (
            <EmptyState icon={<Compass className="w-16 h-16" />} title="Select a world model" description="Choose a model from the sidebar to visualize its causal graph." className="h-full" />
          ) : modelLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent-500)]" />
            </div>
          ) : (
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick} onEdgeClick={onEdgeClick}
              fitView proOptions={{ hideAttribution: true }}
            >
              <Background gap={24} size={1} color="var(--border-secondary)" />
              <Controls />
              <MiniMap maskColor="var(--bg-overlay)" nodeColor={() => "#3b82f6"} />

              <Panel position="top-left">
                <div className="glass glass-border rounded-2xl p-4 space-y-3 shadow-[var(--shadow-md)]">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Legend</p>
                  <div className="space-y-1.5">
                    {Object.entries(measurementColors).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ borderColor: color, background: `${color}20`, border: `2px solid ${color}` }} />
                        <span className="text-[11px] text-[var(--text-tertiary)] font-medium">{capitalize(key)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[var(--border-secondary)] pt-2 space-y-1.5">
                    {Object.entries(strengthColors).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-5 h-0.5 rounded-full" style={{ background: color }} />
                        <span className="text-[11px] text-[var(--text-tertiary)] font-medium">{capitalize(key)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {/* Inspection Panel */}
        {(selectedNode || selectedEdge) && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-80 shrink-0">
            <Card className="h-full overflow-y-auto">
              <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle className="text-[13px]">{selectedNode ? "Variable Details" : "Edge Details"}</CardTitle>
                <Button size="icon-sm" variant="ghost" onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {selectedNode && (
                  <>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">{selectedNode.name}</h4>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">{selectedNode.definition}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedNode.var_type && <InfoItem label="Type" value={capitalize(selectedNode.var_type)} />}
                      {selectedNode.role && <InfoItem label="Role" value={capitalize(selectedNode.role)} />}
                    </div>
                  </>
                )}
                {selectedEdge && (
                  <>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="font-semibold text-[var(--text-primary)]">{selectedEdge.from_var}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span className="font-semibold text-[var(--text-primary)]">{selectedEdge.to_var}</span>
                    </div>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{selectedEdge.mechanism}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedEdge.strength && <InfoItem label="Strength" value={capitalize(selectedEdge.strength)} />}
                      {selectedEdge.confidence != null && <InfoItem label="Confidence" value={`${(selectedEdge.confidence * 100).toFixed(0)}%`} />}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">{label}</p>
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mt-1">{value}</p>
    </div>
  );
}
