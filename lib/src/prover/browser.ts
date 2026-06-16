/**
 * Browser-side ZK proof generation using snarkjs.
 *
 * Loads circuit WASM and proving keys from URLs, generates Groth16 proofs
 * entirely client-side. No secrets ever leave the browser.
 */

import type { Groth16Proof, PublicSignals } from "snarkjs";

/** Result of a proof generation. */
export interface ProofResult {
  /** The Groth16 proof (π_A, π_B, π_C points). */
  proof: Groth16Proof;
  /** The public signals/inputs for the verifier. */
  publicSignals: PublicSignals;
}

/** Input signals for the KYC compliance circuit. */
export interface KycInput {
  country_code: bigint;
  birth_year: bigint;
  kyc_attestation: bigint;
  user_secret: bigint;
  merkle_path: bigint[];
  merkle_indices: number[];
  allowed_countries_root: bigint;
  min_birth_year: bigint;
  kyc_issuer_hash: bigint;
  nonce: bigint;
}

/** Input signals for the amount commitment circuit. */
export interface AmountInput {
  amount: bigint;
  sender_secret: bigint;
  nonce: bigint;
  max_amount: bigint;
}

/** Input signals for the withdrawal circuit. */
export interface WithdrawalInput {
  amount: bigint;
  receiver_secret: bigint;
  nonce: bigint;
  merkle_path: bigint[];
  merkle_indices: number[];
  merkle_root: bigint;
  receiver_address_hash: bigint;
}

/**
 * Client-side ZK prover for Vela circuits.
 * Loads WASM + zkey from URLs and generates Groth16 proofs in the browser.
 */
export class VelaProver {
  private wasmBuffer: ArrayBuffer;
  private zkeyBuffer: ArrayBuffer;

  private constructor(wasmBuffer: ArrayBuffer, zkeyBuffer: ArrayBuffer) {
    this.wasmBuffer = wasmBuffer;
    this.zkeyBuffer = zkeyBuffer;
  }

  /**
   * Load a circuit for proof generation.
   * @param wasmUrl - URL to the compiled circuit WASM file.
   * @param zkeyUrl - URL to the proving key (zkey) file.
   * @returns A VelaProver ready to generate proofs.
   */
  static async loadCircuit(
    wasmUrl: string,
    zkeyUrl: string
  ): Promise<VelaProver> {
    const [wasmResp, zkeyResp] = await Promise.all([
      fetch(wasmUrl),
      fetch(zkeyUrl),
    ]);

    if (!wasmResp.ok) throw new Error(`Failed to fetch WASM: ${wasmUrl}`);
    if (!zkeyResp.ok) throw new Error(`Failed to fetch zkey: ${zkeyUrl}`);

    const [wasmBuffer, zkeyBuffer] = await Promise.all([
      wasmResp.arrayBuffer(),
      zkeyResp.arrayBuffer(),
    ]);

    return new VelaProver(wasmBuffer, zkeyBuffer);
  }

  /**
   * Generate a KYC compliance proof.
   * Proves: country in allowed list, age >= 18, valid attestation, correct nullifier.
   * @param input - Private and public KYC circuit inputs.
   * @returns The Groth16 proof and public signals.
   */
  async proveKYC(input: KycInput): Promise<ProofResult> {
    const { PoseidonHasher } = await import("../crypto/poseidon.js");
    const hasher = await PoseidonHasher.init();

    const nullifier = hasher.computeNullifier(input.user_secret, input.nonce);
    const kycIssuerHash = hasher.hashTwo(
      input.kyc_attestation,
      input.user_secret
    );

    const circuitInput = {
      country_code: input.country_code.toString(),
      birth_year: input.birth_year.toString(),
      kyc_attestation: input.kyc_attestation.toString(),
      user_secret: input.user_secret.toString(),
      merkle_path: input.merkle_path.map((v) => v.toString()),
      merkle_indices: input.merkle_indices.map((v) => v.toString()),
      allowed_countries_root: input.allowed_countries_root.toString(),
      min_birth_year: input.min_birth_year.toString(),
      kyc_issuer_hash: (input.kyc_issuer_hash ?? kycIssuerHash).toString(),
      nullifier: nullifier.toString(),
      nonce: input.nonce.toString(),
    };

    return this.generateProof(circuitInput);
  }

  /**
   * Generate an amount commitment proof.
   * Proves: commitment is valid, amount > 0, amount <= max, correct nullifier.
   * @param input - Private and public amount circuit inputs.
   * @returns The Groth16 proof and public signals.
   */
  async proveAmount(input: AmountInput): Promise<ProofResult> {
    const { PoseidonHasher } = await import("../crypto/poseidon.js");
    const hasher = await PoseidonHasher.init();

    const commitment = hasher.computeCommitment(
      input.amount,
      input.sender_secret,
      input.nonce
    );
    const nullifier = hasher.computeNullifier(input.sender_secret, input.nonce);

    const circuitInput = {
      amount: input.amount.toString(),
      sender_secret: input.sender_secret.toString(),
      nonce: input.nonce.toString(),
      commitment: commitment.toString(),
      max_amount: input.max_amount.toString(),
      nullifier: nullifier.toString(),
    };

    return this.generateProof(circuitInput);
  }

  /**
   * Generate a withdrawal proof.
   * Proves: commitment in Merkle tree, correct nullifier, bound to receiver.
   * @param input - Private and public withdrawal circuit inputs.
   * @returns The Groth16 proof and public signals.
   */
  async proveWithdrawal(input: WithdrawalInput): Promise<ProofResult> {
    const { PoseidonHasher } = await import("../crypto/poseidon.js");
    const hasher = await PoseidonHasher.init();

    const nullifier = hasher.computeNullifier(
      input.receiver_secret,
      input.nonce
    );

    const circuitInput = {
      amount: input.amount.toString(),
      receiver_secret: input.receiver_secret.toString(),
      nonce: input.nonce.toString(),
      merkle_path: input.merkle_path.map((v) => v.toString()),
      merkle_indices: input.merkle_indices.map((v) => v.toString()),
      merkle_root: input.merkle_root.toString(),
      nullifier: nullifier.toString(),
      receiver_address_hash: input.receiver_address_hash.toString(),
    };

    return this.generateProof(circuitInput);
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  private async generateProof(
    input: Record<string, string | string[]>
  ): Promise<ProofResult> {
    const snarkjs = await import("snarkjs");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      new Uint8Array(this.wasmBuffer),
      new Uint8Array(this.zkeyBuffer)
    );
    return { proof, publicSignals };
  }
}
