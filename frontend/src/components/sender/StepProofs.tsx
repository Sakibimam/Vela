"use client";

import { useEffect } from "react";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProofProgress } from "@/components/ui/ProofProgress";
import { cn } from "@/lib/utils";
import type { ProofState, SendFormData } from "./types";

interface StepProofsProps {
  formData: SendFormData;
  kycProof: ProofState;
  amountProof: ProofState;
  onGenerateProofs: () => void;
  onContinue: () => void;
}

function ProofResult({ label, proof }: { label: string; proof: ProofState }) {
  if (proof.status !== "complete" || !proof.hash) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/5 border border-success/20">
      <ShieldCheck className="w-4 h-4 text-success shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-success">{label} verified</p>
        <code className="text-xs font-mono text-text-tertiary truncate block">
          {proof.hash.slice(0, 16)}...{proof.hash.slice(-16)}
        </code>
      </div>
    </div>
  );
}

export function StepProofs({
  formData,
  kycProof,
  amountProof,
  onGenerateProofs,
  onContinue,
}: StepProofsProps) {
  const bothComplete = kycProof.status === "complete" && amountProof.status === "complete";
  const isGenerating = kycProof.status === "generating" || amountProof.status === "generating";

  useEffect(() => {
    if (kycProof.status === "idle" && amountProof.status === "idle") {
      onGenerateProofs();
    }
  }, [kycProof.status, amountProof.status, onGenerateProofs]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Generating ZK Proofs</h3>
        <p className="text-sm text-text-secondary mt-1">
          Your identity and amount are verified locally. Only cryptographic proofs go on-chain.
        </p>
      </div>

      {/* KYC Proof */}
      <Card variant="outlined" className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-accent-blue" />
          <span className="text-sm font-medium text-text-primary">KYC Compliance Proof</span>
          <code className="text-xs text-text-tertiary ml-auto">kyc_compliance.circom</code>
        </div>
        {kycProof.status === "generating" && (
          <ProofProgress
            active
            label="KYC Compliance Proof"
            estimatedMs={7000}
          />
        )}
        <ProofResult label="KYC compliance" proof={kycProof} />
      </Card>

      {/* Amount Proof */}
      <Card variant="outlined" className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-text-primary">Amount Commitment Proof</span>
          <code className="text-xs text-text-tertiary ml-auto">amount_commitment.circom</code>
        </div>
        {amountProof.status === "generating" && (
          <ProofProgress
            active
            label="Amount Commitment Proof"
            estimatedMs={4000}
          />
        )}
        {amountProof.status === "idle" && kycProof.status === "generating" && (
          <p className="text-sm text-text-tertiary py-4 text-center">Waiting for KYC proof...</p>
        )}
        <ProofResult label="Amount committed" proof={amountProof} />
      </Card>

      {/* Blockchain visibility summary */}
      {bothComplete && (
        <Card variant="elevated" className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Eye className="w-4 h-4 text-text-secondary" />
            What the blockchain will see:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
              <span className="text-text-secondary">
                KYC proof hash — <span className="text-text-tertiary">verifies jurisdiction & age</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
              <span className="text-text-secondary">
                Amount commitment — <span className="text-text-tertiary">Poseidon hash, not the actual value</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className={cn("w-3.5 h-3.5 mt-0.5 shrink-0 inline-flex items-center justify-center text-success")}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span className="text-text-secondary">
                Nullifier — <span className="text-text-tertiary">prevents double-spend</span>
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-text-secondary" />
              What stays private:
            </h4>
            <p className="text-xs text-text-tertiary mt-1.5">
              Your name, country, age, transfer amount ($
              {formData.amount}), recipient address — all remain off-chain.
            </p>
          </div>
        </Card>
      )}

      {/* Submit button */}
      <Button
        size="lg"
        className="w-full"
        disabled={!bothComplete || isGenerating}
        onClick={onContinue}
      >
        Submit to Stellar
      </Button>
    </div>
  );
}
