"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BookOpen,
  Coins,
  GraduationCap,
  Pause,
  Play,
} from "lucide-react";
import CoinMascot from "./coin-mascot";
import HeroFinanceLesson from "./hero-finance-lesson";
import { BudgetDemo, GoalDemo, NewsDemo } from "./finance-demos";

type Topic = "saving" | "stocks";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerMotion = () => true;

export default function Homepage() {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerMotion,
  );
  const [paused, setPaused] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [topic, setTopic] = useState<Topic>("saving");
  const motion = !reducedMotion && !paused;

  function selectTopic(next: Topic, focus = false) {
    setTopic(next);
    if (focus) document.getElementById(`topic-${next}`)?.focus();
  }

  return (
    <div className="coinnect-home" data-motion={motion ? "on" : "off"}>
      <section className="learning-hero">
        <div className="hero-grid-floor" aria-hidden="true" />
        <div className="learning-shell learning-hero-grid">
          <div className="learning-hero-copy">
            <h1>
              Five weeks.
              <br />
              Three headlines.
              <br />
              No login.
            </h1>
            <p>
              Two free games for ages 13 to 18. One is a five-week savings
              run. The other sorts fake stock headlines.
              <br />
              No account.
            </p>
            <div className="hero-audience-actions">
              <Link href="/games" className="learning-button">
                I'm a learner
              </Link>
              <Link
                href="/get-involved"
                className="learning-button learning-button-white"
              >
                I'm a parent or teacher
              </Link>
            </div>
            <p className="hero-footnote">
              Nonprofit. No account.
            </p>
          </div>
          <div className="hero-lesson-wrap">
            <HeroFinanceLesson motion={motion} />
            <button
              type="button"
              className="motion-toggle"
              onClick={() => setPaused((value) => !value)}
              disabled={reducedMotion}
              aria-pressed={paused}
            >
              {reducedMotion ? (
                <>
                  <Pause size={13} /> Reduced motion on
                </>
              ) : paused ? (
                <>
                  <Play size={13} /> Play animations
                </>
              ) : (
                <>
                  <Pause size={13} /> Pause animations
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section
        className="homepage-facts"
        aria-label="About the learning experience"
      >
        <div>
          <Coins size={31} strokeWidth={1.5} aria-hidden="true" />
          <h2>100% free</h2>
          <p>No login, no fee</p>
        </div>
        <div>
          <BookOpen size={31} strokeWidth={1.5} aria-hidden="true" />
          <h2>2 games</h2>
          <p>Five savings weeks, three headlines</p>
        </div>
        <div>
          <GraduationCap size={33} strokeWidth={1.5} aria-hidden="true" />
          <h2>Ages 13–18</h2>
          <p>Middle school and high school</p>
        </div>
      </section>

      <section className="penny-introduction" aria-labelledby="meet-penny">
        <button
          className={`penny-intro-mascot ${greeted ? "is-greeting" : ""}`}
          type="button"
          aria-label="Say hello to Penny"
          onClick={() => setGreeted((value) => !value)}
        >
          <CoinMascot />
        </button>
        <span className="sr-only" role="status">
          {greeted
            ? "Penny says hi. Saving and stocks are the two buttons under this."
            : ""}
        </span>
        <h2 id="meet-penny">This is Penny</h2>
        <div
          className="learning-topic-toggle"
          role="tablist"
          aria-label="Choose a learning topic"
        >
          {(["saving", "stocks"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`topic-${value}`}
              aria-selected={topic === value}
              aria-controls={`panel-${value}`}
              tabIndex={topic === value ? 0 : -1}
              onClick={() => selectTopic(value)}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  selectTopic(
                    event.key === "Home"
                      ? "saving"
                      : event.key === "End"
                        ? "stocks"
                        : topic === "saving"
                          ? "stocks"
                          : "saving",
                    true,
                  );
                }
              }}
            >
              {value === "saving" ? "Saving" : "Stocks"}
            </button>
          ))}
        </div>
      </section>

      <section
        className="learning-features learning-shell"
        key={topic}
        role="tabpanel"
        id={`panel-${topic}`}
        aria-labelledby={`topic-${topic}`}
        tabIndex={0}
      >
        {topic === "saving" ? (
          <>
            <div className="learning-feature">
              <div className="feature-visual">
                <BudgetDemo />
              </div>
              <div className="feature-copy">
                <h3>
                  You've got $50.
                </h3>
                <p>
                  Yellow coins stay. Blue ones get spent.
                </p>
                <p>
                  Drag the slider. At $20 saved, $30 is left for this week.
                </p>
              </div>
            </div>
            <div className="learning-feature feature-reverse">
              <div className="feature-visual">
                <GoalDemo />
              </div>
              <div className="feature-copy">
                <h3>
                  Headphones. $120.
                </h3>
                <p>$40 is already saved. $80 is left.</p>
                <p>
                  Tap $5, $10, or $20 a week. The full game runs five weeks of
                  this, and pizza or bus fare can take some of the cash.
                </p>
                <Link href="/games/savings" className="learning-text-link">
                  Play the five weeks <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="learning-feature">
              <div className="feature-visual">
                <NewsDemo />
              </div>
              <div className="feature-copy">
                <h3>
                  Loop Bikes beat the forecast.
                </h3>
                <p>
                  Investors expected an ordinary sales report. Orders came in
                  higher, and costs stayed flat.
                </p>
                <p>
                  Put that piece on buyers or sellers. The longer game has
                  three made-up companies, and Sunbeam's snack sells well while
                  the ingredients get more expensive.
                </p>
                <Link href="/games/stocks" className="learning-text-link">
                  Sort the headlines <ArrowRight size={17} />
                </Link>
              </div>
            </div>
            <div className="market-note">
              <span aria-hidden="true">?</span>
              <div>
                <h3>Same headline, two reads.</h3>
                <p>
                  The game shows how buyers and sellers might react. It will
                  not tell you the next price.
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="homepage-community">
        <div className="learning-shell">
          <div>
            <h2>
              Mr. Ferla started
              <br />
              this as a nonprofit.
            </h2>
            <p>
              He moved from Brazil to the United States and noticed some
              students already talked about saving at home, while others never
              had. You can play the games alone. A teacher can ask about a
              middle school workshop on the next page.
            </p>
            <div className="community-links">
              <Link href="/about" className="learning-button">
                About CoinnectHub
              </Link>
              <Link href="/get-involved" className="learning-text-link">
                Get involved <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <div className="community-note">
            <p>Two links.</p>
            <Link href="/games/savings">
              How long until I can afford it?
              <ArrowRight size={19} />
            </Link>
            <Link href="/games/stocks">
              What makes a stock move?
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
