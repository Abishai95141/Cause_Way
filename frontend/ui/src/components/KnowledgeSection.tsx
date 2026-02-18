import { motion } from "framer-motion";
import { ShieldCheck, History, Eye } from "lucide-react";

const KnowledgeSection = () => {
  return (
    <section id="audit" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-blue opacity-20" />
      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gradient-hero mb-8">
            Full Audit
            <br />
            Provenance
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Every decision, retrieval, and reasoning step — captured as immutable audit entries with span tracing.
          </p>
        </motion.div>

        {/* Audit ledger */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card p-5 sm:p-8 md:p-10 mb-14"
        >
          <div className="flex items-center gap-2 mb-5 sm:mb-6 pb-4 border-b border-border/50 flex-wrap">
            <ShieldCheck size={18} className="text-accent" />
            <span className="text-foreground font-semibold text-sm sm:text-base">Audit Ledger</span>
            <span className="text-xs sm:text-base text-muted-foreground ml-auto">Append-only · Tamper-proof</span>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {[
              {
                time: "14:23:07",
                mode: "Mode 2",
                modeColor: "bg-accent/20 text-accent",
                action: 'Decision query: "Should we raise prices 10%?"',
                detail: "Loaded world model v7 (Supply Chain). Retrieved 3 evidence bundles. Traced 4 causal paths. Confidence: 62%.",
                trace: "trace_8f2a1c",
              },
              {
                time: "12:41:33",
                mode: "Mode 1",
                modeColor: "bg-emerald-500/20 text-emerald-400",
                action: 'World model update: added edge "Competitor Price → Market Share"',
                detail: "Evidence: Market Analysis Q4-2025, §2.3 page 8. Confidence: moderate. Approved by: Sarah Chen.",
                trace: "trace_4e7b9d",
              },
              {
                time: "09:15:22",
                mode: "System",
                modeColor: "bg-amber-500/20 text-amber-400",
                action: "Escalation: model staleness threshold exceeded",
                detail: "Supply Chain model v6 last updated 14 days ago. Auto-initiated Mode 1 reconstruction.",
                trace: "trace_1d3f6a",
              },
            ].map((entry, i) => (
              <div key={i} className="flex gap-3 sm:gap-4 items-start pb-5 sm:pb-0 border-b border-border/30 sm:border-0 last:border-0 last:pb-0">
                <span className="text-xs sm:text-base text-muted-foreground font-mono mt-0.5 shrink-0 w-16 sm:w-20 hidden sm:block">{entry.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="sm:hidden text-xs text-muted-foreground font-mono">{entry.time}</span>
                    <span className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-full font-medium ${entry.modeColor}`}>
                      {entry.mode}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-foreground font-medium mb-1.5 leading-snug">{entry.action}</p>
                  <p className="text-[13px] sm:text-base text-muted-foreground leading-relaxed">{entry.detail}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-mono">{entry.trace}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-8 text-center"
          >
            <History size={24} className="text-accent mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-3">Execution Tracing</h3>
            <p className="text-base md:text-lg text-muted-foreground">Agent Lightning captures spans for every tool call, retrieval, and reasoning step.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 sm:p-8 text-center"
          >
            <Eye size={24} className="text-accent mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-3">Human-in-the-Loop</h3>
            <p className="text-base md:text-lg text-muted-foreground">World models require approval before going active. High-stakes decisions surface uncertainty.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeSection;
