# Vela — Circuit Documentation

## Overview

Vela uses three Circom 2.1 circuits compiled to Groth16 proofs on the BLS12-381 curve. All proofs are generated client-side using snarkjs (WASM) and verified on-chain by the Soroban verifier contract using the `bls12_381_multi_pairing_check` host function.

## Circuit 1: KYC Compliance

**File:** `circuits/circuits/kyc_compliance.circom`

### Purpose
Proves the sender satisfies jurisdiction and age requirements with a valid KYC attestation, without revealing any personal information.

### Signal Table

```
┌─────────────────────────┬───────────┬──────────┬─────────────────────────────┐
│ Signal                  │ Direction │ Visible  │ Description                 │
├─────────────────────────┼───────────┼──────────┼─────────────────────────────┤
│ country_code            │ input     │ private  │ ISO 3166-1 numeric code     │
│ birth_year              │ input     │ private  │ Sender's birth year         │
│ kyc_attestation         │ input     │ private  │ Attestation from provider   │
│ user_secret             │ input     │ private  │ User's 256-bit secret       │
│ merkle_path[8]          │ input     │ private  │ Path in allowed-countries   │
│ merkle_indices[8]       │ input     │ private  │ Left/right at each level    │
│ allowed_countries_root  │ input     │ public   │ Root of allowed jurisdictions│
│ min_birth_year          │ input     │ public   │ Current year - 18           │
│ kyc_issuer_hash         │ input     │ public   │ Poseidon(attestation, secret)│
│ nonce                   │ input     │ public   │ Session nonce               │
│ nullifier               │ output    │ public   │ Poseidon(secret, nonce)     │
└─────────────────────────┴───────────┴──────────┴─────────────────────────────┘
```

### Constraints

1. **Jurisdiction check:** Verify `country_code` is a leaf in the Merkle tree with root `allowed_countries_root` using `merkle_path` and `merkle_indices`.

2. **Age check:** Assert `birth_year <= min_birth_year` (i.e., sender is at least 18).

3. **Attestation binding:** Assert `Poseidon(kyc_attestation, user_secret) == kyc_issuer_hash`. This binds the attestation to the user without revealing either.

4. **Nullifier generation:** Compute `nullifier = Poseidon(user_secret, nonce)`. Stored on-chain to prevent proof reuse.

### Approximate Constraints
~2,500 (dominated by Poseidon hashes and Merkle proof verification)

---

## Circuit 2: Amount Commitment

**File:** `circuits/circuits/amount_commitment.circom`

### Purpose
Commits a transfer amount behind a Poseidon hash with a range proof, ensuring the amount is valid without revealing it.

### Signal Table

```
┌─────────────────────────┬───────────┬──────────┬─────────────────────────────┐
│ Signal                  │ Direction │ Visible  │ Description                 │
├─────────────────────────┼───────────┼──────────┼─────────────────────────────┤
│ amount                  │ input     │ private  │ Transfer amount (cents)     │
│ sender_secret           │ input     │ private  │ Sender's 256-bit secret     │
│ nonce                   │ input     │ private  │ Unique transaction nonce    │
│ max_amount              │ input     │ public   │ Corridor max (e.g., 300000) │
│ commitment              │ output    │ public   │ Poseidon(amt, secret, nonce)│
│ nullifier               │ output    │ public   │ Poseidon(secret, nonce)     │
└─────────────────────────┴───────────┴──────────┴─────────────────────────────┘
```

### Constraints

1. **Positivity:** Assert `amount > 0` (via bit decomposition showing no sign bit).

2. **Range proof:** Assert `amount <= max_amount` using a 32-bit decomposition. Each bit is constrained to be 0 or 1, and the reconstructed value must equal `amount`.

3. **Commitment:** Compute `commitment = Poseidon(amount, sender_secret, nonce)`. This is stored in the Merkle tree on-chain.

4. **Nullifier:** Compute `nullifier = Poseidon(sender_secret, nonce)`. Prevents the same deposit from being used twice.

### Approximate Constraints
~1,800 (dominated by 32-bit range decomposition and Poseidon)

