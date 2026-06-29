"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Wallet, LogOut, Send, Download, Eye, Play } from "lucide-react";
import { cn, truncateAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/hooks/useWallet";

const NAV_ITEMS = [
  { href: "/send", label: "Send", icon: Send },
  { href: "/receive", label: "Receive", icon: Download },
  { href: "/audit", label: "Audit", icon: Eye },
  { href: "/demo", label: "Demo", icon: Play },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);
  const wallet = useWallet();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target as Node)) {
        setWalletMenuOpen(false);
      }
    }
    if (walletMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [walletMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.04] bg-space-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-indigo flex items-center justify-center shadow-[0_2px_8px_rgb(99_102_241/0.3)] group-hover:shadow-[0_2px_12px_rgb(99_102_241/0.5)] transition-shadow duration-300">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-[15px] font-semibold text-text-primary tracking-tight">Vela</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-1 py-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200",
                    isActive
                      ? "text-text-primary bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                      : "text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            <Badge variant="info" className="text-[10px] py-0.5 px-2">Testnet</Badge>

            {wallet.connected && wallet.address ? (
              <div className="hidden sm:block relative" ref={walletMenuRef}>
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgb(16_185_129/0.5)]" />
                  <span className="text-xs font-mono text-text-secondary">
                    {truncateAddress(wallet.address, 4)}
                  </span>
                </button>

                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.08] bg-space-800/95 backdrop-blur-xl shadow-[0_16px_48px_rgb(0_0_0/0.5)] overflow-hidden">
                    <button
                      onClick={() => {
                        wallet.disconnect();
                        setWalletMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={wallet.connect}
                disabled={wallet.connecting}
                loading={wallet.connecting}
                className="hidden sm:inline-flex rounded-full"
              >
                <Wallet className="w-3.5 h-3.5" />
                {wallet.connecting ? "Connecting..." : "Connect"}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.04] bg-space-900/95 backdrop-blur-xl">
          <nav className="px-4 py-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "text-text-primary bg-white/[0.06]"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
