import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "outlined" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "glass rounded-[var(--radius-card)] transition-all duration-300",
  elevated: [
    "glass-strong rounded-[var(--radius-card)]",
    "shadow-[0_8px_32px_rgb(0_0_0/0.3),inset_0_1px_0_rgb(255_255_255/0.05)]",
    "transition-all duration-300",
  ].join(" "),
  outlined: [
    "bg-transparent border border-border-strong rounded-[var(--radius-card)]",
    "transition-all duration-300 hover:border-white/15",
  ].join(" "),
  interactive: [
    "glass rounded-[var(--radius-card)] transition-all duration-300",
    "hover:bg-white/[0.06] hover:border-white/12",
    "hover:shadow-[0_8px_24px_rgb(0_0_0/0.2)]",
    "hover:translate-y-[-1px]",
  ].join(" "),
};

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div className={cn(variantStyles[variant], "p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-text-primary", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-text-secondary mt-1", className)} {...props}>
      {children}
    </p>
  );
}
