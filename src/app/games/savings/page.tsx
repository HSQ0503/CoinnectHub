import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WeekGame from "@/components/week-game";

export const metadata: Metadata = {
  title: "How Long to Buy It?",
  description:
    "Five weeks with $10, $15, or $20. Headphones, a concert ticket, or bike lights. A free savings game from CoinnectHub.",
};

export default function SavingsPage() {
  return (
    <div className="container-shell py-10 sm:py-14 lg:py-18">
      <Link
        href="/games"
        className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        All games & tools
      </Link>
      <div className="mb-10 max-w-3xl sm:mb-12">
        <p className="eyebrow">Make a plan / 5 weeks</p>
        <h1 className="page-heading mt-4">
          How long to <span className="text-blue">buy it?</span>
        </h1>
        <p className="body-copy mt-5 max-w-2xl">
          Headphones are $120, with $40 already saved. A concert ticket and
          bike lights are the other two. Each week you get some cash, and pizza
          or bus fare can take part of it.
        </p>
      </div>
      <WeekGame />
      <p className="mt-7 text-sm leading-relaxed text-navy/75">
        Whole dollars, played in this browser. Nothing is submitted to
        CoinnectHub.
      </p>
    </div>
  );
}
