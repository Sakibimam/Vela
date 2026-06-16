import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroBackground } from "@/components/demo/HeroBackground";
import { HowItWorks } from "@/components/demo/HowItWorks";
import { AnimatedStats } from "@/components/demo/AnimatedStats";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <HeroBackground />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-24">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
            <span className="gradient-text">Private Remittances</span>
            <br />
            <span className="text-text-primary">on Stellar</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Send money across borders. Prove compliance. Reveal nothing.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/send">
              <Button size="lg">Send Money</Button>
            </Link>
            <Link href="/audit">
              <Button size="lg" variant="secondary">
                Audit Corridor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              How It Works
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Three steps to private, compliant cross-border payments.
            </p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <AnimatedStats />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-8">
            Built With
          </h2>
          <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
            <span className="text-text-primary font-medium">Circom circuits</span>
            {" • "}
            <span className="text-text-primary font-medium">Groth16 on BLS12-381</span>
            {" • "}
            <span className="text-text-primary font-medium">Soroban smart contracts</span>
            {" • "}
            <span className="text-text-primary font-medium">Poseidon hashing</span>
            {" • "}
            <span className="text-text-primary font-medium">HKDF view keys</span>
            {" • "}
            <span className="text-text-primary font-medium">Stellar testnet</span>
          </p>
        </div>
      </section>
    </>
  );
}
