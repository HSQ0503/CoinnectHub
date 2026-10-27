import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { GoalIllustration, StockIllustration } from "./illustrations";

export default function GameCards() {
  return (
    <div className="game-card-grid">
      <Link href="/games/savings" className="game-card">
        <div className="game-card-art savings-art">
          <span className="game-subject">Saving & planning</span>
          <GoalIllustration />
        </div>
        <div className="game-card-copy">
          <span className="game-duration">
            <Clock3 size={14} aria-hidden="true" /> A tool you can keep using
          </span>
          <h3>Savings planner</h3>
          <p>
            Find out when you can afford what you want, or how much to save each
            week to get it by a certain date, with interest included.
          </p>
          <div className="game-card-action">
            Plan a goal{" "}
            <span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
      <Link href="/games/stocks" className="game-card">
        <div className="game-card-art stocks-art">
          <span className="game-subject">Investing</span>
          <StockIllustration />
        </div>
        <div className="game-card-copy">
          <span className="game-duration">
            <Clock3 size={14} aria-hidden="true" /> About 10 minutes
          </span>
          <h3>Market Street</h3>
          <p>
            Pick a dream, earn a paycheck, and grow your money in a 3D town
            through ten years of booms, crashes, hype, and surprise bills.
          </p>
          <div className="game-card-action">
            Play Market Street{" "}
            <span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
