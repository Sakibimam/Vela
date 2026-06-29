"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="mb-10">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-500"
            style={{
              background: revealed ? "rgb(16 185 129 / 0.08)" : "rgb(139 92 246 / 0.08)",
              borderColor: revealed ? "rgb(16 185 129 / 0.15)" : "rgb(139 92 246 / 0.15)",
            }}
          >
            {revealed ? (
              <Eye className="w-5 h-5 text-success" />
            ) : (
              <EyeOff className="w-5 h-5 text-accent-purple" />
            )}
          </div>
          <div>
            <p className="text-[11px] font-mono font-semibold text-accent-purple tracking-[0.2em] uppercase mb-1">
              Compliance
            </p>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Corridor Ledger
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {revealed ? "Regulator view — full transparency active" : "Public view — all transaction data shielded"}
            </p>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs">
          <span className="text-text-tertiary">{MOCK_TRANSACTIONS.length} transactions</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors duration-500 ${
          revealed
            ? "border-success/15 bg-success/[0.04] text-success"
            : "border-white/[0.06] bg-white/[0.02] text-text-tertiary"
        }`}>
          {revealed ? (
            <><Eye className="w-3 h-3" /> Decrypted</>
          ) : (
            <><Lock className="w-3 h-3" /> Encrypted</>
          )}
        </div>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-success/15 bg-success/[0.04] text-xs text-success"
          >
            <ShieldCheck className="w-3 h-3" /> 100% compliant
          </motion.div>
        )}
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
            <div className="max-w-2xl mx-auto">
              <Card variant="elevated" className="relative overflow-hidden">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-purple/30 to-transparent" />

                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent-blue/8 border border-accent-blue/12">
                    <KeyRound className="w-4.5 h-4.5 text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                      Enter Corridor View Key
                    </h3>
                    <p className="text-[11px] text-text-tertiary">
                      Authorized regulators can reconstruct the full ledger
                    </p>
                  </div>
                </div>

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
                    className="shrink-0"
                  >
                    Decrypt Ledger
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
                  <ShieldAlert className="w-3.5 h-3.5 text-text-tertiary" />
                  <p className="text-[11px] text-text-tertiary">
                    Demo key: <code className="font-mono text-accent-blue/70 select-all">{DEMO_VIEW_KEY}</code>
                  </p>
                </div>
              </Card>
            </div>
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
