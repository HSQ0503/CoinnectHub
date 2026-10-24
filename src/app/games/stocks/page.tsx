import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StockGame from "@/components/stock-game";

export const metadata: Metadata = {
  title: "What Moves a Stock?",
  description:
    "Explore three fictional companies and learn how headlines can influence buyers and sellers.",
};

export default function StocksPage() {
  return (
    <div className="container-shell game-page">
      <Link href="/games" className="text-link text-navy/65">
        <ArrowLeft size={16} aria-hidden="true" /> All games & tools
      </Link>
      <div className="game-page-heading">
        <p className="eyebrow">Stocks & decisions</p>
        <h1 className="page-heading">What moves a stock?</h1>
        <p className="body-copy">
          Read what investors expected and what actually happened. Sort each
          piece of the story toward buyers, sellers, or “not sure.”
        </p>
      </div>
      <div className="game-experience">
        <StockGame />
      </div>
      <p className="game-disclaimer">
        All companies and headlines are fictional. This is a learning exercise,
        with no real money or investment recommendations.
      </p>
    </div>
  );
}
