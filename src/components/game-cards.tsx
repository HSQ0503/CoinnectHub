import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { GoalIllustration, StockIllustration } from "./illustrations";

export default function GameCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Link
        href="/games/savings"
        className="group overflow-hidden rounded-2xl border border-navy/15 bg-white transition-colors hover:border-blue"
      >
        <div className="h-56 border-b border-navy/10 bg-blue/5 px-3 sm:h-64">
          <GoalIllustration />
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-blue/7 px-3 py-1 text-xs font-bold text-navy">
              Saving & planning
            </span>
            <span className="flex items-center gap-1.5 text-xs text-navy/65">
              <Clock3 size={13} /> At your pace
            </span>
          </div>
          <h3 className="text-[25px] font-extrabold tracking-tight">
            How long to buy it?
          </h3>
          <p className="mt-3 max-w-[370px] text-sm leading-7 text-navy/70">
            That thing you’ve been saving for? Give it a plan. See how a little
            each week adds up.
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-5 text-sm font-extrabold">
            Make a savings plan{" "}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition-colors group-hover:bg-blue">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      </Link>
      <Link
        href="/games/stocks"
        className="group overflow-hidden rounded-2xl border border-navy/15 bg-white transition-colors hover:border-blue"
      >
        <div className="h-56 border-b border-navy/10 bg-yellow/15 px-3 sm:h-64">
          <StockIllustration />
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-yellow/25 px-3 py-1 text-xs font-bold text-navy">
              Stocks & decisions
            </span>
            <span className="flex items-center gap-1.5 text-xs text-navy/65">
              <Clock3 size={13} /> About 1 minute
            </span>
          </div>
          <h3 className="text-[25px] font-extrabold tracking-tight">
            What moves a stock?
          </h3>
          <p className="mt-3 max-w-[370px] text-sm leading-7 text-navy/70">
            A company makes the news. What might investors do? Read the story
            and make your call.
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-5 text-sm font-extrabold">
            Play the news{" "}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition-colors group-hover:bg-blue">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
