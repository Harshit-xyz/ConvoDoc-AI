"use client";

import { motion } from "framer-motion";
import { Brain, Zap, BookOpen, CheckCircle, HelpCircle, LayoutDashboard } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 scroll-mt-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Everything you need to ace exams</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Our AI analyzes your documents to create comprehensive study materials in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(200px,auto)]">
        {/* Feature 1: Mind Maps (Large) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 md:row-span-2 neo-inset p-8 rounded-3xl hover:bg-white/40 transition-colors relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-[#e0e5ec] neo-shadow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Smart Mind Maps</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Visualize complex concepts with interactive mind maps generated automatically from your notes.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </motion.div>

        {/* Feature 2: Q&A (Tall) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 md:row-span-2 neo-inset p-8 rounded-3xl hover:bg-white/40 transition-colors relative overflow-hidden group flex flex-col"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#e0e5ec] neo-shadow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap className="w-7 h-7 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Instant Q&A</h3>
          <p className="text-gray-600 leading-relaxed">
            Chat with your documents. Ask questions and get instant, accurate answers cited from your text.
          </p>
        </motion.div>

        {/* Feature 3: Explanations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 md:row-span-1 neo-inset p-8 rounded-3xl hover:bg-white/40 transition-colors relative overflow-hidden group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] neo-shadow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Deep Explanations</h3>
          <p className="text-sm text-gray-600">
            Get simplified explanations for difficult topics.
          </p>
        </motion.div>

        {/* Feature 4: Predicted Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="md:col-span-1 md:row-span-1 neo-inset p-8 rounded-3xl hover:bg-white/40 transition-colors relative overflow-hidden group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] neo-shadow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Predicted Questions</h3>
          <p className="text-sm text-gray-600">
            Practice with AI-generated exam questions.
          </p>
        </motion.div>

        {/* Feature 5: Previously Asked (Wide) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="md:col-span-2 md:row-span-1 neo-inset p-8 rounded-3xl hover:bg-white/40 transition-colors relative overflow-hidden group flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#e0e5ec] neo-shadow flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HelpCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              Previously Asked
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Soon</span>
            </h3>
            <p className="text-gray-600">
              See questions that have been asked by other students on similar topics.
            </p>
          </div>
        </motion.div>

        {/* Feature 6: Organized Library (Wide) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2 md:row-span-1 neo-inset p-8 rounded-3xl hover:bg-white/40 transition-colors relative overflow-hidden group flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#e0e5ec] neo-shadow flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutDashboard className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Organized Library</h3>
            <p className="text-gray-600">
              Keep all your study materials organized in one beautiful dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
