"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn, truncateHash } from "@/lib/utils";

interface TransactionHashProps {
  hash: string;
  isNew?: boolean;
  className?: string;
}

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx/";

export function TransactionHash({ hash, isNew, className }: TransactionHashProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.98 } : false}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-white/5 border border-border",
        isNew && "animate-pulse-glow",
        className
      )}
    >
      <code className="text-xs font-mono text-text-secondary">
        {truncateHash(hash)}
      </code>

      <button
        onClick={copyToClipboard}
        className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        title="Copy hash"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      <a
        href={`${EXPLORER_BASE}${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-tertiary hover:text-accent-blue transition-colors"
        title="View on Stellar Expert"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.div>
  );
}
