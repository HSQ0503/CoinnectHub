import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";
import { Brand } from "./site-header";

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-shell pt-14 pb-7">
        <div className="grid gap-10 pb-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Brand light />
            <p className="mt-5 max-w-[290px] text-sm leading-7 text-white/70">
              Helping the next generation understand money, one decision at a
              time.
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-extrabold text-yellow">
              Find your way
            </p>
            <div className="grid gap-3 text-sm text-white/80">
              <Link className="hover:text-yellow" href="/about">
                About CoinnectHub
              </Link>
              <Link className="hover:text-yellow" href="/games">
                Games & tools
              </Link>
              <Link className="hover:text-yellow" href="/get-involved">
                Contact & get involved
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-extrabold text-yellow">
              Keep learning
            </p>
            <a
              href="https://www.instagram.com/coinnect.hub/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm hover:text-yellow"
            >
              <Instagram size={18} /> @coinnect.hub <ArrowUpRight size={15} />
            </a>
            <p className="mt-3 max-w-60 text-xs leading-6 text-white/60">
              Small lessons in finance and economics, beyond the website.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-white/20 pt-6 text-xs leading-6 text-white/60 sm:flex-row">
          <p>© 2026 CoinnectHub</p>
          <p>Made for learning. Educational content, not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
