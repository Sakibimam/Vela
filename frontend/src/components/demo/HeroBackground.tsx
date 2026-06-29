"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Primary mesh gradient — large, slow-moving */}
      <motion.div
        className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgb(99 102 241 / 0.08) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary purple bloom — bottom left */}
      <motion.div
        className="absolute -bottom-[30%] -left-[15%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgb(139 92 246 / 0.06) 0%, transparent 65%)",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Tight accent pulse — center-ish */}
      <motion.div
        className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgb(6 182 212 / 0.06) 0%, transparent 70%)",
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.9, 1.2, 0.9],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid lines — subtle perspective grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px),
            linear-gradient(0deg, rgb(255 255 255) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, black 20%, transparent 70%)",
        }}
      />

      {/* Horizontal streak — the "corridor" visual metaphor */}
      <motion.div
        className="absolute top-[55%] left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgb(99 102 241 / 0.2) 30%, rgb(139 92 246 / 0.15) 70%, transparent)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
