import { motion } from "framer-motion";
import { FileText, Bookmark } from "lucide-react";

const documents = [
  { title: "Port congestion → shipping delay +3.2 days", tag: "strong", tagColor: "bg-emerald-500/20 text-emerald-400", source: "Q3 Postmortem", section: "§3.2, page 12", id: "E-5054" },
  { title: "Raw material shortage → production cost +18%", tag: "strong", tagColor: "bg-emerald-500/20 text-emerald-400", source: "Supply Report", section: "§2.1, page 7", id: "E-5058" },
  { title: "Demand forecast error → inventory surplus $2.1M", tag: "moderate", tagColor: "bg-amber-500/20 text-amber-400", source: "Finance Review", section: "§4.3, page 21", id: "E-5052" },
  { title: "Tariff policy → regional sourcing shift", tag: "hypothesis", tagColor: "bg-accent/20 text-accent", source: "Policy Brief", section: "§1.1, page 3", id: "E-5049" },
  { title: "Fuel price spike → last-mile delivery cost +22%", tag: "strong", tagColor: "bg-emerald-500/20 text-emerald-400", source: "Ops Dashboard", section: "§5.4, page 34", id: "E-5048" },
];

const GitHubSyncSection = () => {
  return (
    <section id="evidence" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-orange opacity-20" />

      {/* Decorative illustration — right side, desktop only */}
      <img
        src="/svg/questions-rafiki.svg"
        alt=""
        aria-hidden
        className="hidden lg:block absolute -right-16 xl:-right-8 top-1/2 -translate-y-1/2 w-[340px] xl:w-[420px] 2xl:w-[480px] opacity-[0.08] pointer-events-none select-none"
      />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 sm:mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gradient-hero mb-4 sm:mb-6">
            Evidence trails.
            <br />
            Every claim cited.
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
            Every causal relationship traces back to source documents with section and page-level citations.
          </p>
        </motion.div>

        {/* Evidence table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="glass-card overflow-hidden relative">
            {/* Header */}
            <div className="border-b border-border px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                <Bookmark size={16} />
                <span className="text-foreground font-medium">Evidence Store</span>
                <span>/</span>
                <span className="text-foreground font-medium">Supply Chain Model</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border px-3 sm:px-5 flex gap-3 sm:gap-5 text-sm sm:text-base overflow-x-auto scrollbar-hide">
              {["All Evidence", "Strong (14)", "Moderate (7)", "Hypothesis (3)", "Contested (1)"].map((tab, i) => (
                <span key={tab} className={`py-2.5 border-b-2 whitespace-nowrap ${i === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
                  {tab}
                </span>
              ))}
            </div>

            {/* Evidence list */}
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div key={doc.id} className="px-4 sm:px-5 py-4 sm:py-5 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
                  <FileText size={16} className="text-accent mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-full ${doc.tagColor} whitespace-nowrap`}>{doc.tag}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                      {doc.id} · {doc.source}, {doc.section}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Glowing border */}
          <div className="absolute -bottom-2 -right-2 w-1 h-2/3 bg-gradient-to-t from-accent via-accent/50 to-transparent rounded-full blur-sm" />
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-accent rounded-full blur-sm" />
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubSyncSection;
