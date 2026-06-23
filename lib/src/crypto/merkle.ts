/**
 * Poseidon-based Merkle tree for commitment storage.
 *
 * Mirrors the Merkle proof verification in Vela's Circom circuits
 * (PoseidonMerkleProof template at depth 8).
 */

import { PoseidonHasher } from "./poseidon.js";

/** Merkle proof for a leaf at a given index. */
export interface MerkleProof {
  /** Sibling hashes along the path from leaf to root. */
  siblings: bigint[];
  /** Path direction at each level (0 = left, 1 = right). */
  indices: number[];
}

/**
 * A Poseidon Merkle tree with a fixed depth.
 * Default depth of 8 = 256 leaves max.
 */
export class PoseidonMerkleTree {
  /** Tree depth (number of levels). */
  readonly depth: number;
  /** Current leaves (commitments). */
  readonly leaves: bigint[];
  private hasher: PoseidonHasher;
  private zeroHashes: bigint[];

  private constructor(depth: number, hasher: PoseidonHasher) {
    this.depth = depth;
    this.leaves = [];
    this.hasher = hasher;
    this.zeroHashes = this.computeZeroHashes();
  }

  /**
   * Create a new Poseidon Merkle tree.
   * @param depth - Number of levels (default 8 = 256 leaves).
   * @returns An initialized empty Merkle tree.
   */
  static async create(depth: number = 8): Promise<PoseidonMerkleTree> {
    const hasher = await PoseidonHasher.init();
    return new PoseidonMerkleTree(depth, hasher);
  }

  /**
   * Create a tree with a pre-initialized hasher (avoids repeated WASM loads).
   * @param hasher - An already-initialized PoseidonHasher.
   * @param depth - Number of levels (default 8).
   * @returns An initialized empty Merkle tree.
   */
  static fromHasher(hasher: PoseidonHasher, depth: number = 8): PoseidonMerkleTree {
    return new PoseidonMerkleTree(depth, hasher);
  }

  /**
   * Insert a new leaf (commitment) into the tree.
   * @param leaf - The Poseidon hash commitment to insert.
   * @returns The index where the leaf was inserted.
   * @throws If the tree is full (2^depth leaves).
   */
  insert(leaf: bigint): number {
    const maxLeaves = 2 ** this.depth;
    if (this.leaves.length >= maxLeaves) {
      throw new Error(
        `Merkle tree is full (max ${maxLeaves} leaves at depth ${this.depth})`
      );
    }
    const index = this.leaves.length;
    this.leaves.push(leaf);
    return index;
  }

  /**
   * Get the current Merkle root.
   * @returns The root hash of the tree.
   */
  getRoot(): bigint {
    return this.computeRoot();
  }

  /**
   * Generate a Merkle proof for a leaf at the given index.
   * @param index - The leaf index to generate a proof for.
   * @returns The Merkle proof (siblings + path indices).
   * @throws If the index is out of bounds.
   */
  getProof(index: number): MerkleProof {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(
        `Index ${index} out of bounds (tree has ${this.leaves.length} leaves)`
      );
    }

    const siblings: bigint[] = [];
    const indices: number[] = [];
    const layers = this.computeLayers();

    let currentIndex = index;
    for (let level = 0; level < this.depth; level++) {
      const isRight = currentIndex % 2;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      const sibling =
        siblingIndex < layers[level].length
          ? layers[level][siblingIndex]
          : this.zeroHashes[level];

      siblings.push(sibling);
      indices.push(isRight);
      currentIndex = Math.floor(currentIndex / 2);
    }

    return { siblings, indices };
  }

  /**
   * Verify a Merkle proof against the current root.
   * @param leaf - The leaf hash to verify.
   * @param proof - The Merkle proof (siblings + indices).
   * @returns True if the proof is valid for the current root.
   */
  verifyProof(leaf: bigint, proof: MerkleProof): boolean {
    let current = leaf;

    for (let i = 0; i < this.depth; i++) {
      const sibling = proof.siblings[i];
      if (proof.indices[i] === 0) {
        current = this.hasher.hashTwo(current, sibling);
      } else {
        current = this.hasher.hashTwo(sibling, current);
      }
    }

    return current === this.getRoot();
  }

  /** Number of leaves currently in the tree. */
  get size(): number {
    return this.leaves.length;
  }

  /** Maximum number of leaves the tree can hold. */
  get capacity(): number {
    return 2 ** this.depth;
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  private computeZeroHashes(): bigint[] {
    const zeros: bigint[] = [BigInt(0)];
    for (let i = 1; i <= this.depth; i++) {
      zeros.push(this.hasher.hashTwo(zeros[i - 1], zeros[i - 1]));
    }
    return zeros;
  }

  // TODO [HIGH perf]: cache layers and only recompute on insert — currently O(2^depth) on every call
  private computeLayers(): bigint[][] {
    const maxLeaves = 2 ** this.depth;
    const paddedLeaves: bigint[] = [...this.leaves];
    while (paddedLeaves.length < maxLeaves) {
      paddedLeaves.push(BigInt(0));
    }

    const layers: bigint[][] = [paddedLeaves];

    for (let level = 0; level < this.depth; level++) {
      const prevLayer = layers[level];
      const currentLayer: bigint[] = [];
      for (let i = 0; i < prevLayer.length; i += 2) {
        currentLayer.push(this.hasher.hashTwo(prevLayer[i], prevLayer[i + 1]));
      }
      layers.push(currentLayer);
    }

    return layers;
  }

  private computeRoot(): bigint {
    if (this.leaves.length === 0) {
      return this.zeroHashes[this.depth];
    }
    const layers = this.computeLayers();
    return layers[this.depth][0];
  }
}
