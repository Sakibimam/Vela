# Vela — Security Audit Report

**Date:** 2026-06-16
**Scope:** Full codebase (circuits, contracts, lib, frontend)
**Auditor:** Internal review

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2     |
| HIGH     | 4     |
| MEDIUM   | 5     |
| LOW      | 4     |

---

## CRITICAL Issues

### C1: Withdrawal circuit address binding is non-constraining

- **File:** `circuits/circuits/withdrawal.circom`
- **Line:** 73–80
- **Issue:** The `receiver_address_hash` binding creates a Poseidon hash but only assigns it to an intermediate signal `address_check` without constraining it against any public input. The circuit computes `Poseidon(receiver_secret, receiver_address_hash)` but the result is unused — it doesn't constrain anything. This means ANY address can claim ANY commitment. The `receiver_address_hash` public input is declared but not actually bound to the proof.
- **Impact:** A front-runner could observe a withdrawal proof on-chain, extract the public signals, and submit a transaction claiming the funds to a different address. The proof doesn't cryptographically bind the receiver.
- **Fix:** Constrain the address binding as a public output signal that the contract verifies.

### C2: Corridor policy passes `amount` as cleartext parameter

- **File:** `contracts/corridor-policy/src/lib.rs`
- **Line:** 139 (deposit), 246 (withdraw)
- **Issue:** Both `deposit()` and `withdraw()` accept an `amount: i128` parameter in cleartext. This completely defeats the privacy model — the amount is visible in the transaction call data on-chain. The entire point of the amount commitment circuit is to hide the amount, but the contract then requires it as a plain argument.
- **Impact:** All transfer amounts are publicly visible on-chain despite the ZK shielding. The privacy guarantee is broken at the contract level.
- **Fix:** Remove the cleartext `amount` parameter. The settlement contract should work with commitments only, or the amount should be derived from the proof's public signals inside the contract.

---

## HIGH Issues

### H1: View key `exportKey` derives a different key than what was imported

- **File:** `lib/src/crypto/viewkey.ts`
- **Line:** 134–148
- **Issue:** `exportKey()` uses HKDF to derive bits from the master key with salt "vela-export" — this produces a DIFFERENT key material than the original random bytes. If a regulator exports their key and then imports it elsewhere, `importKey(exportedHex)` will produce a key with different raw bytes than the original, meaning it will derive different transaction keys and fail to decrypt anything.
- **Impact:** Key export/import cycle is broken. A regulator cannot portably share their view key — it won't decrypt correctly on import.
- **Fix:** Export the raw key material directly using `crypto.subtle.exportKey("raw", ...)` instead of deriving new bits. However, since the key was imported as non-extractable (`false` in importKey), we need to generate the key as extractable or store the raw bytes alongside.

### H2: Merkle tree `computeLayers` pads all 256 leaves on every operation

- **File:** `lib/src/crypto/merkle.ts`
- **Line:** 159–177
- **Issue:** Every call to `getRoot()`, `getProof()`, or `verifyProof()` recomputes ALL layers from scratch by padding to 256 leaves and hashing them all. Each Poseidon hash involves WASM calls. This is O(2^depth) on every operation — a `getProof()` call on a tree with 1 leaf still computes 256 + 128 + 64 + ... = 510 Poseidon hashes. For real-time UI this causes unacceptable latency.
- **Impact:** Performance degradation that could freeze the browser UI during proof generation. Not a correctness issue but a denial-of-service vector against the user's own browser.
- **Fix:** Cache the layers and only recompute on insert. Mark as TODO since it's a performance issue, not a security vulnerability in the crypto sense.

### H3: `hexToBytes` does not validate input length or characters

- **File:** `lib/src/crypto/viewkey.ts`
- **Line:** 219–224
- **Issue:** `hexToBytes()` doesn't check that the input is even-length or contains only valid hex characters. An odd-length string will produce a truncated array. Non-hex characters will produce NaN bytes (which become 0 via parseInt returning NaN → Uint8Array stores 0).
- **Impact:** Malformed view key hex strings silently produce wrong keys instead of throwing. A regulator could accidentally use a corrupted key that silently decrypts to garbage (or worse, a key that partially works for some transactions).
- **Fix:** Add input validation.

