import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  status?: "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

const statusColors = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-[var(--color-accent-500)]",
  neutral: "text-[var(--text-secondary)]",
};

const statusBg = {
  success: "from-emerald-500/10 to-emerald-500/5",
  warning: "from-amber-500/10 to-amber-500/5",
  error: "from-red-500/10 to-red-500/5",
  info: "from-[var(--color-accent-500)]/10 to-[var(--color-accent-500)]/5",
  neutral: "from-[var(--bg-tertiary)] to-[var(--bg-tertiary)]",
};

export function StatusCard({ title, value, subtitle, icon: Icon, trend, status = "neutral", className }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
        className
      )}
    >
      {/* Subtle gradient background accent */}
      <div className={cn("absolute inset-0 opacity-50 bg-gradient-to-br", statusBg[status])} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
          {subtitle && <p className="text-[15px] text-[var(--text-tertiary)] leading-relaxed">{subtitle}</p>}
          {trend && (
            <p className={cn("text-[12px] font-semibold flex items-center gap-1", trend.value >= 0 ? "text-emerald-500" : "text-red-500")}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-[var(--text-tertiary)] font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn("flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br shadow-sm", statusBg[status])}>
          <Icon className={cn("w-5 h-5", statusColors[status])} />
        </div>
      </div>
    </motion.div>
  );
}
