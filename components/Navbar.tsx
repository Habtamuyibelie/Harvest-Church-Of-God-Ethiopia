"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Info,
  ListChecks,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Images,
  Mail,
  Phone,
  HandHeart,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/about",       label: "About",  Icon: Info },
  { href: "/programs",    label: "Programs",  Icon: ListChecks },
  { href: "/sermons",     label: "Sermons",   Icon: BookOpen },
  { href: "/events",      label: "Events",    Icon: CalendarDays },
  { href: "/ministries",  label: "Ministries",Icon: HeartHandshake },
  { href: "/gallery",     label: "Gallery",   Icon: Images },
  { href: "/newsletter",  label: "Newsletter",Icon: Mail },
  { href: "/contact",     label: "Contact",   Icon: Phone },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ink/85 backdrop-blur-xl border-b border-hairline/[0.06] shadow-xl shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/70 ring-offset-2 ring-offset-ink group-hover:ring-gold transition-all">
            <Image
              src="/images/logo.jpg"
              alt="Harvest Church of God Ethiopia"
              fill
              className="object-cover"
            />
          </span>
          <span className="leading-tight">
         <span className="block text-[0.8rem] font-body font-medium tracking-wide text-sky-500">
            መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ
          </span>
          <span
       className="block text-[1.1rem] font-bold tracking-tight font-display"style={{ color: "#c41111" }}>
      Harvest Church of God - Ethiopia
        </span>

         
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 font-body">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative flex items-center gap-1.5 px-3.5 py-2 text-[0.9rem] font-medium text-parchment/75 hover:text-parchment transition-colors rounded-lg hover:bg-hairline/[0.06] group"
            >
              <l.Icon size={15} strokeWidth={2} className="text-gold/70 group-hover:text-gold transition-colors" />
              {l.label}
              <span className="absolute bottom-1 left-3.5 right-3.5 h-px scale-x-0 bg-gradient-to-r from-gold to-red group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </nav>

        {/* Theme toggle + Give CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/donate"
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-2.5 text-[0.9rem] font-bold text-parchment shadow-lg shadow-red/30 hover:shadow-red/50 hover:from-redDark hover:to-red transition-all"
          >
            <HandHeart size={15} strokeWidth={2} />
            Give
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-parchment/80 hover:text-parchment p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-ink/95 backdrop-blur-xl border-t border-hairline/[0.07] px-6 py-5 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 text-[1rem] font-medium text-parchment/80 hover:text-parchment py-2.5 border-b border-hairline/[0.05] hover:pl-2 transition-all"
            >
              <l.Icon size={17} strokeWidth={2} className="text-gold/70" />
              {l.label}
            </Link>
          ))}
          <Link
            href="/donate"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-3 font-bold text-parchment"
          >
            <HandHeart size={15} strokeWidth={2} />
            Give
          </Link>
        </div>
      )}
    </header>
  );
}
