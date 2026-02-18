import { cn } from "@/product-ui/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("skeleton rounded-md", className)} {...props} />;
}

export { Skeleton };
