"use client";

import { Bike, Headphones, RotateCcw, Ticket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  GOALS,
  PAYS,
  WEEK_BEATS,
  WEEK_COUNT,
  choiceAmounts,
  createRun,
  lockWeek,
  phase,
  readCustomGoal,
  snapshot,
  weeksLeft,
  type Pay,
  type Run,
} from "@/lib/week-game";

const icons = {
  headphones: Headphones,
  concert: Ticket,
  lights: Bike,
} as const;

const dollars = (amount: number) => `$${amount.toLocaleString("en-US")}`;

function choiceCopy(pay: number, amount: number) {
  if (amount === 0)
    return { title: `Keep ${dollars(pay)}`, detail: "for this week" };
  if (amount === pay)
    return { title: `Save ${dollars(pay)}`, detail: "all of it" };
  return {
    title: `Save ${dollars(amount)}`,
    detail: `Keep ${dollars(pay - amount)}`,
  };
}

function weeksText(weeks: number | null) {
  if (weeks === null) return "None";
  if (weeks === 0) return "Now";
  return String(weeks);
}

export default function WeekGame() {
  const [goalId, setGoalId] = useState(GOALS[0].id);
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saved, setSaved] = useState("");
  const [pay, setPay] = useState<Pay>(15);
  const [attempted, setAttempted] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusKey = run ? `${run.committed.length}-${phase(run)}` : "setup";

  useEffect(() => {
    headingRef.current?.focus();
  }, [focusKey]);

  if (!run) {
    const customRead = readCustomGoal(price, saved);
    return (
      <section className="rounded-[1.5rem] border border-navy/15 bg-white p-6 sm:p-9">
        <p className="eyebrow">Five weeks</p>
        <h2 className="text-3xl font-extrabold tracking-tight">
          What are you saving for?
        </h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-navy/80">
          Start with $40 toward a $120 pair of headphones, or pick another goal.
          Choose a weekly allowance, then decide how much to save each week.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {GOALS.map((goal) => {
            const Icon = icons[goal.id as keyof typeof icons];
            const selected = !custom && goalId === goal.id;
            return (
              <button
                key={goal.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setCustom(false);
                  setGoalId(goal.id);
                }}
                className={`rounded-2xl border p-4 text-left transition-colors ${selected ? "border-blue bg-sky" : "border-navy/20 bg-white hover:border-navy"}`}
              >
                <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
                <span className="mt-4 block text-lg font-extrabold">
                  {goal.name}
                </span>
                <span className="mt-1 block text-sm leading-6 text-navy/75">
                  {dollars(goal.price)} · {dollars(goal.saved)} saved
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-pressed={custom}
          onClick={() => setCustom(true)}
          className="mt-3 text-sm font-extrabold text-blue underline-offset-4 hover:underline"
        >
          Or use your own goal
        </button>
        {custom && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-bold">
              What is it?
              <input
                value={name}
                maxLength={40}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your goal"
                className="mt-2 min-h-12 w-full rounded-xl border border-navy/20 px-3 font-semibold focus:border-navy focus:outline-none"
              />
            </label>
            <NumberField
              label="Price"
              value={price}
              error={
                attempted && !customRead.ok ? customRead.priceError : undefined
              }
              onChange={setPrice}
            />
            <NumberField
              label="Already saved"
              value={saved}
              error={
                attempted && !customRead.ok ? customRead.savedError : undefined
              }
              onChange={setSaved}
            />
          </div>
        )}
        <p className="mt-8 text-sm font-extrabold">
          What do you get each week?
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
          {PAYS.map((amount) => (
            <button
              key={amount}
              type="button"
              aria-pressed={pay === amount}
              onClick={() => setPay(amount)}
              className={`min-h-12 rounded-xl border text-sm font-extrabold transition-colors ${pay === amount ? "border-navy bg-navy text-white" : "border-navy/20 hover:border-navy"}`}
            >
              {dollars(amount)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="button-primary mt-8"
          onClick={() => {
            if (custom) {
              setAttempted(true);
              if (!customRead.ok) return;
              setRun(
                createRun({
                  name: name.trim() || "Your goal",
                  price: customRead.price,
                  saved: customRead.saved,
                  pay,
                }),
              );
              return;
            }
            const goal = GOALS.find((item) => item.id === goalId) ?? GOALS[0];
            setRun(createRun({ ...goal, pay }));
          }}
        >
          Start week 1
        </button>
      </section>
    );
  }

  const view = snapshot(run);
  const step = phase(run);

  if (step === "done") {
    const added = view.saved - run.startSaved;
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-navy/15 bg-sky">
        <div className="p-6 sm:p-10">
          <p className="eyebrow">Your savings plan</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 text-3xl font-semibold tracking-tight focus:outline-none sm:text-4xl"
          >
            {view.reached
              ? "You reached your goal."
              : "Your five-week snapshot."}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8">
            {run.committed.length === 0
              ? `You already have enough saved for ${run.name}. Pick one that's still short if you want the five weeks.`
              : view.reached
                ? `${run.name} is covered in ${run.committed.length} ${run.committed.length === 1 ? "week" : "weeks"}. You added ${dollars(added)}. The shortest path here was ${view.benchmark} ${view.benchmark === 1 ? "week" : "weeks"}.`
                : view.weeks === null
                  ? `${run.name} is the same distance away. Putting the full ${dollars(run.pay)} on it from here would take ${weeksLeft(view.remaining, run.pay)} weeks.`
                  : `${run.name} is ${view.weeks} ${view.weeks === 1 ? "week" : "weeks"} out at your pace. The full ${dollars(run.pay)} each week from here would take ${weeksLeft(view.remaining, run.pay)} ${weeksLeft(view.remaining, run.pay) === 1 ? "week" : "weeks"}.`}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="On the goal" value={dollars(view.saved)} />
            <Stat label="Kept for the weeks" value={dollars(view.kept)} />
            <Stat
              label="Your pace"
              value={
                view.pace === 0
                  ? "$0/wk"
                  : `${dollars(Math.round(view.pace))}/wk`
              }
            />
          </div>
          <p className="mt-8 max-w-xl text-sm leading-7 font-semibold">
            {view.reached
              ? "That number under the shortest path is what happens when every week goes to the goal."
              : view.pace === 0
                ? "You kept each week's cash, so the price didn't move. One saved week would start a date."
                : "Your average week is on the card. Full weeks of the allowance from here would land sooner. The gap between those two numbers is the whole lesson."}
          </p>
          <button
            type="button"
            className="button-primary mt-8"
            onClick={() => setRun(null)}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Play another goal
          </button>
        </div>
        <p className="border-t border-navy/15 bg-white p-6 text-sm leading-7">
          Same amount each week in this game. No interest, taxes, or price
          changes, and nothing is saved to CoinnectHub.
        </p>
      </section>
    );
  }

  const beat = WEEK_BEATS[run.committed.length] ?? WEEK_BEATS[0];
  const progress = Math.min(100, (view.saved / run.price) * 100);
  const fromHere = weeksLeft(view.remaining, run.pay);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
      <section className="rounded-[1.5rem] border border-navy/15 bg-sky p-6 sm:p-9">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">
            Week {run.committed.length + 1} / {WEEK_COUNT}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            {WEEK_BEATS.map((item, index) => (
              <span
                key={item.title}
                className={`h-2.5 w-6 rounded-full ${index < run.committed.length ? "bg-navy" : index === run.committed.length ? "bg-navy/70" : "bg-navy/15"}`}
              />
            ))}
          </div>
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 text-3xl font-extrabold tracking-tight focus:outline-none sm:text-4xl"
        >
          {beat.title}
        </h2>
        <p className="mt-3 max-w-md text-base leading-7">{beat.detail}</p>
        <p className="mt-8 text-sm font-bold">{run.name}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight">
          {dollars(view.saved)}
          <span className="ml-2 text-lg font-bold text-navy/70">
            of {dollars(run.price)}
          </span>
        </p>
        <div
          className="mt-4 h-4 overflow-hidden rounded-full border border-navy/15 bg-white"
          role="progressbar"
          aria-valuenow={Math.floor(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Money on the goal"
        >
          <div
            className="h-full bg-navy transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4" aria-live="polite">
          <div>
            <p className="text-xs font-bold">If you keep this pace</p>
            <p className="mt-1 text-3xl font-extrabold">
              {weeksText(view.weeks)}
            </p>
            <p className="text-sm text-navy/75">
              {view.weeks === 0 ? "the goal is covered" : "at this pace"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold">Full amount from now</p>
            <p className="mt-1 text-3xl font-extrabold">
              {weeksText(fromHere)}
            </p>
            <p className="text-sm text-navy/75">saving the full amount</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-navy/15 bg-white p-6 sm:p-9">
        <h3 className="text-2xl font-extrabold tracking-tight">
          You have {dollars(run.pay)} this week.
        </h3>
        <p className="mt-2 text-sm leading-6 text-navy/75">
          Try each option to see how your plan changes, then lock your choice.
        </p>
        <div className="mt-6 grid gap-3">
          {choiceAmounts(run.pay).map((amount) => {
            const copy = choiceCopy(run.pay, amount);
            const selected = run.pending === amount;
            return (
              <button
                key={amount}
                type="button"
                aria-pressed={selected}
                onClick={() => setRun({ ...run, pending: amount })}
                className={`min-h-16 rounded-2xl border px-4 py-3 text-left transition-colors ${selected ? "border-blue bg-sky" : "border-navy/20 hover:border-navy"}`}
              >
                <span className="block text-lg font-extrabold">
                  {copy.title}
                </span>
                <span className="mt-1 block text-sm text-navy/75">
                  {copy.detail}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="button-primary mt-6 w-full disabled:opacity-40"
          disabled={run.pending === null}
          onClick={() => setRun(lockWeek(run))}
        >
          {run.committed.length === WEEK_COUNT - 1 ||
          (run.pending !== null && view.reached)
            ? "Finish the run"
            : "Lock this week"}
        </button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy/15 bg-white px-4 py-3">
      <p className="text-xs font-bold">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-navy/20 px-3 font-semibold focus:border-navy focus:outline-none"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}
