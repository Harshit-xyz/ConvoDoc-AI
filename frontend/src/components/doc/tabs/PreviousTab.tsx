import { HelpCircle } from "lucide-react";

export default function PreviousTab() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in slide-in-from-right-4">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <HelpCircle className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
      <p className="text-gray-500">We are working on gathering previously asked questions for this topic.</p>
    </div>
  );
}
