"use client";

import { useState, useCallback, useRef } from "react";
import { connectWallet as connectWalletLib, setWalletAddress } from "@/lib/stellar";

export function useWallet() {
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

  return { connected, address, connecting, error, connect };
}
