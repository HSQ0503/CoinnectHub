"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  CircleX,
  Info,
  Newspaper,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  DIRECTION_LABELS,
  ROUND_SIZE,
  pickRound,
  scoreMessage,
  type Direction,
  type Scenario,
} from "@/lib/stock-quiz";

type Phase = "intro" | "question" | "done";

function newSeed() {
  return Math.floor(Math.random() * 1_000_000) + 1;
}

export default function StockQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<Scenario[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Direction[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);

  const scenario = round[index];
  const answer = answers[index];
  const score = round.filter((item, at) => answers[at] === item.direction).length;

  function start() {
    setRound(pickRound(newSeed()));
    setIndex(0);
    setAnswers([]);
    setPhase("question");
  }

  function choose(direction: Direction) {
    if (answer) return;
    setAnswers((current) => [...current, direction]);
  }

  function next() {
    if (index + 1 >= round.length) {
      setPhase("done");
      return;
    }
    setIndex(index + 1);
  }

  // Keep keyboard and screen reader users oriented as the quiz moves along.
  useEffect(() => {
    if (phase !== "intro") heading.current?.focus({ preventScroll: true });
  }, [phase, index]);
  useEffect(() => {
    if (answer) nextButton.current?.focus({ preventScroll: true });
  }, [answer]);

  if (phase === "intro") {
    return (
      <div className="quiz-shell">
        <div className="quiz-card quiz-intro">
          <span className="quiz-badge">
            <Newspaper size={16} aria-hidden="true" /> {ROUND_SIZE} headlines
          </span>
          <h2>Read the news. Pick the likely direction. Find out why.</h2>
          <p>
            Each round shows {ROUND_SIZE} short news stories about made-up
            companies. For each one, guess whether the stock is more likely to
            go up or down, then see the thinking behind it.
          </p>
          <p className="quiz-tip">
            <Info size={18} aria-hidden="true" />
            <span>
              Stock prices respond to <strong>expectations</strong>, not just
              to news. If investors already expected good results, good news
              alone might not push a stock up.
            </span>
          </p>
          <button type="button" className="quiz-primary" onClick={start}>
            Start the quiz <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p className="quiz-fine">No timer, no account, about 2 minutes.</p>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="quiz-shell">
        <div className="quiz-card quiz-done">
          <p className="quiz-eyebrow">Round complete</p>
          <h2 ref={heading} tabIndex={-1}>
            You got <strong>{score}</strong> out of {round.length}
          </h2>
          <p className="quiz-done-message">{scoreMessage(score, round.length)}</p>
          <ol className="quiz-recap" aria-label="Your answers">
            {round.map((item, at) => {
              const right = answers[at] === item.direction;
              return (
                <li key={item.id} className={right ? "is-right" : "is-wrong"}>
                  <span aria-hidden="true">
                    {right ? <Check size={16} /> : <X size={16} />}
                  </span>
                  <span>
                    <strong>{item.company}</strong> was more likely to{" "}
                    {DIRECTION_LABELS[item.direction].toLowerCase()}.
                    {!right &&
                      ` You picked ${DIRECTION_LABELS[answers[at]]}.`}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="quiz-tip">
            <Info size={18} aria-hidden="true" />
            <span>
              Prices move on <strong>surprises</strong>. When results beat what
              investors expected, stocks tend to rise. When they fall short,
              stocks tend to fall, even if the news sounds good on its own.
            </span>
          </p>
          <div className="quiz-actions">
            <button type="button" className="quiz-primary" onClick={start}>
              <RotateCcw size={18} aria-hidden="true" /> Play again
            </button>
            <Link href="/games" className="quiz-secondary">
              All games & tools
            </Link>
          </div>
          <p className="quiz-fine">
            These are simplified examples. Real stock prices can react
            differently.
          </p>
        </div>
      </div>
    );
  }

  const correct = answer === scenario.direction;
  const last = index + 1 === round.length;

  return (
    <div className="quiz-shell">
      <div className="quiz-progress">
        <p ref={heading} tabIndex={-1}>
          Question {index + 1} of {round.length}
        </p>
        <div
          className="quiz-progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={round.length}
          aria-valuenow={index + (answer ? 1 : 0)}
          aria-label="Quiz progress"
        >
          <span
            style={{ width: `${((index + (answer ? 1 : 0)) / round.length) * 100}%` }}
          />
        </div>
      </div>

      <article className="quiz-card quiz-question" key={scenario.id}>
        <p className="quiz-eyebrow">
          <Newspaper size={16} aria-hidden="true" /> {scenario.company}
        </p>
        <p className="quiz-news">{scenario.news}</p>
        <h2 className="quiz-ask">
          Based on this news, is the stock more likely to rise or fall?
        </h2>
        <div className="quiz-choices">
          {(["up", "down"] as const).map((direction) => {
            const Icon = direction === "up" ? TrendingUp : TrendingDown;
            const isCorrect = Boolean(answer) && direction === scenario.direction;
            const isMiss = Boolean(answer) && direction === answer && !isCorrect;
            const state = !answer
              ? ""
              : isCorrect
                ? "is-correct"
                : isMiss
                  ? "is-yours"
                  : "is-faded";
            return (
              <button
                key={direction}
                type="button"
                className={`quiz-choice quiz-choice-${direction} ${state}`}
                aria-pressed={answer === direction}
                disabled={Boolean(answer) && answer !== direction}
                onClick={() => choose(direction)}
              >
                <Icon size={26} aria-hidden="true" />
                {DIRECTION_LABELS[direction]}
                {isCorrect && (
                  <span className="quiz-choice-tag is-correct">
                    <Check size={13} aria-hidden="true" /> Correct answer
                  </span>
                )}
                {isMiss && (
                  <span className="quiz-choice-tag is-yours">
                    <X size={13} aria-hidden="true" /> Your answer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="quiz-feedback-slot" aria-live="polite">
          {answer && (
            <div
              ref={feedback}
              className={`quiz-feedback ${correct ? "is-right" : "is-wrong"}`}
            >
              <p className="quiz-verdict">
                {correct ? (
                  <>
                    <CircleCheck size={20} aria-hidden="true" /> Correct!
                  </>
                ) : (
                  <>
                    <CircleX size={20} aria-hidden="true" /> Not quite. The
                    correct answer is {DIRECTION_LABELS[scenario.direction]}.
                  </>
                )}
              </p>
              <p className="quiz-explanation">{scenario.explanation}</p>
              <button
                ref={nextButton}
                type="button"
                className="quiz-primary"
                onClick={next}
              >
                {last ? "See your score" : "Next"}{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </article>
      <p className="quiz-fine">
        These are simplified examples. Real stock prices can react differently.
      </p>
    </div>
  );
}
