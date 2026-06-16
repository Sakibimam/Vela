"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large gradient orb - top right */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-blue/8 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Purple orb - bottom left */}
      <motion.div
        className="absolute -bottom-48 -left-24 w-80 h-80 rounded-full bg-accent-purple/6 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Small accent orb */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-accent-blue/5 blur-2xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
