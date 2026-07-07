import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, HeartHandshake, HandHeart, Mail } from "lucide-react";
import { socialLinks } from "@/lib/social-links";

const explore = [
  { label: "Sermons",    href: "/sermons",    Icon: BookOpen },
  { label: "Events",     href: "/events",     Icon: CalendarDays },
  { label: "Ministries", href: "/ministries", Icon: HeartHandshake },
  { label: "Give",       href: "/donate",     Icon: HandHeart },
];

export default function Footer() {
  return (
    <footer className="bg-inkLight text-parchment border-t border-hairline/[0.06]">
      <hr className="divider-grad opacity-70" />
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/60">
              <Image src="/images/logo.jpg" alt="Harvest Church of God Ethiopia" fill className="object-cover" />
            </span>
            <span className="leading-tight">
               <span className="block text-[0.68rem] font-body font-medium tracking-wide text-sky-500">
            መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ
          </span>
          <span
       className="block text-[0.95rem] font-bold tracking-tight font-display"style={{ color: "#c41111" }}>
      Harvest Church of God - Ethiopia
        </span>
            
            </span>
          </div>
          <p className="text-[0.8rem] text-parchment/50 leading-relaxed">
            መከር የእግዚአብሔር ቤተ-ክርስቲያን-ኢትዮጲያ — a family of faith gathering to worship, grow, and serve.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">Visit Us</p>
          <ul className="space-y-2 text-[0.84rem] text-parchment/55">
            <li>Shola Signal, Kenenisa Road, Addis Ababa, Ethiopia</li>
            <li>Sundays — 9:00 - 6:30 AM</li>
            <li>Wednesdays — 6:00 PM (Prayer)</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-[0.84rem]">
            {explore.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="flex items-center gap-2 text-parchment/55 hover:text-gold transition-colors">
                  <l.Icon size={14} strokeWidth={2} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Stay Connected</p>
          <p className="text-[0.84rem] text-parchment/55 mb-4">Weekly updates straight to your inbox.</p>
          <Link
            href="/newsletter"
            className="btn-shine inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2 text-[0.84rem] font-semibold text-gold hover:bg-gold hover:text-ink transition-all"
          >
            <Mail size={14} strokeWidth={2} />
            Subscribe
          </Link>
          <div className="flex gap-3 mt-6">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="h-8 w-8 rounded-full border border-hairline/10 flex items-center justify-center text-parchment/40 hover:border-gold/40 hover:text-gold transition-colors"
              >
                <s.Icon size={14} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-hairline/[0.05] px-6 py-5 text-center text-xs text-parchment/30">
        © {new Date().getFullYear()} Harvest Church of God - Ethiopia. All rights reserved.
      </div>
    </footer>
  );
}
