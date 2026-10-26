import type { Metadata } from "next";
import { Check, Lightbulb } from "lucide-react";
import GameCards from "@/components/game-cards";
import JoinBanner from "@/components/join-banner";

export const metadata: Metadata = {
  title: "Games & tools",
  description:
    "Plan a savings goal and play Market Street, a 3D investing game for teens. Free, with no account needed.",
};

export default function GamesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container-shell">
          <p className="eyebrow">Games & tools</p>
          <h1 className="page-heading">
            Practice money decisions
            <br />
            before they’re real
          </h1>
          <p className="body-copy">
            Use the savings planner to map out a real goal, or play Market
            Street to see what ten years of investing choices can do.
          </p>
          <p className="hero-reassurance">
            <Check size={16} aria-hidden="true" /> Free to use, with no account
            and no real money
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
            Market Street works on phones, but it’s best on a laptop or a
            classroom screen, where you can switch to full screen.
          </span>
        </p>
      </section>
      <JoinBanner />
    </>
  );
}
