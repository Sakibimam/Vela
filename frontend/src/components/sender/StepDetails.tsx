"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Wallet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CORRIDORS, COUNTRIES, type SendFormData } from "./types";

interface StepDetailsProps {
  formData: SendFormData;
  onChange: (data: Partial<SendFormData>) => void;
  onContinue: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
  walletConnecting?: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet?: () => void;
}

export function StepDetails({
  formData,
  onChange,
  onContinue,
  walletConnected,
  walletAddress,
  walletConnecting,
  onConnectWallet,
  onDisconnectWallet,
}: StepDetailsProps) {
  const [secretCopied, setSecretCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const corridor = CORRIDORS.find((c) => c.value === formData.corridor);
    if (corridor) {
      onChange({ country: corridor.senderCountry });
    }
  }, [formData.corridor, onChange]);

  function copySecret() {
    navigator.clipboard.writeText(formData.sharedSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errs.amount = "Enter a valid amount";
    } else if (amount > 3000) {
      errs.amount = "Maximum $3,000 per transaction";
    }
    if (!formData.recipientAddress || formData.recipientAddress.length < 56) {
      errs.recipientAddress = "Enter a valid Stellar address (56 characters)";
    }
    if (!formData.corridor) {
      errs.corridor = "Select a corridor";
    }
    if (!formData.birthYear || parseInt(formData.birthYear) > 2008 || parseInt(formData.birthYear) < 1920) {
      errs.birthYear = "Enter a valid birth year (1920-2008)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (!walletConnected) return;
    if (validate()) onContinue();
  }

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      {!walletConnected ? (
        <Card variant="outlined" className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Connect Your Wallet</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Freighter wallet required to sign transactions
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
            <div>
              <span className="text-sm text-text-primary font-medium">Wallet Connected</span>
              <code className="block text-xs font-mono text-text-secondary mt-0.5">
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
              </code>
            </div>
          </div>
          {onDisconnectWallet && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDisconnectWallet}
              className="text-text-secondary hover:text-text-primary"
            >
              Disconnect
            </Button>
          )}
        </Card>
      )}

      {/* Transfer Details */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">Transfer Details</h3>

        <Input
          label="Amount (USDC)"
          prefix="$"
          type="number"
          min="1"
          max="3000"
          step="0.01"
          placeholder="500.00"
          value={formData.amount}
          onChange={(e) => onChange({ amount: e.target.value })}
          error={errors.amount}
          helperText="Maximum $3,000 per transaction"
        />

        <Input
          label="Recipient's Stellar Address"
          placeholder="G..."
          value={formData.recipientAddress}
          onChange={(e) => onChange({ recipientAddress: e.target.value })}
          error={errors.recipientAddress}
          className="font-mono text-xs"
        />

        {/* Corridor Selector */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Corridor</label>
          <div className="relative">
            <select
              value={formData.corridor}
              onChange={(e) => onChange({ corridor: e.target.value })}
              className={cn(
                "w-full appearance-none bg-white/5 border border-border text-text-primary",
                "rounded-[var(--radius-input)] px-3 py-2.5 text-sm",
                "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50",
                "cursor-pointer",
                errors.corridor && "border-error"
              )}
            >
              {CORRIDORS.map((c) => (
                <option key={c.value} value={c.value} className="bg-space-800 text-text-primary">
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          </div>
          {errors.corridor && <p className="text-xs text-error">{errors.corridor}</p>}
        </div>
      </div>

      {/* Shared Secret */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-text-primary">Shared Secret</h3>
        <p className="text-xs text-text-secondary">
          The recipient needs this secret to claim the funds. Share it securely.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono text-text-secondary bg-white/5 border border-border rounded-[var(--radius-input)] px-3 py-2.5 truncate">
            {formData.sharedSecret}
          </code>
          <Button size="sm" variant="secondary" onClick={copySecret}>
            {secretCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            {secretCopied ? "Copied" : "Copy"}
          </Button>
        </div>
        <Badge variant="warning">Save this — recipient needs it to claim funds</Badge>
      </div>

      {/* KYC Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">KYC Verification</h3>
        <p className="text-xs text-text-secondary">
          Your identity is verified locally — only a ZK proof is submitted on-chain.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Country</label>
            <div className="relative">
              <select
                value={formData.country}
                onChange={(e) => onChange({ country: e.target.value })}
                className={cn(
                  "w-full appearance-none bg-white/5 border border-border text-text-primary",
                  "rounded-[var(--radius-input)] px-3 py-2.5 text-sm",
                  "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50",
                  "cursor-pointer"
                )}
              >
                {Object.entries(COUNTRIES).map(([code, name]) => (
                  <option key={code} value={code} className="bg-space-800 text-text-primary">
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            </div>
          </div>

          <Input
            label="Birth Year"
            type="number"
            min="1920"
            max="2008"
            placeholder="1992"
            value={formData.birthYear}
            onChange={(e) => onChange({ birthYear: e.target.value })}
            error={errors.birthYear}
          />
        </div>
      </div>

      {/* Continue */}
      <Button
        size="lg"
        className="w-full"
        disabled={!walletConnected}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
}
