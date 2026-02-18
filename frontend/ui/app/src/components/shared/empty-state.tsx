import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center", className)}>
      {icon && (
        <div className="mb-6 text-[var(--text-tertiary)] opacity-60">
          {icon}
        </div>
      )}
      <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[14px] text-[var(--text-secondary)] max-w-md mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
