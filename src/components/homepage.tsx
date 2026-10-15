"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Coins,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Landmark,
  Newspaper,
  Pause,
  Play,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import CoinMascot from "./coin-mascot";
import {
  BudgetDemo,
  GoalDemo,
  HeroSavingsDemo,
  JourneyDemo,
  NewsDemo,
} from "./finance-demos";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerMotion = () => true;

const topics = [
  { label: "Saving", icon: Coins, href: "/games/savings" },
  { label: "Budgeting", icon: Wallet, href: "#budgeting" },
  { label: "Everyday choices", icon: HandCoins, href: "#budgeting" },
  { label: "Stocks & markets", icon: Landmark, href: "/games/stocks" },
  { label: "Economics", icon: Newspaper, href: "#headlines" },
];

const features = [
  {
    id: "budgeting",
    title: (
      <>
        See the idea.
        <br />
        Try it yourself.
      </>
    ),
    description:
      "Move money between spending and saving. Watch your plan change. Finance feels a lot more familiar when you can explore it with your own hands.",
    detail: "Start here: how would you split $50?",
    Demo: BudgetDemo,
  },
  {
    id: "goals",
    title: (
      <>
        Start with a goal
        <br />
        that matters to you.
      </>
    ),
    description:
      "A new pair of headphones. A bike. Something you’ve had your eye on. Turn ‘one day’ into a plan you can understand.",
    detail: "Try different weekly amounts and see how your timeline changes.",
    Demo: GoalDemo,
    href: "/games/savings",
    link: "Make your own savings plan",
  },
  {
    id: "headlines",
    title: (
      <>
        A few minutes.
        <br />A new way to read the news.
      </>
    ),
    description:
      "Why might a company’s stock price change? Read a fictional headline, make a choice, and explore the reasoning behind it.",
    detail:
      "Some stories have more than one side. Learning to spot that is part of the game.",
    Demo: NewsDemo,
    href: "/games/stocks",
    link: "Try the three-round game",
  },
  {
    id: "curiosity",
    title: (
      <>
        Keep asking
        <br />
        ‘what if?’
      </>
    ),
    description:
      "What if you saved a little more? What if a company’s costs went up? Try a different choice and see how it changes your thinking.",
    detail:
      "There’s room to experiment here. You can start again as often as you like.",
    Demo: JourneyDemo,
  },
];

const audiences = [
  {
    title: "For young people",
    Icon: GraduationCap,
    description:
      "Start with something you want to buy, or a question you’ve never quite understood. You can go at your own pace.",
    href: "/games",
    link: "Start exploring",
  },
  {
    title: "For parents",
    Icon: HeartHandshake,
    description:
      "Use an everyday purchase or savings goal to start a conversation. Explore a tool together and compare your choices.",
    href: "/about",
    link: "Our approach",
  },
  {
    title: "For educators",
    Icon: BookOpen,
    description:
      "Make room for a money question in your classroom. Our short activities can be a starting point for discussion.",
    href: "/get-involved",
    link: "Get involved",
  },
];

