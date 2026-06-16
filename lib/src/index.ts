/**
 * @vela/lib — Shared library for the Vela ZK remittance corridor.
 *
 * Re-exports all public APIs from crypto, prover, and stellar modules.
 */

// Crypto layer
export { ViewKeyManager } from "./crypto/viewkey.js";
export type {
  TransactionPayload,
  EncryptedPayload,
} from "./crypto/viewkey.js";

export { PoseidonHasher } from "./crypto/poseidon.js";

export { PoseidonMerkleTree } from "./crypto/merkle.js";
export type { MerkleProof } from "./crypto/merkle.js";

// Prover
export { VelaProver } from "./prover/browser.js";
export type {
  ProofResult,
  KycInput,
  AmountInput,
  WithdrawalInput,
} from "./prover/browser.js";

// Stellar
export {
  connectToTestnet,
  connectToNetwork,
  invokeContract,
  getCorridorStats,
  isHealthy,
} from "./stellar/client.js";
export type { SorobanConnection, CorridorStats } from "./stellar/client.js";

export {
  isConnected,
  connectWallet,
  getWalletInfo,
  signTx,
  isOnNetwork,
} from "./stellar/wallet.js";
export type { WalletInfo } from "./stellar/wallet.js";
