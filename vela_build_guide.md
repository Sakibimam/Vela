# Vela — Complete Build Guide
## Series of Prompts for Claude Code (Opus)

> Private Cross-Border Remittance Corridor on Stellar with ZK Proofs
> Hackathon: Stellar Hacks: Real-World ZK (June 15–29, 2026)

### How to use this guide
1. Open Claude Code in your terminal
2. Paste each prompt **one at a time**, in order
3. Wait for it to complete before pasting the next one
4. Each prompt is self-contained and references the project structure
5. If something breaks, paste the **Fix Prompt** at the end of each section
6. Total prompts: 12 main + 3 security/polish

---

## ══════════════════════════════════════════
## PROMPT 0 — PROJECT FOUNDATION & CLAUDE.md
## ══════════════════════════════════════════

```
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

---

## ══════════════════════════════════════════
## PROMPT 1 — INSTALL ALL DEPENDENCIES
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now install all dependencies for the Vela project. Use pnpm throughout.
Use the latest STABLE versions of everything (not canary/rc/beta).

STEP 1: Ensure Node 22 LTS is active
- Check: node --version
- If not v22.x, tell me to install it

STEP 2: Install pnpm globally if not present
- npm install -g pnpm

STEP 3: Root workspace
- pnpm init at root (if not done)
- Ensure pnpm-workspace.yaml exists with packages: ['circuits', 'lib', 'frontend']

STEP 4: circuits/package.json — create with:
- devDependencies: circomlib (latest), snarkjs (latest), mocha, chai
- scripts: "compile", "setup", "prove", "test"

STEP 5: lib/package.json — create with:
- dependencies: @stellar/stellar-sdk (latest stable), @stellar/freighter-api (latest)
- devDependencies: typescript (5.x latest), @types/node, tsup (for bundling)
- Create tsconfig.json with strict mode, ESNext module, paths

STEP 6: frontend/package.json — create with:
- dependencies: next (15.x latest stable), react (19.x), react-dom (19.x),
  tailwindcss (v4 latest stable), @tailwindcss/vite (if needed for v4),
  snarkjs, framer-motion (latest), lucide-react (latest),
  @radix-ui/react-dialog, @radix-ui/react-tabs, @radix-ui/react-toast,
  clsx, tailwind-merge
- devDependencies: typescript, @types/react, @types/node, postcss,
  eslint, eslint-config-next
- Create next.config.ts with:
  - webpack config to handle .wasm files (for snarkjs)
  - experimental.serverActions enabled
  - output: 'standalone' for production

STEP 7: Install everything
- Run: pnpm install from root
- Verify: pnpm ls --depth=0 in each workspace

STEP 8: Verify Circom is installed
- Check: circom --version
- If not installed, install circom 2.1.x:
  curl -L https://raw.githubusercontent.com/nicoorellana/circom-install/main/install.sh | bash
  OR guide me to install via cargo: cargo install --git https://github.com/nicoorellana/circom.git

STEP 9: Verify Stellar CLI
- Check: stellar --version  
- If not installed: cargo install stellar-cli --locked
  OR brew install stellar-cli

After all installs, run:
- node --version
- pnpm --version
- circom --version (or note if needs manual install)
- stellar --version (or note if needs manual install)
- pnpm ls -r --depth=0

Report what installed successfully and what needs manual intervention.
Do NOT proceed to coding — just get dependencies right.
```

---

## ══════════════════════════════════════════
## PROMPT 2 — CIRCOM CIRCUITS (Core ZK Logic)
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now write all three Circom circuits for Vela. These are the most critical 
files in the entire project — they define what the ZK proofs actually prove.

IMPORTANT CONSTRAINTS:
- Use Circom 2.1 syntax (pragma circom 2.1.0)
- Use circomlib templates (Poseidon, LessThan, GreaterEqThan, MerkleTreeChecker, etc.)
- Target < 5,000 constraints per circuit (for fast proof generation)
- All hashing MUST use Poseidon (ZK-friendly, native Soroban host function)
- Test each circuit compiles before moving to the next

═══════════════════════════════════════
CIRCUIT 1: circuits/circuits/kyc_compliance.circom
═══════════════════════════════════════

Purpose: Sender proves they are KYC-compliant without revealing identity.

Private inputs:
- country_code (Field) — sender's country (numeric ISO code)
- birth_year (Field) — sender's birth year
- kyc_attestation (Field) — hash of KYC provider's signed attestation
- user_secret (Field) — random blinding factor

Public inputs:
- allowed_countries_root (Field) — Poseidon Merkle root of allowed country list
- min_birth_year (Field) — e.g., 2008 means must be born ≤ 2008 (age ≥ 18)
- kyc_issuer_hash (Field) — hash of the trusted KYC provider's public key
- nullifier (Field) — Poseidon(user_secret, nonce) — prevents proof reuse
- nonce (Field) — session nonce

The circuit proves:
1. country_code is in the allowed_countries Merkle tree (depth 8)
2. birth_year <= min_birth_year (age check)
3. kyc_attestation matches the issuer hash commitment
4. nullifier is correctly derived from user_secret and nonce

Use circomlib/circuits/poseidon.circom for hashing.
Use a custom MerkleProofVerifier with Poseidon for the country check.
The Merkle path (8 siblings + 8 indices) should be private inputs.

═══════════════════════════════════════
CIRCUIT 2: circuits/circuits/amount_commitment.circom
═══════════════════════════════════════

Purpose: Commit to a transfer amount without revealing it.

Private inputs:
- amount (Field) — transfer amount in USDC cents (e.g., 50000 = $500.00)
- sender_secret (Field) — random blinding factor
- nonce (Field) — unique per-transaction

Public inputs:
- commitment (Field) — Poseidon(amount, sender_secret, nonce)
- max_amount (Field) — regulatory threshold (e.g., 300000 = $3,000)
- nullifier (Field) — Poseidon(sender_secret, nonce)

The circuit proves:
1. commitment == Poseidon(amount, sender_secret, nonce)
2. amount > 0 (non-zero transfer)
3. amount <= max_amount (under regulatory reporting threshold)
4. nullifier == Poseidon(sender_secret, nonce)

Use circomlib/circuits/comparators.circom for range checks.
Use 64-bit range for amount comparisons.

