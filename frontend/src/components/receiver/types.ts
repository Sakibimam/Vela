export type ReceiveStep = 1 | 2 | 3;

export interface ClaimData {
  secret: string;
  amount: string | null;
  corridor: string | null;
  commitmentHash: string | null;
}

export interface LookupState {
  status: "idle" | "searching" | "found" | "not-found" | "error";
  error: string | null;
}

export interface WithdrawalProofState {
  status: "idle" | "generating" | "complete" | "error";
  hash: string | null;
  error: string | null;
}

export interface ClaimTxState {
  status: "idle" | "building" | "signing" | "submitting" | "complete" | "error";
  hash: string | null;
  error: string | null;
}
