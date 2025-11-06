// components/ui/progress.tsx
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-zinc-900 transition-all dark:bg-zinc-50"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
        }}
      />
    </div>
  );
}