═══════════════════════════════════════
CIRCUIT 3: circuits/circuits/withdrawal.circom
═══════════════════════════════════════

Purpose: Receiver claims funds by proving knowledge of a commitment in the pool.

Private inputs:
- amount (Field) — the committed amount
- receiver_secret (Field) — shared secret from sender
- nonce (Field) — the transaction nonce
- merkle_path[8] (Field array) — Merkle proof siblings
- merkle_indices[8] (Field array) — left/right path indicators

Public inputs:
- merkle_root (Field) — current commitment tree root
- nullifier (Field) — Poseidon(receiver_secret, nonce) — prevents double-withdrawal
- receiver_address_hash (Field) — Poseidon hash of receiver's Stellar address

The circuit proves:
1. leaf = Poseidon(amount, receiver_secret, nonce) exists in the Merkle tree
2. nullifier == Poseidon(receiver_secret, nonce)
3. receiver_address_hash is correctly bound to this withdrawal

═══════════════════════════════════════
ALSO CREATE:
═══════════════════════════════════════

1. circuits/scripts/compile.sh — compiles all 3 circuits with circom:
   circom circuits/kyc_compliance.circom --r1cs --wasm --sym --c -o build/
   (repeat for each circuit)

2. circuits/scripts/setup.sh — runs Powers of Tau ceremony + circuit-specific setup:
   - Download powersOfTau28_hez_final_14.ptau (sufficient for < 16K constraints)
   - snarkjs groth16 setup for each circuit
   - Generate verification keys (verification_key.json)

3. circuits/scripts/prove.sh — generates a sample proof for testing:
   - Create sample input.json for each circuit
   - Generate witness
   - Create proof
   - Verify locally

4. circuits/test/circuits.test.js — mocha tests that:
   - Compile each circuit
   - Generate a proof with valid inputs
   - Verify the proof passes
   - Generate a proof with INVALID inputs
   - Verify the proof FAILS

Make compile.sh executable and run it. Report:
- Number of constraints for each circuit
- Whether compilation succeeded
- Any errors

If circom is not installed, create the files anyway and note that 
circom needs to be installed to compile. Provide exact install instructions.
```

---

## ══════════════════════════════════════════
## PROMPT 3 — SOROBAN SMART CONTRACTS
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now write the three Soroban smart contracts for Vela.
Follow the Policy-and-Proof Split architecture exactly.

IMPORTANT:
- Use the latest stable Soroban SDK (check soroban-sdk crate version)
- Reference the groth16_verifier from soroban-examples for the verifier
- Use #![no_std] for all contracts
- Every contract must have comprehensive error enums
- Storage keys must be clearly named constants
- All public functions must have doc comments

═══════════════════════════════════════
Set up the Cargo workspace first:
═══════════════════════════════════════

contracts/Cargo.toml — workspace with three members:
  [workspace]
  members = ["groth16-verifier", "corridor-policy", "settlement"]
  
  [workspace.dependencies]
  soroban-sdk = "22"  # or latest stable — check crates.io first

═══════════════════════════════════════
CONTRACT 1: contracts/groth16-verifier/
═══════════════════════════════════════

Purpose: Verify Groth16 proofs. NOTHING ELSE. 
This contract ONLY checks cryptographic proof validity.

Reference: https://github.com/stellar/soroban-examples/tree/main/groth16_verifier

Functions:
- initialize(env, admin, verification_key: Bytes) 
    → stores the VK, can only be called once
- verify(env, proof: Bytes, public_inputs: Vec<Bytes>) -> bool
    → runs BLS12-381 pairing check, returns true/false
    → does NOT store any state or enforce any business rules
- get_vk(env) -> Bytes
    → returns the stored verification key

The core verification logic should use the soroban_sdk crypto 
functions for BLS12-381 pairing. Look at how soroban-examples 
implements this — it uses env.crypto().bls12_381() for pairing checks.

Actually fetch and read the soroban-examples groth16_verifier source:
https://github.com/stellar/soroban-examples/tree/main/groth16_verifier

Model your implementation on their pattern but adapt it for our 
three-circuit system (each circuit gets its own VK stored by ID).

Update the contract to support multiple verification keys:
- store_vk(env, circuit_id: Symbol, vk: Bytes) — admin only
- verify(env, circuit_id: Symbol, proof: Bytes, public_inputs: Vec<Bytes>) -> bool

═══════════════════════════════════════
CONTRACT 2: contracts/corridor-policy/
═══════════════════════════════════════

Purpose: Business rules for the remittance corridor.
Calls the verifier contract for proof checking.

Storage:
- commitment_tree: Vec<u8> — Poseidon Merkle tree of commitments
- used_nullifiers: Map<BytesN<32>, bool> — prevent double-spend
- admin: Address
- verifier_contract_id: Address — cross-contract call target
- settlement_contract_id: Address
- corridor_config: CorridorConfig struct {
    max_amount: u64,
    allowed_countries_root: BytesN<32>,
    kyc_issuer_hash: BytesN<32>,
    is_active: bool
  }

Functions:
- initialize(env, admin, verifier_id, settlement_id, config)
- deposit(env, sender, kyc_proof, kyc_public_inputs, 
          amount_proof, amount_public_inputs,
          encrypted_payload: Bytes)
    → Calls verifier.verify() for both proofs
    → Checks nullifiers not used
    → Stores commitment in tree
    → Stores encrypted_payload in events
    → Calls settlement.lock_funds() if both proofs valid
    → Emits event: (commitment, nullifier, encrypted_payload)

- withdraw(env, receiver, withdrawal_proof, withdrawal_public_inputs)
    → Calls verifier.verify() for withdrawal proof
    → Checks withdrawal nullifier not used
    → Calls settlement.release_funds()
    → Emits event: (nullifier, receiver_address_hash)

- get_merkle_root(env) -> BytesN<32>
- is_nullifier_used(env, nullifier: BytesN<32>) -> bool

═══════════════════════════════════════
CONTRACT 3: contracts/settlement/
═══════════════════════════════════════

Purpose: Holds and releases USDC.

Storage:
- admin: Address
- policy_contract_id: Address — only this contract can call lock/release
- usdc_token_id: Address — SAC address for USDC on testnet
- total_locked: i128
- total_released: i128

Functions:
- initialize(env, admin, policy_id, usdc_token_id)
- lock_funds(env, from: Address, amount: i128)
    → Only callable by policy contract
    → Transfers USDC from sender to this contract
    → Increments total_locked
- release_funds(env, to: Address, amount: i128)
    → Only callable by policy contract
    → Transfers USDC from this contract to receiver
    → Increments total_released
- get_balance(env) -> i128
- get_stats(env) -> (i128, i128) — (locked, released)

═══════════════════════════════════════
ALSO CREATE:
═══════════════════════════════════════

1. scripts/deploy.sh — deploys all 3 contracts to Stellar testnet:
   - Build each contract: stellar contract build
   - Optimize WASM: stellar contract optimize
   - Deploy each contract with proper initialization order:
     a) Deploy verifier first
     b) Deploy settlement second  
     c) Deploy corridor-policy last (needs both IDs)
   - Fund deployer account from friendbot
   - Store contract IDs in .env

2. scripts/fund-testnet.sh — creates and funds test accounts

After writing all contracts, attempt to build them:
  cd contracts && cargo build --release --target wasm32-unknown-unknown

Report:
- Whether each contract compiles
- WASM file sizes
- Any compilation errors and how to fix them
```

