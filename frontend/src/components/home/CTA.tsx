"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section id="about" className="w-full max-w-5xl mx-auto px-6 py-20 scroll-mt-32">
      <div className="neo-shadow rounded-[3rem] p-12 text-center bg-gradient-to-br from-[#e0e5ec] to-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">Ready to transform your grades?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of students using ConvoDoc ai to study smarter. It's free to get started.
          </p>
          <Link href="/dashboard" className="neo-btn px-10 py-4 rounded-full font-bold text-primary text-lg inline-flex items-center gap-2">
            Start Learning Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-white/20 backdrop-blur-sm z-0"></div>
      </div>
    </section>
  );
}
