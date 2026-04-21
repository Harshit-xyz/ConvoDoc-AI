import { Loader2 } from "lucide-react";

import { renderText } from "@/lib/renderText";

interface TopicsTabProps {
  topics: string[];
  explanations: Record<string, string>;
  hasExplanations: boolean;
}

export default function TopicsTab({ topics, explanations, hasExplanations }: TopicsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Topics</h2>
      {topics && topics.length > 0 ? (
        topics.map((topic: string) => (
          <div key={topic} className="neo-shadow p-6 rounded-2xl bg-[#e0e5ec]">
            <h3 className="text-lg font-bold text-primary mb-2">{topic}</h3>
            {hasExplanations ? (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {renderText(explanations?.[topic] || "No explanation available for this topic.")}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Generating explanation...</span>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No topics found.</p>
      )}
    </div>
  );
}