---

## ══════════════════════════════════════════
## PROMPT 4 — VIEW KEY CRYPTOGRAPHIC LAYER
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now implement the view key cryptographic layer in lib/src/crypto/.
This is the selective disclosure system that lets regulators reconstruct 
private transactions.

CRITICAL SECURITY REQUIREMENTS:
- Use Web Crypto API (SubtleCrypto) — no custom crypto
- HKDF for key derivation
- AES-256-GCM for encryption (authenticated encryption)
- All operations must work in both Node.js and browser
- TypeScript strict mode, no 'any' types
- Every function must have JSDoc with @param and @returns

═══════════════════════════════════════
FILE: lib/src/crypto/viewkey.ts
═══════════════════════════════════════

Implement the ViewKey class:

```typescript
interface TransactionPayload {
  senderIdHash: string;      // Poseidon hash of sender identity
  receiverIdHash: string;    // Poseidon hash of receiver identity
  amount: bigint;            // Amount in USDC cents
  corridor: string;          // e.g., "AE-PH" (Dubai to Philippines)
  timestamp: number;
}

interface EncryptedPayload {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  nonce: string;             // Public nonce used for key derivation
}

class ViewKeyManager {
  // Generate a new master view key (32 bytes, random)
  static async generateMasterKey(): Promise<CryptoKey>
  
  // Derive a per-transaction key from master + public nonce
  // Uses HKDF with SHA-256, salt = nonce bytes, info = "vela-tx-key"
  static async deriveTransactionKey(
    masterKey: CryptoKey, 
    nonce: string
  ): Promise<CryptoKey>
  
  // Encrypt a transaction payload for storage on-chain
  static async encryptPayload(
    masterKey: CryptoKey,
    payload: TransactionPayload,
    nonce: string
  ): Promise<EncryptedPayload>
  
  // Decrypt a payload using the master view key + nonce
  // This is what the regulator does
  static async decryptPayload(
    masterKey: CryptoKey,
    encrypted: EncryptedPayload
  ): Promise<TransactionPayload>
  
  // Export master key as hex string (for sharing with regulator)
  static async exportKey(key: CryptoKey): Promise<string>
  
  // Import master key from hex string
  static async importKey(hexKey: string): Promise<CryptoKey>
  
  // Batch decrypt all transactions in a corridor
  // This is the auditor flow — reconstruct entire ledger
  static async auditCorridor(
    masterKey: CryptoKey,
    encryptedPayloads: EncryptedPayload[]
  ): Promise<TransactionPayload[]>
}
```

═══════════════════════════════════════
FILE: lib/src/crypto/poseidon.ts
═══════════════════════════════════════

Wrapper around circomlibjs Poseidon for use in the frontend:

```typescript
// Use circomlibjs for Poseidon hash computation
// This must match the Poseidon used in the Circom circuits
import { buildPoseidon } from 'circomlibjs';

class PoseidonHasher {
  static async init(): Promise<PoseidonHasher>
  hash(inputs: bigint[]): bigint
  hashTwo(a: bigint, b: bigint): bigint
  hashFour(a: bigint, b: bigint, c: bigint, d: bigint): bigint
}
```

Add circomlibjs to lib/package.json dependencies.

═══════════════════════════════════════
FILE: lib/src/crypto/merkle.ts
═══════════════════════════════════════

Poseidon-based Merkle tree for commitment storage:

```typescript
class PoseidonMerkleTree {
  depth: number;        // 8 levels = 256 leaves
  leaves: bigint[];
  
  constructor(depth: number)
  
  // Insert a new leaf (commitment)
  insert(leaf: bigint): number  // returns leaf index
  
  // Get the current root
  getRoot(): bigint
  
  // Generate a Merkle proof for a leaf at index
  getProof(index: number): { 
    siblings: bigint[], 
    indices: number[] 
  }
  
  // Verify a Merkle proof (for testing)
  verifyProof(leaf: bigint, proof: { siblings: bigint[], indices: number[] }): boolean
}
```

═══════════════════════════════════════
FILE: lib/src/prover/browser.ts
═══════════════════════════════════════

Browser-side proof generation using snarkjs:

```typescript
interface ProofResult {
  proof: any;           // Groth16 proof object
  publicSignals: string[];  // Public inputs as strings
  proofHex: string;     // Hex-encoded for Soroban submission
}

class VelaProver {
  // Load circuit WASM and proving key (zkey) from URLs
  static async loadCircuit(
    wasmUrl: string, 
    zkeyUrl: string
  ): Promise<VelaProver>
  
  // Generate KYC compliance proof
  async proveKYC(input: {
    country_code: bigint;
    birth_year: bigint;
    kyc_attestation: bigint;
    user_secret: bigint;
    merkle_path: bigint[];
    merkle_indices: number[];
    // public inputs
    allowed_countries_root: bigint;
    min_birth_year: bigint;
    kyc_issuer_hash: bigint;
    nonce: bigint;
  }): Promise<ProofResult>
  
  // Generate amount commitment proof
  async proveAmount(input: {
    amount: bigint;
    sender_secret: bigint;
    nonce: bigint;
    max_amount: bigint;
  }): Promise<ProofResult>
  
  // Generate withdrawal proof
  async proveWithdrawal(input: {
    amount: bigint;
    receiver_secret: bigint;
    nonce: bigint;
    merkle_path: bigint[];
    merkle_indices: number[];
    merkle_root: bigint;
    receiver_address_hash: bigint;
  }): Promise<ProofResult>
}
```

