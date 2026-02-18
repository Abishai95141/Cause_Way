import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/lib/theme";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-[var(--bg-elevated)] border-[var(--border-primary)] text-[var(--text-primary)]",
          description: "text-[var(--text-secondary)]",
        },
      }}
    />
  );
}