### H4: Settlement contract `release_funds` trusts caller-provided amount

- **File:** `contracts/settlement/src/lib.rs`
- **Line:** 128
- **Issue:** The `release_funds` function accepts `amount: i128` from the calling policy contract without any verification that this amount matches what was actually deposited for the given commitment. Combined with C2, a compromised or buggy policy contract could release arbitrary amounts.
- **Impact:** If the policy contract has a bug, funds could be drained by claiming more than was deposited. The settlement contract has no independent verification of the withdrawal amount against the deposit commitment.
- **Fix:** The settlement contract should track per-commitment locked amounts, or the amount should be derived from the ZK proof's public signals.

---

## MEDIUM Issues

### M1: No Content Security Policy headers in Next.js config

- **File:** `frontend/next.config.ts`
- **Line:** 4–30
- **Issue:** No CSP, X-Frame-Options, or other security headers are configured. The app loads WASM from `/circuits/` and could be vulnerable to clickjacking or script injection if deployed.
- **Impact:** Without CSP, any XSS vulnerability (even in a dependency) can exfiltrate secrets from the browser's memory. The WASM circuit files could theoretically be swapped via a CDN compromise without SRI hashes.
- **Fix:** Add security headers via `next.config.ts` headers config.

### M2: Shared secret displayed in URL-accessible page state

- **File:** `frontend/src/app/send/page.tsx`
- **Line:** 33–39
- **Issue:** The `sharedSecret` is generated on page load and stored in React state. If the user navigates away and back, a new secret is generated (losing the old one if not copied). More critically, React DevTools or browser memory dumps can expose the secret. There's no mechanism to zero out the secret from memory after copy.
- **Impact:** The shared secret persists in React component state indefinitely. If the user's browser is compromised (extension, devtools), the secret is trivially extractable.
- **Fix:** Add a note about memory clearing limitations. In production, consider using a Web Worker for secret handling.

### M3: Mock mode `randomHex` in `mockData.ts` uses Math.random()

- **File:** `frontend/src/components/auditor/mockData.ts`
- **Line:** 1–8
- **Issue:** The `randomHex()` function uses `Math.random()` which is not cryptographically secure. While this is only used for demo/mock display data, if this function were accidentally used for real crypto operations (e.g., nonces), it would be catastrophic.
- **Impact:** Low in current usage (demo data only), but the function's name matches the crypto-secure version in other files. A developer could mistakenly import the wrong `randomHex`.
- **Fix:** Rename to `mockRandomHex` to prevent confusion, or replace with `crypto.getRandomValues`.

### M4: KYC circuit uses `LessEqThan(64)` — oversized comparator

- **File:** `circuits/circuits/kyc_compliance.circom`
- **Line:** 68
- **Issue:** `LessEqThan(64)` creates a 64-bit comparator for birth years that are 4-digit numbers (max ~2100). This wastes ~60 constraints on unnecessary bit decomposition. More importantly, a 64-bit range allows field overflow attacks if the prover provides a very large birth_year that wraps around the field.
- **Impact:** A malicious prover could provide a birth_year value larger than the BLS12-381 scalar field modulus p, causing it to wrap and potentially satisfy the constraint while the actual birth year is invalid. Using 16 bits would be safe for years 0–65535.
- **Fix:** Change to `LessEqThan(16)` and add an explicit range check constraint on birth_year.

### M5: Amount commitment circuit uses `GreaterThan(64)` and `LessEqThan(64)`

- **File:** `circuits/circuits/amount_commitment.circom`
- **Line:** 26–32
- **Issue:** Same as M4 — 64-bit comparators for amounts that should fit in 32 bits (max $30,000 = 3,000,000 cents). The oversized comparator allows field overflow attacks.
- **Impact:** A prover could craft an amount value near the field modulus that wraps around to appear valid while actually being astronomically large, potentially draining the settlement contract.
- **Fix:** Change to `GreaterThan(32)` and `LessEqThan(32)` for the amount (sufficient for up to ~$42M in cents).

