import { ENV, isMockMode } from "./env";

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

export interface TransactionResult {
  hash: string;
  explorerUrl: string;
  ledger: number;
}

import type { Groth16Proof } from "snarkjs";

export interface DepositParams {
  kycProof: Groth16Proof;
  kycPublicSignals: string[];
  amountProof: Groth16Proof;
  amountPublicSignals: string[];
  commitment: string;
  encryptedPayload: string;
}

export interface WithdrawParams {
  withdrawalProof: Groth16Proof;
  withdrawalPublicSignals: string[];
  nullifier: string;
}

function explorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

async function mockTransaction(delayMs: number): Promise<TransactionResult> {
  await delay(delayMs);
  const hash = randomHex(32);
  return { hash, explorerUrl: explorerUrl(hash), ledger: 1234567 + Math.floor(Math.random() * 1000) };
}

async function realDeposit(params: DepositParams, walletAddress: string): Promise<TransactionResult> {
  const StellarSdk = await import("@stellar/stellar-sdk");
  const { rpc } = StellarSdk;
  const { encodeGroth16Proof, encodePublicSignals } = await import("@vela/lib");

  const server = new rpc.Server(ENV.sorobanRpcUrl);
  const networkPassphrase = ENV.networkPassphrase;
  const policyContractId = ENV.policyContractId;

  const sourceAccount = await server.getAccount(walletAddress);
  const contract = new StellarSdk.Contract(policyContractId);

  // Encode the ZK proofs to BLS12-381 format
  const kycProofEncoded = encodeGroth16Proof(params.kycProof);
  const amountProofEncoded = encodeGroth16Proof(params.amountProof);

  // Build Proof ScVals with real BLS12-381 curve points
  const kycProofVal = StellarSdk.xdr.ScVal.scvMap([
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("a"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(kycProofEncoded.a)),
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("b"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(kycProofEncoded.b)),
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("c"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(kycProofEncoded.c)),
    }),
  ]);

  const amountProofVal = StellarSdk.xdr.ScVal.scvMap([
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("a"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(amountProofEncoded.a)),
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("b"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(amountProofEncoded.b)),
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("c"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(amountProofEncoded.c)),
    }),
  ]);

  // Encode public signals as Fr field elements (32 bytes each)
  const kycPublicInputsEncoded = encodePublicSignals(params.kycPublicSignals);
  const amountPublicInputsEncoded = encodePublicSignals(params.amountPublicSignals);

  const kycPublicInputsVal = StellarSdk.xdr.ScVal.scvVec(
    kycPublicInputsEncoded.map((bytes) =>
      StellarSdk.xdr.ScVal.scvBytes(Buffer.from(bytes))
    )
  );

  const amountPublicInputsVal = StellarSdk.xdr.ScVal.scvVec(
    amountPublicInputsEncoded.map((bytes) =>
      StellarSdk.xdr.ScVal.scvBytes(Buffer.from(bytes))
    )
  );

  // Commitment is the first public signal of the amount proof
  const commitment = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.commitment.padStart(64, "0"), "hex")
  );

  // Derive nullifiers from the first 32 bytes of each proof's public signals
  const nullifierKyc = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.kycPublicSignals[params.kycPublicSignals.length - 1] || randomHex(32)).slice(0, 32)
  );
  const nullifierAmount = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.amountPublicSignals[params.amountPublicSignals.length - 1] || randomHex(32)).slice(0, 32)
  );

  const encPayload = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.encryptedPayload.padStart(64, "0").slice(0, 64), "hex")
  );

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "10000000",
    networkPassphrase,
  })
    .addOperation(
      contract.call(
        "deposit",
        StellarSdk.nativeToScVal(walletAddress, { type: "address" }),
        kycProofVal,
        kycPublicInputsVal,
        amountProofVal,
        amountPublicInputsVal,
        commitment,
        nullifierKyc,
        nullifierAmount,
        encPayload
      )
    )
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);

  const { signTx } = await import("@vela/lib");
  const signedXdr = await signTx(preparedTx.toXDR(), networkPassphrase);

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction send failed: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  const result = await server.pollTransaction(sendResponse.hash, {
    sleepStrategy: rpc.BasicSleepStrategy,
  });

  if (result.status !== "SUCCESS") {
    throw new Error(`Transaction failed on-chain: ${result.status}`);
  }

  return {
    hash: sendResponse.hash,
    explorerUrl: explorerUrl(sendResponse.hash),
    ledger: result.ledger,
  };
}

