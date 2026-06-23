"use client";

import { motion } from "framer-motion";
import { Wallet, Check, Loader2, Search, TreePine, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoPhase } from "./types";

interface ReceiverPanelProps {
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

function getReceiverStatus(phase: DemoPhase, activePhases: DemoPhase[]): "pending" | "active" | "complete" {
  if (activePhases.includes(phase)) return "active";
  const phaseOrder: DemoPhase[] = [
    "idle", "sender-connect", "sender-details", "sender-kyc-proof",
    "sender-amount-proof", "sender-submit", "sender-complete",
    "receiver-connect", "receiver-lookup", "receiver-proof",
    "receiver-claim", "receiver-complete", "reveal-prompt", "reveal-decrypt", "complete",
  ];
  const currentIdx = phaseOrder.indexOf(phase);
  const latestActiveIdx = Math.max(...activePhases.map((a) => phaseOrder.indexOf(a)));
  if (currentIdx > latestActiveIdx) return "complete";
  return "pending";
}

export function ReceiverPanel({ phase, txHash }: ReceiverPanelProps) {
  const receiverStarted = [
    "receiver-connect", "receiver-lookup", "receiver-proof",
    "receiver-claim", "receiver-complete", "reveal-prompt", "reveal-decrypt", "complete",
  ].includes(phase);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-2 h-2 rounded-full", receiverStarted ? "bg-success" : "bg-text-tertiary")} />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Manila</span>
      </div>

      {/* Info */}
      <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border text-[11px] text-text-tertiary space-y-0.5 mb-3">
        <p><span className="text-text-secondary">Receiver:</span> Santos Family</p>
        <p><span className="text-text-secondary">Expecting:</span> $500.00 USDC</p>
        <p><span className="text-text-secondary">Secret:</span> from sender</p>
      </div>

      {!receiverStarted && (
        <div className="flex items-center justify-center py-6">
          <p className="text-xs text-text-tertiary">Waiting for sender...</p>
        </div>
      )}

      {receiverStarted && (
        <>
          <StepCard
            icon={<Wallet className="w-3.5 h-3.5" />}
            label="Connect Wallet"
            status={getReceiverStatus(phase, ["receiver-connect"])}
            detail="Freighter connected"
          />
          <StepCard
            icon={<Search className="w-3.5 h-3.5" />}
            label="Look Up Funds"
            status={getReceiverStatus(phase, ["receiver-lookup"])}
            detail="Commitment found • $500.00"
          />
          <StepCard
            icon={<TreePine className="w-3.5 h-3.5" />}
            label="Withdrawal Proof"
            status={getReceiverStatus(phase, ["receiver-proof"])}
            detail="Merkle inclusion • withdrawal.circom"
          />
          <StepCard
            icon={<Download className="w-3.5 h-3.5" />}
            label="Claim Funds"
            status={getReceiverStatus(phase, ["receiver-claim"])}
            detail={txHash ? `${txHash.slice(0, 8)}...` : "Signing & submitting..."}
          />
        </>
      )}

      {/* Completion */}
      {(phase === "receiver-complete" || phase === "reveal-prompt" || phase === "reveal-decrypt" || phase === "complete") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 px-3 py-2 rounded-lg bg-success/5 border border-success/20 text-center"
        >
          <p className="text-xs font-medium text-success">$500.00 Claimed</p>
        </motion.div>
      )}
    </div>
  );
}
