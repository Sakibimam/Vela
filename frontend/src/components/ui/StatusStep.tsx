import { Check, Loader2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "pending" | "active" | "loading" | "complete" | "error";

interface StatusStepProps {
  label: string;
  description?: string;
  state: StepState;
  isLast?: boolean;
}

const stateConfig: Record<StepState, { icon: typeof Circle; color: string; bg: string }> = {
  pending: { icon: Circle, color: "text-text-tertiary", bg: "bg-white/5" },
  active: { icon: Circle, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  loading: { icon: Loader2, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  complete: { icon: Check, color: "text-success", bg: "bg-success/10" },
  error: { icon: AlertCircle, color: "text-error", bg: "bg-error/10" },
};

export function StatusStep({ label, description, state, isLast }: StatusStepProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            config.bg,
            config.color
          )}
        >
          <Icon className={cn("w-4 h-4", state === "loading" && "animate-spin")} />
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-px flex-1 min-h-6 mt-1",
              state === "complete" ? "bg-success/30" : "bg-border"
            )}
          />
        )}
      </div>
      <div className="pb-6">
        <p
          className={cn(
            "text-sm font-medium",
            state === "pending" ? "text-text-tertiary" : "text-text-primary"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
