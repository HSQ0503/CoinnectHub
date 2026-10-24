import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";
import { Brand } from "./site-header";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-shell">
        <div className="footer-main">
          <div className="footer-about">
            <Brand />
            <p>
              Helping young people make sense of money, one conversation and one
              choice at a time.
            </p>
          </div>
          <div className="footer-links">
            <p>Explore CoinnectHub</p>
            <Link href="/about">Our story</Link>
            <Link href="/games">Games & tools</Link>
            <Link href="/get-involved">Get involved</Link>
          </div>
          <div className="footer-links">
            <p>Keep the conversation going</p>
            <a
              href="https://www.instagram.com/coinnect.hub/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} aria-hidden="true" /> @coinnect.hub{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CoinnectHub</p>
          <p>For learning. This is not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
