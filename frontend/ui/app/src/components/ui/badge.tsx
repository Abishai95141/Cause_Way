import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-accent-500)]/10 text-[var(--color-accent-500)] dark:bg-[var(--color-accent-400)]/15 dark:text-[var(--color-accent-400)]",
        success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
        error: "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
        info: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
        secondary: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
        outline: "border border-[var(--border-primary)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
