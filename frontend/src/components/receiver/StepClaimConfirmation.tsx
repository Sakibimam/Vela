"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusStep } from "@/components/ui/StatusStep";
import { TransactionHash } from "@/components/ui/TransactionHash";
import type { ClaimTxState, ClaimData } from "./types";

interface StepClaimConfirmationProps {
  claimData: ClaimData;
  claimTx: ClaimTxState;
  onSubmit: () => void;
  onReset: () => void;
}

type TxStep = "building" | "signing" | "submitting" | "complete";

function getStepState(current: ClaimTxState["status"], target: TxStep) {
  const order: TxStep[] = ["building", "signing", "submitting", "complete"];
  const currentIdx = order.indexOf(current as TxStep);
  const targetIdx = order.indexOf(target);

  if (current === "error") return "error" as const;
  if (currentIdx > targetIdx) return "complete" as const;
  if (currentIdx === targetIdx) return "loading" as const;
  return "pending" as const;
}

export function StepClaimConfirmation({
  claimData,
  claimTx,
  onSubmit,
  onReset,
}: StepClaimConfirmationProps) {
  useEffect(() => {
    if (claimTx.status === "idle") {
      onSubmit();
    }
  }, [claimTx.status, onSubmit]);

  if (claimTx.status === "complete" && claimTx.hash) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Success header */}
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto"
          >
            <Check className="w-8 h-8 text-success" />
          </motion.div>
          <h3 className="text-xl font-bold text-text-primary mt-4">
            Funds Claimed Successfully
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            ${claimData.amount} USDC received to your wallet
          </p>
        </div>

        {/* Transaction Details */}
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Transaction</span>
            <TransactionHash hash={claimTx.hash} isNew />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Amount Received</span>
            <span className="text-lg font-bold text-success">${claimData.amount} USDC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Corridor</span>
            <Badge variant="info">{claimData.corridor}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Privacy</span>
            <Badge variant="success">Zero-knowledge verified</Badge>
          </div>
        </Card>

        {/* Privacy note */}
        <Card variant="outlined" className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent-purple shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            The sender&apos;s identity remains private. The amount was revealed only to you.
            Regulators can reconstruct this transaction only with the corridor view key.
          </p>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${claimTx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="secondary" size="md" className="w-full">
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </Button>
          </a>
          <Button variant="ghost" size="md" className="flex-1" onClick={onReset}>
            Claim Another
          </Button>
        </div>
      </motion.div>
    );
  }

  // Transaction in progress
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Claiming Funds</h3>
        <p className="text-sm text-text-secondary mt-1">
          Submitting your withdrawal proof to release the funds.
        </p>
      </div>

      <Card variant="elevated">
        <StatusStep
          label="Building transaction"
          description="Encoding withdrawal proof into Soroban call"
          state={getStepState(claimTx.status, "building")}
        />
        <StatusStep
          label="Signing with Freighter"
          description="Approve the claim in your wallet"
          state={getStepState(claimTx.status, "signing")}
        />
        <StatusStep
          label="Submitting to testnet"
          description="Broadcasting withdrawal to Stellar"
          state={getStepState(claimTx.status, "submitting")}
        />
        <StatusStep
          label="Funds released"
          description="USDC sent to your wallet"
          state={getStepState(claimTx.status, "complete")}
          isLast
        />
      </Card>

      {claimTx.status === "error" && (
        <Card variant="outlined" className="border-error/30">
          <p className="text-sm text-error">{claimTx.error || "Claim failed"}</p>
          <button
            onClick={onSubmit}
            className="text-sm text-accent-blue hover:underline mt-2 cursor-pointer"
          >
            Retry
          </button>
        </Card>
      )}
    </div>
  );
}
