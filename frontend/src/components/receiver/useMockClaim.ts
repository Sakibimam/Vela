import { useState, useCallback } from "react";
import { generateWithdrawalProof } from "@/lib/prover";
import type { ProofOutput } from "@/lib/prover";
import { submitWithdrawal } from "@/lib/stellar";
import { isMockMode } from "@/lib/env";
import type { LookupState, WithdrawalProofState, ClaimTxState, ClaimData } from "./types";

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useMockClaim() {
  const [lookup, setLookup] = useState<LookupState>({ status: "idle", error: null });
  const [claimData, setClaimData] = useState<ClaimData>({
    secret: "",
    amount: null,
    corridor: null,
    commitmentHash: null,
  });
  const [withdrawalProof, setWithdrawalProof] = useState<WithdrawalProofState>({
    status: "idle",
    hash: null,
    error: null,
  });
  const [claimTx, setClaimTx] = useState<ClaimTxState>({
    status: "idle",
    hash: null,
    error: null,
  });
  const [proofData, setProofData] = useState<ProofOutput | null>(null);

  const lookupCommitment = useCallback(async (secret: string) => {
    setLookup({ status: "searching", error: null });

    if (secret.length !== 64 || !/^[0-9a-f]+$/i.test(secret)) {
      setLookup({ status: "not-found", error: "No matching transfer found for this secret." });
      return;
    }

    if (!isMockMode()) {
      try {
        const { PoseidonHasher } = await import("@vela/lib");
        const hasher = await PoseidonHasher.init();
        const secretBigint = BigInt("0x" + secret);
        const nonce = BigInt("0x" + secret.slice(32));
        const commitment = hasher.computeCommitment(BigInt(50000), secretBigint, nonce);
        const commitmentHash = commitment.toString(16).padStart(64, "0");

        setClaimData({
          secret,
          amount: "500.00",
          corridor: "AE-PH",
          commitmentHash,
        });
        setLookup({ status: "found", error: null });
      } catch (err) {
        setLookup({
          status: "not-found",
          error: err instanceof Error ? err.message : "Lookup failed",
        });
      }
    } else {
      const commitmentHash = randomHex(32);
      setClaimData({
        secret,
        amount: "500.00",
        corridor: "AE-PH",
        commitmentHash,
      });
      setLookup({ status: "found", error: null });
    }
  }, []);

  const generateProof = useCallback(async () => {
    setWithdrawalProof({ status: "generating", hash: null, error: null });
    try {
      const result = await generateWithdrawalProof({
        amount: 50000,
        receiverSecret: claimData.secret,
        nonce: randomHex(16),
        merkleRoot: claimData.commitmentHash || randomHex(32),
      });
      setWithdrawalProof({ status: "complete", hash: result.proofHash, error: null });
      setProofData(result);
    } catch (err) {
      setWithdrawalProof({
        status: "error",
        hash: null,
        error: err instanceof Error ? err.message : "Proof generation failed",
      });
    }
  }, [claimData.secret, claimData.commitmentHash]);

  const submitClaim = useCallback(async () => {
    if (!proofData) {
      setClaimTx({ status: "error", hash: null, error: "Proof not generated yet" });
      return;
    }

    setClaimTx({ status: "building", hash: null, error: null });
    try {
      setClaimTx({ status: "signing", hash: null, error: null });

      setClaimTx({ status: "submitting", hash: null, error: null });

      const result = await submitWithdrawal({
        withdrawalProof: proofData.proof,
        withdrawalPublicSignals: proofData.publicSignals,
        nullifier: randomHex(32),
      });

      setClaimTx({ status: "complete", hash: result.hash, error: null });
    } catch (err) {
      setClaimTx({
        status: "error",
        hash: null,
        error: err instanceof Error ? err.message : "Claim failed",
      });
    }
  }, [proofData]);

  const reset = useCallback(() => {
    setLookup({ status: "idle", error: null });
    setClaimData({ secret: "", amount: null, corridor: null, commitmentHash: null });
    setWithdrawalProof({ status: "idle", hash: null, error: null });
    setClaimTx({ status: "idle", hash: null, error: null });
    setProofData(null);
  }, []);

  return {
    lookup,
    claimData,
    withdrawalProof,
    claimTx,
    lookupCommitment,
    generateWithdrawalProof: generateProof,
    submitClaim,
    reset,
  };
}
