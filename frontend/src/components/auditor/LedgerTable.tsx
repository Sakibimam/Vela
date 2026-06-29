"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShieldedCell } from "./ShieldedCell";
import { MOCK_TRANSACTIONS } from "./mockData";

interface LedgerTableProps {
  revealed: boolean;
  revealedRows: number;
}

export function LedgerTable({ revealed, revealedRows }: LedgerTableProps) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.01]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">#</th>
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">Commitment</th>
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">Corridor</th>
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">Timestamp</th>
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">Amount</th>
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">Sender</th>
            <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.1em]">Receiver</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_TRANSACTIONS.map((tx, idx) => {
            const isRevealed = revealed && idx < revealedRows;
            const rowDelay = idx * 0.08;

            return (
              <motion.tr
                key={tx.id}
                className={cn(
                  "border-b border-white/[0.04] transition-colors duration-500",
                  isRevealed ? "bg-accent-blue/[0.02]" : "bg-transparent",
                  "hover:bg-white/[0.02]"
                )}
                animate={isRevealed ? { backgroundColor: "rgba(59, 130, 246, 0.02)" } : {}}
              >
                <td className="px-4 py-3 text-text-tertiary font-mono text-[11px]">
                  {tx.id}
                </td>
                <td className="px-4 py-3">
                  <code className="text-[11px] font-mono text-text-secondary">
                    {tx.commitment.slice(0, 10)}...
                  </code>
                </td>
                <td className="px-4 py-3">
                  <ShieldedCell
                    revealed={isRevealed}
                    shieldedText="██████"
                    revealedText={tx.corridor}
                    delay={rowDelay}
                    className="text-xs font-medium"
                  />
                </td>
                <td className="px-4 py-3 text-[11px] text-text-secondary font-mono tabular-nums">
                  {tx.timestamp}
                </td>
                <td className="px-4 py-3">
                  {isRevealed ? (
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(8px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: rowDelay + 0.1, ease: "easeOut" }}
                      className="text-xs font-semibold text-success tabular-nums"
                    >
                      {tx.amount}
                    </motion.span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary">
                      <Lock className="w-3 h-3" />
                      <span className="font-mono">SHIELDED</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isRevealed ? (
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(8px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: rowDelay + 0.15, ease: "easeOut" }}
                      className="text-xs text-text-primary"
                    >
                      {tx.sender}
                    </motion.span>
                  ) : (
                    <span className="text-[11px] font-mono text-text-tertiary">PRIVATE</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isRevealed ? (
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(8px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: rowDelay + 0.2, ease: "easeOut" }}
                      className="text-xs text-text-primary"
                    >
                      {tx.receiver}
                    </motion.span>
                  ) : (
                    <span className="text-[11px] font-mono text-text-tertiary">PRIVATE</span>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
