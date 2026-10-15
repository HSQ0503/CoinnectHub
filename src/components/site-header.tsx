"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/games", label: "Games & tools" },
];

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center gap-2.5 ${light ? "text-white" : "text-navy"}`}
      aria-label="CoinnectHub home"
    >
      <Image
        src="/coinnect-logo.png"
        alt=""
        width={44}
        height={44}
        className="h-10 w-10 rounded-lg object-contain md:h-11 md:w-11"
        priority
      />
      <span className="text-[23px] font-extrabold tracking-[-1.1px]">
        Coinnect<span className={light ? "text-yellow" : "text-blue"}>Hub</span>
        <span className={light ? "text-yellow" : "text-blue"}>.</span>
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`site-header ${pathname === "/" ? "site-header-home" : ""}`}
    >
      <div className="site-header-inner">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-9 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              className={`relative py-4 text-[13px] font-bold transition-colors hover:text-blue ${active(link.href) ? "text-blue after:absolute after:right-0 after:bottom-1.5 after:left-0 after:h-0.5 after:bg-blue" : "text-navy/75"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/get-involved"
          className="header-involve hidden md:inline-flex"
        >
          Get involved <ArrowUpRight size={16} />
        </Link>
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-navigation-panel md:hidden"
        >
          {[...links, { href: "/get-involved", label: "Get involved" }].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`block border-t border-navy/10 py-4 text-base font-bold ${active(link.href) ? "text-blue" : "text-navy"}`}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