export default function Homepage() {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerMotion,
  );
  const [paused, setPaused] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const motion = !reducedMotion && !paused;

  return (
    <div className="coinnect-home" data-motion={motion ? "on" : "off"}>
      <section className="learning-hero">
        <div className="hero-grid-floor" aria-hidden="true" />
        <div className="learning-shell learning-hero-grid">
          <div className="learning-hero-copy">
            <h1>
              Your head start
              <br />
              on money and
              <br />
              everyday life.
            </h1>
            <p>
              Learn how money works by trying it yourself.
              <br className="desktop-break" /> Free games and tools for a
              generation with
              <br className="desktop-break" /> big questions and bright ideas.
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
            <div className="hero-promises">
              <span>
                <BookOpen size={20} strokeWidth={1.6} /> Free to explore
              </span>
              <span>
                <ShieldCheck size={20} strokeWidth={1.6} /> No sign-up needed
              </span>
            </div>
          </div>
          <div className="hero-lesson-wrap">
            <HeroSavingsDemo motion={motion} />
            <button
              type="button"
              className="motion-toggle"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              disabled={reducedMotion}
            >
              {reducedMotion ? (
                <>
                  <Pause size={12} /> Reduced motion on
                </>
              ) : paused ? (
                <>
                  <Play size={12} /> Play animations
                </>
              ) : (
                <>
                  <Pause size={12} /> Pause animations
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <nav
        className="topic-navigation learning-shell"
        aria-label="Explore money topics"
      >
        {topics.map(({ label, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Icon size={23} strokeWidth={1.7} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <section className="learning-promise-band">
        <div className="learning-shell">
          <h2>Financial education, open to everyone.</h2>
          <div className="promise-columns">
            <div>
              <HeartHandshake size={29} />
              <span>
                <strong>A nonprofit with a purpose</strong>
                <small>Helping young people understand money.</small>
              </span>
            </div>
            <div>
              <BookOpen size={29} />
              <span>
                <strong>Learn by doing</strong>
                <small>Try an idea and see what changes.</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={29} />
              <span>
                <strong>Free to explore</strong>
                <small>No account or payment needed.</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="learning-features learning-shell">
        <div className="learning-section-heading">
          <h2>Make everyday money make sense.</h2>
          <p>
            Start with what you know. Follow your curiosity.
            <br />
            Each small activity gives you something to think about.
          </p>
        </div>
        {features.map(
          ({ id, title, description, detail, Demo, href, link }, index) => (
            <div
              key={id}
              className={`learning-feature ${index % 2 ? "feature-reverse" : ""}`}
              id={id}
            >
              <div className="feature-visual">
                <Demo />
              </div>
              <div className="feature-copy">
                <h3>{title}</h3>
                <p>{description}</p>
                <p>{detail}</p>
                {href && (
                  <Link className="learning-text-link" href={href}>
                    {link} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          ),
        )}
      </section>

      <section className="learning-library">
        <div className="learning-shell">
          <div className="learning-section-heading">
            <h2>Your next money question starts here.</h2>
            <p>Two ways to learn. Plenty of possibilities.</p>
          </div>
          <div className="learning-tool-grid">
            <Link href="/games/savings" className="learning-tool">
              <div className="tool-art saving-tool-art">
                <div className="tool-coin tool-coin-one">$</div>
                <div className="tool-coin tool-coin-two">$</div>
                <div className="tool-coin tool-coin-three">$</div>
                <div className="tool-goal-flag">
                  Your goal
                  <Check size={16} />
                </div>
              </div>
              <div className="tool-copy">
                <span>Saving & planning</span>
                <h3>How long to buy it?</h3>
                <p>
                  Make a savings goal. Find out what a little each week can do.
                </p>
                <span className="tool-link">
                  Try the calculator <ArrowRight size={16} />
                </span>
              </div>
            </Link>
            <Link href="/games/stocks" className="learning-tool">
              <div className="tool-art stock-tool-art">
                <div className="mini-paper">
                  <span>The Coinnect Brief</span>
                  <strong>
                    Big news.
                    <br />
                    What next?
                  </strong>
                  <svg viewBox="0 0 140 35" fill="none" aria-hidden="true">
                    <path
                      d="M2 22L20 12L37 19L53 4L72 17L91 9L108 29L136 16"
                      stroke="#0875CF"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="paper-question">?</span>
              </div>
              <div className="tool-copy">
                <span>Stocks & economics</span>
                <h3>What moves a stock?</h3>
                <p>
                  Three headlines. Three choices. Look beyond the first
                  impression.
                </p>
                <span className="tool-link">
                  Play the game <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="penny-section">
        <div className="learning-shell penny-grid">
          <div className="penny-copy">
            <h2>
              Meet Penny.
              <br />A little coin,
              <br />a lot of curiosity.
            </h2>
            <p>
              Every good question deserves a place to start. Penny is our
              reminder to stay curious about the money choices around us.
            </p>
            <ul>
              <li>
                <Check size={17} /> Explore ideas through play.
              </li>
              <li>
                <Check size={17} /> See the reasoning behind a choice.
              </li>
              <li>
                <Check size={17} /> Try again whenever you want.
              </li>
            </ul>
            <Link href="/games" className="learning-button">
              Let’s learn something
            </Link>
          </div>
          <div className="penny-stage">
            <span className="penny-orbit orbit-one" />
            <span className="penny-orbit orbit-two" />
            <span className="penny-orbit orbit-three" />
            <button
              type="button"
              aria-label="Say hello to Penny"
              className={`penny-greeting ${greeted ? "is-greeting" : ""}`}
              onClick={() => setGreeted((value) => !value)}
            >
              <CoinMascot pose="wave" />
            </button>
            <p className="penny-speech" aria-live="polite">
              {greeted
                ? "Hi! What are you saving for?"
                : "Psst. Tap to say hello."}
            </p>
          </div>
        </div>
      </section>

      <section className="learning-audiences learning-shell">
        <div className="learning-section-heading">
          <h2>Bring a little curiosity. You’re in.</h2>
          <p>Money comes up everywhere. So can learning about it.</p>
        </div>
        <div className="audience-columns">
          {audiences.map(({ title, Icon, description, href, link }) => (
            <article key={title}>
              <Icon size={30} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{description}</p>
              <Link href={href} className="learning-text-link">
                {link} <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-final-cta">
        <div className="learning-shell">
          <div>
            <h2>
              A better understanding
              <br />
              starts with one small step.
            </h2>
            <Link href="/games" className="learning-button">
              Get started
            </Link>
          </div>
          <div className="final-cta-note">
            <CoinMascot pose="happy" />
            <p>
              Free to explore.
              <br />
              Yours to figure out.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
