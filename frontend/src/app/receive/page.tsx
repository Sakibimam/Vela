"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { StatusStep } from "@/components/ui/StatusStep";
import { StepClaimDetails } from "@/components/receiver/StepClaimDetails";
import { StepWithdrawalProof } from "@/components/receiver/StepWithdrawalProof";
import { StepClaimConfirmation } from "@/components/receiver/StepClaimConfirmation";
import { useMockClaim } from "@/components/receiver/useMockClaim";
import { useWallet } from "@/hooks/useWallet";
import type { ReceiveStep } from "@/components/receiver/types";

function stepState(current: ReceiveStep, target: ReceiveStep) {
  if (current > target) return "complete" as const;
  if (current === target) return "active" as const;
  return "pending" as const;
}

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Receive Funds</h1>
        <p className="mt-2 text-text-secondary">
          Claim your payment with a zero-knowledge withdrawal proof.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        {/* Step sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <StatusStep
              label="Claim Details"
              description="Secret & lookup"
              state={stepState(step, 1)}
            />
            <StatusStep
              label="Withdrawal Proof"
              description="Merkle inclusion"
              state={stepState(step, 2)}
            />
            <StatusStep
              label="Claim"
              description="Receive USDC"
              state={stepState(step, 3)}
              isLast
            />
          </nav>
        </aside>

        {/* Mobile progress */}
        <div className="lg:hidden flex items-center gap-2 mb-2">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= s ? "bg-accent-blue" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Main content */}
        <Card variant="elevated" className="min-h-[400px]">
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
      </div>
    </PageContainer>
  );
}
