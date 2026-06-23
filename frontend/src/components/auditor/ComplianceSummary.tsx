"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Download, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ComplianceSummaryProps {
  revealed: boolean;
  onRevoke: () => void;
}

const checks = [
  "All transfers under $3,000 threshold",
  "All senders KYC-verified",
  "Zero sanctions matches",
  "Full audit trail available",
];

export function ComplianceSummary({ revealed, onRevoke }: ComplianceSummaryProps) {
  if (!revealed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.4 }}
      className="space-y-4"
    >
      <Card variant="elevated" className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <h3 className="text-base font-semibold text-text-primary">Regulatory Summary</h3>
        </div>

        <div className="space-y-2.5">
          {checks.map((check, i) => (
            <motion.div
              key={check}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1.6 + i * 0.1 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3 h-3 text-success" />
              </div>
              <span className="text-sm text-text-secondary">{check}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" size="md" className="flex-1">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
        <Button variant="ghost" size="md" className="flex-1" onClick={onRevoke}>
          <Lock className="w-4 h-4" />
          Revoke Access
        </Button>
      </div>
    </motion.div>
  );
}
