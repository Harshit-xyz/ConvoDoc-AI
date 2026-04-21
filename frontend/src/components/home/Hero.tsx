"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Upload from "@/components/Upload";

export default function Hero() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-10 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="text-left"
      >
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/50 border border-white/20 text-sm font-medium text-primary shadow-sm">
          🚀 AI-Powered Learning
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800 leading-tight">
          Study <span className="text-primary">Smarter</span>, <br />
          Not Harder.
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
          ConvoDoc ai transforms your documents into interactive study guides, mind maps, and quizzes instantly using AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="neo-btn px-8 py-4 rounded-full font-bold text-primary flex items-center justify-center gap-2 text-lg">
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#features" className="px-8 py-4 rounded-full font-medium text-gray-600 hover:bg-white/30 transition-colors flex items-center justify-center">
            Learn More
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-[#e0e5ec]" />
            ))}
          </div>
          <p>Trusted by 1000+ students</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="neo-shadow p-8 rounded-[2rem] bg-[#e0e5ec] relative z-10">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Get Started Now</h2>
          <p className="text-center text-gray-500 mb-8">Upload your notes and let AI do the rest.</p>
          <Upload />
        </div>
        {/* Decorative elements behind upload card */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </motion.div>
    </section>
  );
}
