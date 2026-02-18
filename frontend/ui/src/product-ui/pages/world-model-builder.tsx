import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Play,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Settings2,
  Sparkles,
  Search,
  Link,
  Shield,
  Eye,
  Rocket,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Input } from "@/product-ui/components/ui/input";
import { Textarea } from "@/product-ui/components/ui/textarea";
import { Badge } from "@/product-ui/components/ui/badge";
import { Progress } from "@/product-ui/components/ui/progress";
import { useExecuteMode1, useMode1Stage, useModels, useApproveModel, useDocuments } from "@/product-ui/api/hooks";
import { cn } from "@/product-ui/lib/utils";
import { toast } from "sonner";

const stages = [
  { key: "variable_discovery", label: "Variable Discovery", icon: Search, desc: "Discovering causal variables from evidence" },
  { key: "evidence_gathering", label: "Evidence Gathering", icon: Sparkles, desc: "Deep-searching for supporting evidence" },
  { key: "edge_proposal", label: "Edge Proposal", icon: Link, desc: "Proposing causal relationships" },
  { key: "validation", label: "Validation", icon: Shield, desc: "Cross-checking evidence & detecting conflicts" },
  { key: "human_review", label: "Human Review", icon: Eye, desc: "Awaiting your approval" },
  { key: "complete", label: "Complete", icon: Rocket, desc: "World model is active" },
];

type BuildState = "idle" | "configuring" | "building" | "review" | "complete" | "error";

