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

    try {
      // Look up transfer by secret directly (sender stored under secret key)
      // In production, this would query the on-chain encrypted payload with view key
      const transfers = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('vela_transfers') || '{}')
        : {};

      const transfer = transfers[secret];

      if (transfer) {
        setClaimData({
          secret,
          amount: transfer.amount,
          corridor: transfer.corridor,
          commitmentHash: transfer.commitment,
        });
        setLookup({ status: "found", error: null });
      } else {
        setLookup({
          status: "not-found",
          error: "No matching transfer found for this secret. Make sure you entered the correct secret from the sender."
        });
      }
    } catch (err) {
      setLookup({
        status: "not-found",
        error: err instanceof Error ? err.message : "Lookup failed",
      });
    }
  }, []);

  const generateProof = useCallback(async () => {
    setWithdrawalProof({ status: "generating", hash: null, error: null });
    try {
      if (!claimData.secret || !claimData.commitmentHash || !claimData.amount) {
        throw new Error("Secret, commitment, or amount not found");
      }

      // Derive nonce from secret (same as sender did)
      const nonce = claimData.secret.slice(32);

      // Get amount in cents (stored in transfers)
      const transfers = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('vela_transfers') || '{}')
        : {};
      const transfer = transfers[claimData.secret];
      const amountCents = transfer?.amountCents || 0;

      // Compute Merkle root for single-leaf tree
      // For a tree with all-zero siblings, root = hash(hash(...hash(leaf, 0)..., 0)) (8 levels)
      const { PoseidonHasher } = await import("@vela/lib");
      const hasher = await PoseidonHasher.init();

      // Leaf = commitment = Poseidon(amount, secret, nonce)
      const leaf = BigInt(claimData.commitmentHash);

      // Hash up through 8 levels with zero siblings
      let currentHash = leaf;
      for (let i = 0; i < 8; i++) {
        currentHash = hasher.hashTwo(currentHash, BigInt(0));
      }
      const merkleRoot = currentHash.toString();

      const result = await generateWithdrawalProof({
        amount: amountCents,
        receiverSecret: claimData.secret,
        nonce: nonce,
        merkleRoot: merkleRoot, // Computed Merkle root for single-leaf tree
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
  }, [claimData.secret, claimData.commitmentHash, claimData.amount]);

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
