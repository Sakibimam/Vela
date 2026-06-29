import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 animate-fade-in",
        className
      )}
    >
      {children}
    </main>
  );
}
