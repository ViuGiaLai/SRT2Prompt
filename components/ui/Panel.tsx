import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("rounded-lg border border-line bg-panel p-5 shadow-sm transition-colors duration-200 ease-out", className)}
      {...props}
    />
  );
}
