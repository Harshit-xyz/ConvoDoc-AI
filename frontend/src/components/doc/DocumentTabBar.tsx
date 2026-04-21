import { Book, Brain, MessageSquare, HelpCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabId } from "@/app/doc/[id]/page";

const TABS = [
  { id: "topics" as TabId, label: "Topics & Notes", icon: <Book className="w-4 h-4" /> },
  { id: "qna" as TabId, label: "AI Q&A", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "predicted" as TabId, label: "Predicted Qs", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "previous" as TabId, label: "Previous Qs", icon: <HelpCircle className="w-4 h-4" /> },
];

interface DocumentTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isProcessing: boolean;
  deleting: boolean;
  onDelete: () => void;
  onOpenMindMap: () => void;
}

export default function DocumentTabBar({ activeTab, onTabChange, isProcessing, deleting, onDelete, onOpenMindMap }: DocumentTabBarProps) {
  return (
    <div className="bg-[#e0e5ec] border-b border-white/20 px-6 py-2 flex items-center justify-between overflow-x-auto no-scrollbar shadow-sm z-10">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const isTabLoading = isProcessing && tab.id !== "topics" && tab.id !== "qna" && tab.id !== "previous";
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id ? "neo-inset text-primary" : "text-gray-600 hover:bg-white/30"
              )}
            >
              {tab.icon}
              {tab.label}
              {isTabLoading && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
                </span>
              )}
            </button>
          );
        })}
        
        <div className="w-px h-6 bg-white/40 mx-1"></div>

        <button
          onClick={onOpenMindMap}
          className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap text-gray-600 hover:bg-white/60 bg-white/30 shadow-sm border border-white/40"
        >
          <Brain className="w-4 h-4 text-[#667eea]" />
          Mind Map
        </button>
      </div>

      <button
        onClick={onDelete}
        disabled={deleting}
        className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 hover:neo-inset transition-all"
      >
        <Trash2 className="w-4 h-4" />
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
