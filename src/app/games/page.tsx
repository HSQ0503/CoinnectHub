import type { Metadata } from "next";
import { Check, MousePointer2 } from "lucide-react";
import GameCards from "@/components/game-cards";
import JoinBanner from "@/components/join-banner";

export const metadata: Metadata = {
  title: "Games & tools",
  description:
    "Turn a money question into a little discovery. Try our savings calculator and three-round stock news game.",
};

export default function GamesPage() {
  return (
    <>
      <section className="bg-blue text-white">
        <div className="container-shell py-14 md:py-20">
          <p className="eyebrow">
            <MousePointer2 size={17} className="text-yellow" /> The learning
            playground
          </p>
          <h1 className="page-heading max-w-3xl">
            A little curiosity.
            <br />
            <span className="text-yellow">A lot to discover.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white md:text-lg">
            Make a plan. Read between the headlines. Try out money decisions in
            a place where learning is the whole point.
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
            Pick your starting point.
          </h2>
          <span className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-bold">
            2 ways to learn
          </span>
        </div>
        <GameCards />
        <div className="mt-10 border-l-4 border-yellow py-2 pl-6">
          <p className="text-sm font-extrabold">
            There’s no experience requirement.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-navy/70">
            Each tool explains things as you go. Change your mind, try a
            different answer, and see what you learn along the way.
          </p>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
