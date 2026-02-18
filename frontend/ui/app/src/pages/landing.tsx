import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Menu,
  X,
  Network,
  FileText,
  Search,
  Settings,
  BarChart3,
  GitBranch,
  Bell,
  ChevronDown,
  MoreHorizontal,
  CircleDot,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { LaserFlow } from "@/components/shared/laser-flow";

/* --- Cursor-tracking glow button component --- */
function GlowButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
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

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    setHasInteracted(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative z-0 overflow-visible ${className ?? ''}`}
    >
      {/* Inner border glow — follows cursor, persists dimly on leave */}
      <div
        ref={glowRef}
        className="absolute inset-[-2px] rounded-[inherit] pointer-events-none"
        style={{
          opacity: hovered ? 1 : hasInteracted ? 0.45 : 0,
          transition: 'opacity 0.4s ease',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '2px',
          borderRadius: 'inherit',
        }}
      />
      {/* Outer soft glow — follows cursor, persists dimly on leave */}
      <div
        ref={outerRef}
        className="absolute inset-[-8px] rounded-[inherit] pointer-events-none -z-10"
        style={{
          opacity: hovered ? 1 : hasInteracted ? 0.35 : 0,
          transition: 'opacity 0.4s ease',
          filter: 'blur(14px)',
          borderRadius: 'inherit',
        }}
      />
      {children}
    </button>
  );
}

/* --- Animation helpers --- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.15 } },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050510]" style={{ fontFamily: "'Gonero', 'Geist Sans', 'Inter', system-ui, -apple-system, sans-serif" }}>


      {/* ──── Navbar ──── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.03]"
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex h-[60px] items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-orange-500">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[16px] font-bold tracking-tight text-white">
                Causeway
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[13.5px] text-white/60 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#how-it-works" className="text-[13.5px] text-white/60 hover:text-white transition-colors duration-200">
                How it Works
              </a>
              <a href="#capabilities" className="text-[13.5px] text-white/60 hover:text-white transition-colors duration-200">
                Capabilities
              </a>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app")}
                className="hidden sm:flex items-center px-5 h-[34px] rounded-lg border border-white/[0.14] text-[12px] font-semibold text-white/70 hover:text-white hover:border-white/[0.3] transition-all duration-200 uppercase tracking-wider"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/app")}
                className="flex items-center px-5 h-[34px] rounded-lg bg-white text-[12px] font-bold text-[#050510] hover:bg-white/90 transition-all duration-200 uppercase tracking-wider"
              >
                Sign Up
              </button>
              <button
                onClick={() => setMobileNav(!mobileNav)}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/[0.06] bg-[#050510]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                <a href="#features" onClick={() => setMobileNav(false)} className="block text-[13px] text-white/50 hover:text-white transition-colors py-2">Features</a>
                <a href="#how-it-works" onClick={() => setMobileNav(false)} className="block text-[13px] text-white/50 hover:text-white transition-colors py-2">How it Works</a>
                <a href="#capabilities" onClick={() => setMobileNav(false)} className="block text-[13px] text-white/50 hover:text-white transition-colors py-2">Capabilities</a>
                <button onClick={() => { navigate("/app"); setMobileNav(false); }} className="block w-full text-left text-[13px] text-blue-400 font-medium py-2">Launch App &rarr;</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ──── Hero Section ──── */}
      <section className="relative overflow-hidden">
        {/* LaserFlow — beam flows naturally downward from top into the product image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LaserFlow
            horizontalBeamOffset={0.0}
            verticalBeamOffset={-0.08}
            color="#FF8C42"
            horizontalSizing={0.1}
            verticalSizing={2.2}
            wispDensity={0.9}
            wispSpeed={13}
            wispIntensity={4.5}
            flowSpeed={0.22}
            flowStrength={0.12}
            fogIntensity={0.4}
            fogScale={0.18}
            fogFallSpeed={0.35}
            decay={0.82}
            falloffStart={1.7}
          />
        </div>

        {/* Gradient overlays — heavier on top so text is readable, lighter on bottom so beam meets product */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050510] to-transparent z-[2] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#050510] via-[#050510]/30 to-transparent z-[2] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
          {/* Hero text — LEFT ALIGNED like Huly */}
          <div className="pt-32 sm:pt-40 pb-10 sm:pb-14 max-w-4xl">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              {/* Main heading — very large, bold, white, left-aligned */}
              <motion.h1
                variants={fadeUp}
                className="text-[clamp(3rem,7vw,5.5rem)] font-black leading-[1.05] tracking-[-0.035em] text-white"
              >
                Decision
                <br />
                Intelligence
                <br />
                <span className="text-white/90">for your teams</span>
              </motion.h1>

              {/* Subtitle — left-aligned, muted, smaller */}
              <motion.p
                variants={fadeUp}
                className="max-w-lg mt-6 text-[15px] sm:text-[16px] text-white/40 leading-[1.6] font-normal"
              >
                Causeway extracts causal relationships from your documents,
                builds world models, and delivers evidence-backed decisions
                with full transparency.
              </motion.p>

              {/* CTA button — pill with animated orange glow border */}
              <motion.div variants={fadeUp} className="mt-8">
                <GlowButton
                  onClick={() => navigate("/app")}
                  className="inline-flex items-center gap-2.5 px-7 h-12 rounded-full bg-[#0a0a18] border border-white/[0.06] text-[13px] font-semibold text-white uppercase tracking-[0.08em] transition-all duration-200 hover:bg-[#0e0e20] cursor-pointer"
                >
                  See in Action
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </GlowButton>
              </motion.div>
            </motion.div>
          </div>

          {/* Product preview — large dark mockup, slightly tilted perspective like Huly */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative pb-6 sm:pb-12"
          >
            {/* ── Light overflow — beam wraps and flows around product edges ── */}
            {/* Top spread: narrow beam fans outward as it reaches the product */}
            <div
              className="absolute -top-40 left-1/2 -translate-x-1/2 w-[50%] h-[300px] pointer-events-none z-[1]"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,140,66,0.13) 0%, rgba(255,140,66,0.03) 55%, transparent 80%)',
                filter: 'blur(35px)',
              }}
            />
            {/* Left side overflow glow — light wraps around left edge */}
            <div
              className="absolute -top-2 -left-5 w-20 h-[50%] pointer-events-none z-[1]"
              style={{
                background: 'radial-gradient(ellipse 90% 40% at 100% 12%, rgba(255,140,66,0.07) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            {/* Right side overflow glow — light wraps around right edge */}
            <div
              className="absolute -top-2 -right-5 w-20 h-[50%] pointer-events-none z-[1]"
              style={{
                background: 'radial-gradient(ellipse 90% 40% at 0% 12%, rgba(255,140,66,0.07) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            {/* Top edge highlight — bright line where beam meets the product border */}
            <div
              className="absolute top-0 left-[8%] right-[8%] h-[2px] pointer-events-none z-[5]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,140,66,0.3) 15%, rgba(255,180,100,0.55) 50%, rgba(255,140,66,0.3) 85%, transparent 100%)',
                filter: 'blur(0.5px)',
                boxShadow: '0 0 12px rgba(255,140,66,0.2), 0 0 35px rgba(255,140,66,0.07)',
                transform: 'perspective(2400px) rotateX(1.5deg)',
                transformOrigin: 'center bottom',
              }}
            />
            {/* Bottom corner glow — light leaking under product edges */}
            <div
              className="absolute bottom-[5%] -left-3 w-16 h-[30%] pointer-events-none z-[1]"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 100% 60%, rgba(255,140,66,0.04) 0%, transparent 70%)',
                filter: 'blur(18px)',
              }}
            />
            <div
              className="absolute bottom-[5%] -right-3 w-16 h-[30%] pointer-events-none z-[1]"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 0% 60%, rgba(255,140,66,0.04) 0%, transparent 70%)',
                filter: 'blur(18px)',
              }}
            />
            <div
              className="relative rounded-xl overflow-hidden border border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_60px_rgba(255,140,66,0.08)]"
              style={{
                transform: "perspective(2400px) rotateX(1.5deg)",
                transformOrigin: "center bottom",
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d1a] border-b border-white/[0.04]">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-5 py-1 rounded-md bg-white/[0.04] text-[10px] text-white/20 font-mono tracking-wide">
                    causeway.app/dashboard
                  </div>
                </div>
              </div>
              {/* ── Mock App UI ── */}
              <div className="flex bg-[#0c0c18] text-white" style={{ fontSize: '10px', height: 'clamp(260px, 38vw, 480px)' }}>
                {/* ── Left Sidebar ── */}
                <div className="hidden sm:flex flex-col w-[180px] shrink-0 border-r border-white/[0.04] bg-[#08080f]">
                  {/* Sidebar header */}
                  <div className="flex items-center gap-2 px-3 py-3 border-b border-white/[0.04]">
                    <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-semibold text-white/90 text-[11px]">Causeway</span>
                    <ChevronDown className="w-3 h-3 text-white/25 ml-auto" />
                  </div>
                  {/* Nav items */}
                  <div className="flex-1 py-2 px-2 space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.06] text-white/80">
                      <Network className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] font-medium">World Models</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35 hover:text-white/50">
                      <FileText className="w-3 h-3" />
                      <span className="text-[10px]">Documents</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <Search className="w-3 h-3" />
                      <span className="text-[10px]">Evidence</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <GitBranch className="w-3 h-3" />
                      <span className="text-[10px]">Causal Edges</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <BarChart3 className="w-3 h-3" />
                      <span className="text-[10px]">Decisions</span>
                    </div>
                    {/* Separator */}
                    <div className="!my-2 border-t border-white/[0.04]" />
                    <div className="px-2 py-1 text-[9px] font-semibold text-white/20 uppercase tracking-wider">Your Models</div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <div className="w-2 h-2 rounded-sm bg-emerald-500/70" />
                      <span className="text-[10px]">Supply Chain</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <div className="w-2 h-2 rounded-sm bg-violet-500/70" />
                      <span className="text-[10px]">Climate Risk</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <div className="w-2 h-2 rounded-sm bg-amber-500/70" />
                      <span className="text-[10px]">Market Dynamics</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded text-white/35">
                      <div className="w-2 h-2 rounded-sm bg-rose-500/70" />
                      <span className="text-[10px]">Policy Impact</span>
                    </div>
                  </div>
                  {/* Sidebar footer */}
                  <div className="px-3 py-2.5 border-t border-white/[0.04] flex items-center gap-2">
                    <Settings className="w-3 h-3 text-white/25" />
                    <span className="text-[10px] text-white/25">Settings</span>
                  </div>
                </div>

                {/* ── Main Content Area: Kanban Board ── */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold text-white/90">Causal Edges</span>
                      <span className="text-[10px] text-white/25 border border-white/[0.06] px-1.5 py-0.5 rounded">Supply Chain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-[#0c0c18]" />
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border border-[#0c0c18]" />
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-[#0c0c18]" />
                      </div>
                      <div className="h-4 w-px bg-white/[0.06]" />
                      <Bell className="w-3 h-3 text-white/25" />
                      <MoreHorizontal className="w-3 h-3 text-white/25" />
                    </div>
                  </div>
                  {/* Kanban columns */}
                  <div className="flex-1 flex gap-3 p-3 overflow-hidden">
                    {/* DISCOVERED column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <CircleDot className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Discovered</span>
                        <span className="text-[9px] text-white/20 ml-auto">4</span>
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        {/* Card 1 */}
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Port congestion → shipping delay increases by 3.2 days</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-blue-500/15 text-blue-300">logistics</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-amber-500/15 text-amber-300">high-conf</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-1">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 border border-[#0c0c18]" />
                            </div>
                            <span className="text-[8px] text-white/20">2h ago</span>
                          </div>
                        </div>
                        {/* Card 2 */}
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Raw material shortage → production cost +18%</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-violet-500/15 text-violet-300">cost</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-1">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border border-[#0c0c18]" />
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-[#0c0c18]" />
                            </div>
                            <span className="text-[8px] text-white/20">5h ago</span>
                          </div>
                        </div>
                        {/* Card 3 - partial */}
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Supplier diversification → risk reduction 40%</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-500/15 text-emerald-300">strategy</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* REVIEWING column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Reviewing</span>
                        <span className="text-[9px] text-white/20 ml-auto">3</span>
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Demand forecast error → inventory surplus $2.1M</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-rose-500/15 text-rose-300">finance</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-amber-500/15 text-amber-300">conflict</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-[#0c0c18]" />
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400/60" />
                              <span className="text-[8px] text-amber-300/50">1 conflict</span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Tariff policy → regional sourcing shift</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-blue-500/15 text-blue-300">policy</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-1">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border border-[#0c0c18]" />
                            </div>
                            <span className="text-[8px] text-white/20">1d ago</span>
                          </div>
                        </div>
                        {/* Floating overlay card — like Huly's popup card */}
                        <div className="rounded-lg bg-[#12122a] border border-white/[0.08] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-semibold text-white/80">Confidence: 87%</span>
                          </div>
                          <p className="text-[9px] text-white/40 leading-snug mb-2">Evidence from 3 sources. Awaiting domain expert review.</p>
                          <div className="flex gap-1.5">
                            <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VALIDATED column */}
                    <div className="hidden md:flex flex-1 min-w-0 flex-col">
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Validated</span>
                        <span className="text-[9px] text-white/20 ml-auto">6</span>
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Fuel price spike → last-mile delivery cost +22%</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-500/15 text-emerald-300">validated</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 border border-[#0c0c18]" />
                            <span className="text-[8px] text-white/20">3d ago</span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                          <p className="text-[10px] text-white/70 font-medium leading-snug mb-2">Warehouse automation → order processing -65% time</p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-500/15 text-emerald-300">validated</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-blue-500/15 text-blue-300">ops</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right Panel: Activity / Inbox ── */}
                <div className="hidden lg:flex flex-col w-[200px] shrink-0 border-l border-white/[0.04] bg-[#0a0a14]">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04]">
                    <span className="text-[11px] font-bold text-white/80">Inbox</span>
                    <span className="text-[9px] text-blue-400 font-medium">3 new</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {/* Activity items */}
                    {[
                      { name: "Sarah Chen", action: "approved edge", detail: "Fuel → Delivery Cost", time: "2m", colors: "from-blue-400 to-blue-600" },
                      { name: "James Liu", action: "flagged conflict in", detail: "Demand Forecast Model", time: "15m", colors: "from-emerald-400 to-emerald-600" },
                      { name: "Priya Patel", action: "uploaded 3 docs to", detail: "Climate Risk", time: "1h", colors: "from-violet-400 to-violet-600" },
                      { name: "Alex Torres", action: "ran decision query", detail: "Supplier Selection", time: "2h", colors: "from-amber-400 to-amber-600" },
                      { name: "Mika Tanaka", action: "validated 4 edges in", detail: "Market Dynamics", time: "4h", colors: "from-rose-400 to-rose-600" },
                      { name: "Omar Hassan", action: "changed status", detail: "Edge #2847 → In Progress", time: "5h", colors: "from-cyan-400 to-cyan-600" },
                    ].map((item, i) => (
                      <div key={i} className={`flex gap-2.5 px-3 py-2.5 ${i === 0 ? 'bg-white/[0.03]' : ''} border-b border-white/[0.03] hover:bg-white/[0.02]`}>
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.colors} shrink-0 mt-0.5`} />
                        <div className="min-w-0">
                          <p className="text-[9px] text-white/60 leading-snug">
                            <span className="font-semibold text-white/80">{item.name}</span>{" "}
                            {item.action}{" "}
                            <span className="text-white/50">{item.detail}</span>
                          </p>
                          <span className="text-[8px] text-white/20 mt-0.5 block">{item.time} ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom feature strip — like Huly's "Everything you need..." */}
        <div className="relative z-10 border-t border-white/[0.04] bg-[#050510]/80 backdrop-blur-sm">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-5">
            <p className="text-[13px] text-white/25 mb-4 font-normal">
              Everything you need for causal decision-making:
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {[
                "Causal Discovery",
                "Evidence Triangulation",
                "World Models",
                "Decision Support",
                "Human-in-the-Loop",
                "Audit Trails",
              ].map((item, i) => (
                <span key={item} className="flex items-center">
                  <span className="text-[13px] text-white/60 font-medium">{item}</span>
                  {i < 5 && <span className="text-white/15 mx-2">·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── Features ──── */}
      <section id="features" className="relative py-28 sm:py-36 bg-[#050510]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-[12px] font-semibold text-orange-400 uppercase tracking-[0.2em] mb-4">
              Features
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-[-0.02em] text-white leading-[1.1]">
              Everything you need
              <br />
              <span className="text-white/30">for causal intelligence</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              {
                title: "Causal Discovery",
                desc: "Automatically extract cause-effect relationships from your documents using LLMs and evidence triangulation.",
                color: "bg-orange-500/10 border-orange-500/20",
                dot: "bg-orange-400",
              },
              {
                title: "Evidence-Backed",
                desc: "Every relationship traced to source documents with confidence scoring and contradiction detection.",
                color: "bg-violet-500/10 border-violet-500/20",
                dot: "bg-violet-400",
              },
              {
                title: "Decision Intelligence",
                desc: "Ask natural language questions and receive recommendations with full causal reasoning paths.",
                color: "bg-amber-500/10 border-amber-500/20",
                dot: "bg-amber-400",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-7 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${f.dot}`} />
                  <h3 className="text-[15px] font-bold text-white tracking-tight">{f.title}</h3>
                </div>
                <p className="text-[14px] text-white/35 leading-[1.65]">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──── How it Works ──── */}
      <section id="how-it-works" className="relative py-28 sm:py-36 border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-[12px] font-semibold text-orange-400 uppercase tracking-[0.2em] mb-4">
              How it Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-[-0.02em] text-white leading-[1.1]">
              From documents
              <br />
              <span className="text-white/30">to decisions</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { step: "01", title: "Upload Documents", desc: "Ingest reports, research papers, and data sources into the pipeline." },
              { step: "02", title: "Build World Models", desc: "AI extracts causal relationships and constructs a knowledge graph." },
              { step: "03", title: "Review & Approve", desc: "Human-in-the-loop workflow for validating discovered causal edges." },
              { step: "04", title: "Make Decisions", desc: "Query the model in natural language, get evidence-backed answers." },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
              >
                <span className="inline-block text-[11px] font-mono font-bold text-orange-400 mb-4 px-2 py-0.5 rounded bg-orange-400/10">
                  {item.step}
                </span>
                <h3 className="text-[15px] font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-white/30 leading-[1.6]">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──── Bottom CTA ──── */}
      <section id="capabilities" className="relative py-28 sm:py-36 border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-[-0.02em] text-white leading-[1.1] mb-5">
              Start building your
              <br />
              <span className="text-white/30">causal world model</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[16px] text-white/35 leading-[1.6] mb-9 max-w-lg">
              No setup required — jump straight into the platform and make
              your first evidence-backed decision in minutes.
            </motion.p>
            <motion.div variants={fadeUp}>
              <GlowButton
                onClick={() => navigate("/app")}
                className="inline-flex items-center gap-2.5 px-7 h-12 rounded-full bg-[#0a0a18] border border-white/[0.06] text-[13px] font-semibold text-white uppercase tracking-[0.08em] transition-all duration-200 hover:bg-[#0e0e20] cursor-pointer"
              >
                Launch Platform
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </GlowButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-orange-500">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-[13px] font-bold text-white">Causeway</span>
              <span className="text-[11px] text-white/15 hidden sm:inline ml-1">Decision Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="#features" className="text-[11px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-wider">Features</a>
              <a href="#how-it-works" className="text-[11px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-wider">How it Works</a>
              <span className="text-[11px] text-white/10">&copy; 2026 Causeway</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