═══════════════════════════════════════
ALSO CREATE:
═══════════════════════════════════════

- lib/src/stellar/client.ts — Soroban contract interaction helpers:
  - connectToTestnet()
  - callVerifier(contractId, proof, publicInputs)
  - deposit(corridorPolicyId, kycProof, amountProof, encryptedPayload)
  - withdraw(corridorPolicyId, withdrawalProof)
  - getCorridorStats(settlementId)

- lib/src/stellar/wallet.ts — Freighter wallet wrapper:
  - connectWallet() -> Promise<string> (returns public key)
  - signTransaction(xdr: string) -> Promise<string>
  - isConnected() -> Promise<boolean>

- lib/src/index.ts — re-exports everything

Build the lib with: cd lib && pnpm build (using tsup or tsc)
Fix any TypeScript errors.
```

---

## ══════════════════════════════════════════
## PROMPT 5 — FRONTEND: DESIGN SYSTEM & LAYOUT
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now build the frontend design system and layout for Vela.
The design must feel like it belongs in the Stellar ecosystem — 
professional, institutional, dark-themed — but with its own identity.

DESIGN DIRECTION:
- Primary background: deep space black (#0B0F19) with subtle blue tint
- Secondary background: slate (#111827) for cards
- Accent gradient: blue to purple (#3B82F6 → #8B5CF6)
- Success: emerald (#10B981)
- Error: rose (#F43F5E)  
- Text primary: white (#F9FAFB)
- Text secondary: slate-400 (#94A3B8)
- Border: white at 8% opacity
- Cards: glassmorphism — bg white/5%, backdrop-blur-xl, border white/10%
- Typography: Inter for body (or system font stack), mono for hashes/addresses
- Border radius: 12px for cards, 8px for buttons, 6px for inputs
- Spacing: generous — minimum 24px between sections

INSPIRATION: Look at stellar.org, specifically:
- The dark hero sections with gradient text
- The clean card layouts
- The professional but modern feel
- The way they present complex technical concepts simply

═══════════════════════════════════════
STEP 1: Set up Tailwind CSS v4
═══════════════════════════════════════

Tailwind v4 uses CSS-first config, not tailwind.config.js.
Set up frontend/src/app/globals.css with:
- @import "tailwindcss"
- @theme block with custom colors, fonts, animations
- Custom utilities for glassmorphism, gradient text, etc.

═══════════════════════════════════════
STEP 2: Create shared UI components
═══════════════════════════════════════

frontend/src/components/ui/:

1. Button.tsx — variants: primary (gradient), secondary (outline), 
   ghost, danger. Sizes: sm, md, lg. Loading state with spinner.

2. Card.tsx — glassmorphism card with optional gradient border.
   Variants: default, elevated, outlined.

3. Badge.tsx — status badges: success, warning, error, info, neutral.

4. Input.tsx — dark-themed input with label, error state, 
   helper text. Variants: default, amount (with currency prefix).

5. ProofProgress.tsx — animated progress indicator for ZK proof 
   generation. Shows: "Generating ZK proof..." with animated dots,
   a circular progress ring, and estimated time remaining.
   This is the MOST IMPORTANT UI component — judges watch this 
   during the demo. Make it beautiful.

6. TransactionHash.tsx — displays a Stellar tx hash with:
   - Truncated display (first 8...last 8 chars)
   - Copy button
   - Link to Stellar testnet explorer
   - Subtle pulse animation when new

7. StatusStep.tsx — step indicator for multi-step flows.
   States: pending, active, loading, complete, error.
   Used in sender and receiver flows.

8. Modal.tsx — based on Radix Dialog. Dark themed.

9. Toast.tsx — based on Radix Toast. For success/error notifications.

10. GradientText.tsx — text with the blue→purple gradient.
    Used for headings and key numbers.

═══════════════════════════════════════
STEP 3: Create layout components
═══════════════════════════════════════

frontend/src/components/layout/:

1. Header.tsx — fixed top header with:
   - "Vela" logo (text-based, gradient)
   - Navigation: Send | Receive | Audit | Demo
   - Wallet connect button (shows truncated address when connected)
   - Network indicator badge (Testnet)

2. Footer.tsx — minimal footer:
   - "Built for Stellar Hacks: Real-World ZK"
   - GitHub link
   - "Powered by Stellar" with logo

3. PageContainer.tsx — consistent page wrapper with max-width, 
   padding, and fade-in animation.

═══════════════════════════════════════
STEP 4: Create the landing page
═══════════════════════════════════════

frontend/src/app/page.tsx — The hero/landing page:

Hero section:
- Large gradient headline: "Private Remittances on Stellar"
- Subtitle: "Send money across borders. Prove compliance. Reveal nothing."
- Two CTA buttons: "Send Money" (primary) → /send, "Audit Corridor" → /audit
- Animated background: subtle moving gradient orbs or star particles

How It Works section (3 steps, visually):
1. "Prove" — icon + "Sender proves KYC compliance with a ZK proof. 
   No identity data touches the blockchain."
2. "Shield" — icon + "Amount is committed using Poseidon cryptography. 
   The blockchain sees a hash, not a number."
3. "Claim" — icon + "Receiver claims with a secret key. Regulators 
   reconstruct with a view key."

Stats section (animated count-up):
- "$195T" — "crossed borders in 2024"
- "5.36%" — "average remittance cost" 
- "0 bytes" — "of personal data on-chain with Vela"

Tech stack section:
- "Circom circuits • Groth16 on BLS12-381 • Soroban smart contracts • 
  Poseidon hashing • HKDF view keys • Stellar testnet"

Make sure the page is fully responsive (mobile-first).
Use framer-motion for scroll-triggered animations.
Use server component for the page, client components only for 
interactive elements (animations, wallet button).

═══════════════════════════════════════
STEP 5: Verify it runs
═══════════════════════════════════════

cd frontend && pnpm dev

Open http://localhost:3000 and confirm:
- The landing page renders
- Dark theme looks correct
- Navigation works
- No console errors
- Responsive on mobile viewport

Report any issues.
```

