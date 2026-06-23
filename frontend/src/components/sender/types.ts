export interface SendFormData {
  amount: string;
  recipientAddress: string;
  corridor: string;
  sharedSecret: string;
  country: string;
  birthYear: string;
}

export type SendStep = 1 | 2 | 3 | 4;

export interface ProofState {
  status: "idle" | "generating" | "complete" | "error";
  hash: string | null;
  error: string | null;
}

export interface TransactionState {
  status: "idle" | "building" | "signing" | "submitting" | "complete" | "error";
  hash: string | null;
  error: string | null;
}

export const CORRIDORS = [
  { value: "AE-PH", label: "Dubai → Manila", senderCountry: "AE" },
  { value: "US-CO", label: "US → Colombia", senderCountry: "US" },
  { value: "GB-NG", label: "UK → Lagos", senderCountry: "GB" },
] as const;

export const COUNTRIES: Record<string, string> = {
  AE: "United Arab Emirates",
  US: "United States",
  GB: "United Kingdom",
  PH: "Philippines",
  CO: "Colombia",
  NG: "Nigeria",
};
