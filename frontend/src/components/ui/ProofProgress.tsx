"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProofProgressProps {
  active: boolean;
  label?: string;
  estimatedMs?: number;
  onComplete?: () => void;
}

const PROOF_STAGES = [
  "Loading circuit parameters",
  "Computing witness",
  "Generating Groth16 proof",
  "Finalizing proof elements",
];

export function ProofProgress({
  active,
  label = "Generating ZK Proof",
  estimatedMs = 8000,
  onComplete,
}: ProofProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return p + 1;
      });
    }, estimatedMs / 100);

    return () => clearInterval(interval);
  }, [active, estimatedMs, onComplete]);

  useEffect(() => {
    if (progress < 20) setStageIndex(0);
    else if (progress < 50) setStageIndex(1);
    else if (progress < 85) setStageIndex(2);
    else setStageIndex(3);
  }, [progress]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-6 py-10"
        >
          {/* Proof visualization — concentric rings */}
          <div className="relative w-32 h-32">
            {/* Outer glow */}
            <div
              className="absolute inset-[-8px] rounded-full transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle, rgb(99 102 241 / 0.15) 0%, transparent 70%)",
                opacity: progress > 50 ? 1 : 0.5,
              }}
            />

            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgb(255 255 255 / 0.04)"
                strokeWidth="3"
              />
              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#proof-ring-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
              {/* Inner decorative ring */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="rgb(255 255 255 / 0.02)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient id="proof-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text-primary tabular-nums tracking-tight">
                {progress}
              </span>
              <span className="text-[10px] font-mono text-text-tertiary">percent</span>
            </div>
          </div>

          {/* Label and stage */}
          <div className="text-center space-y-2.5">
            <h4 className="text-sm font-semibold text-text-primary tracking-tight">{label}</h4>
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-text-tertiary font-mono"
            >
              {PROOF_STAGES[stageIndex]}
            </motion.p>
          </div>

          {/* Stage indicators */}
          <div className="flex gap-1">
            {PROOF_STAGES.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i <= stageIndex ? "w-6 bg-accent-indigo" : "w-2 bg-white/10"
                )}
              />
            ))}
          </div>

          {/* Time estimate */}
          {progress < 100 && (
            <p className="text-[11px] text-text-tertiary tabular-nums font-mono">
              ~{Math.ceil(((100 - progress) / 100) * (estimatedMs / 1000))}s
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
