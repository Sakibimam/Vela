"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Eye, KeyRound, Zap } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SenderPanel } from "@/components/demo/SenderPanel";
import { NetworkPanel } from "@/components/demo/NetworkPanel";
import { ReceiverPanel } from "@/components/demo/ReceiverPanel";
import { useDemoOrchestrator } from "@/components/demo/useDemoOrchestrator";

type MobileTab = "sender" | "network" | "receiver";

export default function DemoPage() {
  const { state, runDemo, reveal, reset } = useDemoOrchestrator();
  const [mobileTab, setMobileTab] = useState<MobileTab>("sender");

  const isRunning = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "reveal-prompt";
  const showRevealPrompt = state.phase === "reveal-prompt";
  const isRevealing = state.phase === "reveal-decrypt";

  return (
    <PageContainer className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-mono font-semibold text-accent-cyan tracking-[0.2em] uppercase mb-2">
            Interactive
          </p>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Live Demo</h1>
          <p className="text-sm text-text-secondary mt-1">
            End-to-end private remittance: Dubai &rarr; Manila via Stellar
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state.phase === "idle" && (
            <Button onClick={runDemo} size="md">
              <Play className="w-4 h-4" />
              Run Demo
            </Button>
          )}
          {(state.phase === "complete" || state.phase === "reveal-prompt") && (
            <Button onClick={reset} size="md" variant="ghost">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-blue/15 bg-accent-blue/[0.05]">
              <Zap className="w-3 h-3 text-accent-blue animate-pulse" />
              <span className="text-xs font-medium text-accent-blue">Running</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile tab selector */}
      <div className="lg:hidden flex rounded-xl border border-white/[0.06] p-1 mb-5 bg-white/[0.02]">
        {(["sender", "network", "receiver"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              mobileTab === tab
                ? "bg-white/[0.08] text-text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {tab === "sender" ? "🇦🇪 Dubai" : tab === "network" ? "⛓ On-Chain" : "🇵🇭 Manila"}
          </button>
        ))}
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
        {/* Sender Panel */}
        <div className={`lg:block ${mobileTab === "sender" ? "block" : "hidden"}`}>
          <Card variant="elevated" className="h-full min-h-[440px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-blue/25 to-transparent" />
            <SenderPanel phase={state.phase} txHash={state.senderTxHash} />
          </Card>
        </div>

        {/* Network Panel */}
        <div className={`lg:block ${mobileTab === "network" ? "block" : "hidden"}`}>
          <Card variant="elevated" className="h-full min-h-[440px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-purple/25 to-transparent" />
            <NetworkPanel events={state.events} phase={state.phase} revealed={state.revealed} />
          </Card>
        </div>

        {/* Receiver Panel */}
        <div className={`lg:block ${mobileTab === "receiver" ? "block" : "hidden"}`}>
          <Card variant="elevated" className="h-full min-h-[440px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-teal/25 to-transparent" />
            <ReceiverPanel phase={state.phase} txHash={state.receiverTxHash} />
          </Card>
        </div>
      </div>

      {/* Reveal Prompt */}
      <AnimatePresence>
        {showRevealPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="elevated" className="max-w-xl mx-auto text-center space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-purple/30 to-transparent" />

              <div className="w-14 h-14 rounded-2xl bg-accent-purple/8 border border-accent-purple/15 flex items-center justify-center mx-auto">
                <KeyRound className="w-7 h-7 text-accent-purple" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">
                  The blockchain saw nothing.
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto mt-3 leading-relaxed">
                  $500 just crossed borders. No identity, no amount, no link between
                  sender and receiver appeared on-chain.
                </p>
                <p className="text-xs text-text-tertiary mt-2">
                  But a regulator with the view key can see everything.
                </p>
              </div>
              <Button onClick={reveal} size="lg" loading={isRevealing}>
                <Eye className="w-4 h-4" />
                Decrypt with View Key
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-reveal message */}
      <AnimatePresence>
        {state.revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="elevated" className="max-w-xl mx-auto text-center space-y-4 mt-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-success/30 to-transparent" />

              <div className="w-14 h-14 rounded-2xl bg-success/8 border border-success/15 flex items-center justify-center mx-auto">
                <Eye className="w-7 h-7 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">
                  Full transparency — on demand.
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto mt-2">
                  Privacy by default, auditability when required. That&apos;s Vela.
                </p>
              </div>
              <Button onClick={reset} size="md" variant="ghost">
                <RotateCcw className="w-4 h-4" />
                Run Again
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