export function WorldModelBuilderPage() {
  const [buildState, setBuildState] = useState<BuildState>("idle");
  const [domain, setDomain] = useState("");
  const [query, setQuery] = useState("");
  const [maxVars, setMaxVars] = useState(20);
  const [maxEdges, setMaxEdges] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const executeMutation = useExecuteMode1();
  const approveMutation = useApproveModel();
  const { data: stageData } = useMode1Stage(buildState === "building");
  const { data: serverDocs } = useDocuments();

  // Sync stage data into state (avoid render-phase setState)
  useEffect(() => {
    if (stageData?.stage && buildState === "building") {
      const idx = stages.findIndex((s) => s.key === stageData.stage);
      if (idx >= 0 && idx !== currentStageIdx) {
        setCurrentStageIdx(idx);
        if (stageData.stage === "human_review") setBuildState("review");
        else if (stageData.stage === "complete") setBuildState("complete");
      }
    }
  }, [stageData, buildState, currentStageIdx]);

  const handleBuild = () => {
    if (!domain.trim() || !query.trim()) {
      toast.error("Please provide both a domain name and initial query.");
      return;
    }
    setBuildState("building");
    setCurrentStageIdx(0);
    executeMutation.mutate(
      { domain: domain.trim(), query: query.trim(), maxVars, maxEdges, docIds: selectedDocIds.length > 0 ? selectedDocIds : undefined },
      {
        onSuccess: () => toast.success("World model construction started!"),
        onError: () => { setBuildState("error"); toast.error("Failed to start model construction."); },
      }
    );
  };

  const handleApprove = () => {
    approveMutation.mutate({ domain, approvedBy: "ui-user" }, {
      onSuccess: () => { setBuildState("complete"); setCurrentStageIdx(5); toast.success("World model approved and activated!"); },
      onError: () => toast.error("Failed to approve model"),
    });
  };

  const handleReset = () => {
    setBuildState("idle");
    setCurrentStageIdx(-1);
    setDomain("");
    setQuery("");
  };

  const progressPercent = buildState === "complete" ? 100 : Math.max(0, ((currentStageIdx + 1) / stages.length) * 100);

  return (
    <div>
      <PageHeader
        title="World Model Builder"
        description="Discover causal relationships from your documents and build structured world models."
        actions={
          buildState !== "idle" && buildState !== "configuring" ? (
            <Button variant="outline" onClick={handleReset} size="sm">New Build</Button>
          ) : undefined
        }
      />

      {/* ─── Configuration Form ─── */}
      {(buildState === "idle" || buildState === "configuring") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-[var(--color-accent-500)]" />
                  Configure World Model
                </CardTitle>
                <CardDescription>
                  Define the domain and what causal relationships to discover.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Domain Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder='e.g., "pricing", "supply-chain", "marketing"'
                  />
                  <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                    A short identifier for the causal domain.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Initial Query <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='e.g., "Discover the causal relationships affecting customer churn in our SaaS product"'
                    rows={3}
                  />
                  <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                    Describe what causal relationships to discover.
                  </p>
                </div>

                {/* Advanced Settings */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                  Advanced Settings
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-5 pl-5 border-l-2 border-[var(--color-accent-500)]/20 overflow-hidden"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Max Variables</label>
                          <span className="text-[13px] font-mono font-bold text-[var(--color-accent-500)]">{maxVars}</span>
                        </div>
                        <input
                          type="range" min={5} max={50} value={maxVars}
                          onChange={(e) => setMaxVars(Number(e.target.value))}
                          aria-label="Maximum number of variables"
                          className="w-full accent-[var(--color-accent-500)] h-1.5"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Max Edges</label>
                          <span className="text-[13px] font-mono font-bold text-[var(--color-accent-500)]">{maxEdges}</span>
                        </div>
                        <input
                          type="range" min={10} max={100} value={maxEdges}
                          onChange={(e) => setMaxEdges(Number(e.target.value))}
                          aria-label="Maximum number of edges"
                          className="w-full accent-[var(--color-accent-500)] h-1.5"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Document Selector for doc_ids */}
                {serverDocs && serverDocs.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Restrict to Documents (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {serverDocs.filter((d) => d.status === "indexed").map((doc) => (
                        <button
                          key={doc.doc_id}
                          onClick={() => setSelectedDocIds((prev) =>
                            prev.includes(doc.doc_id) ? prev.filter((id) => id !== doc.doc_id) : [...prev, doc.doc_id]
                          )}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border",
                            selectedDocIds.includes(doc.doc_id)
                              ? "bg-[var(--color-accent-500)] text-white border-[var(--color-accent-500)]"
                              : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--color-accent-400)]"
                          )}
                        >
                          {doc.filename}
                        </button>
                      ))}
                    </div>
                    {selectedDocIds.length > 0 && (
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        {selectedDocIds.length} document{selectedDocIds.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button onClick={handleBuild} disabled={!domain.trim() || !query.trim()} className="w-full gap-2" size="lg">
                    <Play className="w-4 h-4" />
                    Start Building World Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interactive Graph Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-[#080c22]/40 shadow-[0_8px_40px_rgba(0,0,0,0.4)] h-full min-h-[500px]">
              <CausalGraphPreview domain={domain} />

              {/* Overlay info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#080c22]/70 to-transparent pointer-events-none z-20">
                <div className="flex items-center gap-3 rounded-2xl p-3.5 bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-500)]/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent-400)]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white/90">Interactive Causal Graph</p>
                    <p className="text-[10px] text-white/40">Nodes & edges on 3D globe · Drag · Scroll to zoom</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Progress Rail ─── */}
      {(buildState === "building" || buildState === "review" || buildState === "complete" || buildState === "error") && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary Bar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                    Building: <span className="text-[var(--color-accent-500)]">{domain}</span>
                  </p>
                  <p className="text-[13px] text-[var(--text-tertiary)] mt-1">{query}</p>
                </div>
                <Badge
                  variant={buildState === "complete" ? "success" : buildState === "error" ? "error" : buildState === "review" ? "warning" : "info"}
                >
                  {buildState === "building" ? "In Progress" : buildState === "review" ? "Awaiting Review" : buildState === "complete" ? "Complete" : "Error"}
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-2.5" />
              <p className="text-[12px] text-[var(--text-tertiary)] mt-3">
                Stage {Math.min(currentStageIdx + 1, stages.length)} of {stages.length}
                {stageData?.detail && ` — ${stageData.detail}`}
              </p>
            </CardContent>
          </Card>

          {/* Stage Timeline */}
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const isActive = idx === currentStageIdx;
              const isComplete = idx < currentStageIdx || buildState === "complete";
              const isPending = idx > currentStageIdx;
              const StageIcon = stage.icon;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={cn(
                    "flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300",
                    isActive && "border-[var(--color-accent-500)]/20 bg-[var(--color-accent-500)]/5 shadow-[var(--shadow-md)]",
                    isComplete && "border-emerald-500/15 bg-emerald-500/5",
                    isPending && "border-transparent bg-[var(--bg-secondary)] opacity-40"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 transition-colors",
                    isActive && "bg-[var(--color-accent-500)]/10",
                    isComplete && "bg-emerald-500/10",
                    isPending && "bg-[var(--bg-tertiary)]"
                  )}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-[var(--color-accent-500)] animate-spin" />
                    ) : (
                      <StageIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[14px] font-semibold",
                      isActive && "text-[var(--color-accent-500)]",
                      isComplete && "text-emerald-500",
                      isPending && "text-[var(--text-tertiary)]"
                    )}>
                      {stage.label}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{stage.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-500)] animate-pulse-subtle shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Review Panel */}
          {buildState === "review" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 shrink-0">
                      <Eye className="w-7 h-7 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">Review Required</h3>
                      <p className="text-[14px] text-[var(--text-secondary)] mb-5 leading-relaxed">
                        The world model for <strong>{domain}</strong> has been constructed and is awaiting your approval.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={handleApprove} disabled={approveMutation.isPending} variant="success" className="gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Approve & Activate
                        </Button>
                        <Button variant="outline" onClick={() => toast.info("Navigate to Model Explorer to inspect")}>
                          <Eye className="w-4 h-4" /> Inspect Model
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Complete */}
          {buildState === "complete" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-2">World Model Active</h3>
                  <p className="text-[14px] text-[var(--text-secondary)]">
                    The <strong>{domain}</strong> world model is now active and ready for decision support queries.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Ultra-Realistic Causal Node Component ─── */
function CausalNodeComponent({ data }: { data: { label: string; type: string; status: string } }) {
  const styles: Record<string, { bg: string; glow: string; ring: string; accent: string }> = {
    treatment: {
      bg: "from-blue-500 via-blue-600 to-blue-700",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.4),0_0_60px_rgba(59,130,246,0.1)]",
      ring: "ring-blue-400/30",
      accent: "bg-blue-400",
    },
    outcome: {
      bg: "from-emerald-500 via-emerald-600 to-emerald-700",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.4),0_0_60px_rgba(16,185,129,0.1)]",
      ring: "ring-emerald-400/30",
      accent: "bg-emerald-400",
    },
    confounder: {
      bg: "from-amber-500 via-amber-600 to-amber-700",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.4),0_0_60px_rgba(245,158,11,0.1)]",
      ring: "ring-amber-400/30",
      accent: "bg-amber-400",
    },
    mediator: {
      bg: "from-violet-500 via-violet-600 to-violet-700",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.4),0_0_60px_rgba(139,92,246,0.1)]",
      ring: "ring-violet-400/30",
      accent: "bg-violet-400",
    },
    default: {
      bg: "from-slate-500 via-slate-600 to-slate-700",
      glow: "shadow-[0_0_15px_rgba(100,116,139,0.3)]",
      ring: "ring-slate-400/20",
      accent: "bg-slate-400",
    },
  };
  const s = styles[data.type] ?? styles.default;

  return (
    <div className={cn(
      "relative px-6 py-4 rounded-2xl bg-gradient-to-br min-w-[140px] text-center transition-all duration-300 ring-2 ring-inset",
      s.bg, s.glow, s.ring,
    )}>
      {/* Glass overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
      {/* Inner highlight */}
      <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white/80 !border-2 !border-white/40 !-top-1.5 !rounded-full !shadow-[0_0_6px_rgba(255,255,255,0.3)]" />

      <div className="relative">
        <p className="text-[13px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] tracking-tight">{data.label}</p>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", s.accent, "shadow-sm")} />
          <p className="text-[9px] text-white/80 uppercase tracking-[0.1em] font-semibold">{data.type}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white/80 !border-2 !border-white/40 !-bottom-1.5 !rounded-full !shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
    </div>
  );
}

