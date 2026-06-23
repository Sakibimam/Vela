# Vela — Architecture

## System Overview

Vela implements a **Policy-and-Proof Split** architecture: cryptographic verification is isolated from business logic, and business logic is isolated from asset custody.

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                                │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ snarkjs     │  │ Poseidon    │  │ ViewKey      │  │ Freighter    │ │
│  │ (WASM)      │  │ (circomlibjs)│  │ (Web Crypto) │  │ (Wallet)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                │                 │                  │         │
└─────────┼────────────────┼─────────────────┼──────────────────┼─────────┘
          │ proof          │ hash            │ ciphertext       │ signature
          ▼                ▼                 ▼                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      STELLAR NETWORK (Soroban)                          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ VERIFIER CONTRACT                                                 │  │
│  │ • Accepts Groth16 proof + public inputs                           │  │
│  │ • Calls bls12_381_multi_pairing_check host function               │  │
│  │ • Returns bool (valid / invalid)                                  │  │
│  │ • Stateless — no storage, pure verification                       │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ is_valid                             │
│  ┌───────────────────────────────▼──────────────────────────────────┐  │
│  │ CORRIDOR POLICY CONTRACT                                          │  │
│  │ • Calls Verifier for each proof                                   │  │
│  │ • Stores nullifiers (prevents double-spend)                       │  │
│  │ • Maintains Merkle root of commitments                            │  │
│  │ • Enforces corridor rules (max amount, allowed jurisdictions)     │  │
│  │ • Emits encrypted payload as contract event                       │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │ approved                             │
│  ┌───────────────────────────────▼──────────────────────────────────┐  │
│  │ SETTLEMENT CONTRACT                                               │  │
│  │ • Holds USDC in escrow                                            │  │
│  │ • Locks funds on deposit                                          │  │
│  │ • Releases funds on valid withdrawal                              │  │
│  │ • Tracks corridor statistics                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## Contract Interactions

### Deposit Flow (Sender)

```
Sender → corridor_policy::deposit(kyc_proof, amount_proof, encrypted_payload)
  │
  ├── corridor_policy calls verifier::verify(kyc_proof, kyc_public_inputs)
  │   └── Returns true/false
  │
  ├── corridor_policy calls verifier::verify(amount_proof, amount_public_inputs)
  │   └── Returns true/false
  │
  ├── corridor_policy stores nullifier (prevents reuse)
  ├── corridor_policy inserts commitment into Merkle tree
  ├── corridor_policy emits Event(encrypted_payload)
  │
  └── corridor_policy calls settlement::lock(amount_commitment)
      └── settlement escrows USDC
```

### Withdrawal Flow (Receiver)

```
Receiver → corridor_policy::withdraw(withdrawal_proof, nullifier)
  │
  ├── corridor_policy calls verifier::verify(withdrawal_proof, public_inputs)
  │   └── Proves: commitment ∈ Merkle tree, knows preimage, correct nullifier
  │
  ├── corridor_policy checks nullifier not already spent
  ├── corridor_policy marks nullifier as spent
  │
  └── corridor_policy calls settlement::release(receiver_address, amount)
      └── settlement sends USDC to receiver
```

## Circuit Specifications

### 1. KYC Compliance (`kyc_compliance.circom`)

**Purpose:** Prove sender is from an allowed jurisdiction, over 18, and has a valid KYC attestation — without revealing any identity data.

| Signal | Type | Visibility |
|--------|------|-----------|
| country_code | input | private |
| birth_year | input | private |
| kyc_attestation | input | private |
| user_secret | input | private |
| merkle_path[8] | input | private |
| merkle_indices[8] | input | private |
| allowed_countries_root | input | public |
| min_birth_year | input | public |
| kyc_issuer_hash | input | public |
| nullifier | output | public |

**Constraints:**
- `country_code` is a leaf in the allowed-countries Merkle tree
- `birth_year <= current_year - 18`
- `Poseidon(kyc_attestation, user_secret) == kyc_issuer_hash`
- `nullifier = Poseidon(user_secret, nonce)`

### 2. Amount Commitment (`amount_commitment.circom`)

**Purpose:** Commit to a transfer amount with a range proof. The blockchain stores the commitment hash, not the amount.

| Signal | Type | Visibility |
|--------|------|-----------|
| amount | input | private |
| sender_secret | input | private |
| nonce | input | private |
| max_amount | input | public |
| commitment | output | public |
| nullifier | output | public |

**Constraints:**
- `amount > 0`
- `amount <= max_amount` (range proof via bit decomposition)
- `commitment = Poseidon(amount, sender_secret, nonce)`
- `nullifier = Poseidon(sender_secret, nonce)`

### 3. Withdrawal (`withdrawal.circom`)

**Purpose:** Prove the receiver knows the secret for a commitment in the Merkle tree, without revealing which commitment.

| Signal | Type | Visibility |
|--------|------|-----------|
| amount | input | private |
| receiver_secret | input | private |
| nonce | input | private |
| merkle_path[8] | input | private |
| merkle_indices[8] | input | private |
| merkle_root | input | public |
| nullifier | output | public |
| receiver_address_hash | input | public |

**Constraints:**
- `commitment = Poseidon(amount, receiver_secret, nonce)`
- `commitment` is a valid leaf (Merkle proof against `merkle_root`)
- `nullifier = Poseidon(receiver_secret, nonce)` (prevents double-claim)

## View Key Cryptographic Scheme

```
Master View Key (32 bytes, random)
        │
        │ HKDF-SHA256
        │ salt = transaction_nonce
        │ info = "vela-tx-key"
        ▼
Per-Transaction Key (AES-256-GCM)
        │
        │ AES-256-GCM encrypt
        │ plaintext = {senderIdHash, receiverIdHash, amount, corridor, timestamp}
        │ iv = random 12 bytes
        ▼
Encrypted Payload (stored on-chain as contract event)
        = { ciphertext, iv, nonce }
```

**Key properties:**
- One master key per corridor — shared with authorized regulators
- Each transaction derives a unique AES key from the master + public nonce
- Forward secrecy: compromising one transaction key doesn't reveal others
- Batch audit: regulator iterates all events, derives each key, decrypts

**Regulator flow:**
1. Fetch all contract events from the corridor
2. For each event: `txKey = HKDF(masterKey, event.nonce, "vela-tx-key")`
3. Decrypt: `plaintext = AES-GCM-Decrypt(txKey, event.iv, event.ciphertext)`
4. Reconstruct full ledger with amounts, identities, timestamps

## Security Model

### Trust Assumptions

| Component | Trust Level |
|-----------|------------|
| Circom circuits | Zero trust — soundness guaranteed by math |
| Groth16 setup | Trusted setup ceremony (Powers of Tau) |
| Soroban verifier | Trust Stellar validators for execution |
| View key holder | Trust regulator not to leak — revocable |
| Freighter wallet | Trust user's browser environment |
| KYC attestor | Trust identity provider (out of scope for demo) |

### What an attacker CANNOT do:
- Forge a KYC proof without valid attestation
- Determine transfer amounts from on-chain data
- Link sender to receiver from on-chain data
- Double-spend (nullifier prevents)
- Claim someone else's funds (requires secret)

### What a regulator CAN do (with view key):
- Decrypt all transaction metadata in the corridor
- Verify compliance after the fact
- Produce audit reports
- Cannot forge transactions or move funds

### What a regulator CANNOT do:
- Modify transactions retroactively
- Access corridors they don't hold keys for
- Decrypt without the specific corridor key
