"use client";

import { useState } from "react";

export function BudgetDemo() {
  const [saved, setSaved] = useState(20);
  return (
    <div className="budget-demo demo-surface">
      <p className="demo-kicker">You’ve got $50. Split it.</p>
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
      <p className="demo-hint">Move the slider to try a different split.</p>
    </div>
  );
}

export function NewsDemo() {
  const [selected, setSelected] = useState<"buyers" | "sellers" | null>(null);
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
        <p>Investors expected an ordinary report.</p>
      </div>
      <p className="news-demo-question">
        Where does “far more orders than expected” belong?
      </p>
      <div className="news-demo-choices">
        <button
          type="button"
          aria-pressed={selected === "buyers"}
          onClick={() => setSelected("buyers")}
        >
          Buyers
        </button>
        <button
          type="button"
          aria-pressed={selected === "sellers"}
          onClick={() => setSelected("sellers")}
        >
          Sellers
        </button>
      </div>
      <p className="news-demo-feedback" aria-live="polite">
        {selected === "buyers"
          ? "Buyers. People expected an ordinary report, and orders beat that."
          : selected === "sellers"
            ? "Check the forecast. Orders beat it, and costs stayed flat. That piece sits with buyers."
            : "Pick a side."}
      </p>
    </div>
  );
}
