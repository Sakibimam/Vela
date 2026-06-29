"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "relative overflow-hidden",
    "bg-gradient-to-r from-accent-blue to-accent-indigo",
    "text-white font-semibold",
    "shadow-[0_2px_12px_rgb(99_102_241/0.3),inset_0_1px_0_rgb(255_255_255/0.15)]",
    "hover:shadow-[0_4px_20px_rgb(99_102_241/0.4),inset_0_1px_0_rgb(255_255_255/0.2)]",
    "hover:brightness-110 active:brightness-95 active:scale-[0.98]",
  ].join(" "),
  secondary: [
    "bg-white/[0.04] border border-white/10 text-text-primary",
    "hover:bg-white/[0.08] hover:border-white/16",
    "active:bg-white/[0.06] active:scale-[0.98]",
  ].join(" "),
  ghost: [
    "bg-transparent text-text-secondary",
    "hover:text-text-primary hover:bg-white/[0.06]",
    "active:bg-white/[0.04]",
  ].join(" "),
  danger: [
    "bg-error/8 text-error border border-error/15",
    "hover:bg-error/15 hover:border-error/25",
    "active:bg-error/10 active:scale-[0.98]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-[13px] gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-[15px] gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "rounded-[var(--radius-button)] cursor-pointer",
          "transition-all duration-150 ease-out",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue/60",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
