"use client";

import { useEffect } from "react";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

function ProofResult({ label, proof, icon: Icon, color }: { label: string; proof: ProofState; icon: typeof ShieldCheck; color: string }) {
  if (proof.status !== "complete" || !proof.hash) return null;
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl border", `border-${color}/15 bg-${color}/[0.04]`)}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${color}/10`)}>
        <Icon className={cn("w-4 h-4", `text-${color}`)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", `text-${color}`)}>{label}</p>
        <code className="text-[10px] font-mono text-text-tertiary truncate block mt-0.5">
          {proof.hash.slice(0, 20)}...{proof.hash.slice(-12)}
        </code>
      </div>
      <span className="text-[10px] font-mono text-success/80 px-2 py-0.5 rounded-full bg-success/8 border border-success/10">
        verified
      </span>
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
        <h3 className="text-lg font-semibold text-text-primary tracking-tight">Generating ZK Proofs</h3>
        <p className="text-sm text-text-secondary mt-1.5">
          Your identity and amount are verified locally. Only cryptographic proofs go on-chain.
        </p>
      </div>

      {/* KYC Proof */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-text-primary">KYC Compliance Proof</span>
          </div>
          <code className="text-[10px] font-mono text-text-tertiary px-2 py-0.5 rounded bg-white/[0.04]">kyc_compliance.circom</code>
        </div>
        <div className="px-4 pb-4">
          {kycProof.status === "generating" && (
            <ProofProgress
              active
              label="KYC Compliance Proof"
              estimatedMs={7000}
            />
          )}
          <ProofResult label="KYC compliance verified" proof={kycProof} icon={ShieldCheck} color="success" />
        </div>
      </div>

      {/* Amount Proof */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-accent-purple" />
            <span className="text-sm font-medium text-text-primary">Amount Commitment Proof</span>
          </div>
          <code className="text-[10px] font-mono text-text-tertiary px-2 py-0.5 rounded bg-white/[0.04]">amount_commitment.circom</code>
        </div>
        <div className="px-4 pb-4">
          {amountProof.status === "generating" && (
            <ProofProgress
              active
              label="Amount Commitment Proof"
              estimatedMs={4000}
            />
          )}
          {amountProof.status === "idle" && kycProof.status === "generating" && (
            <p className="text-xs text-text-tertiary py-8 text-center font-mono">Queued...</p>
          )}
          <ProofResult label="Amount committed" proof={amountProof} icon={Lock} color="success" />
        </div>
      </div>

      {/* Blockchain visibility summary */}
      {bothComplete && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-text-secondary" />
            <h4 className="text-sm font-semibold text-text-primary">On-chain footprint</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "KYC proof hash", sublabel: "jurisdiction & age" },
              { label: "Amount commitment", sublabel: "Poseidon hash" },
              { label: "Nullifier", sublabel: "prevents double-spend" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <ShieldCheck className="w-3 h-3 text-success shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-text-primary">{item.label}</p>
                  <p className="text-[10px] text-text-tertiary">{item.sublabel}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 pt-3 border-t border-white/[0.04]">
            <EyeOff className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              <span className="text-text-secondary font-medium">Stays private:</span> your name, country, age, transfer amount ($
              {formData.amount}), and recipient address — all remain off-chain.
            </p>
          </div>
        </div>
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
