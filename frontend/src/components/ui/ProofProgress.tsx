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
  "Loading circuit parameters...",
  "Computing witness...",
  "Generating Groth16 proof...",
  "Finalizing proof elements...",
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

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center gap-6 py-8"
        >
          <div className="relative w-28 h-28">
            {/* Glow behind the ring */}
            <div className="absolute inset-0 rounded-full bg-accent-blue/20 blur-xl animate-pulse-glow" />

            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="rgb(255 255 255 / 0.06)"
                strokeWidth="4"
              />
              {/* Progress ring */}
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="url(#proof-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
              <defs>
                <linearGradient id="proof-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-text-primary tabular-nums">
                {progress}%
              </span>
            </div>
          </div>

          {/* Label */}
          <div className="text-center space-y-2">
            <h4 className="text-base font-semibold text-text-primary">{label}</h4>
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-text-secondary"
            >
              {PROOF_STAGES[stageIndex]}
            </motion.p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  progress === 100 ? "bg-success" : "bg-accent-blue"
                )}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Time estimate */}
          {progress < 100 && (
            <p className="text-xs text-text-tertiary tabular-nums">
              ~{Math.ceil(((100 - progress) / 100) * (estimatedMs / 1000))}s remaining
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
