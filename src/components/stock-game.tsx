"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ROUNDS,
  SIDES,
  allPlaced,
  factTotal,
  leanLabel,
  matchedFacts,
  placedSides,
  tilt,
  tiltPercent,
  type Side,
} from "@/lib/headline-game";

const total = factTotal(ROUNDS);

export default function StockGame() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [placements, setPlacements] = useState<Record<string, Side>>({});
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const round = ROUNDS[roundIndex];
  const playerTilt = tilt(
    placedSides(round.facts, placements),
    round.facts.length,
  );
  const answerTilt = tilt(
    round.facts.map((fact) => fact.side),
    round.facts.length,
  );
  const ready = allPlaced(round.facts, placements);
  const aligned = Math.abs(playerTilt - answerTilt) < 0.05;

  useEffect(() => {
    headingRef.current?.focus();
  }, [roundIndex, finished]);

  function place(id: string, side: Side) {
    if (revealed) return;
    setPlacements((current) => ({ ...current, [id]: side }));
  }

  function reveal() {
    if (!ready || revealed) return;
    setScore((current) => current + matchedFacts(round.facts, placements));
    setRevealed(true);
  }

  function next() {
    if (roundIndex === ROUNDS.length - 1) {
      setFinished(true);
      return;
    }
    setRoundIndex((current) => current + 1);
    setPlacements({});
    setRevealed(false);
  }

  function restart() {
    setRoundIndex(0);
    setPlacements({});
    setRevealed(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border-2 border-navy bg-yellow text-center">
        <div className="px-6 py-12 sm:p-14">
          <p className="eyebrow">Three stories. One scale.</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 text-4xl font-extrabold tracking-tight focus:outline-none sm:text-5xl"
          >
            Here's the count.
          </h2>
          <p className="mt-6 text-xl font-bold">
            {score} of {total} pieces landed on the same side as our reading.
          </p>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed">
            A stock is a small piece of a company. The price is whatever buyers
            and sellers agree to pay after they hear something new, like a
            delayed game or a sales number that beat the forecast.
          </p>
          <p className="mx-auto mt-4 max-w-xl font-semibold leading-relaxed">
            These are guesses about interest. The game does not tell you the
            next price.
          </p>
          <button type="button" onClick={restart} className="button-primary mt-8">
            <RotateCcw size={18} aria-hidden="true" />
            Play the three again
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
    <div className="mx-auto grid max-w-4xl gap-6">
      <section className="overflow-hidden rounded-[1.5rem] border-2 border-navy bg-yellow">
        <div className="flex items-center justify-between gap-3 border-b-2 border-navy px-6 py-4 sm:px-8">
          <span className="text-xs font-extrabold tracking-[0.13em] uppercase">
            The Coinnect Brief
          </span>
          <span className="rounded-full border border-navy px-3 py-1 text-xs font-bold">
            Story {roundIndex + 1} / {ROUNDS.length} · Fictional
          </span>
        </div>
        <div className="p-6 sm:p-9">
          <p className="eyebrow">{round.company}</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 max-w-2xl text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.04em] focus:outline-none"
          >
            {round.headline}
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-navy/25 bg-white/55 p-4">
              <p className="text-xs font-extrabold tracking-wide uppercase">
                Expected
              </p>
              <p className="mt-2 leading-7 font-bold">{round.expected}</p>
            </div>
            <div className="rounded-2xl border-2 border-navy bg-white p-4">
              <p className="text-xs font-extrabold tracking-wide uppercase">
                What happened
              </p>
              <p className="mt-2 leading-7 font-bold">{round.happened}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border-2 border-navy bg-white p-6 sm:p-9">
        <h3 className="text-2xl font-extrabold tracking-tight">
          Sort the pieces.
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-navy/75">
          Sellers, buyers, or not sure. The dot moves when you pick.
        </p>
        <Scale
          player={tiltPercent(playerTilt)}
          answer={revealed ? tiltPercent(answerTilt) : null}
          aligned={aligned}
          label={
            revealed
              ? leanLabel(answerTilt)
              : ready
                ? leanLabel(playerTilt)
                : "Place every piece to tip the scale."
          }
        />
        <div className="mt-8 grid gap-5">
          {round.facts.map((fact) => {
            const placed = placements[fact.id];
            const matches = revealed && placed === fact.side;
            return (
              <div
                key={fact.id}
                role="group"
                aria-labelledby={`fact-${round.company}-${fact.id}`}
                className={`rounded-2xl border-2 p-4 ${revealed && matches ? "border-navy bg-yellow/45" : "border-navy/15"}`}
              >
                <p
                  id={`fact-${round.company}-${fact.id}`}
                  className="text-base font-extrabold"
                >
                  {fact.text}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {SIDES.map((side) => (
                    <button
                      key={side.id}
                      type="button"
                      aria-pressed={placed === side.id}
                      disabled={revealed}
                      onClick={() => place(fact.id, side.id)}
                      className={`min-h-12 rounded-xl border-2 px-2 text-sm font-extrabold transition-colors ${placed === side.id ? "border-navy bg-navy text-white" : "border-navy/20 hover:border-navy"}`}
                    >
                      {side.label}
                    </button>
                  ))}
                </div>
                {revealed && (
                  <p className="mt-3 text-sm leading-6">
                    <span className="font-extrabold">
                      {matches ? "Same side we used. " : "We put this one somewhere else. "}
                    </span>
                    {fact.why}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div aria-live="polite">
          {revealed && (
            <p className="mt-6 border-t border-navy/15 pt-5 text-base leading-7 font-semibold">
              {round.lesson}
            </p>
          )}
        </div>
        {revealed ? (
          <button type="button" onClick={next} className="button-primary mt-6 w-full">
            {roundIndex === ROUNDS.length - 1 ? "See your count" : "Next story"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={reveal}
            disabled={!ready}
            className="button-primary mt-6 w-full disabled:opacity-40"
          >
            Tip the scale
          </button>
        )}
      </section>
    </div>
  );
}

function Scale({
  player,
  answer,
  aligned,
  label,
}: {
  player: number;
  answer: number | null;
  aligned: boolean;
  label: string;
}) {
  return (
    <div className="mt-8">
      <div className="relative mx-8 h-16">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-navy/15" />
        <div className="absolute top-1/2 left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy/30" />
        <div className="absolute top-1/2 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-navy/30" />
        {answer !== null && !aligned && (
          <span
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy bg-white"
            style={{ left: `${answer}%` }}
            aria-hidden="true"
          />
        )}
        <span
          className="absolute top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy bg-yellow transition-[left] duration-300 motion-reduce:transition-none"
          style={{ left: `${player}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs font-extrabold tracking-wide uppercase">
        <span>Sellers</span>
        <span>Buyers</span>
      </div>
      <p className="mt-3 text-sm font-bold" aria-live="polite">
        {label}
        {answer !== null && !aligned
          ? " The open dot is where we sorted them."
          : ""}
      </p>
    </div>
  );
}
