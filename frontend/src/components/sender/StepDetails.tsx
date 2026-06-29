"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Wallet, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    <div className="space-y-8">
      {/* Wallet Connection */}
      {!walletConnected ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div>
            <p className="text-sm font-medium text-text-primary">Connect Wallet</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Freighter required to sign transactions
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
            <div>
              <span className="text-sm text-text-primary font-medium">Connected</span>
              <code className="block text-[11px] font-mono text-text-tertiary mt-0.5">
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
              </code>
            </div>
          </div>
          {onDisconnectWallet && (
            <Button size="sm" variant="ghost" onClick={onDisconnectWallet}>
              Disconnect
            </Button>
          )}
        </div>
      )}

      {/* Transfer Details */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent-blue" />
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">Transfer Details</h3>
        </div>

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
          label="Recipient Stellar Address"
          placeholder="G..."
          value={formData.recipientAddress}
          onChange={(e) => onChange({ recipientAddress: e.target.value })}
          error={errors.recipientAddress}
          className="font-mono text-xs"
        />

        {/* Corridor Selector */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-text-secondary tracking-wide">Corridor</label>
          <div className="relative group">
            <select
              value={formData.corridor}
              onChange={(e) => onChange({ corridor: e.target.value })}
              className={cn(
                "w-full appearance-none bg-white/[0.03] border border-white/8 text-text-primary",
                "rounded-[var(--radius-input)] px-3.5 py-2.5 text-sm",
                "focus:outline-none focus:bg-white/[0.05] focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20",
                "group-hover:border-white/12 transition-all duration-200 cursor-pointer",
                errors.corridor && "border-error/40"
              )}
            >
              {CORRIDORS.map((c) => (
                <option key={c.value} value={c.value} className="bg-space-800 text-text-primary">
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          </div>
          {errors.corridor && <p className="text-xs text-error/90 font-medium">{errors.corridor}</p>}
        </div>
      </div>

      {/* Shared Secret */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent-purple" />
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">Shared Secret</h3>
        </div>
        <p className="text-xs text-text-tertiary">
          The recipient needs this secret to claim funds. Share it through a secure channel.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative group">
            <code className="block text-[11px] font-mono text-text-tertiary bg-white/[0.03] border border-white/8 rounded-[var(--radius-input)] px-3.5 py-2.5 truncate group-hover:border-white/12 transition-colors">
              {formData.sharedSecret}
            </code>
          </div>
          <Button size="sm" variant="secondary" onClick={copySecret} className="shrink-0">
            {secretCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            {secretCopied ? "Copied" : "Copy"}
          </Button>
        </div>
        <Badge variant="warning">Recipient needs this to claim funds</Badge>
      </div>

      {/* KYC Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent-teal" />
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">KYC Verification</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-teal/[0.04] border border-accent-teal/10">
          <Shield className="w-3.5 h-3.5 text-accent-teal shrink-0" />
          <p className="text-[11px] text-text-secondary">
            Verified locally — only a ZK proof is submitted on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-text-secondary tracking-wide">Country</label>
            <div className="relative group">
              <select
                value={formData.country}
                onChange={(e) => onChange({ country: e.target.value })}
                className={cn(
                  "w-full appearance-none bg-white/[0.03] border border-white/8 text-text-primary",
                  "rounded-[var(--radius-input)] px-3.5 py-2.5 text-sm",
                  "focus:outline-none focus:bg-white/[0.05] focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20",
                  "group-hover:border-white/12 transition-all duration-200 cursor-pointer"
                )}
              >
                {Object.entries(COUNTRIES).map(([code, name]) => (
                  <option key={code} value={code} className="bg-space-800 text-text-primary">
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
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
        Continue to Proofs
      </Button>
    </div>
  );
}
