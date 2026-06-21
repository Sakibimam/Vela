"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { StatusStep } from "@/components/ui/StatusStep";
import type { TransactionState } from "./types";

interface StepSubmitProps {
  transaction: TransactionState;
  onSubmit: () => void;
  onComplete: () => void;
  onBackToProofs: () => void;
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

function isNullifierError(error: string | null): boolean {
  if (!error) return false;
  return (
    error.includes("NULLIFIER_ALREADY_USED") ||
    error.includes("Error(Contract, #8)") ||
    error.includes("NullifierAlreadyUsed")
  );
}

export function StepSubmit({ transaction, onSubmit, onComplete, onBackToProofs }: StepSubmitProps) {
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

  // Auto-navigate back to proofs on nullifier error after 3 seconds
  useEffect(() => {
    if (transaction.status === "error" && isNullifierError(transaction.error)) {
      const timer = setTimeout(onBackToProofs, 3000);
      return () => clearTimeout(timer);
    }
  }, [transaction.status, transaction.error, onBackToProofs]);

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
          <p className="text-sm text-error">
            {isNullifierError(transaction.error)
              ? "These proofs were already used in a previous transaction."
              : transaction.error || "Transaction failed"}
          </p>
          {isNullifierError(transaction.error) ? (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-text-secondary">
                Redirecting to Step 2 to generate fresh proofs...
              </p>
              <button
                onClick={onBackToProofs}
                className="text-sm text-accent-blue hover:underline cursor-pointer"
              >
                Go back now
              </button>
            </div>
          ) : (
            <p className="text-xs text-text-secondary mt-2">
              Transaction failed. Go back to Step 2 to generate fresh proofs and try again.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
