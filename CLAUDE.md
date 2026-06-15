You are building "Vela" — a private cross-border remittance corridor on 
Stellar using zero-knowledge proofs. This is a hackathon project for 
"Stellar Hacks: Real-World ZK" (June 15–29, 2026).

FIRST: Read the installed Stellar skills if they exist:
- Check if .claude/skills/ directory exists and read any ZK or Soroban skills
- Run: ls -la .claude/skills/ 2>/dev/null || echo "No skills installed"

THEN: Create the complete project structure and CLAUDE.md.

Create this exact folder structure:
```
vela/
├── CLAUDE.md                    # Project brain — read this every session
├── README.md                    # Judge-facing README
├── .gitignore
├── .env.example
├── package.json                 # Root workspace config
├── circuits/                    # Circom ZK circuits
│   ├── package.json
│   ├── circuits/
│   │   ├── kyc_compliance.circom
│   │   ├── amount_commitment.circom
│   │   └── withdrawal.circom
│   ├── scripts/
│   │   ├── compile.sh
│   │   ├── setup.sh
│   │   └── prove.sh
│   ├── test/
│   │   └── circuits.test.js
│   └── build/                   # Generated artifacts (gitignored)
├── contracts/                   # Soroban smart contracts
│   ├── Cargo.toml
│   ├── groth16-verifier/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   ├── corridor-policy/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   └── settlement/
│       ├── Cargo.toml
│       └── src/lib.rs
├── lib/                         # Shared TypeScript library
│   ├── package.json
│   ├── src/
│   │   ├── crypto/
│   │   │   ├── viewkey.ts       # HKDF + AES view key encryption
│   │   │   ├── poseidon.ts      # Poseidon hash wrapper
│   │   │   └── merkle.ts        # Merkle tree utilities
│   │   ├── stellar/
│   │   │   ├── client.ts        # Soroban contract interaction
│   │   │   └── wallet.ts        # Freighter wallet integration
│   │   ├── prover/
│   │   │   └── browser.ts       # snarkjs browser proof generation
│   │   └── index.ts
│   └── tsconfig.json
├── frontend/                    # Next.js frontend
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   └── fonts/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── send/page.tsx          # Sender flow
│   │   │   ├── receive/page.tsx       # Receiver flow
│   │   │   ├── audit/page.tsx         # Auditor/regulator flow
│   │   │   └── demo/page.tsx          # Combined demo view
│   │   ├── components/
│   │   │   ├── ui/                    # Shared UI primitives
│   │   │   ├── layout/               # Header, Footer, Nav
│   │   │   ├── sender/               # Sender flow components
│   │   │   ├── receiver/             # Receiver flow components
│   │   │   ├── auditor/              # Auditor flow components
│   │   │   └── demo/                 # Demo page components
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   └── .env.local.example
├── scripts/                     # Deployment & utility scripts
│   ├── deploy.sh
│   ├── fund-testnet.sh
│   └── generate-mock-data.ts
└── docs/
    ├── architecture.md
    ├── circuits.md
    └── demo-script.md
```

Create CLAUDE.md at the root with this EXACT content:

---
# Vela — Project Context

## What we're building
Vela is a private cross-border remittance corridor on Stellar. 
Sender proves KYC compliance via ZK proof → amount is shielded by 
Poseidon commitment → receiver claims with secret key → regulator 
can reconstruct everything with a view key.

## Hackathon
- Name: Stellar Hacks: Real-World ZK
- Dates: June 15–29, 2026
- Prize: $10,000 XLM
- Requirement: ZK must be load-bearing, verified inside Soroban contract
- Submission: GitHub repo + 2–3 min demo video

## Tech Stack (LOCKED)
- ZK Circuits: Circom 2.1 + snarkjs (Groth16/BLS12-381)
- Smart Contracts: Soroban (Rust) — Stellar SDK 22+
- Frontend: Next.js 15 (App Router) + TypeScript 5.x + Tailwind CSS 4
- Wallet: Freighter (@stellar/freighter-api)
- Stellar SDK: @stellar/stellar-sdk (latest stable)
- Proof generation: snarkjs (browser-side WASM)
- View key crypto: Web Crypto API (HKDF + AES-256-GCM)
- Node: v22 LTS (latest stable)
- Package manager: pnpm

## Architecture (LOCKED — Policy-and-Proof Split)
Three Soroban contracts:
1. Verifier: Groth16 BLS12-381 proof verification ONLY
2. Corridor Policy: Business rules (nullifier, compliance, merkle root)
3. Settlement: USDC vault + state transitions

Three Circom circuits:
1. KYC Compliance: prove jurisdiction + age + sanctions clearance
2. Amount Commitment: Poseidon(amount, nonce) + range proof
3. Withdrawal: Merkle inclusion proof for receiver claim

## Design Theme
Inspired by stellar.org — dark backgrounds (#0B0F19, #111827), 
accent gradients (blue-purple: #3B82F6 → #8B5CF6), clean typography,
generous whitespace, subtle glassmorphism on cards. Professional and 
institutional, not "crypto bro."

## Key Repos (Reference)
- Groth16 verifier: github.com/stellar/soroban-examples/tree/main/groth16_verifier
- CircomStellar: github.com/jamesbachini/CircomStellar
- Private payments: github.com/NethermindEth/stellar-private-payments
- Stellar SDK: github.com/stellar/js-stellar-sdk
- snarkjs: github.com/iden3/snarkjs
- circomlib: github.com/iden3/circomlib

## Session Rules
1. Always read CLAUDE.md first
2. Use pnpm, not npm or yarn
3. Use TypeScript strict mode everywhere
4. Use App Router (not Pages Router) in Next.js
5. Use Tailwind CSS 4 (not 3) — @import not @tailwind
6. Use server components by default, "use client" only when needed
7. All Soroban contracts follow Policy-and-Proof Split
8. Never hardcode contract IDs — use .env files
9. All crypto operations happen client-side (never send secrets to server)
10. Test circuits locally before deploying contracts
---

Also create:
- .gitignore (include: node_modules, target, build, .env, *.wasm, proof.json, 
  witness.wtns, .next, .turbo, *.ptau)
- .env.example with placeholders for NEXT_PUBLIC_STELLAR_NETWORK=testnet,
  NEXT_PUBLIC_VERIFIER_CONTRACT_ID, NEXT_PUBLIC_POLICY_CONTRACT_ID,
  NEXT_PUBLIC_SETTLEMENT_CONTRACT_ID, NEXT_PUBLIC_HORIZON_URL
- Root package.json as a pnpm workspace with workspaces: ["circuits", "lib", "frontend"]
- pnpm-workspace.yaml

Initialize git repo. Do NOT install dependencies yet — that's the next prompt.

After creating all files, run: find . -name "*.md" -o -name "*.json" -o -name "*.yaml" | head -20
Confirm the structure matches the plan above.
```