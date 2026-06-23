/**
 * Freighter wallet integration for Vela.
 *
 * Wraps @stellar/freighter-api for connecting to the user's
 * browser wallet, signing transactions, and checking network state.
 */

import {
  isConnected as freighterIsConnected,
  requestAccess,
  signTransaction,
  getNetwork,
} from "@stellar/freighter-api";

/** Wallet connection result. */
export interface WalletInfo {
  /** The user's Stellar public key (G...). */
  publicKey: string;
  /** The connected network (TESTNET or PUBLIC). */
  network: string;
}

/**
 * Check if Freighter wallet extension is installed and connected.
 * @returns True if Freighter is available in the browser.
 */
export async function isConnected(): Promise<boolean> {
  try {
    const result = await freighterIsConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Connect to the Freighter wallet and request account access.
 * Prompts the user to approve the connection if not already authorized.
 * @returns The user's public key.
 * @throws If the user denies access or Freighter is not installed.
 */
export async function connectWallet(): Promise<string> {
  const accessResult = await requestAccess();
  if (accessResult.error) {
    const msg = typeof accessResult.error === "string"
      ? accessResult.error
      : accessResult.error.message || "Connection denied";
    throw new Error(msg);
  }

  if (!accessResult.address) {
    throw new Error("No address returned from Freighter");
  }

  return accessResult.address;
}

/**
 * Get full wallet info including the connected network.
 * @returns The public key and network name.
 */
export async function getWalletInfo(): Promise<WalletInfo> {
  const publicKey = await connectWallet();
  const networkResult = await getNetwork();

  return {
    publicKey,
    network: networkResult.network || "TESTNET",
  };
}

/**
 * Sign a Stellar transaction XDR using the Freighter wallet.
 * @param xdr - The transaction XDR (base64 encoded) to sign.
 * @param networkPassphrase - The network passphrase for the transaction.
 * @returns The signed transaction XDR (base64 encoded).
 * @throws If the user rejects the signing request.
 */
export async function signTx(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase,
  });

  if (result.error) {
    throw new Error(`Transaction signing rejected: ${result.error}`);
  }

  return result.signedTxXdr;
}

/**
 * Check if the wallet is connected to the expected network.
 * @param expectedNetwork - The network name to check ("TESTNET" or "PUBLIC").
 * @returns True if the wallet is on the expected network.
 */
export async function isOnNetwork(expectedNetwork: string): Promise<boolean> {
  try {
    const networkResult = await getNetwork();
    return (
      networkResult.network?.toUpperCase() === expectedNetwork.toUpperCase()
    );
  } catch {
    return false;
  }
}
