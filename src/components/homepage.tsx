"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, HeartHandshake, Sparkles } from "lucide-react";
import HeroFinanceLesson from "./hero-finance-lesson";
import { BudgetDemo, NewsDemo } from "./finance-demos";
import GameCards from "./game-cards";
import JoinBanner from "./join-banner";

type Topic = "saving" | "stocks";

export default function Homepage() {
  const [topic, setTopic] = useState<Topic>("saving");

  function selectTopic(next: Topic, focus = false) {
    setTopic(next);
    if (focus) document.getElementById(`topic-${next}`)?.focus();
  }

  return (
    <div className="coinnect-home">
      <section className="home-hero">
        <div className="container-shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="hero-intro">
              <span /> A youth financial literacy nonprofit
            </p>
            <h1>
              Money skills.
              <br />
              For real life.
            </h1>
            <p className="hero-description">
              Your first savings goal. Your first stock headline. A place to
              figure it out, one choice at a time.
            </p>
            <div className="hero-actions">
              <Link href="/games" className="button-primary">
                Explore the games <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/about" className="text-link">
                Meet CoinnectHub
              </Link>
            </div>
            <p className="hero-reassurance">
              <Check size={16} aria-hidden="true" /> Free to play. No account
              needed.
            </p>
          </div>
          <HeroFinanceLesson />
        </div>
      </section>

      <div className="learning-strip">
        <div className="container-shell">
          <span>
            <Sparkles size={18} aria-hidden="true" /> Made for curious minds,
            ages 13–18
          </span>
          <span>Every choice is a chance to learn.</span>
        </div>
      </div>

      <section
        className="container-shell section-space"
        aria-labelledby="games-heading"
      >
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Learn by doing</p>
            <h2 id="games-heading" className="section-title">
              Start with
              <br />
              an everyday choice.
            </h2>
          </div>
          <p className="section-description">
            Start with something familiar. Save for what you want, or find the
            story behind a stock headline.
          </p>
        </div>
        <GameCards />
      </section>

      <section className="practice-section">
        <div className="container-shell practice-grid">
          <div className="practice-copy">
            <p className="eyebrow">A quick warm-up</p>
            <h2 className="section-title">
              Try it
              <br />
              for yourself.
            </h2>
            <p className="body-copy">
              See how a different choice changes the picture. Try splitting a
              budget or reading your first market headline.
            </p>
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
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
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
                  {value === "saving"
                    ? "Saving & spending"
                    : "Reading the market"}
                </button>
              ))}
            </div>
          </div>
          <div
            className="practice-panel"
            key={topic}
            role="tabpanel"
            id={`panel-${topic}`}
            aria-labelledby={`topic-${topic}`}
            tabIndex={0}
          >
            {topic === "saving" ? <BudgetDemo /> : <NewsDemo />}
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="container-shell mission-grid">
          <div>
            <span className="mission-icon">
              <HeartHandshake size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h2 className="section-title">
              Money is part of life.
              <br />
              Learning about it
              <br />
              should be, too.
            </h2>
          </div>
          <div className="mission-copy">
            <p>
              Some young people grow up talking about money at home. Others have
              to work it out on their own.
            </p>
            <p>
              That gap is why Mr. Ferla started CoinnectHub. Through free games,
              short explanations, and middle school workshops, we make room for
              the questions students want to ask.
            </p>
            <Link href="/about" className="text-link">
              The story behind CoinnectHub{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <JoinBanner />
    </div>
  );
}
