import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedLiquidBackground from "@/components/AnimatedLiquidBackground";

/* ── Cursor-tracking glow button (ported from ui/) ── */
function GlowButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = btnRef.current;
    const glow = glowRef.current;
    const outer = outerRef.current;
    if (!btn || !glow || !outer) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.background = `radial-gradient(120px circle at ${x}px ${y}px, #f97316 0%, #fb923c 30%, transparent 70%)`;
    outer.style.background = `radial-gradient(160px circle at ${x}px ${y}px, rgba(249,115,22,0.35) 0%, rgba(251,146,60,0.2) 40%, transparent 70%)`;
  }, []);

  return (
    <a
      ref={btnRef}
      href="/app"
      onClick={(e) => { e.preventDefault(); window.location.href = "/app"; }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setHovered(true);
        setHasInteracted(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={`group relative z-0 overflow-visible cursor-pointer ${className ?? ""}`}
    >
      <div
        ref={glowRef}
        className="absolute inset-[-2px] rounded-[inherit] pointer-events-none"
        style={{
          opacity: hovered ? 1 : hasInteracted ? 0.45 : 0,
          transition: "opacity 0.4s ease",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "2px",
          borderRadius: "inherit",
        }}
      />
      <div
        ref={outerRef}
        className="absolute inset-[-8px] rounded-[inherit] pointer-events-none -z-10"
        style={{
          opacity: hovered ? 1 : hasInteracted ? 0.35 : 0,
          transition: "opacity 0.4s ease",
          filter: "blur(14px)",
          borderRadius: "inherit",
        }}
      />
      {children}
    </a>
  );
}

const HeroSection = () => {
  return (
    <>
      <section className="relative overflow-hidden" style={{ zIndex: 1 }}>
        {/* Animated Liquid Background — covers hero + extends into card area */}
        <AnimatedLiquidBackground
          preset="Dark"
          speed={18}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ bottom: "-40vh", height: "140%" }}
        />

        {/* Hero copy */}
        <div className="relative z-10 container mx-auto px-5 sm:px-6 flex flex-col justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="font-display font-bold text-[2.6rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-5">
              Decision Intelligence
              <br />
              for your teams
            </h1>
            <p className="text-foreground text-base sm:text-lg max-w-md mb-7 leading-relaxed">
              Extract causal relationships from documents, build world models,
              and make evidence-backed decisions.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlowButton className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-card/80 border border-foreground/[0.06] font-semibold text-sm">
                <span className="relative z-10 flex items-center gap-2 font-semibold tracking-wide text-sm text-foreground">
                  SEE IN ACTION
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </GlowButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard card */}
        <a
          href="/app"
          onClick={(e) => { e.preventDefault(); window.location.href = "/app"; }}
          id="dashboard-preview"
          className="block relative z-10 container mx-auto px-4 sm:px-6 -mt-16 sm:-mt-28 md:-mt-40 pb-14 sm:pb-20 group cursor-pointer"
        >
          {/* Top glow fan */}
          <div
            className="absolute -top-24 sm:-top-44 left-1/2 -translate-x-1/2 w-[60%] h-[200px] sm:h-[320px] pointer-events-none z-[1]"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,140,66,0.10) 0%, rgba(255,140,66,0.02) 55%, transparent 80%)",
            }}
          />
          {/* Top edge highlight */}
          <div
            className="absolute top-0 left-[8%] right-[8%] h-[2px] pointer-events-none z-[5]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,140,66,0.3) 15%, rgba(255,180,100,0.55) 50%, rgba(255,140,66,0.3) 85%, transparent 100%)",
              filter: "blur(0.5px)",
              boxShadow:
                "0 0 12px rgba(255,140,66,0.2), 0 0 35px rgba(255,140,66,0.07)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-1.5 sm:p-2 md:p-3 overflow-hidden shadow-[0_-20px_80px_-20px_hsl(25_95%_55%/0.12),0_30px_60px_-15px_hsl(0_0%_0%/0.6)] group-hover:shadow-[0_-20px_80px_-20px_hsl(25_95%_55%/0.18),0_30px_60px_-15px_hsl(0_0%_0%/0.7)] transition-shadow duration-300"
          >
            {/* Responsive iframe — scales the product UI down to fit */}
            <div className="relative w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#0d1017]" style={{ aspectRatio: "16/10" }}>
              <img
                src="/dashboard-preview.png"
                alt="Causeway Dashboard — Decision Intelligence Platform"
                className="w-full h-full object-cover object-top"
                loading="eager"
                draggable={false}
              />
            </div>
          </motion.div>
        </a>
      </section>

      {/* Feature pills */}
      <section className="relative z-20 py-8 sm:py-14 px-4 sm:px-6 mt-4 sm:mt-10">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {[
            "Causal Discovery",
            "World Models",
            "Evidence Trails",
            "Audit Provenance",
          ].map((pill) => (
            <span key={pill} className="feature-pill text-xs sm:text-sm">
              {pill}
            </span>
          ))}
        </div>
      </section>
    </>
  );
};

export default HeroSection;