---

## ══════════════════════════════════════════
## PROMPT 6 — FRONTEND: SENDER FLOW
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Build the complete sender flow at frontend/src/app/send/page.tsx.
This is the Dubai nurse sending $500 to Manila.

The sender flow has 4 steps, shown with the StatusStep component:

═══════════════════════════════════════
STEP 1: Connect Wallet & Enter Details
═══════════════════════════════════════

- Connect Freighter wallet button (if not connected)
- Form fields:
  - Amount (USDC) — number input with $ prefix, max $3,000
  - Recipient's Stellar address — text input with validation
  - Corridor — dropdown: "Dubai → Manila", "US → Colombia", "UK → Lagos"
  - Shared secret — auto-generated 32-byte hex, with "Copy for recipient" button
    (this is what the receiver needs to claim funds)

- "KYC Verification" section — mock KYC for the hackathon:
  - Country: dropdown (pre-selected based on corridor)
  - Birth year: number input
  - KYC Provider: "VelaKYC (Demo)" — pre-filled
  
  Add a note: "In production, this connects to a KYC provider API. 
  Demo uses mock attestation data."

- "Continue" button → moves to Step 2

═══════════════════════════════════════
STEP 2: Generate ZK Proofs
═══════════════════════════════════════

This is the most visually important step. Show TWO proof generations:

Proof 1: KYC Compliance
- ProofProgress component showing:
  - "Generating KYC compliance proof..."
  - Circuit: kyc_compliance.circom
  - Estimated time: ~5-10 seconds
  - When complete: green checkmark + "KYC proof verified ✓"
  - Show proof hash (truncated)

Proof 2: Amount Commitment  
- ProofProgress component showing:
  - "Generating amount commitment proof..."
  - Circuit: amount_commitment.circom
  - Estimated time: ~3-5 seconds
  - When complete: green checkmark + "Amount committed ✓"
  - Show commitment hash (truncated)

Below both proofs, show a summary:
- "What the blockchain will see:" 
  - ✓ KYC proof hash
  - ✓ Amount commitment (not the amount)
  - ✓ Encrypted payload (for view key holders)
  - ✗ Your name
  - ✗ Your country
  - ✗ The transfer amount
  - ✗ The recipient's identity

"Submit to Stellar" button → moves to Step 3

For the hackathon demo, if circuit files aren't compiled yet,
use MOCK proof generation with realistic timing delays.
Create a mock mode that:
- Simulates proof generation with setTimeout (5-10 seconds)
- Returns fake proof hashes
- Still shows the full UI flow
- Can be toggled via NEXT_PUBLIC_MOCK_PROOFS=true env var

═══════════════════════════════════════
STEP 3: Submit to Stellar
═══════════════════════════════════════

- Show transaction being built
- Prompt Freighter wallet to sign
- Submit to Stellar testnet
- Show transaction hash with explorer link
- Animated success state

In mock mode: simulate with a 3-second delay.

═══════════════════════════════════════
STEP 4: Confirmation
═══════════════════════════════════════

- "Transfer Shielded Successfully ✓"
- Summary card:
  - Amount: [HIDDEN] (not shown, even to sender after submission)
  - Corridor: Dubai → Manila
  - Commitment: 0x8a3f...
  - Status: Confirmed
  - Block: #12345678
  - Tx Hash: (with explorer link)
- "Share with recipient" section:
  - Display the shared secret with copy button
  - QR code of the shared secret (optional but impressive)
  - Warning: "Save this secret. The recipient needs it to claim funds."

- "View on Explorer" button
- "Send Another" button

═══════════════════════════════════════
Make sure:
- All state management uses React useState/useReducer (no external state lib)
- The flow is keyboard-navigable
- Loading states are handled for every async operation
- Error states show clear messages with retry buttons
- The mock mode is indistinguishable from real mode in the UI
- All sensitive data (secrets, amounts) are in client-side state only
═══════════════════════════════════════

Test: cd frontend && pnpm dev, navigate to /send, walk through all 4 steps.
Report any issues.
```

---

## ══════════════════════════════════════════
## PROMPT 7 — FRONTEND: RECEIVER FLOW
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Build the receiver flow at frontend/src/app/receive/page.tsx.
This is the family in Manila claiming the $500.

The receiver flow has 3 steps:

═══════════════════════════════════════
STEP 1: Enter Claim Details
═══════════════════════════════════════

- Connect Freighter wallet
- "Claim Secret" input — paste the shared secret from sender
  - Validate: must be 64 hex chars (32 bytes)
  - On valid input, derive the commitment and check if it exists on-chain
- If found: show "Funds found ✓" with the amount (decrypted locally)
- If not found: show "No matching transfer found" error

═══════════════════════════════════════
STEP 2: Generate Withdrawal Proof
═══════════════════════════════════════

- ProofProgress showing:
  - "Generating withdrawal proof..."
  - Circuit: withdrawal.circom
  - Merkle inclusion proof being computed
  - ~5 seconds
  - Complete: "Withdrawal proof verified ✓"

- Summary:
  - "What you're proving:"
  - ✓ You know the claim secret
  - ✓ A matching commitment exists in the pool
  - ✗ No one else can see which commitment is yours

"Claim Funds" button

═══════════════════════════════════════
STEP 3: Claim & Confirmation
═══════════════════════════════════════

- Submit withdrawal proof to Stellar
- Sign with Freighter
- Show success:
  - "Funds Claimed Successfully ✓"
  - Amount received: $500.00 USDC
  - Transaction hash with explorer link
  - "The sender's identity remains private. The amount was revealed 
     only to you."

═══════════════════════════════════════
Same mock mode as sender flow — toggle with NEXT_PUBLIC_MOCK_PROOFS.
Same component patterns, error handling, keyboard navigation.

Test the flow end-to-end with the mock mode.
```

---

## ══════════════════════════════════════════
## PROMPT 8 — FRONTEND: AUDITOR FLOW (The Wow Moment)
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Build the auditor/regulator flow at frontend/src/app/audit/page.tsx.
THIS IS THE MOST IMPORTANT PAGE FOR JUDGES.
This is the "aha moment" — the view key reconstructs everything.

═══════════════════════════════════════
THE PAGE HAS TWO STATES:
═══════════════════════════════════════

