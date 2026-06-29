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

function fieldElementToBytes32(decimalString: string): Uint8Array {
  const n = BigInt(decimalString);
  const hex = n.toString(16).padStart(64, "0");
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
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

  // Commitment is the first public signal of the amount proof (convert from decimal string to bytes)
  const commitment = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(fieldElementToBytes32(params.commitment))
  );

  // Nullifiers are the last public signal from each proof (convert from decimal string to bytes)
  const nullifierKycBytes = fieldElementToBytes32(params.kycPublicSignals[params.kycPublicSignals.length - 1] || "0");
  const nullifierAmountBytes = fieldElementToBytes32(params.amountPublicSignals[params.amountPublicSignals.length - 1] || "0");

  const nullifierKyc = StellarSdk.xdr.ScVal.scvBytes(Buffer.from(nullifierKycBytes));
  const nullifierAmount = StellarSdk.xdr.ScVal.scvBytes(Buffer.from(nullifierAmountBytes));

  const encPayload = StellarSdk.xdr.ScVal.scvBytes(
    Buffer.from(params.encryptedPayload.padStart(64, "0").slice(0, 64), "hex")
  );

  // Transaction builder function that accepts a fresh account
  const buildTx = (sourceAccount: any) => {
    return new StellarSdk.TransactionBuilder(sourceAccount, {
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
      .setTimeout(300)
      .build();
  };

  // Submit with retry on txBadSeq
  const MAX_RETRIES = 3;
  let sendResponse;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Always fetch fresh account sequence
    const sourceAccount = await server.getAccount(walletAddress);
    const tx = buildTx(sourceAccount);
    const preparedTx = await server.prepareTransaction(tx);

    const { signTx } = await import("@vela/lib");
    const signedXdr = await signTx(preparedTx.toXDR(), networkPassphrase);
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

    sendResponse = await server.sendTransaction(signedTx);

    if (sendResponse.status === "ERROR") {
      // Check if this is a txBadSeq error by inspecting the error result
      const errorStr = JSON.stringify(sendResponse.errorResult);
      const isBadSeq = errorStr.includes("txBadSeq") || errorStr.includes("tx_bad_seq");

      if (isBadSeq && attempt < MAX_RETRIES - 1) {
        // Stale sequence — wait and retry with fresh account
        await delay(1000);
        continue;
      }

      throw new Error(`Transaction send failed: ${errorStr}`);
    }

    // Success - break out of retry loop
    break;
  }

  if (!sendResponse || sendResponse.status === "ERROR") {
    throw new Error("Transaction failed after 3 retries");
  }

  const result = await server.pollTransaction(sendResponse.hash, {
    sleepStrategy: rpc.BasicSleepStrategy,
  });

  if (result.status !== "SUCCESS") {
    // Check if this is a nullifier reuse error (Contract error #8)
    const resultStr = JSON.stringify(result);
    if (resultStr.includes("Error(Contract, #8)") || resultStr.includes("NullifierAlreadyUsed")) {
      throw new Error(
        "Nullifier already used. This proof has been consumed. Please generate fresh proofs and try again."
      );
    }
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

  // snarkjs publicSignals for withdrawal circuit:
  //   [0] = withdrawal_binding (circuit output)
  //   [1] = merkle_root (public input)
  //   [2] = nullifier (public input)
  //   [3] = receiver_address_hash (public input)
  //
  // Contract verifier ("withdraw") expects exactly 3 public inputs in this order:
  //   [merkle_root, nullifier, withdrawal_binding]
  // Contract fn withdraw() params after proof:
  //   withdrawal_public_inputs: Vec<Fr> (the 3 above)
  //   nullifier: BytesN<32> (same value as public_inputs[1], used for nullifier-set storage)
  //   withdrawal_binding: BytesN<32> (same as public_inputs[2], emitted in event)

  const withdrawalBindingDecimal = params.withdrawalPublicSignals[0];
  const merkleRootDecimal = params.withdrawalPublicSignals[1];
  const nullifierDecimal = params.withdrawalPublicSignals[2];

  if (!merkleRootDecimal || !nullifierDecimal || !withdrawalBindingDecimal) {
    throw new Error(
      `Invalid withdrawal public signals: merkleRoot=${merkleRootDecimal}, nullifier=${nullifierDecimal}, binding=${withdrawalBindingDecimal}`
    );
  }

  // Vec<Fr> with exactly 3 elements for the verifier
  const contractPublicInputs = [merkleRootDecimal, nullifierDecimal, withdrawalBindingDecimal];
  const publicInputsEncoded = encodePublicSignals(contractPublicInputs);
  const publicInputsVal = StellarSdk.xdr.ScVal.scvVec(
    publicInputsEncoded.map((bytes) =>
      StellarSdk.xdr.ScVal.scvBytes(Buffer.from(bytes))
    )
  );

  // Standalone nullifier BytesN<32> — must encode the same decimal value as contractPublicInputs[1]
  const nullifierBytes = fieldElementToBytes32(nullifierDecimal);
  const nullifier = StellarSdk.xdr.ScVal.scvBytes(Buffer.from(nullifierBytes));

  // Standalone withdrawal_binding BytesN<32> — same value as contractPublicInputs[2]
  const withdrawalBindingBytes = fieldElementToBytes32(withdrawalBindingDecimal);
  const withdrawalBinding = StellarSdk.xdr.ScVal.scvBytes(Buffer.from(withdrawalBindingBytes));

  // Transaction builder — contract.call args match Rust signature exactly:
  //   withdraw(receiver, withdrawal_proof, withdrawal_public_inputs, nullifier, withdrawal_binding)
  const buildTx = (sourceAccount: any) => {
    return new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "10000000",
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          "withdraw",
          StellarSdk.nativeToScVal(walletAddress, { type: "address" }),  // receiver: Address
          proofVal,                                                       // withdrawal_proof: Proof {a, b, c}
          publicInputsVal,                                                // withdrawal_public_inputs: Vec<Fr> [3 elements]
          nullifier,                                                      // nullifier: BytesN<32>
          withdrawalBinding                                               // withdrawal_binding: BytesN<32>
        )
      )
      .setTimeout(300)
      .build();
  };

  // Submit with retry on txBadSeq and txTooLate
  const MAX_RETRIES = 3;
  let sendResponse;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Always fetch fresh account sequence
    const sourceAccount = await server.getAccount(walletAddress);
    const tx = buildTx(sourceAccount);
    const preparedTx = await server.prepareTransaction(tx);

    const { signTx } = await import("@vela/lib");
    const signedXdr = await signTx(preparedTx.toXDR(), networkPassphrase);
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

    sendResponse = await server.sendTransaction(signedTx);

    if (sendResponse.status === "ERROR") {
      // Check if this is a txBadSeq or txTooLate error by inspecting the error result
      const errorStr = JSON.stringify(sendResponse.errorResult);
      const isBadSeq = errorStr.includes("txBadSeq") || errorStr.includes("tx_bad_seq");
      const isTooLate = errorStr.includes("txTooLate") || errorStr.includes("tx_too_late");

      if ((isBadSeq || isTooLate) && attempt < MAX_RETRIES - 1) {
        // Stale sequence or expired timeBounds — wait and retry with fresh account and new timeBounds
        await delay(1000);
        continue;
      }

      throw new Error(`Transaction send failed: ${errorStr}`);
    }

    // Success - break out of retry loop
    break;
  }

  if (!sendResponse || sendResponse.status === "ERROR") {
    throw new Error("Transaction failed after 3 retries");
  }

  const result = await server.pollTransaction(sendResponse.hash, {
    sleepStrategy: rpc.BasicSleepStrategy,
  });

  if (result.status !== "SUCCESS") {
    // Check if this is a nullifier reuse error (Contract error #8)
    const resultStr = JSON.stringify(result);
    if (resultStr.includes("Error(Contract, #8)") || resultStr.includes("NullifierAlreadyUsed")) {
      throw new Error(
        "NULLIFIER_ALREADY_USED: These proofs were already used. Please go back to Step 2 and generate new proofs."
      );
    }
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
  const walletAddress = _cachedWalletAddress;
  if (!walletAddress) {
    throw new Error("Wallet not connected. Connect your wallet first.");
  }
  return realDeposit(params, walletAddress);
}

export async function submitWithdrawal(params: WithdrawParams): Promise<TransactionResult> {
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
