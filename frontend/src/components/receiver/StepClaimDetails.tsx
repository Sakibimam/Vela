"use client";

import { useState } from "react";
import { Wallet, Search, CheckCircle, XCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { LookupState, ClaimData } from "./types";

interface StepClaimDetailsProps {
  walletConnected: boolean;
  walletAddress: string | null;
  walletConnecting?: boolean;
  onConnectWallet: () => void;
  lookup: LookupState;
  claimData: ClaimData;
  onLookup: (secret: string) => void;
  onContinue: () => void;
}

export function StepClaimDetails({
  walletConnected,
  walletAddress,
  walletConnecting,
  onConnectWallet,
  lookup,
  claimData,
  onLookup,
  onContinue,
}: StepClaimDetailsProps) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleLookup() {
    const cleaned = secret.trim().toLowerCase();
    if (cleaned.length !== 64 || !/^[0-9a-f]+$/.test(cleaned)) {
      setError("Must be a 64-character hex string (32 bytes)");
      return;
    }
    setError(null);
    onLookup(cleaned);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLookup();
  }

  return (
    <div className="space-y-7">
      {/* Wallet Connection */}
      {!walletConnected ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div>
            <p className="text-sm font-medium text-text-primary">Connect Wallet</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Funds will be sent to your connected address
            </p>
          </div>
          <Button size="sm" onClick={onConnectWallet} disabled={walletConnecting} loading={walletConnecting}>
            <Wallet className="w-3.5 h-3.5" />
            {walletConnecting ? "Connecting..." : "Connect"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-success/10 bg-success/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgb(16_185_129/0.5)]" />
            <span className="text-sm text-text-primary font-medium">Connected</span>
          </div>
          <code className="text-[11px] font-mono text-text-tertiary">
            {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
          </code>
        </div>
      )}

      {/* Claim Secret Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent-teal" />
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">Claim Secret</h3>
        </div>
        <p className="text-xs text-text-tertiary">
          Paste the shared secret from the sender to locate your transfer on-chain.
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Paste 64-character hex secret..."
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              error={error || (lookup.status === "not-found" ? lookup.error || undefined : undefined)}
              className="font-mono text-xs"
            />
          </div>
          <Button
            size="md"
            variant="secondary"
            onClick={handleLookup}
            disabled={!walletConnected || lookup.status === "searching"}
            loading={lookup.status === "searching"}
            className="shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            Find
          </Button>
        </div>
      </div>

      {/* Lookup Result */}
      {lookup.status === "searching" && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
          <span className="text-sm text-text-secondary">Searching on-chain commitments...</span>
        </div>
      )}

      {lookup.status === "found" && claimData.amount && (
        <div className="rounded-xl border border-success/12 bg-success/[0.03] overflow-hidden">
          <div className="flex items-center gap-2.5 p-4 border-b border-success/8">
            <CheckCircle className="w-4.5 h-4.5 text-success" />
            <span className="text-sm font-semibold text-success">Transfer Found</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Amount</span>
              <span className="text-xl font-bold text-text-primary">${claimData.amount} <span className="text-sm font-normal text-text-tertiary">USDC</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Corridor</span>
              <Badge variant="info">{claimData.corridor}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Commitment</span>
              <code className="text-[10px] font-mono text-text-tertiary bg-white/[0.04] px-2 py-0.5 rounded">
                {claimData.commitmentHash?.slice(0, 12)}...{claimData.commitmentHash?.slice(-12)}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t border-success/6 bg-success/[0.02]">
            <Lock className="w-3 h-3 text-text-tertiary" />
            <p className="text-[10px] text-text-tertiary">
              Decrypted locally — amount never appears on-chain
            </p>
          </div>
        </div>
      )}

      {lookup.status === "not-found" && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-error/12 bg-error/[0.03]">
          <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-error">No matching transfer</p>
            <p className="text-xs text-text-tertiary mt-1">
              Double-check the secret or confirm with the sender.
            </p>
          </div>
        </div>
      )}

      {/* Continue */}
      <Button
        size="lg"
        className="w-full"
        disabled={!walletConnected || lookup.status !== "found"}
        onClick={onContinue}
      >
        Generate Withdrawal Proof
      </Button>
    </div>
  );
}
