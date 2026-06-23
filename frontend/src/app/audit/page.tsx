"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, KeyRound, ShieldAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LedgerTable } from "@/components/auditor/LedgerTable";
import { AuditStats } from "@/components/auditor/AuditStats";
import { ComplianceSummary } from "@/components/auditor/ComplianceSummary";
import { DEMO_VIEW_KEY, MOCK_TRANSACTIONS } from "@/components/auditor/mockData";
import { validateViewKey } from "@/lib/viewkey";

export default function AuditPage() {
  const [viewKey, setViewKey] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [revealedRows, setRevealedRows] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = useCallback(async () => {
    setDecrypting(true);
    setError(null);

    const valid = await validateViewKey(viewKey);
    if (!valid) {
      setError("Invalid view key. Access denied.");
      setDecrypting(false);
      return;
    }

    setRevealedRows(0);
    await new Promise((r) => setTimeout(r, 600));
    setRevealed(true);

    for (let i = 1; i <= MOCK_TRANSACTIONS.length; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setRevealedRows(i);
    }

    setDecrypting(false);
  }, [viewKey]);

  function handleRevoke() {
    setRevealed(false);
    setRevealedRows(0);
    setViewKey("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleDecrypt();
  }

  return (
    <PageContainer className="max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            {revealed ? (
              <Eye className="w-5 h-5 text-accent-purple" />
            ) : (
              <EyeOff className="w-5 h-5 text-accent-purple" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Corridor Ledger
            </h1>
            <p className="text-sm text-text-secondary">
              {revealed ? "Regulator View — Full transparency" : "Public View — All data shielded"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Badge variant="neutral">
          {MOCK_TRANSACTIONS.length} transactions
        </Badge>
        <Badge variant={revealed ? "success" : "neutral"}>
          {revealed ? (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> Decrypted
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Volume: ENCRYPTED
            </span>
          )}
        </Badge>
        {revealed && <Badge variant="success">Compliance: 100%</Badge>}
      </div>

      {/* Ledger Table */}
      <div className="mb-8">
        <LedgerTable revealed={revealed} revealedRows={revealedRows} />
      </div>

      {/* Stats (post-reveal) */}
      <div className="mb-8">
        <AuditStats revealed={revealed && revealedRows >= MOCK_TRANSACTIONS.length} />
      </div>

      {/* View Key Input (pre-reveal) */}
      <AnimatePresence mode="wait">
        {!revealed && (
          <motion.div
            key="input"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="elevated" className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-accent-blue" />
                <h3 className="text-base font-semibold text-text-primary">
                  Enter Corridor View Key
                </h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Authorized regulators can reconstruct the full transaction ledger
                using the corridor master view key.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Paste view key..."
                    value={viewKey}
                    onChange={(e) => {
                      setViewKey(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    error={error || undefined}
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  size="md"
                  onClick={handleDecrypt}
                  loading={decrypting}
                  disabled={!viewKey.trim()}
                >
                  Decrypt Ledger
                </Button>
              </div>

              <p className="text-xs text-text-tertiary mt-3 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Demo key: <code className="font-mono text-accent-blue/80">{DEMO_VIEW_KEY}</code>
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Summary (post-reveal) */}
      <ComplianceSummary
        revealed={revealed && revealedRows >= MOCK_TRANSACTIONS.length}
        onRevoke={handleRevoke}
      />
    </PageContainer>
  );
}
