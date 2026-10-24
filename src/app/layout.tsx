import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";
import "./homepage.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coinnecthub.hsq0503.chatgpt.site"),
  title: {
    default: "CoinnectHub | Money games for teens",
    template: "%s | CoinnectHub",
  },
  description:
    "Free games for ages 13 to 18: a five-week savings run and a sort of three made-up stock headlines. No account.",
  icons: { icon: "/coinnect-logo.png" },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
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
