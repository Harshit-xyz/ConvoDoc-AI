import { Loader2 } from "lucide-react";

interface TabLoadingPlaceholderProps {
  label: string;
  progress: number;
}

export default function TabLoadingPlaceholder({ label, progress }: TabLoadingPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in">
      <div className="neo-shadow p-8 rounded-3xl bg-[#e0e5ec] flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
        <h3 className="text-lg font-bold text-gray-700">{label}</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Still processing your document. This will appear once the analysis is complete.
        </p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
            style={{ width: `${Math.min(progress, 95)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
