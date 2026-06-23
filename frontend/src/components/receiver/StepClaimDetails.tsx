"use client";

import { useState } from "react";
import { Wallet, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
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
    <div className="space-y-6">
      {/* Wallet Connection */}
      {!walletConnected ? (
        <Card variant="outlined" className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Connect Your Wallet</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Funds will be sent to your connected Stellar address
            </p>
          </div>
          <Button size="sm" onClick={onConnectWallet} disabled={walletConnecting} loading={walletConnecting}>
            <Wallet className="w-4 h-4" />
            {walletConnecting ? "Connecting..." : "Connect"}
          </Button>
        </Card>
      ) : (
        <Card variant="outlined" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm text-text-primary font-medium">Wallet Connected</span>
          </div>
          <code className="text-xs font-mono text-text-secondary">
            {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
          </code>
        </Card>
      )}

      {/* Claim Secret Input */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-text-primary">Claim Secret</h3>
        <p className="text-xs text-text-secondary">
          Paste the shared secret from the sender to look up your transfer.
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
          >
            <Search className="w-4 h-4" />
            Find
          </Button>
        </div>
      </div>

      {/* Lookup Result */}
      {lookup.status === "searching" && (
        <Card variant="outlined" className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
          <span className="text-sm text-text-secondary">Searching on-chain commitments...</span>
        </Card>
      )}

      {lookup.status === "found" && claimData.amount && (
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm font-semibold text-success">Funds Found</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Amount</span>
              <span className="text-lg font-bold text-text-primary">${claimData.amount} USDC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Corridor</span>
              <Badge variant="info">Dubai → Manila</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Commitment</span>
              <code className="text-xs font-mono text-text-tertiary">
                {claimData.commitmentHash?.slice(0, 12)}...{claimData.commitmentHash?.slice(-12)}
              </code>
            </div>
          </div>

          <p className="text-xs text-text-tertiary border-t border-border pt-3">
            Amount was decrypted locally using your claim secret. It never appears on-chain.
          </p>
        </Card>
      )}

      {lookup.status === "not-found" && (
        <Card variant="outlined" className="border-error/20 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-error shrink-0" />
          <div>
            <p className="text-sm font-medium text-error">No matching transfer found</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Double-check the secret or ask the sender to confirm it was sent.
            </p>
          </div>
        </Card>
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
