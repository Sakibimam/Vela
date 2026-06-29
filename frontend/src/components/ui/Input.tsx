"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, prefix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-text-secondary tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {prefix && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-medium">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white/[0.03] border border-white/8 text-text-primary placeholder:text-text-tertiary/60",
              "rounded-[var(--radius-input)] px-3.5 py-2.5 text-sm",
              "transition-all duration-200",
              "focus:outline-none focus:bg-white/[0.05] focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20",
              "group-hover:border-white/12",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-error/40 focus:border-error/60 focus:ring-error/20",
              prefix && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error/90 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
