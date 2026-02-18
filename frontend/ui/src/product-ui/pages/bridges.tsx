import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Loader2,
  ChevronRight,
  ArrowRight,
  Network,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Badge } from "@/product-ui/components/ui/badge";
import { EmptyState } from "@/product-ui/components/shared/empty-state";
import { useBridges, useBridge, useBuildBridge, useModels } from "@/product-ui/api/hooks";
import type { BridgeSummary, WorldModelSummary } from "@/product-ui/api/client";
import { cn } from "@/product-ui/lib/utils";
import { toast } from "sonner";

export function BridgesPage() {
  const { data: bridgesData, isLoading } = useBridges();
  const { data: modelsData } = useModels();
  const buildBridgeMutation = useBuildBridge();

  const bridges: BridgeSummary[] = Array.isArray(bridgesData) ? bridgesData : [];
  const models: WorldModelSummary[] = Array.isArray(modelsData) ? modelsData : [];

  const [selectedBridgeId, setSelectedBridgeId] = useState<string | null>(null);
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [sourceDomain, setSourceDomain] = useState("");
  const [targetDomain, setTargetDomain] = useState("");

  const handleBuild = () => {
    if (!sourceDomain || !targetDomain) return;
    buildBridgeMutation.mutate(
      { source_domain: sourceDomain, target_domain: targetDomain },
      {
        onSuccess: () => {
          toast.success("Bridge built successfully!");
          setShowBuildForm(false);
          setSourceDomain("");
          setTargetDomain("");
        },
        onError: () => toast.error("Failed to build bridge"),
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Bridges"
        description="Cross-domain causal bridges linking world models together."
        actions={
          <Button onClick={() => setShowBuildForm(!showBuildForm)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Build Bridge
          </Button>
        }
      />

      {/* Build Form */}
      <AnimatePresence>
        {showBuildForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px]">Build Cross-Domain Bridge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Source Domain</label>
                    <select
                      value={sourceDomain}
                      onChange={(e) => setSourceDomain(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)]"
                    >
                      <option value="">Select domain…</option>
                      {models.map((m) => (
                        <option key={m.domain} value={m.domain}>{m.domain}</option>
                      ))}
                    </select>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--text-tertiary)] mt-6 shrink-0" />
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Target Domain</label>
                    <select
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)]"
                    >
                      <option value="">Select domain…</option>
                      {models.filter((m) => m.domain !== sourceDomain).map((m) => (
                        <option key={m.domain} value={m.domain}>{m.domain}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowBuildForm(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    onClick={handleBuild}
                    disabled={!sourceDomain || !targetDomain || buildBridgeMutation.isPending}
                  >
                    {buildBridgeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Build"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bridge List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : bridges.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-12 h-12" />}
          title="No bridges yet"
          description="Build a bridge between two world models to discover cross-domain causal relationships."
        />
      ) : (
        <div className="space-y-3">
          {bridges.map((bridge) => (
            <motion.div key={bridge.bridge_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={cn(
                  "cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow",
                  selectedBridgeId === bridge.bridge_id && "border-[var(--color-accent-500)]/30"
                )}
                onClick={() => setSelectedBridgeId(selectedBridgeId === bridge.bridge_id ? null : bridge.bridge_id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                      <Network className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{bridge.source_version_id}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{bridge.target_version_id}</span>
                        <Badge variant={bridge.status === "active" ? "success" : "info"}>{bridge.status}</Badge>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                        {bridge.edge_count} bridge edges · {bridge.concept_count} shared concepts
                        {bridge.created_at && ` · ${bridge.created_at}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inline detail */}
              <AnimatePresence>
                {selectedBridgeId === bridge.bridge_id && (
                  <BridgeDetailPanel bridgeId={bridge.bridge_id} />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Bridge Detail Panel ─── */
function BridgeDetailPanel({ bridgeId }: { bridgeId: string }) {
  const { data: detail, isLoading } = useBridge(bridgeId);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <Card className="mt-2 border-purple-500/15">
        <CardContent className="p-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
            </div>
          ) : detail ? (
            <>
              {detail.description && (
                <p className="text-[13px] text-[var(--text-secondary)]">{detail.description}</p>
              )}

              {/* Bridge Edges */}
              {detail.bridge_edges.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                    Bridge Edges ({detail.bridge_edges.length})
                  </p>
                  <div className="space-y-2">
                    {detail.bridge_edges.map((edge, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className="font-medium text-[var(--text-primary)]">{edge.source_domain}:{edge.source_var}</span>
                          <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
                          <span className="font-medium text-[var(--text-primary)]">{edge.target_domain}:{edge.target_var}</span>
                          <Badge variant={edge.strength === "strong" ? "success" : edge.strength === "moderate" ? "info" : "warning"} className="text-[9px]">
                            {edge.strength}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{edge.mechanism}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Confidence: {(edge.confidence * 100).toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Concepts */}
              {detail.shared_concepts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                    Shared Concepts ({detail.shared_concepts.length})
                  </p>
                  <div className="space-y-2">
                    {detail.shared_concepts.map((concept, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)] text-[12px]">
                        <span className="font-medium text-[var(--text-primary)]">{concept.source_var}</span>
                        <ArrowRight className="w-3 h-3 text-purple-400" />
                        <span className="font-medium text-[var(--text-primary)]">{concept.target_var}</span>
                        <span className="text-[var(--text-tertiary)] ml-auto">{(concept.similarity_score * 100).toFixed(0)}% similar</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[13px] text-[var(--text-tertiary)]">Failed to load bridge detail.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