STATE 1: Before view key entry (what the PUBLIC sees)

Show a table of all corridor transactions (mock 5-8 transactions):

| # | Commitment | Nullifier | Corridor | Timestamp | Amount | Sender | Receiver |
|---|-----------|-----------|----------|-----------|--------|--------|----------|
| 1 | 0x8a3f... | 0x2b1c... | ?? | 2026-06-20 14:32 | [SHIELDED] | [PRIVATE] | [PRIVATE] |
| 2 | 0x9c2e... | 0x5d4a... | ?? | 2026-06-20 15:01 | [SHIELDED] | [PRIVATE] | [PRIVATE] |
| 3 | 0xf1b7... | 0x8e3f... | ?? | 2026-06-20 15:45 | [SHIELDED] | [PRIVATE] | [PRIVATE] |

The [SHIELDED] and [PRIVATE] cells should have a blurred/redacted 
visual treatment — like text behind frosted glass. This visual is 
what makes the demo memorable.

Above the table:
- "Corridor Ledger — Public View"
- "All amounts and identities are shielded by zero-knowledge proofs."
- Total transactions: 8
- Total volume: [ENCRYPTED]

Below the table:
- A prominent input field: "Enter Corridor View Key"
- Helper text: "Authorized regulators can reconstruct the full 
  transaction ledger using the corridor master view key."
- "Decrypt Ledger" button (gradient, prominent)

═══════════════════════════════════════
STATE 2: After view key entry (what the REGULATOR sees)

THIS TRANSITION IS THE DEMO'S CLIMAX.

When the view key is entered and "Decrypt Ledger" is clicked:
- Animate each row decrypting one by one (staggered, 200ms apart)
- The blurred cells un-blur and reveal real data
- Use framer-motion for a smooth reveal animation

The table transforms to:

| # | Commitment | Nullifier | Corridor | Timestamp | Amount | Sender | Receiver |
|---|-----------|-----------|----------|-----------|--------|--------|----------|
| 1 | 0x8a3f... | 0x2b1c... | AE→PH | 2026-06-20 14:32 | $500.00 | Maria S. | Santos Family |
| 2 | 0x9c2e... | 0x5d4a... | US→CO | 2026-06-20 15:01 | $1,200.00 | Carlos M. | Rodriguez J. |
| 3 | 0xf1b7... | 0x8e3f... | UK→NG | 2026-06-20 15:45 | $750.00 | Adewale O. | Okafor Family |

New stats appear (animated count-up):
- Total volume: $12,450.00
- Corridors active: 4
- Average transfer: $1,556.25
- Compliance rate: 100%

Below the table, show:
- "Regulatory Summary" card:
  - All transfers under $3,000 threshold ✓
  - All senders KYC-verified ✓
  - Zero sanctions matches ✓
  - Full audit trail available ✓

- "Export Report" button (creates a mock PDF/CSV)
- "Revoke Access" button (re-blurs everything)

═══════════════════════════════════════
MOCK DATA:
═══════════════════════════════════════

Create scripts/generate-mock-data.ts that generates 8 realistic 
mock transactions with:
- Diverse corridors: AE→PH, US→CO, UK→NG, SA→IN, AE→IN, US→MX, UK→PK, CA→NG
- Realistic amounts: $200 to $2,500 range
- Realistic names from those corridors
- Timestamps across a 48-hour window

The mock view key should be a fixed string for the demo:
"vela_demo_view_key_2026" (but handled as proper crypto in the code path)

For the real implementation, the ViewKeyManager from lib/ handles 
actual HKDF+AES decryption. For mock mode, it just reveals the data.

═══════════════════════════════════════
MAKE THIS PAGE PERFECT.
═══════════════════════════════════════

This is what wins the hackathon. The blur → reveal animation 
is the single moment that makes 100 judges understand why ZK + 
view keys matter. Spend extra time on:
- The frosted glass effect on shielded data
- The staggered reveal animation
- The smooth transition between states
- The emotional impact of seeing numbers and names appear
- Mobile responsiveness (judges may view on phones)

Test: pnpm dev, go to /audit, enter the mock view key.
The reveal must be visually stunning.
```

---

## ══════════════════════════════════════════
## PROMPT 9 — FRONTEND: DEMO PAGE (Split Screen)
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Build the demo page at frontend/src/app/demo/page.tsx.
This is the page you screen-record for the hackathon video.

The demo page shows ALL THREE ROLES simultaneously in a split layout.

═══════════════════════════════════════
LAYOUT: Three-panel split screen
═══════════════════════════════════════

Desktop: three columns, each showing one role
Mobile: tabbed interface switching between roles

Left panel: "Sender" (labeled "Dubai")
- Compact version of the send flow
- Auto-fills with demo data (Maria, $500, AE→PH corridor)
- Each step is a compact card, not a full page

Center panel: "Stellar Network" (labeled "On-Chain")
- Live feed of events as they happen
- Shows: proof submitted → verified → commitment stored → funds locked
- Each event is a card with timestamp and tx hash
- The key visual: amounts show as "████" (redacted blocks)
- This panel updates in real-time as sender/receiver act

Right panel: "Receiver" (labeled "Manila")  
- Compact version of the receive flow
- Shows the claim flow after sender completes

Below all three panels:
- "Regulator View" button that opens the audit view
- When clicked: the center panel transforms to show the 
  decrypted ledger (same animation as the audit page)

═══════════════════════════════════════
DEMO ORCHESTRATION:
═══════════════════════════════════════

Create a "Run Demo" button that auto-plays the entire flow:
1. Sender panel auto-fills and starts sending (2 second delay between steps)
2. Center panel shows events appearing as sender acts
3. After sender completes, receiver panel auto-starts claiming
4. After receiver completes, the "Decrypt with View Key" prompt appears
5. User clicks it → center panel reveals all data

This orchestrated flow is what you record for the 2-minute demo video.
Each step should have a small delay so the viewer can follow along.

═══════════════════════════════════════
Use React context or a simple event bus for cross-panel communication.
Each panel is a client component.
The page layout is a server component.

Test the full orchestrated demo flow.
```

---

## ══════════════════════════════════════════
## PROMPT 10 — INTEGRATION: WIRE EVERYTHING TOGETHER
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now wire the real proof generation and Stellar interaction into the frontend.
If circuits are compiled and contracts are deployed, use real proofs.
If not, the mock mode must be seamless.

