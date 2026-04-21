import { Loader2 } from "lucide-react";

interface ProcessingBannerProps {
  progress: number;
}

export default function ProcessingBanner({ progress }: ProcessingBannerProps) {
  return (
    <div className="bg-[var(--primary)]/10 border-b border-[var(--primary)]/20 px-6 py-2 flex items-center gap-3">
      <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
      <span className="text-sm font-medium text-[var(--primary)]">
        Generating explanations, mind map &amp; predicted questions in the background...
      </span>
      <div className="ml-auto w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
          style={{ width: `${Math.min(progress, 95)}%` }}
        />
      </div>
    </div>
  );
}
