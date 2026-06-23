# Vela — Private Cross-Border Remittances on Stellar

> Zero-knowledge proofs shield every transfer. Regulators reconstruct on demand.

![Stellar](https://img.shields.io/badge/Stellar-Soroban-blue)
![ZK](https://img.shields.io/badge/ZK-Groth16%20%7C%20BLS12--381-purple)
![Circom](https://img.shields.io/badge/Circuits-Circom%202.1-orange)
![USDC](https://img.shields.io/badge/Asset-USDC-green)
![Hackathon](https://img.shields.io/badge/Stellar%20Hacks-Real--World%20ZK-yellow)

**Built for Stellar Hacks: Real-World ZK (June 15–29, 2026)**

---

## The Problem

GIZ paid 900 Syrian hospital workers via Stellar's SDP — proving blockchain rails work for real payroll. AirTM has processed over $1B in stablecoin disbursements. But every one of these payments is permanently visible to anyone with a block explorer.

This is the **transparency paradox**: the same property that makes blockchain trustworthy makes it a privacy crisis. Every salary reveals income level. Every remittance reveals family connections. Every cross-border transfer is a data point for surveillance, discrimination, or theft targeting.

Workers and families deserve financial privacy without sacrificing regulatory compliance.

## The Solution

Vela is a private remittance corridor on Stellar where **zero-knowledge proofs replace identity disclosure**. Three Circom circuits shield the transfer: the sender proves KYC compliance without revealing identity, the amount is committed as a Poseidon hash rather than stored in cleartext, and the receiver claims funds with a secret key that links to nothing on-chain.

Regulators aren't locked out — they hold a **corridor view key** (HKDF-derived) that decrypts every transaction in the corridor. Privacy by default, auditability on demand. The ZK proofs are verified inside Soroban smart contracts on Stellar, making compliance cryptographically enforced rather than policy-enforced.

## Demo

| Resource | Link |
|----------|------|
| Demo Video | _Coming soon_ |
| Live Testnet | _Coming soon_ |

**The "aha moment":** the audit page shows a ledger of shielded transactions (amounts hidden, identities private). Enter the corridor view key — and every cell decrypts in a staggered animation, revealing the full private ledger.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VELA ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SENDER (Dubai)              STELLAR NETWORK              RECEIVER (Manila)
│  ─────────────              ───────────────              ────────────────
│                                                                          │
│  ┌──────────────┐           ┌──────────────┐           ┌──────────────┐ │
│  │ KYC Proof    │──proof──▶│  VERIFIER    │           │              │ │
│  │ (circom)     │           │  (Soroban)   │           │              │ │
│  └──────────────┘           └──────┬───────┘           │              │ │
│                                    │ valid              │              │ │
│  ┌──────────────┐           ┌──────▼───────┐           │              │ │
│  │ Amount Commit│──commit──▶│  CORRIDOR    │           │  Withdrawal  │ │
│  │ (circom)     │           │  POLICY      │◀──proof──│  Proof       │ │
│  └──────────────┘           └──────┬───────┘           │  (circom)    │ │
│                                    │                    │              │ │
│  ┌──────────────┐           ┌──────▼───────┐           └──────────────┘ │
│  │ Encrypt w/   │──payload─▶│  SETTLEMENT  │──USDC──▶  Receiver Wallet  │
│  │ View Key     │           │  (USDC vault)│                            │
│  └──────────────┘           └──────────────┘                            │
│                                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                                          │
│  REGULATOR                                                               │
│  ─────────                                                               │
│  ┌──────────────┐           ┌──────────────┐                            │
│  │ View Key     │──decrypt─▶│ Full Ledger  │  amounts, identities,      │
│  │ (HKDF+AES)   │           │ Reconstruction│  corridors, timestamps    │
│  └──────────────┘           └──────────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## How It Works

### Sender (Dubai nurse sending $500 to Manila)
1. Proves KYC compliance with a ZK proof — jurisdiction, age, and attestation verified without revealing identity
2. Commits the amount using Poseidon hashing — the blockchain stores a hash, not a number
3. Encrypted transaction metadata is stored on-chain under the corridor view key

### Receiver (Family in Manila claiming funds)
1. Enters the shared secret from the sender
2. Generates a Merkle withdrawal proof — proves knowledge of a valid commitment without revealing which one
3. Claims funds — USDC released from the settlement vault

### Regulator (Authorized auditor)
1. Holds the corridor master view key (shared via secure channel)
2. Derives per-transaction keys using HKDF
3. Decrypts all transaction metadata — full ledger reconstruction on demand

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ZK Circuits | Circom 2.1 — Groth16 proofs on BLS12-381 |
| On-chain Verifier | Soroban (BLS12-381 host functions) |
| Smart Contracts | Soroban / Rust — 3 contracts (Verifier, Policy, Settlement) |
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 |
| Wallet | Freighter (@stellar/freighter-api) |
| Proof Generation | snarkjs (browser-side WASM) |
| View Key Crypto | Web Crypto API — HKDF + AES-256-GCM |
| Network | Stellar Testnet (Soroban RPC) |
| Package Manager | pnpm workspaces |

## Quick Start

```bash
# Clone and install
git clone https://github.com/Sakibimam/Vela.git
cd Vela
pnpm install

# Build the shared library (required before frontend)
cd lib && pnpm build && cd ..

# Run the frontend (mock mode — no contracts required)
cd frontend && pnpm dev
# Open http://localhost:3000

# Compile ZK circuits (requires circom installed)
cd ../circuits && pnpm run compile
```

## Project Structure

```
vela/
├── circuits/                # Circom ZK circuits
│   ├── circuits/
│   │   ├── kyc_compliance.circom
│   │   ├── amount_commitment.circom
│   │   └── withdrawal.circom
│   ├── scripts/             # Compile, setup, prove scripts
│   └── test/                # Circuit unit tests
├── contracts/               # Soroban smart contracts (Rust)
│   ├── groth16-verifier/    # BLS12-381 proof verification
│   ├── corridor-policy/     # Business rules + nullifiers
│   └── settlement/          # USDC vault + state machine
├── lib/                     # Shared TypeScript library
│   └── src/
│       ├── crypto/          # ViewKey (HKDF+AES), Poseidon, Merkle
│       ├── prover/          # Browser-side snarkjs wrapper
│       └── stellar/         # Soroban client + Freighter wallet
├── frontend/                # Next.js 15 application
│   └── src/
│       ├── app/             # Pages: /, /send, /receive, /audit, /demo
│       ├── components/      # UI system + flow components
│       └── lib/             # Integration layer (prover, stellar, viewkey)
├── docs/                    # Architecture, circuits, demo script
└── scripts/                 # Deployment and utility scripts
```

## What's Real vs. What's Mock

**Fully implemented:**
- ZK circuits (Circom) — KYC compliance, amount commitment, withdrawal
- Groth16 verifier contract (Soroban/Rust) — BLS12-381 verification
- Corridor policy + settlement contracts
- View key cryptography — HKDF key derivation + AES-256-GCM encryption/decryption
- Poseidon Merkle tree — commitment storage with proof generation
- Browser-side proof generation — snarkjs WASM
- Complete frontend with sender, receiver, auditor, and demo flows
- Mock mode that demonstrates the full UX without deployed contracts

**Mock / not yet integrated:**
- KYC attestation provider (in production: regulated identity verifier)
- Fiat on/off ramp (in production: Stellar anchor via SEP-31)
- Testnet contract deployment (contracts written, deployment pending)
- Multi-corridor governance (single corridor in demo)

> In production, the KYC attestation would come from a regulated provider (e.g., Synaps, Jumio). The demo uses mock attestation data to demonstrate the cryptographic flow end-to-end.

## Hackathon

| | |
|---|---|
| **Event** | Stellar Hacks: Real-World ZK |
| **Dates** | June 15–29, 2026 |
| **Prize Pool** | $10,000 XLM |
| **Requirement** | ZK must be load-bearing, verified inside Soroban |
| **Submission** | GitHub repo + 2–3 min demo video |

## License

MIT
