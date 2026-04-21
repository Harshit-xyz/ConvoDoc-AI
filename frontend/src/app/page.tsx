"use client";

import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";
import FAQ from "@/components/home/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-[#e0e5ec]">
      {/* Background Elements */}
      {/* Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none z-0"></div>

      <Hero />
      <Features />
      <CTA />
      <FAQ />
    </main>
  );
}
