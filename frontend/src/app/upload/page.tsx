"use client";

import Upload from "@/components/Upload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#e0e5ec] p-6 relative overflow-hidden">
       {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-2xl z-10">
        <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Upload Document</h1>
          <p className="text-gray-600">Supported formats: PDF, DOCX</p>
        </div>

        <div className="neo-shadow p-8 rounded-[2rem] bg-[#e0e5ec]">
          <Upload />
        </div>
      </div>
    </main>
  );
}
