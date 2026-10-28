import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./site-header";
import { InstagramIcon, SOCIAL_LINKS, TikTokIcon } from "./social-icons";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-shell">
        <div className="footer-main">
          <div className="footer-about">
            <Brand />
            <p>
              Helping young people make sense of money through games,
              conversations, and classroom workshops.
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
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
              <InstagramIcon size={16} /> Instagram{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer">
              <TikTokIcon size={15} /> TikTok{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CoinnectHub</p>
          <p>For learning only, not financial advice</p>
        </div>
      </div>
    </footer>
  );
}
