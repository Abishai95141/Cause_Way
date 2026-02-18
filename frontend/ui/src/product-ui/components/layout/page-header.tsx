import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">{title}</h1>
        <p className="mt-2 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-xl">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </motion.div>
  );
}