---

## LOW Issues

### L1: Dependency vulnerabilities in transitive packages

- **File:** `circuits/package.json`, `lib/package.json`, `frontend/package.json`
- **Issue:** `pnpm audit` reports 10 vulnerabilities (4 high, 3 moderate, 3 low):
  - `serialize-javascript` ≤7.0.2 (RCE via mocha)
  - `underscore` ≤1.13.7 (DoS via snarkjs→bfj→jsonpath)
  - `esbuild` <0.28.1 (RCE via NPM_CONFIG_REGISTRY, dev only)
  - `ws` <8.21.0 (memory exhaustion DoS)
- **Impact:** All are in dev/test dependencies or transitive deps of snarkjs that don't execute in production browser context. The `ws` vulnerability only affects WebSocket servers, not clients. The `esbuild` issue only affects Deno (not Node.js).
- **Fix:** Pin `snarkjs` override to latest, update `tsup` to get esbuild ≥0.28.1, update `mocha`. Low priority since none execute in production.

### L2: Explorer URL construction doesn't validate txHash format

- **File:** `frontend/src/lib/stellar.ts`
- **Line:** 34–36
- **Issue:** `explorerUrl(hash)` concatenates the hash directly into a URL without validating it's a proper hex string. In mock mode this is fine, but a malformed hash could construct an unexpected URL.
- **Impact:** Extremely low — the hash only goes into an `<a href>` to stellar.expert. No injection risk since it's the path component, but could create a broken link.
- **Fix:** Validate hash is 64-char hex before constructing URL.

### L3: View key input not rate-limited

- **File:** `frontend/src/app/audit/page.tsx`
- **Line:** 24–44
- **Issue:** The `handleDecrypt` function has no rate limiting. An attacker with access to the page could brute-force view keys (though with a proper 256-bit key this is computationally infeasible).
- **Impact:** Negligible for 256-bit keys. Could cause excessive re-renders if spammed.
- **Fix:** Add a basic debounce or cooldown after failed attempts.

### L4: `navigator.clipboard.writeText` used without fallback

- **File:** `frontend/src/components/sender/StepConfirmation.tsx`
- **Line:** 23
- **Issue:** `navigator.clipboard.writeText` requires HTTPS or localhost and a focused document. In some browser contexts (embedded iframes, non-secure origins) it will silently fail or throw.
- **Impact:** User might think they copied the secret but clipboard is empty. Could lead to loss of access to funds.
- **Fix:** Add try/catch with a fallback (select-all in a hidden textarea) or show an error toast on failure.

---

## Fixes Applied

### C1 Fixed: Withdrawal circuit address binding

The address binding now constrains the output — the circuit produces a `withdrawal_binding` output signal that the contract must verify equals `Poseidon(receiver_secret, receiver_address_hash)`. This cryptographically binds the withdrawal to a specific receiver address.

### C2 Fixed: Removed cleartext amount from corridor-policy

Removed the `amount: i128` parameter from both `deposit()` and `withdraw()`. The settlement contract now uses a fixed commitment-based model where amounts are never exposed on-chain.

### H1 Fixed: View key export uses stored raw bytes pattern

Changed the approach to generate the master key as extractable and use `crypto.subtle.exportKey("raw", ...)` for the real export.

### H3 Fixed: hexToBytes validates input

Added length and character validation to `hexToBytes()`.

---

## Recommendations

1. **Pre-deployment:** Run a formal verification tool on the Circom circuits (e.g., Circom-Mutant, ECNE)
2. **Pre-deployment:** Add constraint count assertions in circuit tests to detect unexpected changes
3. **Pre-deployment:** Implement proper Merkle root tracking in the corridor-policy contract (currently just stores commitments sequentially)
4. **Consider:** Using a Web Worker for all crypto operations to isolate secrets from the main thread
5. **Consider:** Adding SRI hashes for the circuit WASM/zkey files when served from a CDN
