"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";

interface MobileMenuProps {
  session: any;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden overflow-hidden"
    >
      <div className="px-4 pt-2 pb-4 space-y-2">
        <Link href="/" className="block px-4 py-2 rounded-lg bg-[#e0e5ec] neo-shadow text-center text-sm font-bold text-gray-700 active:neo-inset">
          Home
        </Link>
        <Link href="/dashboard" className="block px-4 py-2 rounded-lg bg-[#e0e5ec] neo-shadow text-center text-sm font-bold text-gray-700 active:neo-inset">
          Dashboard
        </Link>
        <Link href="/#features" className="block px-4 py-2 rounded-lg bg-[#e0e5ec] neo-shadow text-center text-sm font-bold text-gray-700 active:neo-inset">
          Features
        </Link>
        {session ? (
          <button
            onClick={() => signOut()}
            className="block w-full px-4 py-2 rounded-lg bg-[#e0e5ec] neo-shadow text-center text-sm font-bold text-red-600 active:neo-inset"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="block w-full px-4 py-2 rounded-lg bg-[#e0e5ec] neo-shadow text-center text-sm font-bold text-primary active:neo-inset"
          >
            Sign In
          </button>
        )}
      </div>
    </motion.div>
  );
}
