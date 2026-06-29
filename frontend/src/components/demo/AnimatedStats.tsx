"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatProps {
  value: string;
  label: string;
  sublabel: string;
  delay?: number;
}

function AnimatedStat({ value, label, sublabel, delay = 0 }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayed, setDisplayed] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setDisplayed(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={displayed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative text-center px-6 py-8"
    >
      <p className="text-5xl sm:text-6xl font-bold tracking-tight gradient-text leading-none">
        {value}
      </p>
      <p className="text-sm font-medium text-text-primary mt-4">{label}</p>
      <p className="text-xs text-text-tertiary mt-1">{sublabel}</p>
    </motion.div>
  );
}

const STATS = [
  { value: "$195T", label: "crossed borders in 2024", sublabel: "World Bank estimate" },
  { value: "5.36%", label: "average remittance cost", sublabel: "SDG target: 3%" },
  { value: "0 bytes", label: "personal data on-chain", sublabel: "with Vela" },
];

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
      {STATS.map((stat, i) => (
        <AnimatedStat key={stat.label} {...stat} delay={i * 150} />
      ))}
    </div>
  );
}
