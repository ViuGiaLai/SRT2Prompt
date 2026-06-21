"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "success" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-md border font-medium transition",
        variant === "primary" && "border-accent bg-accent text-white hover:bg-accent-strong",
        variant === "secondary" && "border-line bg-panelSoft text-white hover:border-accent",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:bg-panelSoft hover:text-white",
        variant === "success" && "border-success bg-success text-[#06130a] hover:bg-green-400",
        variant === "danger" && "border-danger bg-danger text-white hover:bg-red-500",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        size === "icon" && "h-9 w-9 p-0",
        className
      )}
      {...props}
    />
  );
}
