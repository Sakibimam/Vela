# Vela — Demo Script (2:30)

This is your second-by-second guide for recording the hackathon video.

---

## Setup Before Recording

- Browser open to `http://localhost:3000`
- Terminal visible (optional, for credibility)
- Screen resolution: 1920x1080, browser at ~90% zoom
- Have the demo view key ready to paste: `vela_demo_view_key_2026`
- Close all other tabs and notifications

---

## 0:00–0:15 — Hook (15 seconds)

**Show:** Landing page hero section

**Say:**
> "Every cross-border payment on a blockchain is visible to everyone. Your salary, your remittances, your family connections — all public. Vela fixes this."

**Action:** Scroll slightly to show the "How It Works" section briefly.

---

## 0:15–0:30 — The Problem (15 seconds)

**Show:** Stay on landing page, point at the stats section

**Say:**
> "$195 trillion crosses borders annually. The average remittance costs over 5%. And every single one is a privacy leak. A nurse in Dubai sending money to her family in Manila shouldn't expose her income to the world."

**Action:** Click "Send Money" button.

---

## 0:30–1:00 — Sender Flow (30 seconds)

**Show:** /send page

**Say:**
> "Here's how Vela works. Maria connects her Freighter wallet..."

**Action:** Click "Connect" wallet button.

> "...enters $500 to send to Manila..."

**Action:** Type "500" in amount, paste a Stellar address, show corridor is "Dubai → Manila".

> "...and Vela generates two zero-knowledge proofs entirely in her browser."

**Action:** Click "Continue". Watch the KYC proof progress ring animate.

> "The first proves she's from an allowed jurisdiction and is over 18 — without revealing her name, passport, or country. The second commits the amount as a Poseidon hash — the blockchain will see a hash, not a number."

**Action:** Wait for both proofs to complete. Point at the "What the blockchain will see" summary.

> "Nothing private touches the chain."

**Action:** Click "Submit to Stellar". Wait for confirmation.

---

## 1:00–1:25 — Receiver Flow (25 seconds)

**Show:** Navigate to /receive

**Say:**
> "Now the family in Manila claims the funds. They paste the shared secret..."

**Action:** Paste a 64-character hex secret, click "Find".

> "The system finds their commitment — but nobody else can tell which one it is."

**Action:** Wait for "Funds Found" to appear showing $500.

> "A Merkle withdrawal proof proves they know the secret for a valid commitment — without revealing which commitment in the pool is theirs."

**Action:** Watch the withdrawal proof generate. Click "Claim Funds". Wait for success.

> "$500 received. Zero identity leaked."

---

## 1:25–2:15 — The Reveal (50 seconds) ⭐ CLIMAX

**Show:** Navigate to /audit

**Say:**
> "But here's the thing regulators worry about — if everything is private, how do you audit it?"

**Action:** Point at the table. Emphasize "SHIELDED" amounts and "PRIVATE" identities.

> "This is what the public sees. Eight transactions. All amounts hidden. All identities private. It looks like a black box."

**Pause 2 seconds for impact.**

> "But Vela has a view key system. A corridor regulator holds a master key — derived using HKDF. One key decrypts every transaction in the corridor."

**Action:** Click the view key input. Paste `vela_demo_view_key_2026`.

> "Watch what happens."

**Action:** Click "Decrypt Ledger". 

**PAUSE — let the animation play.** This is the money shot. Each row decrypts one by one. Amounts appear in green. Names appear. The table transforms from opaque to transparent.

> "Every amount. Every sender. Every receiver. Full compliance — on demand."

**Action:** Point at the compliance summary (all green checkmarks).

> "Privacy by default. Auditability when required. That's Vela."

---

## 2:15–2:30 — Close (15 seconds)

**Show:** Scroll to compliance summary, then cut to landing page

**Say:**
> "Three Circom circuits. Three Soroban contracts. Groth16 on BLS12-381. HKDF view keys. All running on Stellar testnet. Private remittances that regulators can trust."

**Action:** Show the tech stack section briefly.

> "Vela. Built for Stellar Hacks."

---

## Key Tips

1. **The reveal animation is everything.** Give it silence. Let the audience watch the blur-to-clear transition. Don't talk over it.

2. **Pace yourself on proofs.** The progress rings are beautiful — let them breathe for 2-3 seconds before narrating.

3. **Use the numbers.** "$500" is concrete. "A hash, not a number" is memorable.

4. **End on the value prop.** "Privacy by default, auditability when required" is the one-liner judges will remember.

5. **If something loads slowly**, narrate over it: "Generating a Groth16 proof is computationally intensive — this happens entirely in the browser, nothing touches a server."
