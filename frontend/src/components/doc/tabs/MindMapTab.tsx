import MindMap from "@/components/MindMap";
import TabLoadingPlaceholder from "@/components/doc/TabLoadingPlaceholder";

interface MindMapTabProps {
  hasMindTree: boolean;
  mindTree: any;
  isProcessing: boolean;
  progress: number;
}

export default function MindMapTab({ hasMindTree, mindTree, isProcessing, progress }: MindMapTabProps) {
  return (
    <div className="h-full flex flex-col w-full">
      {hasMindTree ? (
        <div className="flex-1 w-full h-full relative">
          <MindMap data={mindTree} />
        </div>
      ) : isProcessing ? (
        <TabLoadingPlaceholder label="Building Mind Map..." progress={progress} />
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500 h-full">No mind map available.</div>
      )}
    </div>
  );
}
