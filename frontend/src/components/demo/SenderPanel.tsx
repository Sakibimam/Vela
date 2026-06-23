"use client";

import { motion } from "framer-motion";
import { Wallet, Check, Loader2, ShieldCheck, Lock, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoPhase } from "./types";

interface SenderPanelProps {
  phase: DemoPhase;
  txHash: string | null;
}

interface StepCardProps {
  icon: React.ReactNode;
  label: string;
  status: "pending" | "active" | "complete";
  detail?: string;
}

function StepCard({ icon, label, status, detail }: StepCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-300",
        status === "complete" && "border-success/20 bg-success/5",
        status === "active" && "border-accent-blue/30 bg-accent-blue/5",
        status === "pending" && "border-border bg-transparent opacity-40"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          status === "complete" && "bg-success/10 text-success",
          status === "active" && "bg-accent-blue/10 text-accent-blue",
          status === "pending" && "bg-white/5 text-text-tertiary"
        )}
      >
        {status === "active" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : status === "complete" ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-medium", status === "pending" ? "text-text-tertiary" : "text-text-primary")}>
          {label}
        </p>
        {detail && status !== "pending" && (
          <p className="text-[10px] text-text-tertiary truncate">{detail}</p>
        )}
      </div>
    </div>
  );
}

function getStatus(phase: DemoPhase, target: DemoPhase[], activeAt: DemoPhase[]): "pending" | "active" | "complete" {
  if (target.some((t) => phase === t)) return "active";
  const phaseOrder: DemoPhase[] = [
    "idle", "sender-connect", "sender-details", "sender-kyc-proof",
    "sender-amount-proof", "sender-submit", "sender-complete",
    "receiver-connect", "receiver-lookup", "receiver-proof",
    "receiver-claim", "receiver-complete", "reveal-prompt", "reveal-decrypt", "complete",
  ];
  const currentIdx = phaseOrder.indexOf(phase);
  const activeIdx = Math.max(...activeAt.map((a) => phaseOrder.indexOf(a)));
  if (currentIdx > activeIdx) return "complete";
  return "pending";
}

export function SenderPanel({ phase, txHash }: SenderPanelProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-accent-blue" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Dubai</span>
      </div>

      {/* Demo data summary */}
      <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border text-[11px] text-text-tertiary space-y-0.5 mb-3">
        <p><span className="text-text-secondary">Sender:</span> Maria S.</p>
        <p><span className="text-text-secondary">Amount:</span> $500.00 USDC</p>
        <p><span className="text-text-secondary">Corridor:</span> AE → PH</p>
      </div>

      {/* Steps */}
      <StepCard
        icon={<Wallet className="w-3.5 h-3.5" />}
        label="Connect Wallet"
        status={getStatus(phase, ["sender-connect"], ["sender-connect"])}
        detail="Freighter connected"
      />
      <StepCard
        icon={<Send className="w-3.5 h-3.5" />}
        label="Enter Details"
        status={getStatus(phase, ["sender-details"], ["sender-details"])}
        detail="$500 → Manila"
      />
      <StepCard
        icon={<ShieldCheck className="w-3.5 h-3.5" />}
        label="KYC Proof"
        status={getStatus(phase, ["sender-kyc-proof"], ["sender-kyc-proof"])}
        detail="Groth16 • kyc_compliance.circom"
      />
      <StepCard
        icon={<Lock className="w-3.5 h-3.5" />}
        label="Amount Commitment"
        status={getStatus(phase, ["sender-amount-proof"], ["sender-amount-proof"])}
        detail="Poseidon(500, nonce)"
      />
      <StepCard
        icon={<Send className="w-3.5 h-3.5" />}
        label="Submit to Stellar"
        status={getStatus(phase, ["sender-submit"], ["sender-submit"])}
        detail={txHash ? `${txHash.slice(0, 8)}...` : "Broadcasting..."}
      />

      {/* Completion badge */}
      {(phase === "sender-complete" ||
        phase === "receiver-connect" ||
        phase === "receiver-lookup" ||
        phase === "receiver-proof" ||
        phase === "receiver-claim" ||
        phase === "receiver-complete" ||
        phase === "reveal-prompt" ||
        phase === "reveal-decrypt" ||
        phase === "complete") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 px-3 py-2 rounded-lg bg-success/5 border border-success/20 text-center"
        >
          <p className="text-xs font-medium text-success">Payment Sent</p>
        </motion.div>
      )}
    </div>
  );
}
