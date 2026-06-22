"use client";

import { useState, useCallback, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { StatusStep } from "@/components/ui/StatusStep";
import { StepDetails } from "@/components/sender/StepDetails";
import { StepProofs } from "@/components/sender/StepProofs";
import { StepSubmit } from "@/components/sender/StepSubmit";
import { StepConfirmation } from "@/components/sender/StepConfirmation";
import { useMockProver } from "@/components/sender/useMockProver";
import { useWallet } from "@/hooks/useWallet";
import type { SendFormData, SendStep } from "@/components/sender/types";

function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function stepState(current: SendStep, target: SendStep) {
  if (current > target) return "complete" as const;
  if (current === target) return "active" as const;
  return "pending" as const;
}

export default function SendPage() {
  const [step, setStep] = useState<SendStep>(1);
  const wallet = useWallet();

  const [formData, setFormData] = useState<SendFormData>({
    amount: "",
    recipientAddress: "",
    corridor: "IN-PH",
    sharedSecret: "",
    country: "IN",
    birthYear: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, sharedSecret: generateSecret() }));
  }, []);

  const { kycProof, amountProof, transaction, generateProofs, submitTransaction, reset } =
    useMockProver();

  const handleFormChange = useCallback((partial: Partial<SendFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  function handleSendAnother() {
    setStep(1);
    setFormData({
      amount: "",
      recipientAddress: "",
      corridor: "IN-PH",
      sharedSecret: generateSecret(),
      country: "IN",
      birthYear: "",
    });
    reset();
  }

  return (
    <PageContainer className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Send Money</h1>
        <p className="mt-2 text-text-secondary">
          Prove KYC compliance and send a shielded payment across borders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        {/* Step Indicator (sidebar on large screens) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <StatusStep
              label="Details"
              description="Wallet & amount"
              state={stepState(step, 1)}
            />
            <StatusStep
              label="ZK Proofs"
              description="KYC & commitment"
              state={stepState(step, 2)}
            />
            <StatusStep
              label="Submit"
              description="Sign & broadcast"
              state={stepState(step, 3)}
            />
            <StatusStep
              label="Confirmed"
              description="Share secret"
              state={stepState(step, 4)}
              isLast
            />
          </nav>
        </aside>

        {/* Mobile step indicator */}
        <div className="lg:hidden flex items-center gap-2 mb-2">
          {([1, 2, 3, 4] as const).map((s) => (
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
            <StepDetails
              formData={formData}
              onChange={handleFormChange}
              onContinue={() => setStep(2)}
              walletConnected={wallet.connected}
              walletAddress={wallet.address}
              walletConnecting={wallet.connecting}
              onConnectWallet={wallet.connect}
              onDisconnectWallet={wallet.disconnect}
            />
          )}

          {step === 2 && (
            <StepProofs
              formData={formData}
              kycProof={kycProof}
              amountProof={amountProof}
              onGenerateProofs={() => generateProofs(formData)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepSubmit
              transaction={transaction}
              onSubmit={() => submitTransaction(formData)}
              onComplete={() => setStep(4)}
              onBackToProofs={() => {
                setStep(2);
                reset();
              }}
            />
          )}

          {step === 4 && transaction.hash && (
            <StepConfirmation
              formData={formData}
              txHash={transaction.hash}
              onSendAnother={handleSendAnother}
            />
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
