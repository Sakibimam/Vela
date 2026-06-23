"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { cn, truncateAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/hooks/useWallet";

const NAV_ITEMS = [
  { href: "/send", label: "Send" },
  { href: "/receive", label: "Receive" },
  { href: "/audit", label: "Audit" },
  { href: "/demo", label: "Demo" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wallet = useWallet();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">Vela</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-text-primary bg-white/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Badge variant="info">Testnet</Badge>

            {wallet.connected && wallet.address ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-button)] bg-white/5 border border-border">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-mono text-text-secondary">
                  {truncateAddress(wallet.address, 4)}
                </span>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={wallet.connect}
                disabled={wallet.connecting}
                loading={wallet.connecting}
                className="hidden sm:inline-flex"
              >
                <Wallet className="w-3.5 h-3.5" />
                {wallet.connecting ? "Connecting..." : "Connect"}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-text-primary bg-white/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
