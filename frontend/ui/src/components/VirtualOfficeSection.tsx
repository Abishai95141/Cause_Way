import { motion } from "framer-motion";
import { Network, GitBranch, Layers, ShieldCheck } from "lucide-react";

const features = [
  { icon: Network, title: "DAG construction", desc: "Build directed acyclic graphs from business narratives using PyWhyLLM and NetworkX." },
  { icon: GitBranch, title: "Version control", desc: "Every world model is versioned. Compare snapshots, track evolution over time." },
  { icon: Layers, title: "Domain slicing", desc: "Query subgraphs for specific domains — pricing, supply chain, policy impact." },
];

const VirtualOfficeSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gradient-hero mb-6">
            Build world models.
            <br />
            From your documents.
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Evidence-based causal world models where every edge links back to source documents.
          </p>
        </motion.div>

        {/* World Model mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto mb-16"
        >
          {/* Main DAG card */}
          <div className="glass-card p-1.5 overflow-hidden">
            <div className="bg-secondary rounded-xl relative overflow-hidden">
              {/* Header — with integrated metadata */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-foreground font-semibold text-base sm:text-lg">World Model — Supply Chain</p>
                    <span className="text-xs sm:text-sm bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">v7</span>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">🔗 24 causal edges · 18 nodes · 87% avg confidence</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm text-muted-foreground">Updated 2h ago</span>
                  <div className="flex items-center gap-1.5 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">Approved</span>
                  </div>
                </div>
              </div>

              {/* Graph area */}
              <div className="aspect-[4/3] sm:aspect-[16/9] bg-gradient-to-br from-muted/50 to-secondary flex items-center justify-center relative p-3 sm:p-6">
                <div className="grid grid-cols-3 gap-x-3 sm:gap-x-12 gap-y-2 sm:gap-y-6 items-center w-full max-w-md">
                  {/* Causes */}
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { label: "Port Congestion", cls: "bg-accent/15 border-accent/20 text-accent" },
                      { label: "Tariff Policy", cls: "bg-amber-500/15 border-amber-500/20 text-amber-400" },
                      { label: "Fuel Price", cls: "bg-primary/15 border-primary/20 text-primary" },
                    ].map((n) => (
                      <div key={n.label} className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border text-center ${n.cls}`}>
                        <p className="text-[9px] sm:text-sm font-medium leading-tight">{n.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mediators */}
                  <div className="space-y-2 sm:space-y-3">
                    {["Shipping Delay", "Sourcing Mix", "Delivery Cost"].map((l) => (
                      <div key={l} className="px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-muted border border-border text-center">
                        <p className="text-[9px] sm:text-sm font-medium text-foreground leading-tight">{l}</p>
                      </div>
                    ))}
                  </div>
                  {/* Outcomes */}
                  <div className="space-y-2 sm:space-y-3">
                    {["Revenue", "Customer Sat."].map((l) => (
                      <div key={l} className="px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-center">
                        <p className="text-[9px] sm:text-sm font-medium text-emerald-400 leading-tight">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="33%" y1="25%" x2="50%" y2="25%" stroke="currentColor" strokeWidth="1" className="text-accent" />
                    <line x1="33%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-amber-400" />
                    <line x1="33%" y1="75%" x2="50%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    <line x1="66%" y1="25%" x2="82%" y2="35%" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                    <line x1="66%" y1="75%" x2="82%" y2="65%" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                  </svg>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border/50 flex-wrap gap-2">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs sm:text-sm text-muted-foreground">14 validated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs sm:text-sm text-muted-foreground">7 reviewing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs sm:text-sm text-muted-foreground">3 discovered</span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">v7 · Feb 2026</span>
              </div>
            </div>
          </div>

          {/* Blue glow */}
          <div className="absolute -inset-10 bg-accent/10 rounded-full blur-xl -z-10" />
        </motion.div>

        {/* Sub-features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center glass-card p-6 sm:p-8"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <f.icon size={20} className="text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg mb-2">{f.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VirtualOfficeSection;
