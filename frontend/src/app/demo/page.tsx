"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Eye, KeyRound } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Live Demo</h1>
          <p className="text-sm text-text-secondary mt-1">
            End-to-end private remittance: Dubai → Manila via Stellar
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
            <Badge variant="info">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                Running...
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Mobile tab selector */}
      <div className="lg:hidden flex rounded-lg border border-border p-1 mb-4 bg-white/[0.02]">
        {(["sender", "network", "receiver"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mobileTab === tab
                ? "bg-white/10 text-text-primary"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {tab === "sender" ? "Dubai" : tab === "network" ? "On-Chain" : "Manila"}
          </button>
        ))}
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Sender Panel */}
        <div className={`lg:block ${mobileTab === "sender" ? "block" : "hidden"}`}>
          <Card variant="elevated" className="h-full min-h-[420px]">
            <SenderPanel phase={state.phase} txHash={state.senderTxHash} />
          </Card>
        </div>

        {/* Network Panel */}
        <div className={`lg:block ${mobileTab === "network" ? "block" : "hidden"}`}>
          <Card variant="elevated" className="h-full min-h-[420px] flex flex-col">
            <NetworkPanel events={state.events} phase={state.phase} revealed={state.revealed} />
          </Card>
        </div>

        {/* Receiver Panel */}
        <div className={`lg:block ${mobileTab === "receiver" ? "block" : "hidden"}`}>
          <Card variant="elevated" className="h-full min-h-[420px]">
            <ReceiverPanel phase={state.phase} txHash={state.receiverTxHash} />
          </Card>
        </div>
      </div>

      {/* Reveal Prompt */}
      <AnimatePresence>
        {showRevealPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <Card variant="elevated" className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                The blockchain saw nothing.
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                $500 just crossed borders. No identity, no amount, no link between sender and receiver
                appeared on-chain. But a regulator with the view key can see everything.
              </p>
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="elevated" className="max-w-xl mx-auto text-center space-y-3 mt-6">
              <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Full transparency — on demand.
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Privacy by default, auditability when required. That&apos;s Vela.
              </p>
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
