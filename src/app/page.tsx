import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Coins,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { SavingsIllustration } from "@/components/illustrations";
import GameCards from "@/components/game-cards";
import JoinBanner from "@/components/join-banner";

export default function Home() {
  return (
    <>
      <section className="overflow-hidden bg-blue text-white">
        <div className="container-shell grid items-center gap-2 pt-12 pb-10 md:grid-cols-[1.05fr_1fr] md:gap-0 md:pt-14 md:pb-16 lg:min-h-[620px]">
          <div className="hero-copy relative z-10">
            <p className="mb-7 flex items-center gap-2.5 text-xs font-bold sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-yellow" /> Financial
              literacy for the next generation
            </p>
            <h1 className="max-w-[620px] text-[48px] leading-[1.06] font-extrabold tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              Money makes
              <br />
              more sense
              <br />
              <span className="text-yellow">when it’s yours.</span>
            </h1>
            <p className="mt-7 max-w-[410px] text-base leading-7 text-white lg:text-[17px]">
              Your first savings goal. Your next big purchase. Get to know the
              money decisions that shape your world.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link className="button-yellow" href="/games">
                Explore games & tools <ArrowUpRight size={18} />
              </Link>
              <Link href="/about" className="text-link text-white">
                Meet CoinnectHub <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-7 flex items-center gap-2 text-xs text-white">
              <Check size={15} className="text-yellow" /> Free to explore. No
              sign-up needed.
            </p>
          </div>
          <div className="hero-illustration -mx-5 mt-4 md:-mr-10 md:-ml-6 md:mt-0 lg:-mr-14">
            <SavingsIllustration className="mx-auto w-full max-w-[620px]" />
          </div>
        </div>
      </section>
      <div className="border-b border-navy/10">
        <div className="container-shell flex flex-wrap items-center justify-center gap-x-9 gap-y-4 py-6 text-[12px] font-bold text-navy/70 sm:justify-between sm:text-sm">
          <span className="flex items-center gap-2.5">
            <Coins size={18} className="text-blue" /> Everyday money, explained
          </span>
          <span className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-blue" /> Built for curious minds
          </span>
          <span className="flex items-center gap-2.5">
            <HeartHandshake size={18} className="text-blue" /> Learning with a
            purpose
          </span>
        </div>
      </div>
      <section className="container-shell py-16 md:py-24">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-blue">
              <Sparkles size={17} /> Less scrolling. More discovering.
            </p>
            <h2 className="section-title">A good place to start.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-navy/70">
              Try a real-life question. Find an answer that sticks.
            </p>
          </div>
          <Link href="/games" className="text-link shrink-0">
            All games & tools <ArrowRight size={16} />
          </Link>
        </div>
        <GameCards />
      </section>
      <section className="border-t border-navy/10 bg-blue/4">
        <div className="container-shell grid items-center gap-12 py-16 md:grid-cols-2 md:gap-20 md:py-24">
          <div>
            <p className="eyebrow text-blue">The idea behind CoinnectHub</p>
            <h2 className="section-title max-w-md">
              Money is part of life.
              <br />
              Understanding it
              <br />
              should be, too.
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-navy/75">
              We’re a nonprofit helping young people make sense of finance and
              economics. We start with familiar questions and make room to
              explore the answers.
            </p>
            <Link href="/about" className="button-secondary mt-7">
              Get to know us <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-navy bg-white p-7 sm:p-9">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow">
                <BookOpen size={21} />
              </span>
              <h3 className="text-lg font-extrabold">Start with your world.</h3>
            </div>
            <div className="space-y-6">
              <div className="border-b border-navy/10 pb-6">
                <p className="text-xl font-extrabold tracking-tight">
                  “Can I afford it?”
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/70">
                  Learn how saving a little today changes what’s possible
                  tomorrow.
                </p>
              </div>
              <div className="border-b border-navy/10 pb-6">
                <p className="text-xl font-extrabold tracking-tight">
                  “Why did that price change?”
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/70">
                  Explore the news, choices, and expectations behind a market.
                </p>
              </div>
              <p className="text-sm leading-7 text-navy/70">
                You don’t need to know the jargon to ask a good question.
              </p>
            </div>
          </div>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
