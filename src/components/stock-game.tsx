"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Lightbulb,
  Minus,
  RotateCcw,
} from "lucide-react";
import { useRef, useState } from "react";

type Choice = "buying" | "selling" | "mixed";

const choices = [
  {
    id: "buying",
    label: "More buying interest",
    detail: "Investors see a reason to be optimistic.",
    icon: ArrowUpRight,
  },
  {
    id: "selling",
    label: "More selling interest",
    detail: "Investors see a reason to be cautious.",
    icon: ArrowDownRight,
  },
  {
    id: "mixed",
    label: "It’s mixed",
    detail: "There are reasons on both sides.",
    icon: Minus,
  },
] as const;

const rounds: {
  company: string;
  category: string;
  headline: string;
  news: string;
  answer: Choice;
  explanation: string;
  lesson: string;
}[] = [
  {
    company: "Loop Bikes",
    category: "A surprise in the sales report",
    headline: "More riders. More orders.",
    news: "Loop Bikes reports far more bike orders than investors expected. The company says its costs have stayed steady.",
    answer: "buying",
    explanation:
      "Stronger sales with steady costs could mean higher profits. That may make more investors interested in owning a piece of the company.",
    lesson: "What matters is how news compares with what investors expected.",
  },
  {
    company: "Pixel Play",
    category: "A change of plans",
    headline: "The big release will have to wait.",
    news: "Pixel Play unexpectedly delays its biggest game until next year. It now expects lower sales this year, while development costs keep rising.",
    answer: "selling",
    explanation:
      "Lower expected sales and higher costs can make investors less confident about future profits. Some might want to sell, though others may still believe in the company’s longer-term plans.",
    lesson:
      "Investors can respond to expectations about the future, before the results arrive.",
  },
  {
    company: "Sunbeam Snacks",
    category: "Two sides to the story",
    headline: "A hit snack. A bigger bill.",
    news: "Demand for Sunbeam’s new snack is stronger than expected. But ingredients now cost much more, and the company hasn’t said how the two changes will affect profits.",
    answer: "mixed",
    explanation:
      "More demand could help sales, while higher ingredient costs could reduce profits. Investors need more information to judge which effect matters more.",
    lesson:
      "One headline rarely tells the whole story. Different investors can reach different conclusions.",
  },
];

export default function StockGame() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const round = rounds[roundIndex];
  const isCorrect = selected === round.answer;

  function choose(choice: Choice) {
    if (selected) return;
    setSelected(choice);
    if (choice === round.answer) setScore((current) => current + 1);
  }

  function nextRound() {
    if (roundIndex === rounds.length - 1) {
      setFinished(true);
    } else {
      setRoundIndex((current) => current + 1);
      setSelected(null);
    }
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function restart() {
    setRoundIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  if (finished) {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border-2 border-navy bg-yellow text-center">
        <div className="px-6 py-12 sm:p-14">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-navy bg-white">
            <Check size={30} aria-hidden="true" />
          </span>
          <p className="eyebrow mt-7">Three headlines. A new perspective.</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 text-4xl font-extrabold tracking-tight focus:outline-none sm:text-5xl"
          >
            There’s more to the story.
          </h2>
          <p className="mt-6 text-xl font-bold">
            {score} of 3 matched the strongest explanation.
          </p>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed">
            A stock is a small ownership share in a company. Its price reflects
            what buyers and sellers are willing to pay, shaped by expectations,
            new information, and uncertainty.
          </p>
          <p className="mx-auto mt-4 max-w-xl font-semibold leading-relaxed">
            These choices explain possible investor reactions. They don’t
            predict what a stock’s price will do.
          </p>
          <button
            type="button"
            onClick={restart}
            className="button-primary mt-8 inline-flex items-center gap-3"
          >
            <RotateCcw size={18} aria-hidden="true" />
            Play again
          </button>
        </div>
        <div className="border-t-2 border-navy bg-white p-6 text-sm leading-relaxed">
          Keep exploring:{" "}
          <a
            className="font-bold underline decoration-2 underline-offset-4"
            href="https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks"
            target="_blank"
            rel="noreferrer"
          >
            Learn about stocks at Investor.gov{" "}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.04fr] lg:gap-8">
      <section
        className="overflow-hidden rounded-[1.5rem] border-2 border-navy bg-yellow"
        aria-labelledby="stock-headline"
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-navy px-6 py-4 sm:px-8">
          <span className="text-xs font-extrabold tracking-[0.13em] uppercase">
            The Coinnect Brief
          </span>
          <span className="rounded-full border border-navy px-3 py-1 text-xs font-bold">
            Fictional news
          </span>
        </div>
        <div className="p-6 sm:p-9">
          <p className="eyebrow">{round.company}</p>
          <h2
            id="stock-headline"
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 text-[clamp(2.5rem,5vw,4rem)] leading-[1.06] font-extrabold tracking-[-0.05em] focus:outline-none"
          >
            {round.headline}
          </h2>
          <p className="mt-6 text-lg leading-relaxed">{round.news}</p>
          <div className="mt-9 flex items-center gap-3 border-t border-navy/25 pt-5">
            <span
              className="size-2 shrink-0 rounded-full bg-navy"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold">{round.category}</p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="stock-choice-heading"
        className="rounded-[1.5rem] border-2 border-navy bg-white p-6 sm:p-9"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <p className="eyebrow">Round {roundIndex + 1} / 3</p>
          <div className="flex gap-2" aria-hidden="true">
            {rounds.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-9 rounded-full ${index <= roundIndex ? "bg-navy" : "bg-navy/15"}`}
              />
            ))}
          </div>
        </div>
        <h3
          id="stock-choice-heading"
          className="text-2xl font-extrabold leading-tight tracking-tight"
        >
          How might investors respond?
        </h3>
        <p className="mt-3 text-sm leading-relaxed">
          Choose the reaction this news gives the strongest reason for.
        </p>
        <div className="mt-6 grid gap-3">
          {choices.map(({ id, label, detail, icon: Icon }) => {
            const picked = selected === id;
            const bestAnswer = selected !== null && round.answer === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                disabled={selected !== null}
                aria-pressed={picked}
                className={`flex min-h-20 w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors enabled:cursor-pointer enabled:hover:border-navy enabled:hover:bg-yellow/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${bestAnswer ? "border-navy bg-yellow" : picked ? "border-navy bg-white" : "border-navy/20 bg-white"}`}
              >
                <Icon size={24} className="shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-base font-extrabold">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed sm:text-sm">
                    {detail}
                  </span>
                  {picked && (
                    <span className="mt-2 block text-xs font-bold">
                      Your choice{bestAnswer ? " (best fit)" : ""}
                    </span>
                  )}
                  {bestAnswer && !picked && (
                    <span className="mt-2 block text-xs font-bold">
                      Best fit
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <div aria-live="polite" aria-atomic="true">
          {selected && (
            <div className="mt-7 border-t border-navy/20 pt-6">
              <p className="flex items-center gap-2 font-extrabold">
                <Lightbulb size={20} className="shrink-0" aria-hidden="true" />
                {isCorrect
                  ? "You spotted the signal."
                  : "Here’s another way to read it."}
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                {round.explanation}
              </p>
              <p className="mt-3 text-sm font-bold leading-relaxed">
                {round.lesson}
              </p>
            </div>
          )}
        </div>
        {selected && (
          <button
            type="button"
            onClick={nextRound}
            className="button-primary mt-6 inline-flex w-full items-center justify-between gap-4"
          >
            {roundIndex === rounds.length - 1
              ? "See the big picture"
              : "Next headline"}
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        )}
      </section>
    </div>
  );
}
