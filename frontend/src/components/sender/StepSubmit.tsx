"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { StatusStep } from "@/components/ui/StatusStep";
import type { TransactionState } from "./types";

interface StepSubmitProps {
  transaction: TransactionState;
  onSubmit: () => void;
  onComplete: () => void;
}

type TxStep = "building" | "signing" | "submitting" | "complete";

function getStepState(current: TransactionState["status"], target: TxStep) {
  const order: TxStep[] = ["building", "signing", "submitting", "complete"];
  const currentIdx = order.indexOf(current as TxStep);
  const targetIdx = order.indexOf(target);

  if (current === "error") return "error";
  if (currentIdx > targetIdx) return "complete" as const;
  if (currentIdx === targetIdx) return "loading" as const;
  return "pending" as const;
}

export function StepSubmit({ transaction, onSubmit, onComplete }: StepSubmitProps) {
  useEffect(() => {
    if (transaction.status === "idle") {
      onSubmit();
    }
  }, [transaction.status, onSubmit]);

  useEffect(() => {
    if (transaction.status === "complete") {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [transaction.status, onComplete]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Submitting to Stellar</h3>
        <p className="text-sm text-text-secondary mt-1">
          Your proofs are being submitted to the Soroban smart contracts on testnet.
        </p>
      </div>

      <Card variant="elevated">
        <div className="space-y-0">
          <StatusStep
            label="Building transaction"
            description="Encoding proofs and commitments into Soroban call"
            state={getStepState(transaction.status, "building")}
          />
          <StatusStep
            label="Signing with Freighter"
            description="Approve the transaction in your wallet"
            state={getStepState(transaction.status, "signing")}
          />
          <StatusStep
            label="Submitting to testnet"
            description="Broadcasting to Stellar network"
            state={getStepState(transaction.status, "submitting")}
          />
          <StatusStep
            label="Confirmed"
            description="Transaction included in ledger"
            state={getStepState(transaction.status, "complete")}
            isLast
          />
        </div>
      </Card>

      {transaction.status === "error" && (
        <Card variant="outlined" className="border-error/30">
          <p className="text-sm text-error">{transaction.error || "Transaction failed"}</p>
          <button
            onClick={onSubmit}
            className="text-sm text-accent-blue hover:underline mt-2 cursor-pointer"
          >
            Retry submission
          </button>
        </Card>
      )}
    </div>
  );
}
