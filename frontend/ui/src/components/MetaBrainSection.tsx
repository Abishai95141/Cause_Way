import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, ShieldCheck, Check } from "lucide-react";

const MetaBrainSection = () => {
  return (
    <section id="decisions" className="py-24 md:py-32 relative overflow-hidden">
      {/* Lightweight CSS gradient replacing WebGL canvas */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 40% 45%, rgba(77,143,204,0.18) 0%, transparent 60%), " +
            "radial-gradient(ellipse 50% 40% at 65% 55%, rgba(77,143,204,0.10) 0%, transparent 50%)",
        }}
      />
      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gradient-hero mb-6">
            Decision Support
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Ask natural language questions. Causeway traces causal paths and returns evidence-backed recommendations.
          </p>
        </motion.div>

        {/* Bento Grid — 6 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {/* Ask */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 min-h-[280px] flex flex-col"
          >
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-1">Ask questions</h3>
              <p className="text-base text-muted-foreground mb-4">Query your world model in natural language.</p>
            </div>
            <div className="mt-auto flex-1 space-y-3">
              <div className="bg-secondary rounded-lg px-4 py-3">
                <p className="text-base text-foreground italic">"Should we raise prices 10%?"</p>
              </div>
              <div className="bg-secondary rounded-lg px-4 py-3">
                <p className="text-base text-foreground italic">"What drives customer churn?"</p>
              </div>
              <div className="bg-secondary rounded-lg px-4 py-3">
                <p className="text-base text-foreground italic">"What if our supplier delays?"</p>
              </div>
            </div>
          </motion.div>

          {/* Trace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 min-h-[280px] flex flex-col"
          >
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-1">Trace causal paths</h3>
              <p className="text-base text-muted-foreground mb-4">AI follows cause-effect chains through your model.</p>
            </div>
            <div className="mt-auto flex-1 flex items-center justify-center">
              <div className="bg-secondary rounded-lg p-4 w-full">
                <p className="text-base text-muted-foreground mb-2">Causal Path Analysis</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-base text-foreground">Price ↑10%</span>
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                    <span className="text-base text-foreground">Churn ↑2.3%</span>
                    <span className="text-sm text-accent">(strong)</span>
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                    <span className="text-base text-foreground">Revenue ↓$1.8M</span>
                    <span className="text-sm text-amber-400">(moderate)</span>
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                    <span className="text-base text-foreground">Net: ↑$0.4M</span>
                    <span className="text-sm text-emerald-400">(uncertain)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 min-h-[280px] flex flex-col"
          >
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-1">Get recommendations</h3>
              <p className="text-base text-muted-foreground mb-4">Evidence-backed answers with uncertainty levels.</p>
            </div>
            <div className="mt-auto flex-1 space-y-4">
              <div className="bg-secondary rounded-lg px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span className="text-base font-semibold text-foreground">Recommendation</span>
                </div>
                <p className="text-base text-muted-foreground">"Delay price increase. Competitor prices dropped — confounder detected."</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
                </div>
                <span className="text-sm text-amber-400 font-medium">62% confidence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-base text-muted-foreground">Escalation: recommend world model update</span>
              </div>
            </div>
          </motion.div>

          {/* Escalation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 min-h-[280px] flex flex-col"
          >
            <div className="mb-2">
              <AlertTriangle size={18} className="text-amber-400 mb-3" />
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-1">Smart escalation</h3>
              <p className="text-base text-muted-foreground">Auto-detects when the model needs updating.</p>
            </div>
            <div className="mt-4 flex-1 space-y-3">
              {["Critical variable missing?", "Evidence contradicts model?", "Model older than threshold?"].map((q) => (
                <div key={q} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-base text-muted-foreground">{q}</span>
                </div>
              ))}
              <p className="text-base text-accent mt-2 px-2">→ Auto-triggers Mode 1 reconstruction</p>
            </div>
          </motion.div>

          {/* Agent Training */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 min-h-[280px] flex flex-col items-center justify-center text-center"
          >
            <div className="mb-6">
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl">Agent training</h3>
              <p className="text-base text-muted-foreground">Agent Lightning captures every execution span for continuous improvement.</p>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {["Retrieval", "Reasoning", "Protocol", "Reward"].map((label, i) => (
                <div key={label} className="relative">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-border">
                    <span className="text-sm font-bold text-muted-foreground">{label}</span>
                  </div>
                  {i === 3 && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-background" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Two Modes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 min-h-[280px] flex flex-col"
          >
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-1">Two operating modes</h3>
              <p className="text-base text-muted-foreground mb-4">Build or query — clearly separated protocols.</p>
            </div>
            <div className="mt-auto flex-1 space-y-4">
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-base font-semibold text-foreground">Mode 1 — Build</p>
                <p className="text-base text-muted-foreground mt-1">Construct world models from document evidence</p>
              </div>
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-base font-semibold text-foreground">Mode 2 — Query</p>
                <p className="text-base text-muted-foreground mt-1">Ask questions, get evidence-backed decisions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MetaBrainSection;
