"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Unlock, Radio, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NetworkEvent, DemoPhase } from "./types";

interface NetworkPanelProps {
  events: NetworkEvent[];
  phase: DemoPhase;
  revealed: boolean;
}

const EVENT_ICONS: Record<NetworkEvent["type"], typeof ShieldCheck> = {
  proof: ShieldCheck,
  verify: ShieldCheck,
  commit: Lock,
  lock: Lock,
  unlock: Unlock,
  claim: Unlock,
};

const EVENT_COLORS: Record<NetworkEvent["type"], string> = {
  proof: "text-accent-blue bg-accent-blue/10",
  verify: "text-success bg-success/10",
  commit: "text-accent-purple bg-accent-purple/10",
  lock: "text-warning bg-warning/10",
  unlock: "text-success bg-success/10",
  claim: "text-success bg-success/10",
};

export function NetworkPanel({ events, phase, revealed }: NetworkPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  const isActive = phase !== "idle";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-success animate-pulse" : "bg-text-tertiary")} />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">On-Chain</span>
        {isActive && (
          <span className="text-[10px] text-text-tertiary ml-auto">Stellar Testnet</span>
        )}
      </div>

      {/* Events feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1 scrollbar-thin"
      >
        {events.length === 0 && phase === "idle" && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Radio className="w-6 h-6 text-text-tertiary mb-2" />
            <p className="text-xs text-text-tertiary">Waiting for transactions...</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {events.map((event) => {
            const Icon = EVENT_ICONS[event.type];
            const colorClass = EVENT_COLORS[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="px-3 py-2.5 rounded-lg border border-border bg-white/[0.02] space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0", colorClass)}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-text-primary flex-1 truncate">
                    {event.label}
                  </span>
                  <span className="text-[10px] text-text-tertiary tabular-nums shrink-0">
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-text-tertiary pl-7">{event.detail}</p>
                <code className="text-[10px] font-mono text-text-tertiary/60 pl-7 block truncate">
                  tx: {event.txHash.slice(0, 16)}...
                </code>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Reveal state */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="px-3 py-3 rounded-lg border border-accent-purple/30 bg-accent-purple/5 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent-purple" />
              <span className="text-xs font-semibold text-accent-purple">View Key Applied</span>
            </div>
            <p className="text-[11px] text-text-secondary pl-6">
              Full ledger decrypted. Amount: <span className="text-success font-medium">$500.00</span> • Maria S. → Santos Family
            </p>
          </motion.div>
        )}
      </div>

      {/* Redaction notice */}
      {events.length > 0 && !revealed && (
        <div className="mt-2 px-2 py-1.5 rounded bg-white/[0.02] border border-border">
          <p className="text-[10px] text-text-tertiary text-center">
            ████ = shielded by ZK proof • View key required to decrypt
          </p>
        </div>
      )}
    </div>
  );
}
