import { cn } from "@/shared/lib/css";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-active animate-pulse rounded-md", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
