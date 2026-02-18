import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Network,
  Compass,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  Menu,
  X,
  GitBranch,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/product-ui/lib/theme";
import { useHealth, useProtocolStatus } from "@/product-ui/api/hooks";
import { cn } from "@/product-ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/product-ui/components/ui/tooltip";
import { Badge } from "@/product-ui/components/ui/badge";
import { Toaster } from "@/product-ui/components/ui/toaster";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Documents", href: "/app/documents", icon: FileText },
  { name: "World Model", href: "/app/builder", icon: Network },
  { name: "Explorer", href: "/app/explorer", icon: Compass },
  { name: "Decisions", href: "/app/decisions", icon: MessageSquare },
  { name: "Bridges", href: "/app/bridges", icon: GitBranch },
  { name: "Approvals", href: "/app/approval", icon: ShieldCheck },
  { name: "Settings", href: "/app/settings", icon: Settings },
  { name: "Admin", href: "/app/admin", icon: Shield },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const { data: protocol } = useProtocolStatus();
  const location = useLocation();

  const isOnline = health?.status === "ok" || health?.status === "healthy";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex flex-row items-center gap-3 px-5 h-16 shrink-0 overflow-hidden">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shrink-0">
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        {(!collapsed || mobileOpen) && (
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] font-bold tracking-tight text-[var(--sidebar-text)] whitespace-nowrap">Causeway</span>
            <span className="text-[11px] text-[var(--sidebar-text-faint)] font-medium tracking-wide whitespace-nowrap">Decision Intelligence</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.href}
                end={item.href === "/app"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex flex-row items-center gap-3 px-3 h-11 rounded-lg text-[15px] font-medium transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                    isActive
                      ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text)]"
                      : "text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)]"
                  )
                }
              >
                {({ isActive }) => (
                  <div className="flex flex-row items-center gap-3 w-full">
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-[var(--sidebar-active-indicator)]")} />
                    {(!collapsed || mobileOpen) && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>
                )}
              </NavLink>
            </TooltipTrigger>
            {collapsed && !mobileOpen && (
              <TooltipContent side="right" className="font-medium">{item.name}</TooltipContent>
            )}
          </Tooltip>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[var(--sidebar-border)] space-y-0.5 shrink-0">
        {/* System Status */}
        <div className={cn("flex flex-row items-center gap-3 px-3 h-9", collapsed && !mobileOpen && "justify-center")}>
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isOnline ? "bg-emerald-400 animate-pulse-subtle shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
          )} />
          {(!collapsed || mobileOpen) && (
            <span className="text-[13px] text-[var(--sidebar-text-faint)] font-medium">
              {isOnline ? "System Online" : "Offline"}
            </span>
          )}
        </div>

        {/* Protocol Status */}
        {protocol?.state && (!collapsed || mobileOpen) && (
          <div className="flex flex-row items-center gap-3 px-3 h-8">
            <Activity className="w-3.5 h-3.5 text-[var(--sidebar-text-faint)]" />
            <Badge variant={protocol.state === "idle" ? "secondary" : "default"} className="text-[10px]">
              {protocol.state.replace(/_/g, " ")}
            </Badge>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex flex-row items-center gap-3 w-full px-3 h-11 rounded-lg text-[15px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] transition-all duration-200",
            collapsed && !mobileOpen && "justify-center"
          )}
        >
          {resolvedTheme === "dark" ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
          {(!collapsed || mobileOpen) && <span className="font-medium">{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Collapse Toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex flex-row items-center gap-3 w-full px-3 h-11 rounded-lg text-[15px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] transition-all duration-200 justify-center lg:justify-start"
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
        {/* ─── Mobile Header ─── */}
        <div className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-[var(--sidebar-bg)] backdrop-blur-xl border-b border-[var(--sidebar-border)] z-40 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14px] font-bold text-[var(--sidebar-text)]">Causeway</span>
            </div>
          </div>
          <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-400" : "bg-red-400")} />
        </div>

        {/* ─── Mobile Overlay ─── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* ─── Mobile Sidebar ─── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] shadow-[2px_0_40px_rgba(0,0,0,0.3)] z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── Desktop Sidebar ─── */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 68 : 260 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex relative flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] overflow-hidden shrink-0 z-30"
        >
          <SidebarContent />
        </motion.aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
          <div className="flex-1 overflow-y-auto">
            <div className="container-full px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <Toaster />
    </TooltipProvider>
  );
}