async function realWithdraw(params: WithdrawParams, walletAddress: string): Promise<TransactionResult> {
  const StellarSdk = await import("@stellar/stellar-sdk");
  const { rpc } = StellarSdk;
  const { encodeGroth16Proof, encodePublicSignals } = await import("@vela/lib");

  const server = new rpc.Server(ENV.sorobanRpcUrl);
  const networkPassphrase = ENV.networkPassphrase;
  const policyContractId = ENV.policyContractId;

  const sourceAccount = await server.getAccount(walletAddress);
  const contract = new StellarSdk.Contract(policyContractId);

  // Encode the withdrawal proof to BLS12-381 format
  const proofEncoded = encodeGroth16Proof(params.withdrawalProof);

  const proofVal = StellarSdk.xdr.ScVal.scvMap([
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("a"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(proofEncoded.a)),
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("b"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(proofEncoded.b)),
    }),
    new StellarSdk.xdr.ScMapEntry({
      key: StellarSdk.xdr.ScVal.scvSymbol("c"),
      val: StellarSdk.xdr.ScVal.scvBytes(Buffer.from(proofEncoded.c)),
    }),
  ]);

  // Encode public signals as Fr field elements
  const publicInputsEncoded = encodePublicSignals(params.withdrawalPublicSignals);
  const publicInputsVal = StellarSdk.xdr.ScVal.scvVec(
    publicInputsEncoded.map((bytes) =>
      StellarSdk.xdr.ScVal.scvBytes(Buffer.from(bytes))
    )
  );

  const nullifier = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.nullifier.padStart(64, "0").slice(0, 64), "hex")
  );

  // Withdrawal binding is derived from public signals (last element is typically the binding)
  const withdrawalBinding = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.withdrawalPublicSignals[params.withdrawalPublicSignals.length - 1] || randomHex(32)).slice(0, 32)
  );

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "10000000",
    networkPassphrase,
  })
    .addOperation(
      contract.call(
        "withdraw",
        StellarSdk.nativeToScVal(walletAddress, { type: "address" }),
        proofVal,
        publicInputsVal,
        nullifier,
        withdrawalBinding
      )
    )
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);

  const { signTx } = await import("@vela/lib");
  const signedXdr = await signTx(preparedTx.toXDR(), networkPassphrase);

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction send failed: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  const result = await server.pollTransaction(sendResponse.hash, {
    sleepStrategy: rpc.BasicSleepStrategy,
  });

  if (result.status !== "SUCCESS") {
    throw new Error(`Transaction failed on-chain: ${result.status}`);
  }

  return {
    hash: sendResponse.hash,
    explorerUrl: explorerUrl(sendResponse.hash),
    ledger: result.ledger,
  };
}

let _cachedWalletAddress: string | null = null;

export function setWalletAddress(address: string) {
  _cachedWalletAddress = address;
}

export function getWalletAddress(): string | null {
  return _cachedWalletAddress;
}

export async function submitDeposit(params: DepositParams): Promise<TransactionResult> {
  if (isMockMode()) {
    return mockTransaction(3000 + Math.random() * 1500);
  }
  const walletAddress = _cachedWalletAddress;
  if (!walletAddress) {
    throw new Error("Wallet not connected. Connect your wallet first.");
  }
  return realDeposit(params, walletAddress);
}

export async function submitWithdrawal(params: WithdrawParams): Promise<TransactionResult> {
  if (isMockMode()) {
    return mockTransaction(3000 + Math.random() * 1500);
  }
  const walletAddress = _cachedWalletAddress;
  if (!walletAddress) {
    throw new Error("Wallet not connected. Connect your wallet first.");
  }
  return realWithdraw(params, walletAddress);
}

export async function connectWallet(): Promise<string> {
  const { connectWallet: freighterConnect } = await import("@vela/lib");
  const address = await freighterConnect();
  _cachedWalletAddress = address;
  return address;
}

export async function checkWalletConnection(): Promise<boolean> {
  return _cachedWalletAddress !== null;
}
