import { useState, useCallback, useRef } from "react";
import type { DemoPhase, DemoState, NetworkEvent } from "./types";

function randomHex(bytes: number): string {
  const chars = "0123456789abcdef";
  let r = "";
  for (let i = 0; i < bytes * 2; i++) r += chars[Math.floor(Math.random() * 16)];
  return r;
}

function now(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const PHASE_SEQUENCE: DemoPhase[] = [
  "sender-connect",
  "sender-details",
  "sender-kyc-proof",
  "sender-amount-proof",
  "sender-submit",
  "sender-complete",
  "receiver-connect",
  "receiver-lookup",
  "receiver-proof",
  "receiver-claim",
  "receiver-complete",
  "reveal-prompt",
];

const PHASE_DELAYS: Record<DemoPhase, number> = {
  idle: 0,
  "sender-connect": 1200,
  "sender-details": 1800,
  "sender-kyc-proof": 4000,
  "sender-amount-proof": 3000,
  "sender-submit": 2500,
  "sender-complete": 1500,
  "receiver-connect": 1200,
  "receiver-lookup": 2000,
  "receiver-proof": 4000,
  "receiver-claim": 2500,
  "receiver-complete": 1500,
  "reveal-prompt": 0,
  "reveal-decrypt": 2000,
  complete: 0,
};

const PHASE_EVENTS: Partial<Record<DemoPhase, Omit<NetworkEvent, "id" | "timestamp" | "txHash">>> = {
  "sender-kyc-proof": { type: "proof", label: "KYC Proof Submitted", detail: "Groth16 proof → Verifier contract" },
  "sender-amount-proof": { type: "verify", label: "KYC Verified On-Chain", detail: "Proof valid • Nullifier stored" },
  "sender-submit": { type: "commit", label: "Amount Committed", detail: "Poseidon(████, nonce) → Merkle tree" },
  "sender-complete": { type: "lock", label: "Funds Locked", detail: "$████ USDC → Settlement vault" },
  "receiver-proof": { type: "proof", label: "Withdrawal Proof Submitted", detail: "Merkle inclusion → Verifier" },
  "receiver-claim": { type: "unlock", label: "Funds Released", detail: "$████ USDC → Receiver wallet" },
};

export function useDemoOrchestrator() {
  const [state, setState] = useState<DemoState>({
    phase: "idle",
    events: [],
    senderTxHash: null,
    receiverTxHash: null,
    revealed: false,
  });
  const abortRef = useRef<boolean>(false);

  const addEvent = useCallback((phase: DemoPhase) => {
    const template = PHASE_EVENTS[phase];
    if (!template) return;
    const event: NetworkEvent = {
      ...template,
      id: crypto.randomUUID(),
      timestamp: now(),
      txHash: randomHex(32),
    };
    setState((s) => ({ ...s, events: [...s.events, event] }));
  }, []);

  const runDemo = useCallback(async () => {
    abortRef.current = false;
    setState({ phase: "idle", events: [], senderTxHash: null, receiverTxHash: null, revealed: false });

    for (const phase of PHASE_SEQUENCE) {
      if (abortRef.current) return;

      setState((s) => ({ ...s, phase }));
      addEvent(phase);

      if (phase === "sender-complete") {
        setState((s) => ({ ...s, senderTxHash: randomHex(32) }));
      }
      if (phase === "receiver-complete") {
        setState((s) => ({ ...s, receiverTxHash: randomHex(32) }));
      }

      const delay = PHASE_DELAYS[phase];
      if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }, [addEvent]);

  const reveal = useCallback(async () => {
    setState((s) => ({ ...s, phase: "reveal-decrypt" }));
    await new Promise((r) => setTimeout(r, 1500));
    setState((s) => ({ ...s, revealed: true, phase: "complete" }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ phase: "idle", events: [], senderTxHash: null, receiverTxHash: null, revealed: false });
  }, []);

  return { state, runDemo, reveal, reset };
}
