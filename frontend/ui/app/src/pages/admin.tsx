import { useState } from "react";
import {
  Shield,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Badge } from "@/product-ui/components/ui/badge";
import { usePurgeDocuments, useHealth, useMetrics } from "@/product-ui/api/hooks";
import type { PurgeResponse } from "@/product-ui/api/client";
import { toast } from "sonner";

export function AdminPage() {
  const purgeMutation = usePurgeDocuments();
  const { data: health } = useHealth();
  const { data: metrics } = useMetrics();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastPurge, setLastPurge] = useState<PurgeResponse | null>(null);

  const handlePurge = () => {
    purgeMutation.mutate(true, {
      onSuccess: (data) => {
        setLastPurge(data);
        setConfirmOpen(false);
        toast.success(`Purged ${data.documents_deleted} documents, ${data.vectors_deleted} vectors, ${data.files_deleted} files.`);
      },
      onError: () => toast.error("Purge failed"),
    });
  };

  return (
    <div>
      <PageHeader
        title="Admin"
        description="System administration and dangerous operations."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
              System Health
            </CardTitle>
            <CardDescription>Current backend status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px]">
            {health ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Status</span>
                  <Badge variant={health.status === "healthy" ? "success" : "warning"}>{health.status}</Badge>
                </div>
                {health.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Version</span>
                    <span className="font-mono text-[var(--text-primary)]">{health.version}</span>
                  </div>
                )}
                {metrics?.uptime_seconds != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">Uptime</span>
                    <span className="font-mono text-[var(--text-primary)]">{Math.floor(metrics.uptime_seconds / 60)}m</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[var(--text-tertiary)]">Health data unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Purge Documents */}
        <Card className="border-red-500/15">
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2 text-red-400">
              <Trash2 className="w-4 h-4" />
              Purge Documents
            </CardTitle>
            <CardDescription>Delete all documents, vectors, and files from the system. This action is irreversible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!confirmOpen ? (
              <Button variant="destructive" onClick={() => setConfirmOpen(true)} className="gap-1.5">
                <Trash2 className="w-4 h-4" />
                Purge All Documents
              </Button>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-red-400">Are you sure?</p>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                      This will permanently delete all documents, vector embeddings, and uploaded files.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                  <Button variant="destructive" size="sm" onClick={handlePurge} disabled={purgeMutation.isPending}>
                    {purgeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Purge"}
                  </Button>
                </div>
              </div>
            )}

            {/* Last purge results */}
            {lastPurge && (
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)] space-y-2">
                <div className="flex items-center gap-2 text-[13px]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                  <span className="font-semibold text-[var(--text-primary)]">Purge completed</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-[12px]">
                  <div>
                    <p className="text-[var(--text-tertiary)]">Documents</p>
                    <p className="font-bold text-[var(--text-primary)]">{lastPurge.documents_deleted}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-tertiary)]">Vectors</p>
                    <p className="font-bold text-[var(--text-primary)]">{lastPurge.vectors_deleted}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-tertiary)]">Files</p>
                    <p className="font-bold text-[var(--text-primary)]">{lastPurge.files_deleted}</p>
                  </div>
                </div>
                {lastPurge.warnings.length > 0 && (
                  <div className="text-[11px] text-amber-400 space-y-0.5">
                    {lastPurge.warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
                  </div>
                )}
                {lastPurge.errors.length > 0 && (
                  <div className="text-[11px] text-red-400 space-y-0.5">
                    {lastPurge.errors.map((e, i) => <p key={i}>✗ {e}</p>)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
