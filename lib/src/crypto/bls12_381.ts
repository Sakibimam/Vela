/**
 * BLS12-381 curve point encoding for Soroban Groth16 verifier.
 *
 * Converts snarkjs proof format (affine coordinates as decimal strings)
 * to raw BLS12-381 bytes expected by Soroban's native verifier.
 */

import type { Groth16Proof } from "snarkjs";

/**
 * Encode a G1 point from snarkjs format to BLS12-381 uncompressed bytes (96 bytes).
 *
 * snarkjs G1 point: [x_decimal_string, y_decimal_string, "1"]
 * BLS12-381 G1: 48 bytes (x) + 48 bytes (y) in big-endian
 */
function encodeG1Point(point: string[]): Uint8Array {
  if (point.length !== 3) {
    throw new Error(`Invalid G1 point: expected 3 coordinates, got ${point.length}`);
  }

  const x = BigInt(point[0]);
  const y = BigInt(point[1]);

  const buffer = new Uint8Array(96);

  // X coordinate (48 bytes, big-endian)
  const xBytes = bigIntToBytes(x, 48);
  buffer.set(xBytes, 0);

  // Y coordinate (48 bytes, big-endian)
  const yBytes = bigIntToBytes(y, 48);
  buffer.set(yBytes, 48);

  return buffer;
}

/**
 * Encode a G2 point from snarkjs format to BLS12-381 uncompressed bytes (192 bytes).
 *
 * snarkjs G2 point: [[x0, x1], [y0, y1], ["1", "0"]]
 * BLS12-381 G2: 48 bytes (x0) + 48 bytes (x1) + 48 bytes (y0) + 48 bytes (y1)
 */
function encodeG2Point(point: string[][]): Uint8Array {
  if (point.length !== 3 || point[0].length !== 2 || point[1].length !== 2) {
    throw new Error(`Invalid G2 point structure`);
  }

  const x0 = BigInt(point[0][0]);
  const x1 = BigInt(point[0][1]);
  const y0 = BigInt(point[1][0]);
  const y1 = BigInt(point[1][1]);

  const buffer = new Uint8Array(192);

  // BLS12-381 G2 encoding: (x0, x1, y0, y1) each 48 bytes
  buffer.set(bigIntToBytes(x0, 48), 0);
  buffer.set(bigIntToBytes(x1, 48), 48);
  buffer.set(bigIntToBytes(y0, 48), 96);
  buffer.set(bigIntToBytes(y1, 48), 144);

  return buffer;
}

/**
 * Convert a BigInt to a fixed-size byte array in big-endian format.
 */
function bigIntToBytes(value: bigint, length: number): Uint8Array {
  const hex = value.toString(16).padStart(length * 2, "0");
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Encode a Groth16 proof from snarkjs format to Soroban-compatible BLS12-381 bytes.
 *
 * Returns an object with:
 * - a: G1 point (96 bytes)
 * - b: G2 point (192 bytes)
 * - c: G1 point (96 bytes)
 */
export function encodeGroth16Proof(proof: Groth16Proof): {
  a: Uint8Array;
  b: Uint8Array;
  c: Uint8Array;
} {
  return {
    a: encodeG1Point(proof.pi_a),
    b: encodeG2Point(proof.pi_b),
    c: encodeG1Point(proof.pi_c),
  };
}

/**
 * Encode a field element (public signal) to 32 bytes for Soroban Fr type.
 * snarkjs public signals are decimal strings representing field elements.
 */
export function encodeFieldElement(signal: string): Uint8Array {
  const value = BigInt(signal);
  return bigIntToBytes(value, 32);
}

/**
 * Encode all public signals to a vector of Fr elements.
 */
export function encodePublicSignals(signals: string[]): Uint8Array[] {
  return signals.map(encodeFieldElement);
}

/**
 * Convert Uint8Array to hex string (for logging/debugging).
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
