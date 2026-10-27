import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Footprints } from "lucide-react";
import { GoalIllustration, QuizIllustration } from "./illustrations";

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
          <Image
            src="/market-street-cover.webp"
            alt="Penny, the coin character, standing in a glowing circle in front of the Savings Bank in the 3D town of Market Street"
            width={1600}
            height={933}
            className="game-card-cover"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 400px"
          />
          <span className="game-cover-chip">
            <Footprints size={14} aria-hidden="true" /> Walk around a 3D town
          </span>
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
      <Link href="/games/stock-quiz" className="game-card">
        <div className="game-card-art quiz-art">
          <span className="game-subject">Quick quiz</span>
          <QuizIllustration />
        </div>
        <div className="game-card-copy">
          <span className="game-duration">
            <Clock3 size={14} aria-hidden="true" /> About 2 minutes
          </span>
          <h3>What Moves a Stock?</h3>
          <p>
            Read a headline, guess which way the stock might move, and learn
            what drives the reaction.
          </p>
          <div className="game-card-action">
            Start the quiz{" "}
            <span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
