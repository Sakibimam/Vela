"use client";

import { useEffect } from "react";
import { ShieldCheck, TreePine, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProofProgress } from "@/components/ui/ProofProgress";
import type { WithdrawalProofState, ClaimData } from "./types";

interface StepWithdrawalProofProps {
  claimData: ClaimData;
  withdrawalProof: WithdrawalProofState;
  onGenerate: () => void;
  onContinue: () => void;
}

export function StepWithdrawalProof({
  claimData,
  withdrawalProof,
  onGenerate,
  onContinue,
}: StepWithdrawalProofProps) {
  useEffect(() => {
    if (withdrawalProof.status === "idle") {
      onGenerate();
    }
  }, [withdrawalProof.status, onGenerate]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Withdrawal Proof</h3>
        <p className="text-sm text-text-secondary mt-1">
          Proving your right to claim without revealing which commitment is yours.
        </p>
      </div>

      {/* Proof Generation */}
      <Card variant="outlined" className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <TreePine className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-text-primary">Merkle Withdrawal Proof</span>
          <code className="text-xs text-text-tertiary ml-auto">withdrawal.circom</code>
        </div>

        {withdrawalProof.status === "generating" && (
          <ProofProgress
            active
            label="Withdrawal Proof"
            estimatedMs={6000}
          />
        )}

        {withdrawalProof.status === "complete" && withdrawalProof.hash && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/5 border border-success/20">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-success">Withdrawal proof generated</p>
              <code className="text-xs font-mono text-text-tertiary truncate block">
                {withdrawalProof.hash.slice(0, 16)}...{withdrawalProof.hash.slice(-16)}
              </code>
            </div>
          </div>
        )}
      </Card>

      {/* What the proof proves */}
      {withdrawalProof.status === "complete" && (
        <Card variant="elevated" className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-text-secondary" />
            What this proof guarantees:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
              <span className="text-text-secondary">
                You know the secret for a valid commitment in the pool
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
              <span className="text-text-secondary">
                The commitment exists in the Merkle tree (inclusion proof)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
              <span className="text-text-secondary">
                The nullifier prevents double-claiming
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-text-secondary" />
              What stays hidden:
            </h4>
            <div className="space-y-2 text-sm mt-2">
              <div className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-accent-purple mt-0.5 shrink-0" />
                <span className="text-text-secondary">
                  No one can see which commitment is yours
                </span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-accent-purple mt-0.5 shrink-0" />
                <span className="text-text-secondary">
                  The sender&apos;s identity remains private
                </span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-accent-purple mt-0.5 shrink-0" />
                <span className="text-text-secondary">
                  The amount is revealed only to you
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Claim Button */}
      <Button
        size="lg"
        className="w-full"
        disabled={withdrawalProof.status !== "complete"}
        onClick={onContinue}
      >
        Claim Funds
      </Button>
    </div>
  );
}