const causalNodeTypes: NodeTypes = { causal: CausalNodeComponent };

/* ─── Sample graph for demonstration ─── */
const sampleNodes = [
  { id: "price", label: "Pricing Strategy", type: "treatment" },
  { id: "demand", label: "Customer Demand", type: "mediator" },
  { id: "revenue", label: "Revenue", type: "outcome" },
  { id: "season", label: "Seasonality", type: "confounder" },
  { id: "quality", label: "Product Quality", type: "mediator" },
  { id: "churn", label: "Customer Churn", type: "outcome" },
  { id: "marketing", label: "Marketing Spend", type: "treatment" },
  { id: "brand", label: "Brand Awareness", type: "mediator" },
];

const sampleEdges = [
  { source: "price", target: "demand", label: "inverse" },
  { source: "demand", target: "revenue", label: "drives" },
  { source: "season", target: "demand", label: "modulates" },
  { source: "quality", target: "churn", label: "reduces" },
  { source: "price", target: "churn", label: "increases" },
  { source: "marketing", target: "brand", label: "builds" },
  { source: "brand", target: "demand", label: "boosts" },
  { source: "season", target: "revenue", label: "affects" },
];

function layoutGraph(rawNodes: typeof sampleNodes, rawEdges: typeof sampleEdges) {
  // Spherical / elliptical layout — nodes arranged around the globe
  const cx = 350;
  const cy = 280;
  const radiusX = 260;
  const radiusY = 210;
  const n = rawNodes.length;

  const nodes: Node[] = rawNodes.map((n_item, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const x = cx + radiusX * Math.cos(angle);
    const y = cy + radiusY * Math.sin(angle);
    return {
      id: n_item.id,
      type: "causal",
      position: { x: x - 70, y: y - 25 },
      data: { label: n_item.label, type: n_item.type, status: "measured" },
    };
  });

  const edges: Edge[] = rawEdges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    type: "default",
    style: { stroke: "rgba(99,150,255,0.5)", strokeWidth: 2, filter: "drop-shadow(0 0 4px rgba(59,130,246,0.4))" },
    labelStyle: { fill: "rgba(200,210,230,0.9)", fontSize: 9, fontWeight: 700, letterSpacing: "0.02em" },
    labelBgStyle: { fill: "rgba(10,15,30,0.8)", rx: 6, ry: 6 },
    labelBgPadding: [5, 3] as [number, number],
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(99,150,255,0.7)", width: 16, height: 16 },
  }));

  return { nodes, edges };
}

