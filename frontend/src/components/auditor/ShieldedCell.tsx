"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShieldedCellProps {
  revealed: boolean;
  shieldedText: string;
  revealedText: string;
  delay?: number;
  className?: string;
  mono?: boolean;
}

export function ShieldedCell({
  revealed,
  shieldedText,
  revealedText,
  delay = 0,
  className,
  mono,
}: ShieldedCellProps) {
  return (
    <motion.span
      className={cn("inline-block relative", className)}
      animate={revealed ? "revealed" : "shielded"}
      initial="shielded"
      variants={{
        shielded: { filter: "blur(0px)" },
        revealed: { filter: "blur(0px)" },
      }}
    >
      {revealed ? (
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
          className={cn(mono && "font-mono")}
        >
          {revealedText}
        </motion.span>
      ) : (
        <span
          className={cn(
            "select-none",
            "bg-gradient-to-r from-white/5 to-white/10 text-transparent bg-clip-text",
            "blur-[6px]",
            mono && "font-mono"
          )}
          aria-hidden
        >
          {shieldedText}
        </span>
      )}
    </motion.span>
  );
}