═══════════════════════════════════════
STEP 1: Environment config
═══════════════════════════════════════

Create frontend/.env.local with all the values from .env.example.
Set NEXT_PUBLIC_MOCK_PROOFS=true for now.
Set NEXT_PUBLIC_STELLAR_NETWORK=testnet
Set NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

═══════════════════════════════════════
STEP 2: Proof generation integration
═══════════════════════════════════════

Create frontend/src/lib/prover.ts that:
- Checks NEXT_PUBLIC_MOCK_PROOFS env var
- If true: returns mock proofs with realistic delays
- If false: loads circuit WASM + zkey from /public/circuits/ 
  and generates real proofs via snarkjs

The switch must be transparent to the UI components.
Use a ProverProvider context so any component can generate proofs.

═══════════════════════════════════════
STEP 3: Stellar transaction integration
═══════════════════════════════════════

Create frontend/src/lib/stellar.ts that:
- Connects to Stellar testnet via StellarSdk
- Builds transactions for deposit/withdrawal
- Signs via Freighter
- Submits and waits for confirmation
- Returns tx hash and explorer URL

In mock mode: simulate with delays and fake hashes.

═══════════════════════════════════════
STEP 4: View key integration
═══════════════════════════════════════

Wire the ViewKeyManager from lib/ into the audit page:
- In mock mode: use the fixed demo key to "decrypt" mock data
- In real mode: use actual HKDF+AES decryption of on-chain event data

═══════════════════════════════════════
STEP 5: Hook everything up
═══════════════════════════════════════

Go through each page and ensure:
- /send uses ProverProvider and StellarProvider
- /receive uses ProverProvider and StellarProvider  
- /audit uses ViewKeyManager
- /demo orchestrates all three
- Error boundaries exist for each critical section
- Loading states are shown for every async operation

═══════════════════════════════════════
STEP 6: Test the full flow
═══════════════════════════════════════

Run: cd frontend && pnpm dev

Walk through:
1. Landing page loads correctly
2. /send — complete all 4 steps with mock mode
3. /receive — complete all 3 steps with mock mode
4. /audit — enter view key, see the reveal animation
5. /demo — run the orchestrated demo

Fix any errors. Report the status of each page.
```

---

## ══════════════════════════════════════════
## PROMPT 11 — README & DOCUMENTATION
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Now write the judge-facing README.md and documentation.
This is the FIRST thing judges read. It must be excellent.

═══════════════════════════════════════
README.md (root)
═══════════════════════════════════════

Write a complete README with:

1. PROJECT HEADER
   - "Vela — Private Cross-Border Remittances on Stellar"
   - One-line description
   - Badges: Stellar, ZK, Circom, Soroban, USDC
   - "Built for Stellar Hacks: Real-World ZK (June 2026)"

2. THE PROBLEM (3-4 sentences)
   - Reference: GIZ paying 900 Syrian hospital workers via SDP
   - Reference: AirTM processing $1B+ in stablecoin payroll
   - The transparency paradox: blockchain transparency = privacy crisis
   - Every salary, every remittance, visible to anyone with an explorer

3. THE SOLUTION (3-4 sentences)
   - Three ZK circuits shield the transfer
   - Poseidon commitments hide amounts
   - View keys enable selective disclosure for regulators
   - Built on Stellar's native payment rails

4. DEMO
   - [Video link — placeholder]
   - [Live testnet URL — placeholder]  
   - Screenshot of the audit page reveal moment

5. ARCHITECTURE DIAGRAM (text-based)
   Show the full flow from sender to receiver with all contracts

6. HOW IT WORKS (the three roles, briefly)
   - Sender: proves KYC + commits amount
   - Receiver: proves knowledge of secret + claims funds
   - Regulator: view key → full ledger reconstruction

7. TECH STACK TABLE
   | Layer | Technology |
   |-------|-----------|
   | ZK Circuits | Circom 2.1 (Groth16) |
   | On-chain Verifier | Soroban + BLS12-381 |
   | Smart Contracts | Soroban / Rust |
   | Frontend | Next.js 15 + React 19 |
   | Wallet | Freighter |
   | View Key Crypto | HKDF + AES-256-GCM |
   | Network | Stellar Testnet |

8. QUICK START
   ```bash
   pnpm install
   cd frontend && pnpm dev
   ```

9. PROJECT STRUCTURE (tree view)

10. WHAT'S REAL VS MOCK (honest disclosure)
    - Real: ZK circuits, proof generation, Soroban verifier, 
      view key cryptography, frontend
    - Mock: Bank/KYC API integration, fiat on/off ramp, 
      anchor SEP-31 integration
    - "In production, the KYC attestation would come from a 
      regulated provider. The demo uses mock attestation data."

11. HACKATHON
    - Stellar Hacks: Real-World ZK
    - Prize pool: $10,000 XLM
    - Submission deadline: June 29, 2026

12. LICENSE: MIT

═══════════════════════════════════════
docs/architecture.md
═══════════════════════════════════════

Detailed architecture document with:
- System diagram (text)
- Contract interactions
- Circuit specifications (inputs, outputs, constraints)
- View key cryptographic scheme
- Security model and trust assumptions

═══════════════════════════════════════
docs/circuits.md
═══════════════════════════════════════

Circuit documentation:
- Each circuit's purpose
- Input/output specification
- Constraint count
- Proof generation time
- Security properties

═══════════════════════════════════════
docs/demo-script.md
═══════════════════════════════════════

Script for recording the 2-minute demo video:
- Second-by-second timing
- What to say at each point
- What to click
- What the viewer should notice

This file is for YOUR reference when recording.
```

---

## ══════════════════════════════════════════
## PROMPT 12 — SECURITY AUDIT
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Perform a thorough security review of the entire Vela codebase.
Check every file. Report issues as CRITICAL, HIGH, MEDIUM, LOW.

═══════════════════════════════════════
CHECK 1: Cryptographic Correctness
═══════════════════════════════════════

- Are Poseidon hashes using the same parameters in Circom AND TypeScript?
- Is the nullifier derivation consistent across all three circuits?
- Is the Merkle tree implementation correct (same hash function, same depth)?
- Does the view key HKDF use appropriate salt and info parameters?
- Is AES-256-GCM used with unique IVs for every encryption?
- Are any secrets ever logged, stored in localStorage, or sent to a server?

