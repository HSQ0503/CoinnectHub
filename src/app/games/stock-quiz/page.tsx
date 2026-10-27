import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StockQuiz from "@/components/stock-quiz";

export const metadata: Metadata = {
  title: "What Moves a Stock?",
  description:
    "A two-minute quiz. Read a headline about a made-up company, guess whether its stock is more likely to rise or fall, and learn what drives the reaction.",
};

export default function StockQuizPage() {
  return (
    <div className="container-shell game-page">
      <Link href="/games" className="text-link text-navy/65">
        <ArrowLeft size={16} aria-hidden="true" /> All games & tools
      </Link>
      <div className="game-page-heading">
        <p className="eyebrow">Quick quiz</p>
        <h1 className="page-heading">What Moves a Stock?</h1>
        <p className="body-copy">
          Read a headline, guess which way the stock might move, and learn
          what drives the reaction. Five questions, no timer, about two
          minutes.
        </p>
      </div>
      <div className="game-experience">
        <StockQuiz />
      </div>
      <p className="game-disclaimer">
        Every company in this quiz is made up, and nothing here is investment
        advice. Nothing you answer leaves your browser.
      </p>
    </div>
  );
}
