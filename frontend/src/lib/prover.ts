import { isMockMode } from "./env";

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

import type { Groth16Proof } from "snarkjs";

export interface ProofOutput {
  proofHash: string;
  publicSignals: string[];
  proof: Groth16Proof;
}

export interface KycProofInput {
  countryCode: number;
  birthYear: number;
  userSecret: string;
}

export interface AmountProofInput {
  amount: number;
  senderSecret: string;
  nonce: string;
  maxAmount: number;
}

export interface WithdrawalProofInput {
  amount: number;
  receiverSecret: string;
  nonce: string;
  merkleRoot: string;
}

async function mockProof(delayMs: number): Promise<ProofOutput> {
  await delay(delayMs);
  return {
    proofHash: randomHex(32),
    publicSignals: [randomHex(16), randomHex(16), randomHex(16)],
    proof: {
      pi_a: ["0", "0", "1"],
      pi_b: [["0", "0"], ["0", "0"], ["1", "0"]],
      pi_c: ["0", "0", "1"],
      protocol: "groth16",
      curve: "bls12381",
    } as any,
  };
}

async function realKycProof(input: KycProofInput): Promise<ProofOutput> {
  const { VelaProver } = await import("@vela/lib");
  const prover = await VelaProver.loadCircuit(
    "/circuits/kyc_compliance.wasm",
    "/circuits/kyc_compliance.zkey"
  );
  const result = await prover.proveKYC({
    country_code: BigInt(input.countryCode),
    birth_year: BigInt(input.birthYear),
    kyc_attestation: BigInt("0x" + input.userSecret.slice(0, 16)),
    user_secret: BigInt("0x" + input.userSecret),
    merkle_path: Array(8).fill(BigInt(0)),
    merkle_indices: Array(8).fill(0),
    allowed_countries_root: BigInt(0),
    min_birth_year: BigInt(1944),
    kyc_issuer_hash: BigInt(0),
    nonce: BigInt("0x" + randomHex(16)),
  });
  const proofHash = randomHex(32);
  return {
    proofHash,
    publicSignals: result.publicSignals,
    proof: result.proof,
  };
}

async function realAmountProof(input: AmountProofInput): Promise<ProofOutput> {
  const { VelaProver } = await import("@vela/lib");
  const prover = await VelaProver.loadCircuit(
    "/circuits/amount_commitment.wasm",
    "/circuits/amount_commitment.zkey"
  );
  const result = await prover.proveAmount({
    amount: BigInt(input.amount),
    sender_secret: BigInt("0x" + input.senderSecret),
    nonce: BigInt("0x" + input.nonce),
    max_amount: BigInt(input.maxAmount),
  });
  const proofHash = randomHex(32);
  return {
    proofHash,
    publicSignals: result.publicSignals,
    proof: result.proof,
  };
}

async function realWithdrawalProof(input: WithdrawalProofInput): Promise<ProofOutput> {
  const { VelaProver } = await import("@vela/lib");
  const prover = await VelaProver.loadCircuit(
    "/circuits/withdrawal.wasm",
    "/circuits/withdrawal.zkey"
  );
  const result = await prover.proveWithdrawal({
    amount: BigInt(input.amount),
    receiver_secret: BigInt("0x" + input.receiverSecret),
    nonce: BigInt("0x" + input.nonce),
    merkle_path: Array(8).fill(BigInt(0)),
    merkle_indices: Array(8).fill(0),
    merkle_root: BigInt("0x" + input.merkleRoot),
    receiver_address_hash: BigInt(0),
  });
  const proofHash = randomHex(32);
  return {
    proofHash,
    publicSignals: result.publicSignals,
    proof: result.proof,
  };
}

export async function generateKycProof(input: KycProofInput): Promise<ProofOutput> {
  if (isMockMode()) {
    return mockProof(5000 + Math.random() * 3000);
  }
  return realKycProof(input);
}

export async function generateAmountProof(input: AmountProofInput): Promise<ProofOutput> {
  if (isMockMode()) {
    return mockProof(3000 + Math.random() * 2000);
  }
  return realAmountProof(input);
}

export async function generateWithdrawalProof(input: WithdrawalProofInput): Promise<ProofOutput> {
  if (isMockMode()) {
    return mockProof(4500 + Math.random() * 2500);
  }
  return realWithdrawalProof(input);
}
