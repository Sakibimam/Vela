export type DemoPhase =
  | "idle"
  | "sender-connect"
  | "sender-details"
  | "sender-kyc-proof"
  | "sender-amount-proof"
  | "sender-submit"
  | "sender-complete"
  | "receiver-connect"
  | "receiver-lookup"
  | "receiver-proof"
  | "receiver-claim"
  | "receiver-complete"
  | "reveal-prompt"
  | "reveal-decrypt"
  | "complete";

export interface NetworkEvent {
  id: string;
  timestamp: string;
  type: "proof" | "verify" | "commit" | "lock" | "unlock" | "claim";
  label: string;
  detail: string;
  txHash: string;
}

export interface DemoState {
  phase: DemoPhase;
  events: NetworkEvent[];
  senderTxHash: string | null;
  receiverTxHash: string | null;
  revealed: boolean;
}
