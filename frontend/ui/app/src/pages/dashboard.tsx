import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Server,
  Network,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  Compass,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Brain,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusCard } from "@/product-ui/components/shared/status-card";
import { Card, CardContent } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Input } from "@/product-ui/components/ui/input";
import { Badge } from "@/product-ui/components/ui/badge";
import { useHealth, useMetrics, useModels, useUnifiedQuery } from "@/product-ui/api/hooks";
import { cn } from "@/product-ui/lib/utils";
import { toast } from "sonner";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const quickActions = [
  { label: "Upload Documents", description: "Ingest PDFs, CSVs and text files", icon: FileText, href: "/app/documents", color: "from-orange-500 to-amber-500", img: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80" },
  { label: "Build World Model", description: "Discover causal relationships", icon: Network, href: "/app/builder", color: "from-violet-500 to-purple-500", img: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80" },
  { label: "Explore Models", description: "Visualize causal graphs", icon: Compass, href: "/app/explorer", color: "from-emerald-500 to-green-500", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
  { label: "Ask a Question", description: "Get evidence-backed decisions", icon: MessageSquare, href: "/app/decisions", color: "from-blue-500 to-cyan-500", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" },
];

const features = [
  { title: "Causal Discovery", desc: "Automatically extract cause-effect relationships from your documents using LLMs and evidence triangulation.", icon: Brain, img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80" },
  { title: "Evidence-Backed", desc: "Every relationship is traced back to source documents with confidence scoring and contradiction detection.", icon: Shield, img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80" },
  { title: "Decision Intelligence", desc: "Ask natural language questions and receive recommendations with causal reasoning paths.", icon: Zap, img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: health, isError: healthError } = useHealth();
  const { data: metrics } = useMetrics();
  const { data: models } = useModels();
  const unifiedQuery = useUnifiedQuery();
  const [query, setQuery] = useState("");

  const isOnline = health?.status === "healthy";
  const modelList = Array.isArray(models) ? models : [];
  const modelCount = modelList.length;
  const activeModels = modelList.filter((m) => m.status === "active").length;

  const handleQuery = () => {
    if (!query.trim()) return;
    unifiedQuery.mutate(
      { query: query.trim() },
      {
        onSuccess: (data) => {
          if (data.routed_mode === "world_model_construction") {
            toast.success("Routed to World Model Builder");
            navigate("/app/builder");
          } else {
            toast.success("Routed to Decision Support");
            navigate("/app/decisions");
          }
        },
        onError: () => toast.error("Query failed. Is the API running?"),
      }
    );
  };

  return (
    <div className="space-y-14">
      {/* ─── Hero Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0f1219] via-[#131825] to-[#0d1017] shadow-[0_20px_80px_rgba(0,0,0,0.5)] min-h-[380px] sm:min-h-[440px]"
      >
        {/* Abstract mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] rounded-full bg-[var(--color-accent-500)]/[0.06] blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-violet-500/[0.04] blur-[100px]" />
          <div className="absolute top-1/2 right-1/3 w-[40%] h-[40%] rounded-full bg-cyan-500/[0.03] blur-[80px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-14 max-w-2xl min-h-[380px] sm:min-h-[440px]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)] animate-pulse-subtle" />
              <span className="text-[13px] font-semibold text-[var(--color-accent-400)]">Decision Intelligence Platform</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.1] mb-5"
          >
            Build causal models.
            <br />
            <span className="bg-gradient-to-r from-[var(--color-accent-400)] via-blue-400 to-cyan-400 bg-clip-text text-transparent">Make better decisions.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base sm:text-lg text-white/50 leading-relaxed mb-8 max-w-lg"
          >
            Discover causal relationships from your documents and get evidence-backed recommendations powered by AI.
          </motion.p>

          {/* Unified Query Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-accent-400)]" />
              <span className="text-sm text-white/40 font-medium">Ask Causeway</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                  placeholder="Ask anything or build a model..."
                  className="h-12 rounded-2xl bg-white/[0.06] backdrop-blur-md border-white/[0.08] text-white placeholder:text-white/30 text-base px-5 focus:border-[var(--color-accent-500)]/40 focus:bg-white/[0.08]"
                />
              </div>
              <Button
                onClick={handleQuery}
                disabled={!query.trim() || unifiedQuery.isPending}
                size="lg"
                className="rounded-2xl h-12 px-6 shrink-0"
              >
                {unifiedQuery.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Ask <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Suggestion chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="flex flex-wrap gap-2 mt-5">
            {["What if we raise prices?", "Supply chain model", "Expand to Europe?"].map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="text-[13px] text-white/40 hover:text-[var(--color-accent-400)] px-4 py-2 rounded-full border border-white/[0.06] hover:border-[var(--color-accent-500)]/30 hover:bg-[var(--color-accent-500)]/5 transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Status Cards ─── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <StatusCard title="API Status" value={isOnline ? "Online" : "Offline"} subtitle={healthError ? "Cannot reach API" : health?.version} icon={Server} status={isOnline ? "success" : "error"} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatusCard title="Total Requests" value={metrics?.request_count?.toLocaleString() ?? "—"} subtitle={metrics?.error_count ? `${metrics.error_count} errors` : "No errors"} icon={Activity} status={metrics?.error_count ? "warning" : "info"} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatusCard title="World Models" value={modelCount} subtitle={`${activeModels} active`} icon={Network} status={activeModels > 0 ? "success" : "neutral"} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatusCard title="Uptime" value={metrics?.uptime_seconds ? `${Math.floor(metrics.uptime_seconds / 3600)}h` : "—"} subtitle="Since last restart" icon={Clock} status="info" />
        </motion.div>
      </motion.div>

      {/* ─── Quick Actions with Images ─── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Quick Actions</h2>
        <p className="text-base text-[var(--text-secondary)] mb-6">Jump straight into the core workflows.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}>
              <Card
                className="group cursor-pointer overflow-hidden hover:shadow-[var(--shadow-xl)] hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate(action.href)}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img src={action.img} alt={action.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={cn("absolute top-3 right-3 w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", action.color)}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardContent className="p-4 pt-3">
                  <p className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent-500)] transition-colors mb-1">{action.label}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Platform Features ─── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Platform Capabilities</h2>
        <p className="text-base text-[var(--text-secondary)] mb-6">Powered by causal inference and large language models.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div key={feat.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
              <Card className="overflow-hidden h-full hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img src={feat.img} alt={feat.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-500)]/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <feat.icon className="w-5 h-5 text-[var(--color-accent-400)]" />
                    </div>
                    <h3 className="text-lg font-bold text-white drop-shadow-md">{feat.title}</h3>
                  </div>
                </div>
                <CardContent className="p-5 pt-4">
                  <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Active Models ─── */}
      {modelList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Recent Models</h2>
              <p className="text-base text-[var(--text-secondary)] mt-0.5">{modelCount} world models built</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/explorer")}>View All <ArrowRight className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modelList.slice(0, 3).map((model, i) => (
              <motion.div key={model.version_id ?? model.domain} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }}>
                <Card className="cursor-pointer hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden" onClick={() => navigate("/app/explorer")}>
                  <div className={cn("h-1.5 w-full", model.status === "active" ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : model.status === "review" ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-slate-400 to-slate-300")} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--color-accent-500)]/10 to-[var(--color-accent-500)]/5 flex items-center justify-center">
                        <Network className="w-5 h-5 text-[var(--color-accent-500)]" />
                      </div>
                      <Badge variant={model.status === "active" ? "success" : model.status === "review" ? "warning" : "secondary"}>{model.status}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 capitalize">{model.domain}</h3>
                    <p className="text-[15px] text-[var(--text-tertiary)] mb-3">{`${model.node_count} variables · ${model.edge_count} edges`}</p>
                    <div className="flex items-center gap-4 text-[13px] text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {model.node_count} vars</span>
                      <span className="flex items-center gap-1"><Network className="w-3 h-3" /> {model.edge_count} edges</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Footer Stats Bar ─── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
        className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Globe className="w-6 h-6 text-[var(--color-accent-500)] mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{modelCount}</p>
            <p className="text-sm text-[var(--text-tertiary)]">World Models</p>
          </div>
          <div>
            <BarChart3 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{metrics?.request_count?.toLocaleString() ?? "0"}</p>
            <p className="text-sm text-[var(--text-tertiary)]">API Requests</p>
          </div>
          <div>
            <Shield className="w-6 h-6 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{activeModels}</p>
            <p className="text-sm text-[var(--text-tertiary)]">Active Models</p>
          </div>
          <div>
            <Activity className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{metrics?.uptime_seconds ? `${(metrics.uptime_seconds / 3600).toFixed(1)}h` : "—"}</p>
            <p className="text-sm text-[var(--text-tertiary)]">Uptime</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