/* ─── Graph Preview ─── */
function CausalGraphPreview({ domain }: { domain: string }) {
  const { data: modelsData } = useModels();
  const modelList = Array.isArray(modelsData) ? modelsData : [];
  const model = modelList.find((m) => m.domain === domain);

  // Build nodes/edges from real model if available, else use sample data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (model && model.node_count > 0) {
      // WorldModelSummary only has variable names, create basic nodes from them
      const rawN = model.variables.map((varName, i) => ({ id: varName, label: varName, type: "default" }));
      const rawE: typeof sampleEdges = []; // No edge detail in summary; edges render when detail endpoint is used
      const { nodes, edges } = layoutGraph(rawN, rawE);
      return { initialNodes: nodes, initialEdges: edges };
    }
    const { nodes, edges } = layoutGraph(sampleNodes, sampleEdges);
    return { initialNodes: nodes, initialEdges: edges };
  }, [model]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full min-h-[500px] relative">
      {/* Spline 3D Earth Globe — background layer */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/earthdayandnight-sHHWu18kAT3yslm9PT2uIOMH/"
          frameBorder="0"
          className="w-full h-full border-0"
          style={{ pointerEvents: "none" }}
          title="3D Globe"
          loading="lazy"
        />
        {/* Light vignette to keep nodes readable without hiding the globe */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,7,0.7)_100%)]" />
      </div>

      {/* ReactFlow graph on top of the globe */}
      <div className="relative z-10 h-full min-h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={causalNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          proOptions={{ hideAttribution: true }}
          className="[&_.react-flow__background]:!opacity-0"
          style={{ background: "transparent" }}
        >
          <Background gap={24} size={1} color="transparent" />
          <Controls showInteractive={false} className="!rounded-xl !border-white/10 !shadow-lg !bg-white/[0.06] !backdrop-blur-md [&>button]:!bg-transparent [&>button]:!border-white/[0.06] [&>button]:!text-white/50 [&>button:hover]:!bg-white/[0.08] [&>button:hover]:!text-white/80" />
        </ReactFlow>
      </div>
    </div>
  );
}