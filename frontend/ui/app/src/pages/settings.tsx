import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  BarChart3,
  Palette,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Activity,
  Clock,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Badge } from "@/product-ui/components/ui/badge";
import { Input } from "@/product-ui/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/product-ui/components/ui/tabs";
import { useModels, useHealth, useMetrics } from "@/product-ui/api/hooks";
import { useTheme } from "@/product-ui/lib/theme";
import type { WorldModelSummary } from "@/product-ui/api/client";
import { cn, formatRelativeTime } from "@/product-ui/lib/utils";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage approvals, review training, and configure system preferences." />

      <Tabs defaultValue="approvals">
        <TabsList className="mb-6">
          <TabsTrigger value="approvals"><ShieldCheck className="w-3.5 h-3.5" /> Approvals</TabsTrigger>
          <TabsTrigger value="training"><BarChart3 className="w-3.5 h-3.5" /> Training</TabsTrigger>
          <TabsTrigger value="preferences"><Palette className="w-3.5 h-3.5" /> Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals"><ApprovalsTab /></TabsContent>
        <TabsContent value="training"><TrainingTab /></TabsContent>
        <TabsContent value="preferences"><PreferencesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Approvals Tab ─── */
function ApprovalsTab() {
  const { data } = useModels();
  const models: WorldModelSummary[] = Array.isArray(data) ? data : [];
  const reviewModels = models.filter((m) => m.status === "review" || m.status === "draft");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-[var(--color-accent-500)] mx-auto mb-4" />
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">Approval Review</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
            Review and approve world models before activation. {reviewModels.length > 0 && (
              <span className="text-[var(--color-warning)] font-semibold">{reviewModels.length} model{reviewModels.length > 1 ? 's' : ''} awaiting review.</span>
            )}
          </p>
          <Button onClick={() => window.location.href = '/app/approval'} className="gap-2">
            <Eye className="w-4 h-4" />
            Go to Approval Review
            {reviewModels.length > 0 && (
              <Badge variant="warning" className="ml-1 text-[10px]">{reviewModels.length}</Badge>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Training Tab ─── */
function TrainingTab() {
  const { data: metrics, refetch: refetchMetrics } = useMetrics();
  const { data: health, refetch: refetchHealth } = useHealth();

  const handleRefresh = () => {
    refetchMetrics();
    refetchHealth();
  };

  return (
    <div className="space-y-6">
      {/* System Overview Metrics */}
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">System Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Uptime"
            value={metrics?.uptime_seconds ? `${(metrics.uptime_seconds / 3600).toFixed(1)}h` : "—"}
            icon={<Clock className="w-4 h-4 text-[var(--color-accent-500)]" />}
          />
          <MetricCard
            label="Total Requests"
            value={metrics?.request_count?.toLocaleString() ?? "—"}
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
          />
          <MetricCard
            label="Errors"
            value={metrics?.error_count?.toLocaleString() ?? "—"}
            icon={<XCircle className="w-4 h-4 text-red-400" />}
          />
          <MetricCard
            label="API Status"
            value={health?.status === "healthy" ? "Healthy" : health?.status ?? "—"}
            icon={<CheckCircle2 className={cn("w-4 h-4", health?.status === "healthy" ? "text-emerald-500" : "text-amber-400")} />}
          />
        </div>
      </div>

      {/* Training Info */}
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Training & Observability</h3>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-2">Training Dashboard</p>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                Reward charts, span distribution, throughput analytics, and audit logs will appear here once training spans are collected. Connect the backend training pipeline to begin collecting data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                  <p className="text-[20px] font-bold text-[var(--text-primary)]">0</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">Training Spans</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                  <p className="text-[20px] font-bold text-[var(--text-primary)]">—</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">Avg Reward</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                  <p className="text-[20px] font-bold text-[var(--text-primary)]">—</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">Throughput</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Audit */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <Button variant="ghost" size="sm" onClick={handleRefresh}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border-secondary)]">
              {health?.status === "healthy" ? (
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[var(--text-primary)]">System is healthy</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{health.timestamp ? formatRelativeTime(health.timestamp) : "Just now"}</p>
                  </div>
                  <Badge variant="success">OK</Badge>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[13px] text-[var(--text-tertiary)]">No recent activity to display.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Metric Card ─── */
function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-secondary)] shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-[18px] font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Preferences Tab ─── */
function PreferencesTab() {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun; desc: string }[] = [
    { value: "light", label: "Light", icon: Sun, desc: "Clean and bright appearance" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    { value: "system", label: "System", icon: Monitor, desc: "Follow your OS preference" },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Theme */}
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Appearance</h3>
        <p className="text-[13px] text-[var(--text-secondary)] mb-4">Choose how Causeway looks to you.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "p-5 rounded-2xl border text-left transition-all duration-200",
                theme === opt.value
                  ? "border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/5 shadow-[var(--shadow-button)]"
                  : "border-[var(--border-primary)] hover:border-[var(--color-accent-400)]/30 hover:bg-[var(--bg-secondary)]"
              )}
            >
              <opt.icon className={cn("w-5 h-5 mb-3", theme === opt.value ? "text-[var(--color-accent-500)]" : "text-[var(--text-tertiary)]")} />
              <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-0.5">{opt.label}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">API Configuration</h3>
          <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] mb-4">Backend connection settings managed via environment config.</p>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 block">API Base URL</label>
            <Input placeholder="http://localhost:8000" disabled defaultValue="" />
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">Set via Vite proxy in development. Configured in vite.config.ts.</p>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 block">Polling Intervals</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input placeholder="15000" disabled defaultValue="15000" />
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Health check (ms)</p>
              </div>
              <div>
                <Input placeholder="10000" disabled defaultValue="10000" />
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Metrics (ms)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">About Causeway</h3>
        <p className="text-[13px] text-[var(--text-secondary)] mb-4">Decision Intelligence Platform</p>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Version</span>
                <span className="text-[var(--text-primary)] font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Framework</span>
                <span className="text-[var(--text-primary)] font-medium">React + Vite + TypeScript</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Backend</span>
                <span className="text-[var(--text-primary)] font-medium">FastAPI + Python</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">License</span>
                <span className="text-[var(--text-primary)] font-medium">MIT</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
