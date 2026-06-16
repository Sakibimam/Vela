import { useState, useCallback } from "react";
import { generateKycProof, generateAmountProof } from "@/lib/prover";
import type { ProofOutput } from "@/lib/prover";
import { submitDeposit } from "@/lib/stellar";
import type { ProofState, TransactionState, SendFormData } from "./types";

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ISO 3166-1 numeric country codes
const COUNTRY_CODES: Record<string, number> = {
  IN: 356,  // India
  AE: 784,  // United Arab Emirates
  US: 840,  // United States
  GB: 826,  // United Kingdom
  PH: 608,  // Philippines
  CO: 170,  // Colombia
  NG: 566,  // Nigeria
};

export function useMockProver() {
  const [kycProof, setKycProof] = useState<ProofState>({
    status: "idle",
    hash: null,
    error: null,
  });
  const [amountProof, setAmountProof] = useState<ProofState>({
    status: "idle",
    hash: null,
    error: null,
  });
  const [transaction, setTransaction] = useState<TransactionState>({
    status: "idle",
    hash: null,
    error: null,
  });

  const [kycProofData, setKycProofData] = useState<ProofOutput | null>(null);
  const [amountProofData, setAmountProofData] = useState<ProofOutput | null>(null);

  const generateProofs = useCallback(async (formData: SendFormData) => {
    setKycProof({ status: "generating", hash: null, error: null });
    setAmountProof({ status: "idle", hash: null, error: null });

    const countryCode = COUNTRY_CODES[formData.country] || 356;
    const birthYear = parseInt(formData.birthYear) || 1992;

    // Use the sharedSecret from formData (shown to user) for both KYC and amount proofs
    const sharedSecret = formData.sharedSecret;
    const nonce = sharedSecret.slice(32); // Last 32 chars as nonce

    try {
      const kycResult = await generateKycProof({
        countryCode,
        birthYear,
        userSecret: sharedSecret,
      });
      setKycProof({ status: "complete", hash: kycResult.proofHash, error: null });
      setKycProofData(kycResult);
    } catch (err) {
      setKycProof({ status: "error", hash: null, error: err instanceof Error ? err.message : "KYC proof failed" });
      return;
    }

    setAmountProof({ status: "generating", hash: null, error: null });

    const amountInCents = Math.round(parseFloat(formData.amount) * 100) || 1000;

    try {
      const amountResult = await generateAmountProof({
        amount: amountInCents,
        senderSecret: sharedSecret,
        nonce: nonce,
        maxAmount: 300000,
      });
      setAmountProof({ status: "complete", hash: amountResult.proofHash, error: null });
      setAmountProofData(amountResult);
    } catch (err) {
      setAmountProof({ status: "error", hash: null, error: err instanceof Error ? err.message : "Amount proof failed" });
    }
  }, []);

  const submitTransaction = useCallback(async (formData: SendFormData) => {
    if (!kycProofData || !amountProofData) {
      setTransaction({ status: "error", hash: null, error: "Proofs not generated yet" });
      return;
    }

    setTransaction({ status: "building", hash: null, error: null });

    try {
      setTransaction({ status: "signing", hash: null, error: null });

      setTransaction({ status: "submitting", hash: null, error: null });

      const commitment = amountProofData.publicSignals[0] || randomHex(32);
      const amountInCents = Math.round(parseFloat(formData.amount) * 100) || 1000;

      // Store secret → transfer data mapping in localStorage for demo (receiver needs this)
      // In production, this would be encrypted in the on-chain payload with view key
      if (typeof window !== 'undefined') {
        // Map corridor value to human-readable label for receiver display
        const CORRIDOR_LABELS: Record<string, string> = {
          "IN-PH": "India → Philippines",
          "AE-PH": "Dubai → Manila",
          "US-CO": "US → Colombia",
          "GB-NG": "UK → Lagos",
        };
        const corridorLabel = CORRIDOR_LABELS[formData.corridor] || formData.corridor;

        const transfers = JSON.parse(localStorage.getItem('vela_transfers') || '{}');
        transfers[formData.sharedSecret] = {
          secret: formData.sharedSecret,
          amount: formData.amount,
          amountCents: amountInCents,
          corridor: corridorLabel,
          commitment: commitment,
          timestamp: Date.now(),
        };
        localStorage.setItem('vela_transfers', JSON.stringify(transfers));
      }

      const result = await submitDeposit({
        kycProof: kycProofData.proof,
        kycPublicSignals: kycProofData.publicSignals,
        amountProof: amountProofData.proof,
        amountPublicSignals: amountProofData.publicSignals,
        commitment,
        encryptedPayload: randomHex(64),
      });

      setTransaction({ status: "complete", hash: result.hash, error: null });
    } catch (err) {
      setTransaction({ status: "error", hash: null, error: err instanceof Error ? err.message : "Transaction failed" });
    }
  }, [kycProofData, amountProofData]);

  const reset = useCallback(() => {
    setKycProof({ status: "idle", hash: null, error: null });
    setAmountProof({ status: "idle", hash: null, error: null });
    setTransaction({ status: "idle", hash: null, error: null });
    setKycProofData(null);
    setAmountProofData(null);
  }, []);

  return {
    kycProof,
    amountProof,
    transaction,
    generateProofs,
    submitTransaction,
    reset,
  };
}
