import { motion } from "framer-motion";
import { Search, FileText, ChevronRight, Network } from "lucide-react";

const ProductivitySection = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-orange opacity-20" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gradient-hero mb-6">
            Causal Discovery
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
            Extract cause-effect relationships from business documents and structure them into queryable causal graphs.
          </p>
        </motion.div>

        {/* Bento Grid — 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Dual Retrieval */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 flex flex-col justify-between min-h-[280px] sm:min-h-[340px] group"
          >
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="bg-secondary rounded-xl p-4 w-full max-w-[300px]">
                <div className="flex items-center gap-2 mb-3 bg-muted rounded-lg px-3 py-2">
                  <Search size={14} className="text-muted-foreground" />
                  <span className="text-sm sm:text-base text-muted-foreground">Search evidence…</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "PageIndex — Structural Navigation", key: "P" },
                    { label: "Haystack — Semantic Search", key: "H" },
                    { label: "Hybrid — Breadth + Depth", key: "B" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-muted/50">
                      <span className="text-sm sm:text-base text-foreground">{item.label}</span>
                      <span className="text-sm bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">{item.key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-2">Dual retrieval engine</h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">PageIndex for precise citations. Haystack for broad semantic search.</p>
            </div>
          </motion.div>

          {/* Variable Discovery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 flex flex-col justify-between min-h-[280px] sm:min-h-[340px] group"
          >
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="bg-card rounded-xl p-4 w-full max-w-[300px] border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold text-foreground">Discovered Variables</span>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm">+</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-secondary rounded-lg p-3">
                    <span className="text-sm bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Candidate</span>
                    <p className="text-base text-foreground mt-2">Shipping delay → Revenue: −$2.4M</p>
                    <p className="text-sm text-muted-foreground mt-1">📄 Q3 Postmortem, §3.2</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <span className="text-sm bg-accent/20 text-accent px-2 py-0.5 rounded-full">Confirmed</span>
                    <p className="text-base text-foreground mt-2">Price elasticity → Customer churn</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-2">Variable discovery</h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">AI identifies causal variables and factors with document-level provenance.</p>
            </div>
          </motion.div>

          {/* Causal Edge Extraction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 flex flex-col justify-between min-h-[280px] sm:min-h-[340px] group"
          >
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full max-w-[300px] space-y-4">
                {[
                  { from: "Port Congestion", to: "Shipping Delay", conf: "87%", color: "text-accent" },
                  { from: "Raw Material Cost", to: "Production Cost", conf: "92%", color: "text-primary" },
                  { from: "Tariff Policy", to: "Sourcing Shift", conf: "64%", color: "text-amber-400" },
                ].map((edge) => (
                  <div key={edge.from}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="px-3 py-1.5 bg-accent/20 rounded-lg text-sm font-medium text-accent">{edge.from}</div>
                      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                      <div className="px-3 py-1.5 bg-primary/20 rounded-lg text-sm font-medium text-primary">{edge.to}</div>
                    </div>
                    <p className="text-base text-muted-foreground mt-1 ml-2">
                      Confidence: <span className={edge.color}>{edge.conf}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-2">Causal edge extraction</h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">Every link classified as strong, moderate, or hypothesis with evidence scoring.</p>
            </div>
          </motion.div>

          {/* Evidence Triangulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8 flex flex-col justify-between min-h-[280px] sm:min-h-[340px] group overflow-hidden"
          >
            <div className="flex-1 flex items-center justify-center mb-6 relative">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="text-xs sm:text-sm text-muted-foreground">Documents</span>
                  <div className="relative w-28 h-28 sm:w-40 sm:h-40">
                    <div className="absolute inset-0 rounded-full border border-muted/30" />
                    <div className="absolute inset-3 sm:inset-4 rounded-full border border-muted/40" />
                    <div className="absolute inset-6 sm:inset-8 rounded-full border border-muted/50" />
                    <div className="absolute inset-[36px] sm:inset-[52px] rounded-full bg-secondary flex items-center justify-center">
                      <Network size={20} className="text-foreground sm:w-6 sm:h-6" />
                    </div>
                    <div className="absolute top-4 sm:top-6 right-2 sm:right-4 bg-accent text-accent-foreground text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                      12
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Data</span>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">Domain</span>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-primary/20 rounded-full blur-xl" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg md:text-xl mb-2">Evidence triangulation</h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">Cross-check claims across documents, data, and domain knowledge.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
