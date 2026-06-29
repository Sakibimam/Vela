"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Lock, KeyRound, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Prove",
    subtitle: "KYC compliance",
    description:
      "Generate a zero-knowledge proof that you meet jurisdiction requirements. Your identity never touches the blockchain.",
    accentColor: "rgb(59 130 246)",
  },
  {
    icon: Lock,
    number: "02",
    title: "Shield",
    subtitle: "Amount commitment",
    description:
      "Your transfer amount is committed as a Poseidon hash. The network validates the math — not the money.",
    accentColor: "rgb(139 92 246)",
  },
  {
    icon: KeyRound,
    number: "03",
    title: "Claim",
    subtitle: "Secret key withdrawal",
    description:
      "The receiver proves knowledge of a shared secret to withdraw. Regulators reconstruct the full picture with a view key.",
    accentColor: "rgb(20 184 166)",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative">
      {/* Connecting line between cards on desktop */}
      <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-[1px] bg-gradient-to-r from-accent-blue/20 via-accent-purple/20 to-accent-teal/20 -translate-y-1/2" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.02] p-6 h-full transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
                {/* Accent glow on hover */}
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                  style={{ background: step.accentColor, opacity: "var(--tw-opacity, 0)" }}
                />
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-700 opacity-0 group-hover:opacity-[0.06]"
                  style={{ background: step.accentColor }}
                />

                <div className="relative">
                  {/* Step number */}
                  <span className="text-[11px] font-mono font-semibold text-text-tertiary tracking-widest uppercase mb-4 block">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border transition-colors duration-300"
                    style={{
                      background: `color-mix(in srgb, ${step.accentColor} 8%, transparent)`,
                      borderColor: `color-mix(in srgb, ${step.accentColor} 15%, transparent)`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.accentColor }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-text-primary mb-1 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow connector on mobile */}
              {i < STEPS.length - 1 && (
                <div className="md:hidden flex justify-center py-2">
                  <ArrowRight className="w-4 h-4 text-text-tertiary rotate-90" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
