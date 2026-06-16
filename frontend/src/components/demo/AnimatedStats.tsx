"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatProps {
  value: string;
  label: string;
  delay?: number;
}

function AnimatedStat({ value, label, delay = 0 }: StatProps) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={displayed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center"
    >
      <p className="text-4xl sm:text-5xl font-bold gradient-text">{value}</p>
      <p className="text-sm text-text-secondary mt-2">{label}</p>
    </motion.div>
  );
}

const STATS = [
  { value: "$195T", label: "crossed borders in 2024" },
  { value: "5.36%", label: "average remittance cost" },
  { value: "0 bytes", label: "of personal data on-chain with Vela" },
];

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
      {STATS.map((stat, i) => (
        <AnimatedStat key={stat.label} {...stat} delay={i * 150} />
      ))}
    </div>
  );
}
