import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WeekGame from "@/components/week-game";

export const metadata: Metadata = {
  title: "How Long to Buy It?",
  description:
    "Five weeks with $10, $15, or $20. A free game about saving for your next goal from CoinnectHub.",
};

export default function SavingsPage() {
  return (
    <div className="container-shell game-page">
      <Link href="/games" className="text-link text-navy/65">
        <ArrowLeft size={16} aria-hidden="true" /> All games & tools
      </Link>
      <div className="game-page-heading">
        <p className="eyebrow">Saving & planning</p>
        <h1 className="page-heading">How long to buy it?</h1>
        <p className="body-copy">
          Choose something worth saving for. Then try five weeks of everyday
          decisions and watch your goal get closer.
        </p>
      </div>
      <div className="game-experience">
        <WeekGame />
      </div>
      <p className="game-disclaimer">
        A practice game using whole dollars. Progress stays in this session and
        resets when you leave or refresh.
      </p>
    </div>
  );
}
