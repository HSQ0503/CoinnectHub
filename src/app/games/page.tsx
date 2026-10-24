import type { Metadata } from "next";
import { Check, Lightbulb } from "lucide-react";
import GameCards from "@/components/game-cards";
import JoinBanner from "@/components/join-banner";

export const metadata: Metadata = {
  title: "Games & tools",
  description:
    "Practice saving and explore stock headlines with two free interactive games for teens. No account needed.",
};

export default function GamesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container-shell">
          <p className="eyebrow">Games & tools</p>
          <h1 className="page-heading">
            Make a choice.
            <br />
            See what happens.
          </h1>
          <p className="body-copy">
            Build a savings plan or unpack a stock headline. Two short games to
            help you get comfortable with money.
          </p>
          <p className="hero-reassurance">
            <Check size={16} aria-hidden="true" /> Free to play. No account. No
            real money.
          </p>
        </div>
      </section>
      <section
        className="container-shell section-space"
        aria-label="Choose a game"
      >
        <GameCards />
        <p className="games-note">
          <Lightbulb size={21} strokeWidth={1.6} aria-hidden="true" />
          <span>
            Take your time with each choice. You can change your answer before
            you lock a week or reveal a headline’s explanation.
          </span>
        </p>
      </section>
      <JoinBanner />
    </>
  );
}
