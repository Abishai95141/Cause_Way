import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Lightweight CSS gradient replacing WebGL canvas */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(255,140,66,0.12) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 70% 60%, rgba(255,107,26,0.08) 0%, transparent 55%)",
        }}
      />
      <div className="container mx-auto px-5 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-gradient-hero mb-8">
            Start building your
            <br />
            causal world model
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed">
            From documents to decisions in minutes.
          </p>
          <motion.a
            href="/app"
            onClick={(e: React.MouseEvent) => { e.preventDefault(); window.location.href = "/app"; }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
          >
            LAUNCH PLATFORM
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
