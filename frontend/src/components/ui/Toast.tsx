"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (data: Omit<ToastData, "id">) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const variantConfig: Record<ToastVariant, { icon: typeof Check; color: string }> = {
  success: { icon: Check, color: "text-success" },
  error: { icon: AlertCircle, color: "text-error" },
  info: { icon: Info, color: "text-info" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((data: Omit<ToastData, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...data, id }]);
  }, []);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          const Icon = config.icon;
          return (
            <RadixToast.Root
              key={t.id}
              className={cn(
                "glass-strong rounded-[var(--radius-card)] p-4 shadow-lg shadow-black/30",
                "data-[state=open]:animate-fade-up",
                "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]"
              )}
              onOpenChange={(open) => {
                if (!open) removeToast(t.id);
              }}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <RadixToast.Title className="text-sm font-medium text-text-primary">
                    {t.title}
                  </RadixToast.Title>
                  {t.description && (
                    <RadixToast.Description className="text-xs text-text-secondary mt-0.5">
                      {t.description}
                    </RadixToast.Description>
                  )}
                </div>
                <RadixToast.Close className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </RadixToast.Close>
              </div>
            </RadixToast.Root>
          );
        })}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
