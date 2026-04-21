"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderText } from "@/lib/renderText";

interface QnaTabProps {
  documentId: string;
  session: any;
}



export default function QnaTab({ documentId, session }: QnaTabProps) {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [asking, setAsking] = useState(false);

  // Fetch existing chat history
  useEffect(() => {
    if (!documentId || !session) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/qna/history/${documentId}`, {
      headers: { Authorization: `Bearer ${session.backendToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChatHistory(data);
      })
      .catch((err) => console.error("Failed to fetch chat history", err));
  }, [documentId, session]);

  const handleAskQuestion = async () => {
    if (!question.trim() || asking) return;

    const userQuestion = question;
    setQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", content: userQuestion }]);
    setAsking(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/qna/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify({ documentId, question: userQuestion }),
      });

      if (!res.ok) throw new Error("Failed to get answer");

      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch (error) {
      console.error("Q&A failed:", error);
      setChatHistory((prev) => [...prev, { role: "ai", content: "Sorry, I couldn't get an answer at this time." }]);
    } finally {
      setAsking(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm("Clear chat history?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/qna/history/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.backendToken}` },
      });
      setChatHistory([]);
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Ask AI</h2>
        {chatHistory.length > 0 && (
          <button
            onClick={handleClearChat}
            className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex-1 neo-inset rounded-2xl mb-4 p-4 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
            <p>Ask anything about the document...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] p-5 rounded-2xl shadow-sm text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[var(--primary)] text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  )}
                >
                  {renderText(msg.content)}
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1 w-fit">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
          placeholder="Type your question..."
          className="flex-1 neo-inset px-4 py-3 rounded-xl bg-transparent outline-none"
          disabled={asking}
        />
        <button
          onClick={handleAskQuestion}
          disabled={asking || !question.trim()}
          className="neo-btn px-6 py-3 rounded-xl font-bold text-primary disabled:opacity-50"
        >
          {asking ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
