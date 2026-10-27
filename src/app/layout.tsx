import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";
import "./homepage.css";
import "./games.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coinnecthub.hsq0503.chatgpt.site"),
  title: {
    default: "CoinnectHub | Money games for teens",
    template: "%s | CoinnectHub",
  },
  description:
    "Free money tools for ages 13 to 18, including a savings planner, Market Street, a 3D investing game, and a quick quiz on what moves a stock. No account needed.",
  icons: { icon: "/coinnect-logo.png" },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only fixed top-3 left-3 z-50 rounded bg-yellow p-4 font-bold text-navy focus:not-sr-only"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
