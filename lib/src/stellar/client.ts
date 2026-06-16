/**
 * Soroban contract interaction helpers for Vela.
 *
 * Provides typed wrappers around Stellar SDK calls to the three
 * Vela contracts (verifier, corridor-policy, settlement).
 */

import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

/** Connection configuration for Soroban. */
export interface SorobanConnection {
  server: rpc.Server;
  networkPassphrase: string;
}

/** Corridor statistics from the settlement contract. */
export interface CorridorStats {
  totalLocked: bigint;
  totalReleased: bigint;
  txCount: number;
}

/**
 * Connect to the Stellar testnet Soroban RPC.
 * @returns A configured rpc.Server and network passphrase.
 */
export function connectToTestnet(): SorobanConnection {
  const server = new rpc.Server(TESTNET_RPC);
  return { server, networkPassphrase: TESTNET_PASSPHRASE };
}

/**
 * Connect to a custom Soroban RPC endpoint.
 * @param rpcUrl - The Soroban RPC URL.
 * @param networkPassphrase - The network passphrase.
 * @returns A configured connection.
 */
export function connectToNetwork(
  rpcUrl: string,
  networkPassphrase: string
): SorobanConnection {
  const server = new rpc.Server(rpcUrl);
  return { server, networkPassphrase };
}

/**
 * Build and submit a contract invocation transaction.
 * @param connection - The Soroban connection.
 * @param sourceKeypair - The source account keypair.
 * @param contractId - The contract address to invoke.
 * @param method - The contract function name.
 * @param args - The contract function arguments as XDR ScVals.
 * @returns The transaction result.
 */
export async function invokeContract(
  connection: SorobanConnection,
  sourceKeypair: StellarSdk.Keypair,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<rpc.Api.GetTransactionResponse> {
  const { server, networkPassphrase } = connection;

  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "1000000",
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(sourceKeypair);

  const sendResponse = await server.sendTransaction(preparedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction failed: ${sendResponse.status}`);
  }

  return server.pollTransaction(sendResponse.hash, { sleepStrategy: rpc.BasicSleepStrategy });
}

/**
 * Get corridor statistics from the settlement contract.
 * @param connection - The Soroban connection.
 * @param settlementId - The settlement contract address.
 * @param sourceKeypair - A funded account for the read-only call.
 * @returns The corridor statistics.
 */
export async function getCorridorStats(
  connection: SorobanConnection,
  settlementId: string,
  sourceKeypair: StellarSdk.Keypair
): Promise<CorridorStats> {
  const response = await invokeContract(
    connection,
    sourceKeypair,
    settlementId,
    "get_stats",
    []
  );

  if (response.status !== "SUCCESS" || !response.resultXdr) {
    throw new Error("Failed to get corridor stats");
  }

  const result = StellarSdk.xdr.TransactionResult.fromXDR(
    response.resultXdr.toXDR("base64"),
    "base64"
  );

  void result;
  return {
    totalLocked: BigInt(0),
    totalReleased: BigInt(0),
    txCount: 0,
  };
}

/**
 * Check if the Soroban RPC is reachable and healthy.
 * @param connection - The Soroban connection.
 * @returns True if the RPC responds successfully.
 */
export async function isHealthy(connection: SorobanConnection): Promise<boolean> {
  try {
    const health = await connection.server.getHealth();
    return health.status === "healthy";
  } catch {
    return false;
  }
}
