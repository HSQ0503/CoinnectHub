"use client";

import { useEffect, useRef, useState } from "react";

const weeklyOptions = [5, 10, 20];

export default function HeroFinanceLesson({ motion }: { motion: boolean }) {
  const [selected, setSelected] = useState(1);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const weekly = weeklyOptions[selected];
  const weeks = Math.ceil(80 / weekly);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!motion || !visible || manual) return;
    const interval = window.setInterval(
      () => setSelected((value) => (value + 1) % weeklyOptions.length),
      3200,
    );
    return () => window.clearInterval(interval);
  }, [motion, visible, manual]);

  return (
    <div
      className="hero-lesson"
      ref={container}
      aria-label="Interactive weekly savings lesson"
    >
      <div className="finance-lesson-sheet">
        <div className="finance-lesson-board" aria-hidden="true">
          <div className="lesson-board-label">
            <span>A $120 goal</span>
            <span>$40 already saved</span>
          </div>
          <div className="lesson-board-chart">
            {Array.from({ length: 8 }, (_, index) => {
              const balance = Math.min(120, 40 + weekly * (index + 1));
              return (
                <div className="lesson-chart-column" key={index}>
                  <span
                    className={
                      balance === 120
                        ? "lesson-chart-bar at-goal"
                        : "lesson-chart-bar"
                    }
                    style={{ height: `${(balance / 120) * 100}%` }}
                  />
                  <small>{index + 1}</small>
                </div>
              );
            })}
            <span className="lesson-chart-goal">$120</span>
          </div>
          <p>Weeks of saving</p>
        </div>
        <div className="finance-lesson-working">
          <div>
            <span className="lesson-line-number">1</span>
            <span>Your goal</span>
            <strong>$120</strong>
          </div>
          <div>
            <span className="lesson-line-number">2</span>
            <span>Already saved</span>
            <strong>$40</strong>
          </div>
          <div>
            <span className="lesson-line-number">3</span>
            <span>Save each week</span>
            <strong className="lesson-value">${weekly}</strong>
          </div>
          <div className="lesson-equation">
            <span className="lesson-line-number">4</span>
            <span>
              <b>$80</b> ÷ <b>${weekly}</b> = <strong>{weeks} weeks</strong>
            </span>
          </div>
        </div>
      </div>
      <div className="lesson-choice-area">
        <p>What if you saved a different amount?</p>
        <div
          className="lesson-choice-group"
          role="group"
          aria-label="Choose a weekly savings amount"
        >
          {weeklyOptions.map((amount, index) => (
            <button
              type="button"
              key={amount}
              aria-pressed={selected === index}
              onClick={() => {
                setManual(true);
                setSelected(index);
              }}
            >
              ${amount}
              <span>/week</span>
            </button>
          ))}
        </div>
        {!manual && (
          <svg
            viewBox="0 0 50 60"
            className="lesson-demo-cursor"
            aria-hidden="true"
            style={{ left: `${14 + selected * 32}%` }}
          >
            <path
              d="M7 4L42 31L25 34L18 52Z"
              fill="#061B45"
              stroke="white"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="sr-only" aria-live={manual ? "polite" : "off"}>
        Saving ${weekly} per week, you would reach this goal in {weeks} weeks.
      </p>
    </div>
  );
}
