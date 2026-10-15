"use client";

import { useState } from "react";
import { Headphones } from "lucide-react";

export function BudgetDemo() {
  const [saved, setSaved] = useState(20);
  return (
    <div className="budget-demo demo-surface">
      <p className="demo-kicker">You have $50. What’s your plan?</p>
      <div className="budget-coins" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span className={i < saved / 5 ? "is-saving" : "is-spending"} key={i}>
            <span>$5</span>
          </span>
        ))}
      </div>
      <div className="budget-totals">
        <div>
          <span className="budget-key" /> Save<strong>${saved}</strong>
        </div>
        <div>
          <span className="budget-key spending-key" /> Spend
          <strong>${50 - saved}</strong>
        </div>
      </div>
      <label className="sr-only" htmlFor="budget-demo-range">
        Amount to save from $50
      </label>
      <input
        id="budget-demo-range"
        type="range"
        min="0"
        max="50"
        step="5"
        value={saved}
        onChange={(event) => setSaved(Number(event.target.value))}
      />
      <p className="demo-hint">Move the slider. Find your balance.</p>
    </div>
  );
}

export function GoalDemo() {
  const [weekly, setWeekly] = useState(10);
  const weeks = Math.ceil(80 / weekly);
  return (
    <div className="goal-demo demo-surface">
      <div className="goal-demo-heading">
        <Headphones size={32} strokeWidth={1.5} />
        <span>
          Your next pair of headphones<strong>$40 saved of $120</strong>
        </span>
      </div>
      <div className="goal-demo-chart" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
          <div key={week}>
            <span
              style={{
                height: `${(Math.min(120, 40 + weekly * week) / 120) * 100}%`,
              }}
              className={week >= weeks ? "goal-bar-complete" : ""}
            />
            <small>{week}</small>
          </div>
        ))}
        <span className="goal-line" />
        <span className="goal-chart-label">First 8 weeks</span>
      </div>
      <div
        className="weekly-options"
        role="group"
        aria-label="Example weekly savings"
      >
        {[5, 10, 20].map((amount) => (
          <button
            key={amount}
            type="button"
            aria-pressed={weekly === amount}
            onClick={() => setWeekly(amount)}
          >
            ${amount}/week
          </button>
        ))}
      </div>
      <p className="goal-demo-result" aria-live="polite">
        Your goal, in <strong>{weeks} weeks.</strong>
      </p>
    </div>
  );
}

export function NewsDemo() {
  const [selected, setSelected] = useState<"buy" | "sell" | null>(null);
  return (
    <div className="news-demo demo-surface">
      <div className="news-demo-top">
        <span className="news-brand">The Coinnect Brief</span>
        <span>Fictional news</span>
      </div>
      <div className="news-demo-story">
        <span>Loop Bikes</span>
        <h4>
          More orders.
          <br />
          Same costs.
        </h4>
        <p>Sales are stronger than investors expected.</p>
      </div>
      <p className="news-demo-question">What might investors think?</p>
      <div className="news-demo-choices">
        <button
          type="button"
          aria-pressed={selected === "buy"}
          onClick={() => setSelected("buy")}
        >
          More interested
        </button>
        <button
          type="button"
          aria-pressed={selected === "sell"}
          onClick={() => setSelected("sell")}
        >
          More cautious
        </button>
      </div>
      <p className="news-demo-feedback" aria-live="polite">
        {selected === "buy"
          ? "That’s a reasonable reaction. More sales at steady costs could mean higher profits."
          : selected === "sell"
            ? "Take another look: stronger sales with steady costs could make investors more interested."
            : "Choose a response to see the reasoning."}
      </p>
    </div>
  );
}
