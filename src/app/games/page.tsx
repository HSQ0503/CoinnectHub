import type { Metadata } from "next";
import { Check, MousePointer2 } from "lucide-react";
import GameCards from "@/components/game-cards";
import JoinBanner from "@/components/join-banner";

export const metadata: Metadata = {
  title: "Games & tools",
  description:
    "A five-week savings game and a headline sort with three made-up companies. Free, no account.",
};

export default function GamesPage() {
  return (
    <>
      <section className="bg-blue text-white">
        <div className="container-shell py-14 md:py-20">
          <p className="eyebrow">
            <MousePointer2 size={17} className="text-yellow" /> Games
          </p>
          <h1 className="page-heading max-w-3xl">
            Two games.
            <br />
            <span className="text-yellow">Both free.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white md:text-lg">
            One runs five weeks of $10, $15, or $20. The other is three fake
            headlines, Loop Bikes, Pixel Play, and Sunbeam Snacks, that you
            sort onto a scale.
          </p>
          <p className="mt-7 flex items-center gap-2 text-sm">
            <Check size={17} className="text-yellow" /> Free to use. No
            accounts. No real money at risk.
          </p>
        </div>
      </section>
      <section className="container-shell py-14 md:py-20">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Pick one.
          </h2>
          <span className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-bold">
            2 games
          </span>
        </div>
        <GameCards />
        <div className="mt-10 border-l-4 border-yellow py-2 pl-6">
          <p className="text-sm font-extrabold">
            You can change a week before you lock it.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-navy/70">
            Same with the headline pieces, until you tip the scale. The page
            then tells you how we read that line.
          </p>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
