"use client";

import { useState, useCallback, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { StepDetails } from "@/components/sender/StepDetails";
import { StepProofs } from "@/components/sender/StepProofs";
import { StepSubmit } from "@/components/sender/StepSubmit";
import { StepConfirmation } from "@/components/sender/StepConfirmation";
import { useMockProver } from "@/components/sender/useMockProver";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";
import type { SendFormData, SendStep } from "@/components/sender/types";

function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const STEPS = [
  { num: 1, label: "Details", sublabel: "Wallet & amount" },
  { num: 2, label: "Proofs", sublabel: "KYC & commitment" },
  { num: 3, label: "Submit", sublabel: "Sign & broadcast" },
  { num: 4, label: "Done", sublabel: "Share secret" },
] as const;

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
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] font-mono font-semibold text-accent-blue tracking-[0.2em] uppercase mb-2">
          Sender
        </p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Send Money</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Prove KYC compliance and commit a shielded payment across borders.
        </p>
      </div>

      {/* Step indicator — horizontal capsule style */}
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
                ? "border-accent-blue/40 bg-accent-blue/10 text-accent-blue"
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
    </PageContainer>
  );
}
