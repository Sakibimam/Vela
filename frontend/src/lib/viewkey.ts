import { isMockMode } from "./env";
import { DEMO_VIEW_KEY, MOCK_TRANSACTIONS } from "@/components/auditor/mockData";

export interface DecryptedTransaction {
  id: number;
  commitment: string;
  nullifier: string;
  corridor: string;
  timestamp: string;
  amount: string;
  sender: string;
  receiver: string;
}

export async function validateViewKey(key: string): Promise<boolean> {
  if (isMockMode()) {
    return key.trim() === DEMO_VIEW_KEY;
  }
  try {
    const { ViewKeyManager } = await import("@vela/lib");
    await ViewKeyManager.importKey(key.trim());
    return true;
  } catch {
    return false;
  }
}

export async function decryptLedger(key: string): Promise<DecryptedTransaction[]> {
  if (isMockMode()) {
    if (key.trim() !== DEMO_VIEW_KEY) {
      throw new Error("Invalid view key");
    }
    return MOCK_TRANSACTIONS.map((tx) => ({ ...tx }));
  }

  const { ViewKeyManager } = await import("@vela/lib");
  const masterKey = await ViewKeyManager.importKey(key.trim());

  // In real mode, fetch encrypted payloads from on-chain events
  // and decrypt each one with the corridor view key
  // For now this path is a placeholder until contracts emit events
  void masterKey;
  return MOCK_TRANSACTIONS.map((tx) => ({ ...tx }));
}
