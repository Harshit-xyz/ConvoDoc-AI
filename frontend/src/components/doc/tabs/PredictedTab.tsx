import TabLoadingPlaceholder from "@/components/doc/TabLoadingPlaceholder";
import { renderText } from "@/lib/renderText";

interface PredictedTabProps {
  hasPredictedQuestions: boolean;
  predictedQuestions: { question: string; answer: string }[];
  isProcessing: boolean;
  progress: number;
}

export default function PredictedTab({ hasPredictedQuestions, predictedQuestions, isProcessing, progress }: PredictedTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Predicted Questions</h2>
      {hasPredictedQuestions ? (
        predictedQuestions.map((q, i) => (
          <div key={i} className="neo-shadow p-6 rounded-2xl bg-[#e0e5ec]">
            <h3 className="font-bold text-gray-800 mb-2">Q: {q.question}</h3>
            <p className="text-gray-600 text-sm">A: {renderText(q.answer)}</p>
          </div>
        ))
      ) : isProcessing ? (
        <TabLoadingPlaceholder label="Generating Predicted Questions..." progress={progress} />
      ) : (
        <p className="text-gray-500">No predicted questions available.</p>
      )}
    </div>
  );
}
