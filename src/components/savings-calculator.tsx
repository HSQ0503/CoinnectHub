"use client";

import { CalendarDays, Check, Flag, MoveRight, PiggyBank } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
  calculateSavings,
  MAX_AMOUNT,
  type SavingsFields,
} from "@/lib/savings";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const money = (cents: number) => currency.format(cents / 100);
const number = new Intl.NumberFormat("en-US");

function getLocalDay() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function subscribeToLocalDay(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener("focus", onChange);
  };
}

const getServerDay = () => null;

const fieldLabels: Record<keyof SavingsFields, string> = {
  price: "How much does it cost?",
  saved: "How much have you saved?",
  weekly: "What can you save each week?",
};

export default function SavingsCalculator() {
  const [item, setItem] = useState("A new pair of headphones");
  const [fields, setFields] = useState<SavingsFields>({
    price: "120",
    saved: "40",
    weekly: "10",
  });
  const localDay = useSyncExternalStore(
    subscribeToLocalDay,
    getLocalDay,
    getServerDay,
  );
  const result = calculateSavings(
    fields,
    localDay ? new Date(`${localDay}T12:00:00`) : new Date(Number.NaN),
  );
  const weeklyAmount = Number(fields.weekly);
  const sliderMax =
    Number.isFinite(weeklyAmount) && weeklyAmount > 100
      ? Math.min(MAX_AMOUNT, Math.ceil(weeklyAmount / 50) * 50)
      : 100;
  const sliderValue = Number.isFinite(weeklyAmount)
    ? Math.min(sliderMax, Math.max(0, weeklyAmount))
    : 0;
  const updateField = (field: keyof SavingsFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.04fr_1fr] lg:gap-8">
      <section
        className="min-w-0 rounded-[1.5rem] border-2 border-navy bg-white p-6 sm:p-9"
        aria-labelledby="your-goal-heading"
      >
        <div className="mb-8 flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-full bg-yellow font-extrabold"
            aria-hidden="true"
          >
            01
          </span>
          <h2
            id="your-goal-heading"
            className="text-2xl font-extrabold tracking-tight"
          >
            Make it your goal.
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="saving-item"
              className="mb-2 block text-sm font-bold"
            >
              What are you saving for?
            </label>
            <input
              id="saving-item"
              type="text"
              maxLength={80}
              value={item}
              onChange={(event) => setItem(event.target.value)}
              placeholder="Your next big (or small) thing"
              className="min-h-14 w-full rounded-xl border-2 border-navy/20 bg-white px-4 py-3 text-base font-semibold text-navy transition-colors focus:border-navy focus:outline-none"
            />
          </div>

          {(["price", "saved", "weekly"] as const).map((field) => {
            const error =
              result.status === "invalid" ? result.errors[field] : undefined;
            return (
              <div key={field}>
                <label
                  htmlFor={`saving-${field}`}
                  className="mb-2 block text-sm font-bold"
                >
                  {fieldLabels[field]}
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <input
                    id={`saving-${field}`}
                    type="number"
                    inputMode="decimal"
                    min={field === "price" ? 0.01 : 0}
                    max={MAX_AMOUNT}
                    step="0.01"
                    value={fields[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? `saving-${field}-error` : undefined
                    }
                    className="min-h-14 w-full rounded-xl border-2 border-navy/20 bg-white py-3 pr-4 pl-9 text-base font-semibold text-navy transition-colors focus:border-navy focus:outline-none aria-invalid:border-navy"
                  />
                </div>
                {error && (
                  <p
                    id={`saving-${field}-error`}
                    className="mt-2 text-sm font-semibold"
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          <div className="border-t border-navy/15 pt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="weekly-slider" className="text-sm font-bold">
                Try a different weekly amount
              </label>
              <span className="text-sm font-extrabold">
                {currency.format(sliderValue)} / week
              </span>
            </div>
            <input
              id="weekly-slider"
              type="range"
              min="0"
              max={sliderMax}
              step="0.01"
              value={sliderValue}
              aria-valuetext={`${currency.format(sliderValue)} per week`}
              onChange={(event) => updateField("weekly", event.target.value)}
              className="min-h-11 w-full cursor-pointer accent-navy"
            />
            <div
              className="flex justify-between text-xs font-semibold"
              aria-hidden="true"
            >
              <span>$0</span>
              <span>{currency.format(sliderMax)}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="min-w-0 overflow-hidden rounded-[1.5rem] border-2 border-navy bg-yellow"
        aria-labelledby="your-plan-heading"
      >
        <div className="p-6 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <p id="your-plan-heading" className="eyebrow">
              Your savings plan
            </p>
            <PiggyBank size={32} strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h2 className="mt-7 [overflow-wrap:anywhere] text-2xl font-extrabold tracking-tight sm:text-3xl">
            {item.trim() || "Your next goal"}
          </h2>

          <div
            className="min-h-48 py-8"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {result.status === "invalid" && (
              <>
                <p className="text-3xl font-extrabold tracking-tight">
                  Let’s fill in the gaps.
                </p>
                <p className="mt-4 max-w-sm leading-relaxed">
                  Check your amounts to see your savings timeline.
                </p>
              </>
            )}
            {result.status === "complete" && (
              <>
                <Check size={40} strokeWidth={2} aria-hidden="true" />
                <p className="mt-3 text-4xl font-extrabold tracking-tight">
                  You’re already there!
                </p>
                <p className="mt-4 leading-relaxed">
                  You have enough saved to cover your {money(result.priceCents)}{" "}
                  goal.
                </p>
              </>
            )}
            {result.status === "paused" && (
              <>
                <p className="text-3xl font-extrabold tracking-tight">
                  A little each week adds up.
                </p>
                <p className="mt-4 leading-relaxed">
                  You have {money(result.remainingCents)} to go. Try a weekly
                  amount above $0 to see when you could reach your goal.
                </p>
              </>
            )}
            {result.status === "planned" && (
              <>
                <p className="[overflow-wrap:anywhere] text-[clamp(3.25rem,7vw,6.5rem)] leading-none font-extrabold tracking-[-0.07em]">
                  {number.format(result.weeks)}
                  <span className="ml-3 text-2xl tracking-tight sm:text-3xl">
                    {result.weeks === 1 ? "week" : "weeks"}
                  </span>
                </p>
                <p className="mt-5 flex items-start gap-2 text-sm font-semibold leading-relaxed sm:text-base">
                  <CalendarDays
                    className="mt-0.5 shrink-0"
                    size={19}
                    aria-hidden="true"
                  />
                  {!localDay ? (
                    <span>Calculating your goal date…</span>
                  ) : result.targetDate ? (
                    <span>
                      Goal date:{" "}
                      <time
                        dateTime={`${result.targetDate.getFullYear()}-${String(result.targetDate.getMonth() + 1).padStart(2, "0")}-${String(result.targetDate.getDate()).padStart(2, "0")}`}
                      >
                        {result.targetDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </span>
                  ) : (
                    <span>
                      That date is too far away to display. Try increasing your
                      weekly savings.
                    </span>
                  )}
                </p>
              </>
            )}
          </div>

          {result.status !== "invalid" && (
            <>
              <div className="mb-3 flex justify-between gap-4 text-sm font-bold">
                <span>{Math.floor(result.progress)}% saved</span>
                <span>{money(result.remainingCents)} to go</span>
              </div>
              <div
                role="progressbar"
                aria-label="Savings goal progress"
                aria-valuenow={Math.floor(result.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-4 overflow-hidden rounded-full border-2 border-navy bg-white"
              >
                <div
                  className="h-full rounded-full bg-navy transition-[width] duration-200 motion-reduce:transition-none"
                  style={{ width: `${result.progress}%` }}
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-navy/20 pt-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Saved today
                  </p>
                  <p className="mt-1 text-xl font-extrabold">
                    {money(result.savedCents)}
                  </p>
                </div>
                <MoveRight size={24} aria-hidden="true" />
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Your goal
                  </p>
                  <p className="mt-1 text-xl font-extrabold">
                    {money(result.priceCents)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 border-t-2 border-navy bg-white p-6 sm:px-9">
          <Flag size={22} className="mt-1 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            Your first deposit happens one week from today. This estimate uses
            the same amount each week and doesn’t include interest, taxes, or
            price changes.
          </p>
        </div>
      </section>
    </div>
  );
}
