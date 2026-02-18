import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Network,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Badge } from "@/product-ui/components/ui/badge";
import { EmptyState } from "@/product-ui/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/product-ui/components/ui/tabs";
import { useModels, useApproveModel, useModelDetail, usePatchModel } from "@/product-ui/api/hooks";
import type { WorldModelSummary, EdgeDetail, PatchWorldModelRequest } from "@/product-ui/api/client";
import { cn, capitalize } from "@/product-ui/lib/utils";
import { toast } from "sonner";

export function ApprovalReviewPage() {
  const { data: modelsData, isLoading } = useModels();
  const approveMutation = useApproveModel();
  const patchMutation = usePatchModel();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [approvedBy, setApprovedBy] = useState("ui-user");
  const [reviewedEdges, setReviewedEdges] = useState<Record<string, "approved" | "rejected">>({});

  const { data: detailData, isLoading: detailLoading } = useModelDetail(selectedDomain ?? "");

  const models: WorldModelSummary[] = Array.isArray(modelsData) ? modelsData : [];

  const pendingModels = useMemo(
    () => models.filter((m) => m.status === "review" || m.status === "draft"),
    [models]
  );

  const activeModels = useMemo(
    () => models.filter((m) => m.status === "active"),
    [models]
  );

  const handleApprove = async (domain: string) => {
    // Collect rejected edges to remove via PATCH before approving
    const rejectedEdges = Object.entries(reviewedEdges)
      .filter(([, verdict]) => verdict === "rejected")
      .map(([key]) => {
        const sep = key.indexOf("\u2192");
        return { from_var: key.slice(0, sep), to_var: key.slice(sep + 1) };
      });

    try {
      if (rejectedEdges.length > 0) {
        const patch: PatchWorldModelRequest = { remove_edges: rejectedEdges };
        await patchMutation.mutateAsync({ domain, patch });
      }
      approveMutation.mutate({ domain, approvedBy }, {
        onSuccess: () => {
          toast.success(`Model "${domain}" approved and activated!`);
          setSelectedDomain(null);
          setReviewedEdges({});
        },
        onError: () => toast.error("Failed to approve model"),
      });
    } catch {
      toast.error("Failed to remove rejected edges");
    }
  };

  const toggleEdgeReview = (edgeKey: string, action: "approved" | "rejected") => {
    setReviewedEdges((prev) => {
      const next = { ...prev };
      if (next[edgeKey] === action) {
        delete next[edgeKey];
      } else {
        next[edgeKey] = action;
      }
      return next;
    });
  };

  const reviewStats = useMemo(() => {
    const total = detailData?.edges?.length ?? 0;
    const approved = Object.values(reviewedEdges).filter((v) => v === "approved").length;
    const rejected = Object.values(reviewedEdges).filter((v) => v === "rejected").length;
    return { total, approved, rejected, remaining: total - approved - rejected };
  }, [detailData, reviewedEdges]);

  return (
    <div>
      <PageHeader
        title="Approval Review"
        description="Review, inspect, and approve world models before activation."
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Pending Review
            {pendingModels.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--color-warning)] text-white text-[10px] font-bold">
                {pendingModels.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" />
            </div>
          ) : selectedDomain ? (
            /* ─── Detailed Review View ─── */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => { setSelectedDomain(null); setReviewedEdges({}); }}>
                  ← Back
                </Button>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedDomain}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    placeholder="Your name"
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] w-32"
                  />
                  <Button
                    onClick={() => handleApprove(selectedDomain)}
                    disabled={approveMutation.isPending || patchMutation.isPending}
                    variant="success"
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Model
                  </Button>
                </div>
              </div>

              {/* Review Progress */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-tertiary)]">Variables:</span>
                      <span className="font-bold text-[var(--text-primary)]">{detailData?.variables?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-tertiary)]">Edges:</span>
                      <span className="font-bold text-[var(--text-primary)]">{reviewStats.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-success)]" />
                      <span className="text-[var(--color-success)]">{reviewStats.approved}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3 h-3 text-[var(--color-error)]" />
                      <span className="text-[var(--color-error)]">{reviewStats.rejected}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-tertiary)]">Remaining: {reviewStats.remaining}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edge Review List */}
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
                </div>
              ) : (
              <div className="space-y-2">
                {(detailData?.edges ?? []).map((edge: EdgeDetail, i: number) => {
                  const edgeKey = `${edge.from_var}\u2192${edge.to_var}`;
                  const status = reviewedEdges[edgeKey];
                  return (
                    <motion.div
                      key={edgeKey}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Card className={cn(
                        "transition-colors",
                        status === "approved" && "border-[var(--color-success)]/30",
                        status === "rejected" && "border-[var(--color-error)]/30"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-[var(--text-primary)]">{edge.from_var}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">{edge.to_var}</span>
                                {edge.strength && (
                                  <Badge
                                    variant={
                                      edge.strength === "strong" ? "success" :
                                      edge.strength === "moderate" ? "info" :
                                      edge.strength === "hypothesis" ? "warning" : "error"
                                    }
                                    className="text-[10px]"
                                  >
                                    {edge.strength}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)]">{edge.mechanism}</p>
                              <div className="flex items-center gap-4 mt-2 text-[11px] text-[var(--text-tertiary)]">
                                {edge.confidence != null && <span>Confidence: {(edge.confidence * 100).toFixed(0)}%</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="icon-sm"
                                variant={status === "approved" ? "success" : "outline"}
                                onClick={() => toggleEdgeReview(edgeKey, "approved")}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant={status === "rejected" ? "destructive" : "outline"}
                                onClick={() => toggleEdgeReview(edgeKey, "rejected")}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              )}
            </motion.div>
          ) : pendingModels.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="w-12 h-12" />}
              title="No models pending review"
              description="Build a world model first — it will appear here for your review before activation."
            />
          ) : (
            <div className="space-y-3">
              {pendingModels.map((model) => (
                <motion.div key={model.version_id ?? model.domain} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer" onClick={() => { setSelectedDomain(model.domain); setReviewedEdges({}); }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-warning)]/10">
                          <Network className="w-6 h-6 text-[var(--color-warning)]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{model.domain}</h3>
                            <Badge variant="warning">{model.status}</Badge>
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                            {model.node_count} variables · {model.edge_count} edges
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                          <Eye className="w-3.5 h-3.5" /> Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeModels.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-12 h-12" />}
              title="No active models"
              description="Approved models will appear here."
            />
          ) : (
            <div className="space-y-3">
              {activeModels.map((model) => (
                <Card key={model.version_id ?? model.domain}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-success)]/10">
                        <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{model.domain}</h3>
                          <Badge variant="success">Active</Badge>
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                          {model.node_count} variables · {model.edge_count} edges
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
