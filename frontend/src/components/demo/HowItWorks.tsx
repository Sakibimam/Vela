"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Lock, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Prove",
    description:
      "Sender proves KYC compliance with a ZK proof. No identity data touches the blockchain.",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: Lock,
    title: "Shield",
    description:
      "Amount is committed using Poseidon cryptography. The blockchain sees a hash, not a number.",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
  {
    icon: KeyRound,
    title: "Claim",
    description:
      "Receiver claims with a secret key. Regulators reconstruct with a view key.",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
          >
            <Card variant="default" className="h-full relative overflow-hidden group">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-border flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
