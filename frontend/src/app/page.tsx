import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroBackground } from "@/components/demo/HeroBackground";
import { HowItWorks } from "@/components/demo/HowItWorks";
import { AnimatedStats } from "@/components/demo/AnimatedStats";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <HeroBackground />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-24">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/8 bg-white/[0.03] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-text-secondary tracking-wide">
              Live on Stellar Testnet
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-bold tracking-tight leading-[0.95]">
            <span className="text-text-primary">Move money.</span>
            <br />
            <span className="gradient-text">Reveal nothing.</span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed font-light">
            Private cross-border remittances with zero-knowledge proofs.
            Regulators see everything — the public sees only math.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/send">
              <Button size="lg">
                Start Sending
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="secondary">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust signal */}
          <p className="mt-16 text-[11px] font-mono text-text-tertiary tracking-widest uppercase">
            Groth16 &middot; BLS12-381 &middot; Poseidon &middot; Soroban
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-[11px] font-mono font-semibold text-accent-blue tracking-[0.2em] uppercase mb-3">
              Protocol
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Three cryptographic steps
            </h2>
            <p className="mt-4 text-text-secondary max-w-md mx-auto">
              Each step generates a proof that can be verified without revealing the underlying data.
            </p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[20px] border border-white/[0.06] bg-white/[0.015] overflow-hidden">
          <AnimatedStats />
        </div>
      </section>

      {/* CTA / Philosophy */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-6">
            Privacy by default.
            <br />
            <span className="text-text-secondary font-normal">Transparency on demand.</span>
          </h2>
          <p className="text-sm text-text-tertiary leading-relaxed max-w-lg mx-auto mb-10">
            Vela proves that privacy and compliance aren&apos;t opposites — they&apos;re layers.
            Workers keep their dignity. Regulators keep their oversight.
            The blockchain keeps its integrity.
          </p>
          <Link href="/audit">
            <Button size="lg" variant="secondary">
              See the Audit View
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
