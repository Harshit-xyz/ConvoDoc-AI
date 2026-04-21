"use client";

import { motion } from "framer-motion";

export default function FAQ() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20 mb-20">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { q: "How does ConvoDoc ai work?", a: "Simply upload your PDF or DOCX file. Our AI analyzes the content to extract key topics, generate summaries, create mind maps, and predict exam questions." },
          { q: "Is it free to use?", a: "Yes, ConvoDoc ai offers a free tier that allows you to process a limited number of documents per month." },
          { q: "What file formats are supported?", a: "Currently, we support PDF and DOCX files. We are working on adding support for more formats soon." },
          { q: "Is my data safe?", a: "Absolutely. We use industry-standard encryption to protect your files and personal information." }
        ].map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="neo-inset p-8 rounded-3xl hover:bg-white/40 transition-all"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
