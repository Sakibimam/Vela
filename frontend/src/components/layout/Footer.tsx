import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Vela" className="w-5 h-5 rounded-md" />
            <p className="text-xs text-text-tertiary">
              Built for{" "}
              <span className="text-text-secondary font-medium">
                Stellar Hacks: Real-World ZK
              </span>
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/Sakibimam/Vela"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors inline-flex items-center gap-1.5"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-xs text-text-tertiary">
              Powered by <span className="font-medium text-text-secondary">Stellar</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
