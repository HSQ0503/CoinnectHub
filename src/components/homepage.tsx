import Link from "next/link";
import { ArrowRight, Check, HeartHandshake, Sparkles } from "lucide-react";
import HeroFinanceLesson from "./hero-finance-lesson";
import FollowSection from "./follow-section";
import GameCards from "./game-cards";
import JoinBanner from "./join-banner";

export default function Homepage() {
  return (
    <div className="coinnect-home">
      <section className="home-hero">
        <div className="container-shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="hero-intro">
              <span /> A youth financial literacy nonprofit
            </p>
            <h1>
              Money skills
              <br />
              for real life
            </h1>
            <p className="hero-description">
              Whether it’s your first savings goal or your first investment,
              CoinnectHub gives you a place to try real money decisions and see
              how they play out.
            </p>
            <div className="hero-actions">
              <Link href="/games" className="button-primary">
                Explore the games <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/about" className="text-link">
                Meet CoinnectHub
              </Link>
            </div>
            <p className="hero-reassurance">
              <Check size={16} aria-hidden="true" /> Free to play, and no
              account needed
            </p>
          </div>
          <HeroFinanceLesson />
        </div>
      </section>

      <div className="learning-strip">
        <div className="container-shell">
          <span>
            <Sparkles size={18} aria-hidden="true" /> Made for students ages
            13 to 18
          </span>
          <span>No real money, so every mistake is a free lesson</span>
        </div>
      </div>

      <section
        className="container-shell section-space"
        aria-labelledby="games-heading"
      >
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Learn by doing</p>
            <h2 id="games-heading" className="section-title">
              Learn by making
              <br />
              your own choices
            </h2>
          </div>
          <p className="section-description">
            Plan a real savings goal with our calculator, walk around Market
            Street to decide where ten years of your money should go, or take
            a two-minute quiz on what moves a stock.
          </p>
        </div>
        <GameCards />
      </section>

      <section className="mission-section">
        <div className="container-shell mission-grid">
          <div>
            <span className="mission-icon">
              <HeartHandshake size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h2 className="section-title">
              Money is part of everyday life, so learning about it should be
              too
            </h2>
          </div>
          <div className="mission-copy">
            <p>
              Some young people grow up talking about money at home, while
              others have to work it out on their own.
            </p>
            <p>
              That gap is why CoinnectHub was created. Through free games,
              short explanations, and middle school workshops, we make room for
              the questions students actually want to ask.
            </p>
            <Link href="/about" className="text-link">
              The story behind CoinnectHub{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <JoinBanner />
      <FollowSection />
    </div>
  );
}
