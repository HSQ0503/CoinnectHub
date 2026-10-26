"use client";

import { useState } from "react";
import { Target, Headphones } from "lucide-react";
import CoinMascot from "./coin-mascot";

export default function HeroFinanceLesson() {
  const [weekly, setWeekly] = useState(10);
  const weeks = Math.ceil(80 / weekly);

  return (
    <div className="goal-stage">
      <div className="goal-stage-ring" aria-hidden="true" />
      <div className="goal-stage-caption">
        <span /> Small amounts add up over time
      </div>
      <div
        className="hero-goal-card"
        aria-label="Interactive weekly savings lesson"
      >
        <div className="goal-card-header">
          <span>Your next big thing</span>
          <Target size={19} aria-hidden="true" />
        </div>
        <div className="goal-product">
          <div className="headphone-drawing">
            <Headphones strokeWidth={1.25} aria-hidden="true" />
          </div>
          <div>
            <p>A new pair of headphones</p>
            <strong>
              $120<span> savings goal</span>
            </strong>
          </div>
        </div>
        <div className="goal-progress-label">
          <span>$40 saved</span>
          <span>$80 to go</span>
        </div>
        <div
          className="goal-progress"
          role="progressbar"
          aria-label="Already saved toward headphones"
          aria-valuenow={40}
          aria-valuemin={0}
          aria-valuemax={120}
        >
          <span />
        </div>
        <fieldset className="hero-weekly-options">
          <legend>How much could you save each week?</legend>
          <div>
            {[5, 10, 20].map((amount) => (
              <button
                key={amount}
                type="button"
                aria-pressed={weekly === amount}
                onClick={() => setWeekly(amount)}
              >
                ${amount}
                <span>/ week</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="goal-arrival" aria-live="polite">
          <div>
            <span>You could get there in</span>
            <strong>{weeks} weeks</strong>
          </div>
          <div className="arrival-bars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} style={{ height: `${16 + n * 7}px` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="hero-penny">
        <CoinMascot />
        <span>
          Meet Penny,
          <br />
          your learning buddy
        </span>
      </div>
    </div>
  );
}
