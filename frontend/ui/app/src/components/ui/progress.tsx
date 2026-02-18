import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full rounded-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-accent-400)] transition-all duration-500 ease-out shadow-[var(--shadow-glow)]",
        indicatorClassName
      )}
      style={{ width: `${value || 0}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
