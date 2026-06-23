"use client";

import { motion } from "framer-motion";
import { AUDIT_STATS } from "./mockData";

interface AuditStatsProps {
  revealed: boolean;
}

const stats = [
  { label: "Total Volume", value: AUDIT_STATS.totalVolume, color: "text-success" },
  { label: "Corridors Active", value: String(AUDIT_STATS.corridorsActive), color: "text-accent-blue" },
  { label: "Average Transfer", value: AUDIT_STATS.averageTransfer, color: "text-accent-purple" },
  { label: "Compliance Rate", value: AUDIT_STATS.complianceRate, color: "text-success" },
];

export function AuditStats({ revealed }: AuditStatsProps) {
  if (!revealed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
          className="glass rounded-[var(--radius-card)] p-4 text-center"
        >
          <p className={`text-xl sm:text-2xl font-bold tabular-nums ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
