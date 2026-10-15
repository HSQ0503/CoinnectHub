"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Headphones, Plus, RotateCcw } from "lucide-react";
import CoinMascot from "./coin-mascot";

export function HeroSavingsDemo({ motion }: { motion: boolean }) {
  const [saved, setSaved] = useState(40);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!motion || !visible || manual) return;
    const timer = window.setInterval(
      () => setSaved((value) => (value >= 120 ? 20 : value + 10)),
      1900,
    );
    return () => window.clearInterval(timer);
  }, [motion, visible, manual]);
  function deposit() {
    setManual(true);
    setSaved((value) => (value >= 120 ? 0 : value + 10));
  }
  return (
    <div
      ref={cardRef}
      className="hero-lesson"
      aria-label="Interactive savings example"
    >
      <div className="hero-lesson-top">
        <span className="lesson-dot" /> A little each week
      </div>
      <div className="hero-goal">
        <span className="goal-icon">
          <Headphones size={21} strokeWidth={1.7} />
        </span>
        <span>
          New headphones<strong>$120 goal</strong>
        </span>
      </div>
      <div className="jar-scene">
        <svg
          viewBox="0 0 360 330"
          fill="none"
          aria-hidden="true"
          className="savings-jar"
        >
          <path
            d="M100 74V51C100 45 105 40 111 40H249C255 40 260 45 260 51V74"
            fill="#EAF3FC"
            stroke="#061B45"
            strokeWidth="2"
          />
          <path
            d="M97 73H263L278 107V274C278 286 268 296 256 296H104C92 296 82 286 82 274V107L97 73Z"
            fill="white"
            stroke="#061B45"
            strokeWidth="2.2"
          />
          <path
            d="M97 73H263M116 56H245"
            stroke="#061B45"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M97 122V264C97 274 102 280 112 280"
            stroke="#0875CF"
            strokeOpacity=".13"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((column) => {
              const index = row * 3 + column;
              return (
                <g
                  key={index}
                  className={`jar-coin ${saved / 10 > index ? "is-filled" : ""}`}
                  style={{
                    transformOrigin: `${130 + column * 50}px ${264 - row * 44}px`,
                  }}
                >
                  <ellipse
                    cx={130 + column * 50}
                    cy={264 - row * 44}
                    rx="20"
                    ry="19"
                    fill={saved / 10 > index ? "#FFCA20" : "#F6F8FB"}
                    stroke={saved / 10 > index ? "#061B45" : "#DFE6EF"}
                    strokeWidth="1.5"
                  />
                  {saved / 10 > index && (
                    <text
                      x={130 + column * 50}
                      y={269 - row * 44}
                      textAnchor="middle"
                      fill="#061B45"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="Arial,sans-serif"
                    >
                      $10
                    </text>
                  )}
                </g>
              );
            }),
          )}
          <path
            d="M282 114H307M282 159H300M282 204H300M282 249H307"
            stroke="#061B45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <text
            x="310"
            y="117"
            fill="#061B45"
            fontSize="10"
            fontFamily="Arial,sans-serif"
          >
            Goal
          </text>
          <ellipse
            cx="180"
            cy="312"
            rx="112"
            ry="5"
            fill="#061B45"
            opacity=".06"
          />
          {saved > 0 && saved < 120 && (
            <g key={saved} className="falling-coin">
              <circle
                cx="180"
                cy="16"
                r="15"
                fill="#FFCA20"
                stroke="#061B45"
                strokeWidth="1.8"
              />
              <path
                d="M175 11C177 7 185 8 184 13C183 17 174 13 175 18C176 22 184 22 186 18M180 6V24"
                stroke="#061B45"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>
        <CoinMascot
          className={`hero-penny ${saved >= 120 ? "penny-celebrates" : ""}`}
          pose="wave"
        />
      </div>
      <div
        className="hero-savings-output"
        aria-live={manual ? "polite" : "off"}
      >
        <span>
          <strong>${saved}</strong> <span>saved</span>
        </span>
        <span>{saved >= 120 ? "You did it!" : `$${120 - saved} to go`}</span>
      </div>
      <div
        className="hero-progress"
        role="progressbar"
        aria-label="Example savings progress"
        aria-valuenow={saved}
        aria-valuemin={0}
        aria-valuemax={120}
      >
        <span style={{ width: `${(saved / 120) * 100}%` }} />
      </div>
      <button type="button" onClick={deposit} className="deposit-button">
        {saved >= 120 ? (
          <>
            <RotateCcw size={16} /> Start again
          </>
        ) : (
          <>
            <Plus size={17} /> Save $10
          </>
        )}
        <span>{saved >= 120 ? "Try a new plan" : "Give it a try"}</span>
      </button>
    </div>
  );
}

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
        <span className="goal-line" /><span className="goal-chart-label">First 8 weeks</span>
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

const lessonSteps = ["Set a goal", "Try an idea", "See what changes"];
export function JourneyDemo() {
  const [step, setStep] = useState(0);
  return (
    <div className="journey-demo">
      <div className="journey-steps">
        {lessonSteps.map((label, index) => (
          <div
            key={label}
            className={
              index <= step ? "journey-step is-reached" : "journey-step"
            }
          >
            <span>{index < step ? <Check size={19} /> : index + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <div className="journey-mascot" style={{ left: `${13 + step * 32}%` }}>
        <CoinMascot pose={step === 2 ? "wave" : "happy"} />
      </div>
      <button
        type="button"
        onClick={() => setStep((value) => (value + 1) % 3)}
        className="journey-button"
      >
        {step === 2 ? "Try another idea" : "Take the next step"}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
