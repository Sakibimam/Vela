"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { connectWallet as connectWalletLib, setWalletAddress } from "@/lib/stellar";

interface WalletContextValue {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const connect = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectWalletLib();
      setAddress(addr);
      setConnected(true);
      setWalletAddress(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
      pendingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setWalletAddress("");
  }, []);

  return (
    <WalletContext.Provider value={{ connected, address, connecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}
