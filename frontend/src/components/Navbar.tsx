"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ProfileDropdown from "./navbar/ProfileDropdown";
import MobileMenu from "./navbar/MobileMenu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#features", label: "Features" },
  { href: "/#about", label: "About" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#e0e5ec]/80 backdrop-blur-md border-b border-white/20 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#e0e5ec] neo-shadow flex items-center justify-center text-primary font-bold text-lg group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="text-lg font-bold text-gray-800 tracking-tight group-hover:text-primary transition-colors">ConvoDoc ai</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 font-medium hover:text-primary hover:bg-[#e0e5ec] hover:neo-shadow transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth / Profile (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <ProfileDropdown
                session={session}
                isOpen={profileOpen}
                onToggle={() => setProfileOpen(!profileOpen)}
              />
            ) : (
              <div className="flex gap-2">
                <button onClick={() => signIn()} className="px-4 py-1.5 rounded-lg text-sm text-gray-600 font-bold hover:text-primary hover:neo-shadow transition-all">
                  Log In
                </button>
                <button onClick={() => signIn()} className="neo-btn px-4 py-1.5 rounded-lg text-sm font-bold text-primary hover:scale-105 transition-transform">
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-8 h-8 rounded-lg bg-[#e0e5ec] neo-shadow flex items-center justify-center text-gray-700 active:neo-inset transition-all"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && <MobileMenu session={session} />}
      </AnimatePresence>
    </nav>
  );
}
