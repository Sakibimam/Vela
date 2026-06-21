"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TransactionHash } from "@/components/ui/TransactionHash";
import type { SendFormData } from "./types";
import { CORRIDORS } from "./types";

interface StepConfirmationProps {
  formData: SendFormData;
  txHash: string;
  onSendAnother: () => void;
}

export function StepConfirmation({ formData, txHash, onSendAnother }: StepConfirmationProps) {
  const [secretCopied, setSecretCopied] = useState(false);
  const corridor = CORRIDORS.find((c) => c.value === formData.corridor);

  // TODO [LOW security]: add try/catch — clipboard API fails in non-HTTPS/unfocused contexts
  function copySecret() {
    navigator.clipboard.writeText(formData.sharedSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success header */}
      <div className="text-center py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto"
        >
          <Check className="w-8 h-8 text-success" />
        </motion.div>
        <h3 className="text-xl font-bold text-text-primary mt-4">ZK Proof Verified</h3>
        <p className="text-sm text-text-secondary mt-1">
          ${formData.amount} shielded transfer via {corridor?.label}
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          ZK commitment stored on Stellar testnet. Token settlement requires contract initialization.
        </p>
      </div>

      {/* Transaction Details */}
      <Card variant="elevated" className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Transaction</span>
          <TransactionHash hash={txHash} isNew />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Amount</span>
          <span className="text-sm font-medium text-text-primary">${formData.amount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Corridor</span>
          <Badge variant="info">{corridor?.label}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Privacy</span>
          <Badge variant="success">Amount shielded</Badge>
        </div>
      </Card>

      {/* Share Secret */}
      <Card variant="outlined" className="space-y-3 border-warning/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Share with recipient</h4>
            <p className="text-xs text-text-secondary mt-0.5">
              The recipient needs this secret to claim their funds. Share it securely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono text-text-secondary bg-white/5 border border-border rounded-[var(--radius-input)] px-3 py-2.5 truncate">
            {formData.sharedSecret}
          </code>
          <Button size="sm" variant="secondary" onClick={copySecret}>
            {secretCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <Badge variant="warning">
          Save this secret. The recipient needs it to claim funds.
        </Badge>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="secondary" size="md" className="w-full">
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </Button>
        </a>
        <Button variant="ghost" size="md" className="flex-1" onClick={onSendAnother}>
          <RotateCcw className="w-4 h-4" />
          Send Another
        </Button>
      </div>
    </motion.div>
  );
}
