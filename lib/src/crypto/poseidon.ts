/**
 * Poseidon hash wrapper using circomlibjs.
 *
 * This must produce the exact same hashes as the Circom circuits —
 * circomlibjs is the canonical JS implementation used by snarkjs/circom.
 */

import type { buildPoseidon } from "circomlibjs";

type PoseidonFn = Awaited<ReturnType<typeof buildPoseidon>>;

/**
 * ZK-friendly Poseidon hasher compatible with Vela's Circom circuits.
 * Initialize once with `PoseidonHasher.init()`, then call `hash()` methods.
 */
export class PoseidonHasher {
  private poseidon: PoseidonFn;
  private F: { toObject: (v: unknown) => bigint };

  private constructor(poseidon: PoseidonFn) {
    this.poseidon = poseidon;
    this.F = poseidon.F;
  }

  /**
   * Initialize the Poseidon hasher. Must be called once before hashing.
   * Loads the circomlibjs WASM module.
   * @returns A ready-to-use PoseidonHasher instance.
   */
  static async init(): Promise<PoseidonHasher> {
    const { buildPoseidon } = await import("circomlibjs");
    const poseidon = await buildPoseidon();
    return new PoseidonHasher(poseidon);
  }

  /**
   * Hash an arbitrary number of field elements (1–16 inputs).
   * @param inputs - Array of bigint field elements.
   * @returns The Poseidon hash as a bigint.
   */
  hash(inputs: bigint[]): bigint {
    const raw = this.poseidon(inputs);
    return this.F.toObject(raw) as bigint;
  }

  /**
   * Hash exactly one field element.
   * @param a - The input.
   * @returns Poseidon(a) as a bigint.
   */
  hashOne(a: bigint): bigint {
    return this.hash([a]);
  }

  /**
   * Hash exactly two field elements.
   * @param a - First input.
   * @param b - Second input.
   * @returns Poseidon(a, b) as a bigint.
   */
  hashTwo(a: bigint, b: bigint): bigint {
    return this.hash([a, b]);
  }

  /**
   * Hash exactly three field elements.
   * @param a - First input.
   * @param b - Second input.
   * @param c - Third input.
   * @returns Poseidon(a, b, c) as a bigint.
   */
  hashThree(a: bigint, b: bigint, c: bigint): bigint {
    return this.hash([a, b, c]);
  }

  /**
   * Hash exactly four field elements.
   * @param a - First input.
   * @param b - Second input.
   * @param c - Third input.
   * @param d - Fourth input.
   * @returns Poseidon(a, b, c, d) as a bigint.
   */
  hashFour(a: bigint, b: bigint, c: bigint, d: bigint): bigint {
    return this.hash([a, b, c, d]);
  }

  /**
   * Compute a nullifier: Poseidon(secret, nonce).
   * @param secret - The user's private secret.
   * @param nonce - A public or session nonce.
   * @returns The nullifier as a bigint.
   */
  computeNullifier(secret: bigint, nonce: bigint): bigint {
    return this.hashTwo(secret, nonce);
  }

  /**
   * Compute an amount commitment: Poseidon(amount, secret, nonce).
   * @param amount - The transfer amount.
   * @param secret - The sender's secret.
   * @param nonce - A unique transaction nonce.
   * @returns The commitment as a bigint.
   */
  computeCommitment(amount: bigint, secret: bigint, nonce: bigint): bigint {
    return this.hashThree(amount, secret, nonce);
  }
}
