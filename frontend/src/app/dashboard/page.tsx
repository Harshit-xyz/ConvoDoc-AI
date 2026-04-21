"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import DocumentCard from "@/components/DocumentCard";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      signIn();
      return;
    }

    if (session) {
      const fetchDocuments = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/`, {
            headers: {
              Authorization: `Bearer ${(session as any).backendToken}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            const mappedDocs = data.map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              subject: doc.subject || "General",
              category: doc.category || "Uncategorized",
              year: doc.year || new Date(doc.createdAt).getFullYear(),
              status: doc.status,
              createdAt: doc.createdAt
            }));
            setDocuments(mappedDocs);
          }
        } catch (error) {
          console.error("Failed to fetch documents", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDocuments();
    }
  }, [status, session]);

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any).backendToken}`,
        },
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        console.error("Failed to delete document");
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error deleting document");
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-[#e0e5ec]">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Library</h1>
            <p className="text-gray-500">Manage your study materials and track your progress.</p>
          </div>
          <Link 
            href="/upload"
            className="neo-btn px-6 py-3 rounded-full font-bold text-primary flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" /> New Upload
          </Link>
        </header>

        {/* Search & Filters */}
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="neo-inset px-6 py-4 rounded-2xl flex items-center gap-3 flex-1 max-w-lg bg-[#e0e5ec] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 font-medium"
            />
          </div>
          {/* Add filter buttons here if needed */}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {documents.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Plus className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No documents yet</h3>
                <p className="text-gray-500 mb-6">Upload your first document to get started.</p>
                <Link 
                  href="/upload"
                  className="text-primary font-bold hover:underline"
                >
                  Upload a document
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {documents.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    {...doc} 
                    onDelete={handleDeleteDocument}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
