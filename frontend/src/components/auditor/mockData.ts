// TODO [MEDIUM security]: rename to mockRandomHex — uses Math.random(), not crypto-secure.
// Only safe for display-only demo data. Never use for nonces, secrets, or commitments.
function randomHex(bytes: number): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < bytes * 2; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

export interface MockTransaction {
  id: number;
  commitment: string;
  nullifier: string;
  corridor: string;
  timestamp: string;
  amount: string;
  sender: string;
  receiver: string;
}

export const DEMO_VIEW_KEY = "vela_demo_view_key_2026";

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 1,
    commitment: "0x8a3f" + randomHex(12),
    nullifier: "0x2b1c" + randomHex(12),
    corridor: "AE→PH",
    timestamp: "2026-06-20 14:32",
    amount: "$500.00",
    sender: "Maria S.",
    receiver: "Santos Family",
  },
  {
    id: 2,
    commitment: "0x9c2e" + randomHex(12),
    nullifier: "0x5d4a" + randomHex(12),
    corridor: "US→CO",
    timestamp: "2026-06-20 15:01",
    amount: "$1,200.00",
    sender: "Carlos M.",
    receiver: "Rodriguez J.",
  },
  {
    id: 3,
    commitment: "0xf1b7" + randomHex(12),
    nullifier: "0x8e3f" + randomHex(12),
    corridor: "UK→NG",
    timestamp: "2026-06-20 15:45",
    amount: "$750.00",
    sender: "Adewale O.",
    receiver: "Okafor Family",
  },
  {
    id: 4,
    commitment: "0x4d9a" + randomHex(12),
    nullifier: "0xc7e2" + randomHex(12),
    corridor: "AE→PH",
    timestamp: "2026-06-20 18:12",
    amount: "$2,800.00",
    sender: "Ahmed K.",
    receiver: "Reyes Family",
  },
  {
    id: 5,
    commitment: "0x6b2c" + randomHex(12),
    nullifier: "0xa1f8" + randomHex(12),
    corridor: "US→CO",
    timestamp: "2026-06-21 09:05",
    amount: "$950.00",
    sender: "Jennifer L.",
    receiver: "Gomez A.",
  },
  {
    id: 6,
    commitment: "0xe8d1" + randomHex(12),
    nullifier: "0x3c9b" + randomHex(12),
    corridor: "UK→NG",
    timestamp: "2026-06-21 11:22",
    amount: "$1,800.00",
    sender: "Oluwaseun T.",
    receiver: "Adekunle M.",
  },
  {
    id: 7,
    commitment: "0x1a5e" + randomHex(12),
    nullifier: "0x7f4d" + randomHex(12),
    corridor: "AE→PH",
    timestamp: "2026-06-21 13:50",
    amount: "$2,100.00",
    sender: "Fatima R.",
    receiver: "De Leon P.",
  },
  {
    id: 8,
    commitment: "0xb3f9" + randomHex(12),
    nullifier: "0x6e2a" + randomHex(12),
    corridor: "US→CO",
    timestamp: "2026-06-21 16:38",
    amount: "$2,350.00",
    sender: "David P.",
    receiver: "Herrera C.",
  },
];

export const AUDIT_STATS = {
  totalVolume: "$12,450.00",
  corridorsActive: 4,
  averageTransfer: "$1,556.25",
  complianceRate: "100%",
};