---

## Circuit 3: Withdrawal

**File:** `circuits/circuits/withdrawal.circom`

### Purpose
Proves the receiver knows the preimage of a commitment that exists in the on-chain Merkle tree, binding the withdrawal to their address without revealing which commitment is theirs.

### Signal Table

```
┌─────────────────────────┬───────────┬──────────┬─────────────────────────────┐
│ Signal                  │ Direction │ Visible  │ Description                 │
├─────────────────────────┼───────────┼──────────┼─────────────────────────────┤
│ amount                  │ input     │ private  │ Transfer amount (cents)     │
│ receiver_secret         │ input     │ private  │ Shared secret from sender   │
│ nonce                   │ input     │ private  │ Transaction nonce           │
│ merkle_path[8]          │ input     │ private  │ Path to commitment leaf     │
│ merkle_indices[8]       │ input     │ private  │ Left/right at each level    │
│ merkle_root             │ input     │ public   │ Current on-chain root       │
│ nullifier               │ output    │ public   │ Poseidon(secret, nonce)     │
│ receiver_address_hash   │ input     │ public   │ Poseidon(stellar_address)   │
└─────────────────────────┴───────────┴──────────┴─────────────────────────────┘
```

### Constraints

1. **Commitment reconstruction:** Compute `commitment = Poseidon(amount, receiver_secret, nonce)`.

2. **Merkle inclusion:** Verify `commitment` is a leaf in the tree with root `merkle_root` using `merkle_path` and `merkle_indices` (8 levels of Poseidon hashing).

3. **Nullifier:** Compute `nullifier = Poseidon(receiver_secret, nonce)`. Prevents double-claim of the same commitment.

4. **Address binding:** The `receiver_address_hash` is included as a public input, binding this proof to a specific receiver address so it cannot be front-run.

### Approximate Constraints
~3,200 (dominated by 8-level Merkle proof with Poseidon at each level)

---

## Shared Components

### Poseidon Hash
All circuits use the circomlib Poseidon implementation (t=3 to t=5 depending on arity). This matches the `circomlibjs` implementation used in the frontend for computing commitments and nullifiers client-side.

### Merkle Proof Verification
Both KYC and Withdrawal circuits include an 8-level Merkle proof subcircuit:
- Depth: 8 (supports 256 leaves)
- Hash: Poseidon(left, right) at each level
- Direction: determined by `indices[level]` (0=left, 1=right)

### Nullifier Pattern
Every circuit produces a nullifier = `Poseidon(secret, nonce)`. This is stored on-chain by the corridor policy contract. If a nullifier already exists, the transaction is rejected. This prevents:
- KYC proof reuse (same attestation, different nonce each time)
- Double-deposit (same sender secret + nonce)
- Double-withdrawal (same receiver secret + nonce)

---

## Proving Key Setup

```bash
# Download Powers of Tau (BLS12-381, 2^14 constraints)
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau

# Compile each circuit
circom circuits/kyc_compliance.circom --r1cs --wasm --sym -o build/

# Circuit-specific setup (Phase 2)
snarkjs groth16 setup build/kyc_compliance.r1cs powersOfTau28_hez_final_14.ptau build/kyc_compliance_0000.zkey

# Contribute to Phase 2 (adds randomness)
snarkjs zkey contribute build/kyc_compliance_0000.zkey build/kyc_compliance.zkey --name="vela-contributor"

# Export verification key (used by Soroban verifier)
snarkjs zkey export verificationkey build/kyc_compliance.zkey build/kyc_compliance.vkey.json
```

## Proof Sizes

| Circuit | Constraints | Proof Size | Verification Time |
|---------|-------------|-----------|-------------------|
| KYC Compliance | ~2,500 | 192 bytes | <1ms (pairing check) |
| Amount Commitment | ~1,800 | 192 bytes | <1ms |
| Withdrawal | ~3,200 | 192 bytes | <1ms |

All Groth16 proofs are constant size (3 curve points = 192 bytes on BLS12-381) regardless of circuit complexity.
