import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/product-ui/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[var(--color-accent-500)] to-[var(--color-accent-600)] text-white shadow-[var(--shadow-button)] hover:from-[var(--color-accent-400)] hover:to-[var(--color-accent-500)] hover:shadow-lg",
        secondary:
          "bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-input)] hover:shadow-[var(--shadow-md)]",
        outline:
          "border border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-xs)] hover:bg-[var(--bg-tertiary)] hover:shadow-[var(--shadow-sm)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
        destructive:
          "bg-gradient-to-b from-[var(--color-error)] to-red-600 text-white shadow-sm hover:from-red-500 hover:to-red-600",
        success:
          "bg-gradient-to-b from-[var(--color-success)] to-emerald-600 text-white shadow-sm hover:from-emerald-400 hover:to-emerald-500",
        link: "text-[var(--color-accent-500)] underline-offset-4 hover:underline p-0 h-auto font-medium",
        glass:
          "glass glass-border text-[var(--text-primary)] hover:bg-[var(--bg-glass-thick)]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-5",
        lg: "h-11 px-6 text-[15px]",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
