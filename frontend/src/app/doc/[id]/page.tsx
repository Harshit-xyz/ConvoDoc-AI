"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Brain, X } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import DocumentTabBar from "@/components/doc/DocumentTabBar";
import ProcessingBanner from "@/components/doc/ProcessingBanner";
import PdfViewer from "@/components/doc/PdfViewer";
import TopicsTab from "@/components/doc/tabs/TopicsTab";
import MindMapTab from "@/components/doc/tabs/MindMapTab";
import QnaTab from "@/components/doc/tabs/QnaTab";
import PredictedTab from "@/components/doc/tabs/PredictedTab";
import PreviousTab from "@/components/doc/tabs/PreviousTab";
import TabLoadingPlaceholder from "@/components/doc/TabLoadingPlaceholder";
import { cn } from "@/lib/utils";

export type TabId = "topics" | "qna" | "predicted" | "previous";

export default function DocumentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("topics");
  const [showMindMap, setShowMindMap] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Polling for document data ──
  useEffect(() => {
    if (!id || !session) return;

    let timeoutId: NodeJS.Timeout;

    const fetchDocument = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${(session as any).backendToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch document");

        const docData = await res.json();

        if (docData.status === "processing") {
          setProgress(docData.progress || 0);
          timeoutId = setTimeout(fetchDocument, 2000);
        } else if (docData.status === "topics_ready") {
          setData(docData);
          setLoading(false);
          setIsProcessing(true);
          setProgress(docData.progress || 40);
          timeoutId = setTimeout(fetchDocument, 3000);
        } else if (docData.status === "ready") {
          setData(docData);
          setLoading(false);
          setIsProcessing(false);
          setProgress(100);
        } else if (docData.status === "failed") {
          setData(docData);
          setLoading(false);
          setIsProcessing(false);
        } else {
          setData(docData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setLoading(false);
      }
    };

    fetchDocument();
    return () => clearTimeout(timeoutId);
  }, [id, session]);

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${(session as any).backendToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading / error states ──
  if (loading) return <LoadingScreen progress={progress} />;
  if (!data) return <div className="flex items-center justify-center h-screen bg-[#e0e5ec] text-gray-500">Document not found</div>;

  const isFullScreen = activeTab !== "topics";
  const hasExplanations = data.explanations && typeof data.explanations === "object" && Object.keys(data.explanations).length > 0;
  const hasMindTree = data.mindTree && typeof data.mindTree === "object" && Object.keys(data.mindTree).length > 0;
  const hasPredictedQuestions = data.predictedQuestions && Array.isArray(data.predictedQuestions) && data.predictedQuestions.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#e0e5ec]">
      <DocumentTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isProcessing={isProcessing}
        deleting={deleting}
        onDelete={handleDelete}
        onOpenMindMap={() => setShowMindMap(true)}
      />

      {isProcessing && <ProcessingBanner progress={progress} />}

      <div className="flex flex-1 overflow-hidden">
        {!isFullScreen && <PdfViewer fileUrl={data.fileUrl} />}

        <div className={cn("p-8 overflow-y-auto bg-[#e0e5ec]", isFullScreen ? "w-full" : "w-full lg:w-1/2")}>
          {activeTab === "topics" && (
            <TopicsTab topics={data.topics} explanations={data.explanations} hasExplanations={hasExplanations} />
          )}



          {activeTab === "qna" && (
            <QnaTab documentId={id as string} session={session} />
          )}

          {activeTab === "predicted" && (
            <PredictedTab
              hasPredictedQuestions={hasPredictedQuestions}
              predictedQuestions={data.predictedQuestions}
              isProcessing={isProcessing}
              progress={progress}
            />
          )}

          {activeTab === "previous" && <PreviousTab />}
        </div>
      </div>

      {/* Mind Map Full Screen Modal */}
      {showMindMap && (
        <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-200 bg-[#1a1b1e]">
          <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none flex justify-between items-start">
            <div>
              <h2 className="text-[22px] font-medium text-white drop-shadow-md">
                {data?.fileName?.replace(/\.[^/.]+$/, "") || "Concept Map"}
              </h2>
              <p className="text-sm text-gray-400 mt-1 drop-shadow-md">Based on uploaded document</p>
            </div>
            <button 
              onClick={() => setShowMindMap(false)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors pointer-events-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <MindMapTab hasMindTree={hasMindTree} mindTree={data.mindTree} isProcessing={isProcessing} progress={progress} />
          </div>
        </div>
      )}
    </div>
  );
}
