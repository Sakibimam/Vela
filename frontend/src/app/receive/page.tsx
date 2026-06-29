"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { StepClaimDetails } from "@/components/receiver/StepClaimDetails";
import { StepWithdrawalProof } from "@/components/receiver/StepWithdrawalProof";
import { StepClaimConfirmation } from "@/components/receiver/StepClaimConfirmation";
import { useMockClaim } from "@/components/receiver/useMockClaim";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";
import type { ReceiveStep } from "@/components/receiver/types";

const STEPS = [
  { num: 1, label: "Lookup", sublabel: "Secret & find" },
  { num: 2, label: "Prove", sublabel: "Merkle inclusion" },
  { num: 3, label: "Claim", sublabel: "Receive USDC" },
] as const;

export default function ReceivePage() {
  const [step, setStep] = useState<ReceiveStep>(1);
  const wallet = useWallet();

  const {
    lookup,
    claimData,
    withdrawalProof,
    claimTx,
    lookupCommitment,
    generateWithdrawalProof,
    submitClaim,
    reset,
  } = useMockClaim();

  function handleReset() {
    setStep(1);
    reset();
  }

  return (
    <PageContainer className="max-w-3xl">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] font-mono font-semibold text-accent-teal tracking-[0.2em] uppercase mb-2">
          Receiver
        </p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Receive Funds</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Claim your payment with a zero-knowledge withdrawal proof.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-1 p-1 rounded-full border border-white/[0.06] bg-white/[0.02] w-fit">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
              step === s.num
                ? "bg-white/[0.08] text-text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                : step > s.num
                  ? "text-success"
                  : "text-text-tertiary"
            )}
          >
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
              step === s.num
                ? "border-accent-teal/40 bg-accent-teal/10 text-accent-teal"
                : step > s.num
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-white/10 text-text-tertiary"
            )}>
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <Card variant="elevated" className="min-h-[440px]">
        {step === 1 && (
          <StepClaimDetails
            walletConnected={wallet.connected}
            walletAddress={wallet.address}
            walletConnecting={wallet.connecting}
            onConnectWallet={wallet.connect}
            lookup={lookup}
            claimData={claimData}
            onLookup={lookupCommitment}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepWithdrawalProof
            claimData={claimData}
            withdrawalProof={withdrawalProof}
            onGenerate={generateWithdrawalProof}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepClaimConfirmation
            claimData={claimData}
            claimTx={claimTx}
            onSubmit={submitClaim}
            onReset={handleReset}
          />
        )}
      </Card>
    </PageContainer>
  );
}
