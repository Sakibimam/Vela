/**
 * View Key cryptographic layer for Vela.
 *
 * Implements selective disclosure: a master view key encrypts transaction
 * metadata so regulators can reconstruct private transactions on demand.
 *
 * Uses Web Crypto API (HKDF + AES-256-GCM) — works in both browser and Node.js.
 */

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const HKDF_INFO = TEXT_ENCODER.encode("vela-tx-key");

/** Transaction metadata encrypted under the view key. */
export interface TransactionPayload {
  /** Poseidon hash of sender identity (hex string). */
  senderIdHash: string;
  /** Poseidon hash of receiver identity (hex string). */
  receiverIdHash: string;
  /** Amount in USDC cents (e.g., 150000 = $1,500.00). */
  amount: bigint;
  /** Corridor identifier, e.g., "AE-PH" (Dubai → Philippines). */
  corridor: string;
  /** Unix timestamp (ms) when the transaction was created. */
  timestamp: number;
}

/** Encrypted transaction payload stored on-chain / in events. */
export interface EncryptedPayload {
  /** AES-256-GCM ciphertext. */
  ciphertext: Uint8Array;
  /** 12-byte initialization vector. */
  iv: Uint8Array;
  /** Public nonce used for HKDF key derivation. */
  nonce: string;
}

/**
 * Manages the view key lifecycle: generation, derivation, encryption, and
 * batch auditing of corridor transactions.
 */
export class ViewKeyManager {
  /**
   * Generate a new master view key (256-bit random).
   * @returns A CryptoKey suitable for HKDF derivation.
   */
  static async generateMasterKey(): Promise<CryptoKey> {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    return crypto.subtle.importKey("raw", raw, "HKDF", true, [
      "deriveKey",
      "deriveBits",
    ]);
  }

  /**
   * Derive a per-transaction AES-256-GCM key from the master key and a public nonce.
   * Uses HKDF-SHA256 with salt = nonce bytes, info = "vela-tx-key".
   * @param masterKey - The corridor master view key.
   * @param nonce - A unique public nonce (hex string) for this transaction.
   * @returns An AES-256-GCM CryptoKey for encrypt/decrypt.
   */
  static async deriveTransactionKey(
    masterKey: CryptoKey,
    nonce: string
  ): Promise<CryptoKey> {
    const salt = TEXT_ENCODER.encode(nonce);
    return crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt, info: HKDF_INFO },
      masterKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt a transaction payload for on-chain storage.
   * @param masterKey - The corridor master view key.
   * @param payload - Transaction metadata to encrypt.
   * @param nonce - A unique public nonce for key derivation.
   * @returns The encrypted payload (ciphertext + IV + nonce).
   */
  static async encryptPayload(
    masterKey: CryptoKey,
    payload: TransactionPayload,
    nonce: string
  ): Promise<EncryptedPayload> {
    const txKey = await this.deriveTransactionKey(masterKey, nonce);
    const iv = new Uint8Array(12) as Uint8Array<ArrayBuffer>;
    crypto.getRandomValues(iv);

    const serialized = serializePayload(payload);
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        txKey,
        serialized.buffer as ArrayBuffer
      )
    );

    return { ciphertext, iv, nonce };
  }

  /**
   * Decrypt a payload using the master view key and its stored nonce.
   * This is the regulator's operation — reconstruct a single transaction.
   * @param masterKey - The corridor master view key.
   * @param encrypted - The encrypted payload from on-chain events.
   * @returns The decrypted transaction metadata.
   */
  static async decryptPayload(
    masterKey: CryptoKey,
    encrypted: EncryptedPayload
  ): Promise<TransactionPayload> {
    const txKey = await this.deriveTransactionKey(masterKey, encrypted.nonce);

    const iv = new Uint8Array(encrypted.iv) as Uint8Array<ArrayBuffer>;
    const plaintext = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        txKey,
        encrypted.ciphertext.buffer as ArrayBuffer
      )
    );

    return deserializePayload(plaintext);
  }

  /**
   * Export a master key as a hex string for storage/sharing with regulators.
   * @param masterKey - The master view key to export.
   * @returns Hex-encoded 32-byte key material.
   */
  static async exportKey(masterKey: CryptoKey): Promise<string> {
    const raw = new Uint8Array(
      await crypto.subtle.exportKey("raw", masterKey)
    );
    return bytesToHex(raw);
  }

  /**
   * Import a master key from a hex string.
   * @param hexKey - 64-character hex string (32 bytes).
   * @returns A CryptoKey ready for derivation.
   */
  static async importKey(hexKey: string): Promise<CryptoKey> {
    if (hexKey.length !== 64) {
      throw new Error("View key must be exactly 64 hex characters (32 bytes)");
    }
    const raw = hexToBytes(hexKey);
    return crypto.subtle.importKey("raw", raw.buffer as ArrayBuffer, "HKDF", true, [
      "deriveKey",
      "deriveBits",
    ]);
  }

  /**
   * Batch-decrypt all transactions in a corridor.
   * This is the auditor flow — reconstruct the entire private ledger.
   * @param masterKey - The corridor master view key.
   * @param encryptedPayloads - Array of encrypted payloads from on-chain events.
   * @returns All decrypted transaction payloads.
   */
  static async auditCorridor(
    masterKey: CryptoKey,
    encryptedPayloads: EncryptedPayload[]
  ): Promise<TransactionPayload[]> {
    const results = await Promise.all(
      encryptedPayloads.map((ep) => this.decryptPayload(masterKey, ep))
    );
    return results;
  }
}

// ─── Serialization ───────────────────────────────────────────────────────────

function serializePayload(payload: TransactionPayload): Uint8Array {
  const json = JSON.stringify({
    s: payload.senderIdHash,
    r: payload.receiverIdHash,
    a: payload.amount.toString(),
    c: payload.corridor,
    t: payload.timestamp,
  });
  return TEXT_ENCODER.encode(json);
}

function deserializePayload(data: Uint8Array): TransactionPayload {
  const json = JSON.parse(TEXT_DECODER.decode(data)) as {
    s: string;
    r: string;
    a: string;
    c: string;
    t: number;
  };
  return {
    senderIdHash: json.s,
    receiverIdHash: json.r,
    amount: BigInt(json.a),
    corridor: json.c,
    timestamp: json.t,
  };
}

// ─── Hex Utilities ───────────────────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error("Hex string contains invalid characters");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
