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
              Make sense
              <br />
              of money and
              <br />
              the markets.
            </h1>
            <p>
              Explore saving and investing through interactive activities.
              <br />
              Free financial education for teenagers.
            </p>
            <div className="hero-audience-actions">
              <Link href="/games" className="learning-button">
                I’m a learner
              </Link>
              <Link
                href="/get-involved"
                className="learning-button learning-button-white"
              >
                I’m a parent or teacher
              </Link>
            </div>
            <p className="hero-footnote">
              A nonprofit initiative. No account needed.
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
          <p>Financial education for everyone</p>
        </div>
        <div>
          <BookOpen size={31} strokeWidth={1.5} aria-hidden="true" />
          <h2>2 interactive tools</h2>
          <p>Practice saving and explore stocks</p>
        </div>
        <div>
          <GraduationCap size={33} strokeWidth={1.5} aria-hidden="true" />
          <h2>Made for teens</h2>
          <p>Designed for ages 13–18</p>
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
            ? "Hello from Penny! Choose a topic below to start exploring."
            : ""}
        </span>
        <h2 id="meet-penny">Meet Penny, your guide to money</h2>
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
                  Decide where
                  <br />
                  your money goes.
                </h3>
                <p>
                  You have $50. How much would you spend, and how much would you
                  keep for later?
                </p>
                <p>
                  Move the slider to try a different split. Every dollar you
                  save is a dollar you can put toward a future purchase.
                </p>
              </div>
            </div>
            <div className="learning-feature feature-reverse">
              <div className="feature-visual">
                <GoalDemo />
              </div>
              <div className="feature-copy">
                <h3>
                  Work out when
                  <br />
                  you can buy it.
                </h3>
                <p>
                  Choose something you want, enter its price, and see how long
                  it could take to save for it.
                </p>
                <p>
                  Change your weekly savings to compare timelines. The full
                  calculator also shows an estimated goal date.
                </p>
                <Link href="/games/savings" className="learning-text-link">
                  Try the savings calculator <ArrowRight size={17} />
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
                  Read the news.
                  <br />
                  Think it through.
                </h3>
                <p>
                  A company sells more than expected. Does that give investors a
                  reason to be interested?
                </p>
                <p>
                  Make a choice and read the explanation. In the full game, some
                  headlines have good and bad news at the same time.
                </p>
                <Link href="/games/stocks" className="learning-text-link">
                  Play the three-round game <ArrowRight size={17} />
                </Link>
              </div>
            </div>
            <div className="market-note">
              <span aria-hidden="true">?</span>
              <div>
                <h3>A headline isn’t a prediction.</h3>
                <p>
                  Investors can interpret the same news differently. Our game
                  explains possible reactions, rather than promising where a
                  stock’s price will go.
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
              Financial education
              <br />
              with a purpose.
            </h2>
            <p>
              CoinnectHub is a nonprofit helping young people learn about
              finance and economics. Try the activities on your own, use them to
              start a conversation at home, or bring a money question to class.
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
            <p>Start with a question.</p>
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