═══════════════════════════════════════
CHECK 2: Smart Contract Security
═══════════════════════════════════════

- Can the verifier be called by anyone, or only the policy contract?
- Can nullifiers be replayed across different corridors?
- Is the settlement contract properly gated to only accept calls from policy?
- Are there integer overflow risks in amount handling?
- Is the admin function properly protected?
- Can a malicious user drain the settlement contract?

═══════════════════════════════════════
CHECK 3: Frontend Security
═══════════════════════════════════════

- Are any secrets in URL parameters or query strings?
- Is sensitive data in React state cleared after use?
- Are there any XSS vectors in user input handling?
- Is the CSP (Content Security Policy) set in next.config?
- Are all external URLs validated before fetch?
- Does the app work correctly with wallet disconnected?

═══════════════════════════════════════
CHECK 4: ZK Circuit Security
═══════════════════════════════════════

- Are all private inputs actually private (not leaked via public inputs)?
- Is the nullifier binding correct (can't be forged)?
- Can the same proof be submitted twice (replay attack)?
- Are range checks using sufficient bit width?
- Is the Merkle depth sufficient for the demo?

═══════════════════════════════════════
CHECK 5: Dependency Audit
═══════════════════════════════════════

Run: pnpm audit
Check for known vulnerabilities in all dependencies.
Check that snarkjs is loaded from a trusted source.
Check that no dependencies have been deprecated.

═══════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════

For each issue found:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- File: exact file path
- Line: approximate line number
- Issue: what's wrong
- Fix: exact code change to make
- Impact: what could go wrong if not fixed

After listing all issues, fix every CRITICAL and HIGH issue immediately.
For MEDIUM and LOW, create TODO comments in the code.

Save the audit report to docs/security-audit.md.
```

---

## ══════════════════════════════════════════
## PROMPT 13 — FINAL POLISH & SUBMISSION PREP
## ══════════════════════════════════════════

```
Read CLAUDE.md first.

Final polish pass before submission. Go through every page and fix.

═══════════════════════════════════════
VISUAL POLISH
═══════════════════════════════════════

- Run the app: cd frontend && pnpm dev
- Check every page at 1440px (desktop) and 390px (mobile)
- Fix any layout breaks, overflow, or spacing issues
- Ensure dark theme is consistent everywhere
- Check that all animations are smooth (no jank)
- Verify the audit page reveal animation is stunning
- Add subtle hover effects to all interactive elements
- Ensure loading states look professional
- Check that error messages are helpful, not generic

═══════════════════════════════════════
CODE QUALITY
═══════════════════════════════════════

- Run: cd frontend && pnpm lint — fix all errors
- Run: cd frontend && pnpm build — ensure production build succeeds
- Check: no console.log statements left in production code
- Check: no commented-out code blocks
- Check: all TypeScript types are explicit (no 'any')
- Check: all components have proper prop types
- Check: no unused imports or variables

═══════════════════════════════════════
DOCUMENTATION
═══════════════════════════════════════

- README.md is complete with all sections filled
- Architecture diagram is accurate
- All environment variables are documented
- Quick start actually works from a fresh clone
- License file exists (MIT)

═══════════════════════════════════════
SUBMISSION CHECKLIST (from hackathon rules)
═══════════════════════════════════════

✓ Open-source repo on GitHub with full source code
✓ Clear README.md explaining what you built
✓ 2–3 minute demo video (record after this prompt)
✓ ZK + Stellar — proofs verified in Soroban contract
✓ ZK is load-bearing — not just mentioned in README

═══════════════════════════════════════
FINAL VERIFICATION
═══════════════════════════════════════

Run this exact sequence:
1. rm -rf node_modules .next
2. pnpm install
3. cd frontend && pnpm build
4. pnpm start
5. Open http://localhost:3000
6. Walk through: landing → send → receive → audit → demo
7. Confirm everything works

Report the final status of every page and feature.
```

---

## ══════════════════════════════════════════
## REFERENCE: FIX PROMPTS (Use if something breaks)
## ══════════════════════════════════════════

### If dependencies won't install:
```
Read CLAUDE.md. My pnpm install is failing with errors. 
Read the error output below and fix the dependency issues.
Do NOT change the project structure. Only fix package versions 
or add missing peer dependencies.

[paste error here]
```

### If the frontend won't compile:
```
Read CLAUDE.md. My Next.js build is failing. Read the errors below.
Fix TypeScript errors, missing imports, and build issues.
Do NOT restructure the app. Only fix the specific errors.

[paste error here]
```

### If contracts won't compile:
```
Read CLAUDE.md. My Soroban contracts won't build with 
cargo build --release --target wasm32-unknown-unknown.
Read the errors below. Fix Rust compilation issues.
Check that soroban-sdk version matches the imports.

[paste error here]
```

### If circuits won't compile:
```
Read CLAUDE.md. My Circom circuits won't compile.
Read the errors below. Fix circuit syntax issues.
Check that circomlib imports are correct.
Check constraint count is under 5,000 per circuit.

[paste error here]
```

---

## ══════════════════════════════════════════
## ORDER OF OPERATIONS SUMMARY
## ══════════════════════════════════════════

```
Prompt 0  → Project structure + CLAUDE.md       (10 min)
Prompt 1  → Install all dependencies             (15 min)
Prompt 2  → Write Circom circuits                (1-2 hours)
Prompt 3  → Write Soroban contracts              (1-2 hours)
Prompt 4  → View key crypto library              (1 hour)
Prompt 5  → Frontend design system + landing     (1-2 hours)
Prompt 6  → Sender flow                          (1-2 hours)
Prompt 7  → Receiver flow                        (1 hour)
Prompt 8  → Auditor flow (THE WOW PAGE)          (1-2 hours)
Prompt 9  → Demo page (split screen)             (1 hour)
Prompt 10 → Integration (wire everything)        (1-2 hours)
Prompt 11 → README + documentation               (30 min)
Prompt 12 → Security audit                       (30 min)
Prompt 13 → Final polish + submission prep       (30 min)
                                          ─────────────────
                                          Total: ~12-16 hours
```

> TIP: After each prompt, do a quick `git add -A && git commit -m "prompt N: description"`
> so you can rollback if something breaks.