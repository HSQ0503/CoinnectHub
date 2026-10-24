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
            <Clock3 size={14} aria-hidden="true" /> Five virtual weeks
          </span>
          <h3>How long to buy it?</h3>
          <p>
            A pair of headphones. A concert ticket. Make a few choices and see
            how your savings add up.
          </p>
          <div className="game-card-action">
            Play the savings game{" "}
            <span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
      <Link href="/games/stocks" className="game-card">
        <div className="game-card-art stocks-art">
          <span className="game-subject">Stocks & decisions</span>
          <StockIllustration />
        </div>
        <div className="game-card-copy">
          <span className="game-duration">
            <Clock3 size={14} aria-hidden="true" /> Three stories to explore
          </span>
          <h3>What moves a stock?</h3>
          <p>
            More sales. Higher costs. A delayed launch. Discover why one
            headline can tell more than one story.
          </p>
          <div className="game-card-action">
            Play the headline game{" "}
            <span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
