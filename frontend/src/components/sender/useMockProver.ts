import { useState, useCallback } from "react";
import { generateKycProof, generateAmountProof } from "@/lib/prover";
import type { ProofOutput } from "@/lib/prover";
import { submitDeposit } from "@/lib/stellar";
import type { ProofState, TransactionState } from "./types";

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

  const generateProofs = useCallback(async () => {
    setKycProof({ status: "generating", hash: null, error: null });
    setAmountProof({ status: "idle", hash: null, error: null });

    try {
      const kycResult = await generateKycProof({
        countryCode: 784,
        birthYear: 1992,
        userSecret: randomHex(32),
      });
      setKycProof({ status: "complete", hash: kycResult.proofHash, error: null });
      setKycProofData(kycResult);
    } catch (err) {
      setKycProof({ status: "error", hash: null, error: err instanceof Error ? err.message : "KYC proof failed" });
      return;
    }

    setAmountProof({ status: "generating", hash: null, error: null });

    try {
      const amountResult = await generateAmountProof({
        amount: 50000,
        senderSecret: randomHex(32),
        nonce: randomHex(16),
        maxAmount: 300000,
      });
      setAmountProof({ status: "complete", hash: amountResult.proofHash, error: null });
      setAmountProofData(amountResult);
    } catch (err) {
      setAmountProof({ status: "error", hash: null, error: err instanceof Error ? err.message : "Amount proof failed" });
    }
  }, []);

  const submitTransaction = useCallback(async () => {
    if (!kycProofData || !amountProofData) {
      setTransaction({ status: "error", hash: null, error: "Proofs not generated yet" });
      return;
    }

    setTransaction({ status: "building", hash: null, error: null });

    try {
      setTransaction({ status: "signing", hash: null, error: null });

      setTransaction({ status: "submitting", hash: null, error: null });
      const result = await submitDeposit({
        kycProof: kycProofData.proof,
        kycPublicSignals: kycProofData.publicSignals,
        amountProof: amountProofData.proof,
        amountPublicSignals: amountProofData.publicSignals,
        commitment: amountProofData.publicSignals[0] || randomHex(32),
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
