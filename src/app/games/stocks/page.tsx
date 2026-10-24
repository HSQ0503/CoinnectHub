import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StockGame from "@/components/stock-game";

export const metadata: Metadata = {
  title: "What Moves a Stock?",
  description:
    "Sort lines from three made-up headlines, Loop Bikes, Pixel Play, and Sunbeam Snacks, onto a buyers and sellers scale.",
};

export default function StocksPage() {
  return (
    <div className="container-shell py-10 sm:py-14 lg:py-18">
      <Link
        href="/games"
        className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        All games & tools
      </Link>
      <div className="mb-10 max-w-3xl sm:mb-12">
        <p className="eyebrow">Read the signals / 3 stories</p>
        <h1 className="page-heading mt-4">
          What moves <span className="text-blue">a stock?</span>
        </h1>
        <p className="body-copy mt-5 max-w-2xl">
          Each card shows what investors expected, then what the company
          reported. You drop the lines on sellers, buyers, or not sure. All
          three companies are fictional.
        </p>
      </div>
      <StockGame />
      <p className="mt-7 text-sm leading-relaxed text-navy/75">
        All companies and headlines in this game are fictional. No real money,
        trading, or investment recommendations.
      </p>
    </div>
  );
}
