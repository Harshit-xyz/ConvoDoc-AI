"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileDropdownProps {
  session: any;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ProfileDropdown({ session, isOpen, onToggle }: ProfileDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-10 h-10 rounded-full bg-[#e0e5ec] neo-shadow flex items-center justify-center text-gray-700 hover:text-primary hover:scale-105 transition-all"
      >
        {session.user?.image ? (
          <img src={session.user.image} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-[#e0e5ec]" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-[#e0e5ec] rounded-xl neo-shadow overflow-hidden py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-200/50">
              <p className="text-xs font-bold text-gray-800 truncate">{session.user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{session.user?.email}</p>
            </div>
            <div className="p-1">
              <Link href="/dashboard" className="block px-3 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-[#e0e5ec] hover:neo-inset flex items-center gap-2 transition-all">
                <LayoutDashboard className="w-3 h-3" /> Dashboard
              </Link>
              <button className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-[#e0e5ec] hover:neo-inset flex items-center gap-2 transition-all">
                <Settings className="w-3 h-3" /> Settings
              </button>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-[#e0e5ec] hover:neo-inset flex items-center gap-2 transition-all mt-1"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
