import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MonitorPlay, RotateCcw, Vote } from "lucide-react";
import MarketStreet from "@/components/market-street/market-street";

export const metadata: Metadata = {
  title: "Market Street",
  description:
    "A free 3D investing game for teens. Walk around town, collect your paychecks, and decide where ten years of your money should go.",
};

const classroomTips = [
  {
    Icon: MonitorPlay,
    title: "Put it on the big screen",
    text: "Press the full-screen button and pick the quick 5-year game, which fits into about ten minutes of a workshop.",
  },
  {
    Icon: Vote,
    title: "Let the class decide",
    text: "Stop at each building and have students vote on where the money goes before you fast-forward, then read the newspaper together.",
  },
  {
    Icon: RotateCcw,
    title: "Replay the same years",
    text: "At the end, replay the exact same market with a different plan so students can see that the choices changed the result, not luck.",
  },
];

export default function StocksPage() {
  return (
    <div className="container-shell game-page">
      <Link href="/games" className="text-link text-navy/65">
        <ArrowLeft size={16} aria-hidden="true" /> All games & tools
      </Link>
      <div className="game-page-heading">
        <p className="eyebrow">Investing</p>
        <h1 className="page-heading">Market Street</h1>
        <p className="body-copy">
          You’re 15 with $1,000 and a part-time job. Walk around town, invest in
          banks, bonds, companies, or a hype coin, and see what a decade of
          crashes, booms, and surprise bills does to your money.
        </p>
      </div>
      <div className="game-experience">
        <MarketStreet />
      </div>
      <section className="classroom-tips" aria-labelledby="classroom-heading">
        <h2 id="classroom-heading">Using Market Street in a classroom</h2>
        <ul className="workshop-grid">
          {classroomTips.map(({ Icon, title, text }) => (
            <li key={title}>
              <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="game-disclaimer">
        Every company, coin, and headline is made up, and the yearly returns are
        simplified versions of how real investments tend to behave. This is a
        learning game with no real money and no investment advice.
      </p>
    </div>
  );
}
