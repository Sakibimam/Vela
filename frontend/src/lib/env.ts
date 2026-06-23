export const ENV = {
  mockProofs: process.env.NEXT_PUBLIC_MOCK_PROOFS === "true",
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet",
  horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  verifierContractId: process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ID || "",
  policyContractId: process.env.NEXT_PUBLIC_POLICY_CONTRACT_ID || "",
  settlementContractId: process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT_ID || "",
} as const;

export function isMockMode(): boolean {
  return ENV.mockProofs || !ENV.verifierContractId;
}
