import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-text-tertiary">
            Built for{" "}
            <span className="text-text-secondary font-medium">
              Stellar Hacks: Real-World ZK
            </span>
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors inline-flex items-center gap-1"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-xs text-text-tertiary flex items-center gap-1.5">
              Powered by
              <span className="font-medium text-text-secondary">Stellar</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
