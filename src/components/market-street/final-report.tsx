import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, Shuffle, Star, Trophy } from "lucide-react";
import {
  START_AGE,
  STRATEGY_LABELS,
  benchmarkPaths,
  lessonsFor,
  netWorth,
  profileFor,
  type GameState,
  type Strategy,
} from "@/lib/market-game";
import { money } from "./format";
import { useCountUp } from "./use-count-up";

const LINE_COLORS: Record<Strategy, string> = {
  you: "#061b45",
  index: "#0875cf",
  mix: "#1f9e8f",
  bank: "#7fb6e6",
  cash: "#94a3b8",
  rocket: "#e0457b",
};

// A personal best is a per-browser nicety, so storage failures are simply ignored.
function readBest(key: string) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? null : Number(stored);
  } catch {
    return null;
  }
}

function saveBest(key: string, value: number) {
  try {
    window.localStorage.setItem(key, String(Math.round(value)));
  } catch {}
}

type FinalReportProps = {
  game: GameState;
  onReplay: () => void;
  onNewGame: () => void;
};

export function FinalReport({ game, onReplay, onNewGame }: FinalReportProps) {
  const paths = benchmarkPaths(game);
  const final = netWorth(game);
  const endAge = START_AGE + game.years;
  const profile = profileFor(game);
  const lessons = lessonsFor(game);
  const beat = (strategy: Strategy) => final >= paths[strategy][game.years] - 0.5;
  const stars = [beat("cash"), beat("bank"), beat("index")].filter(Boolean).length;
  const ranking = (Object.keys(paths) as Strategy[]).sort(
    (a, b) => paths[b][game.years] - paths[a][game.years],
  );
  const realValue = final / game.priceLevel;
  const heading = useRef<HTMLHeadingElement>(null);
  const shownFinal = useCountUp(final, 0, 1400);
  const bestKey = `coinnecthub-market-best-${game.years}`;
  const [previousBest] = useState(() => readBest(bestKey));
  const newBest = previousBest !== null && final > previousBest + 0.5;

  useEffect(() => heading.current?.focus(), []);
  useEffect(() => {
    if (previousBest === null || final > previousBest) saveBest(bestKey, final);
  }, [bestKey, final, previousBest]);

  return (
    <div className="market-modal" role="dialog" aria-modal="true" aria-labelledby="final-heading">
      <article className="market-paper market-final">
        <p className="market-economy is-normal">Age {endAge} · Game over</p>
        <h2 id="final-heading" tabIndex={-1} ref={heading}>
          <span aria-hidden="true">You finished with {money(shownFinal)}</span>
          <span className="sr-only">You finished with {money(final)}</span>
        </h2>
        {previousBest !== null && (
          <p className={`market-best ${newBest ? "is-new" : ""}`}>
            <Trophy size={16} aria-hidden="true" />
            {newBest
              ? `New personal best! Your old ${game.years}-year record was ${money(previousBest)}.`
              : `Your best ${game.years}-year game so far is ${money(previousBest)}.`}
          </p>
        )}
        <p className="market-paper-sub">
          You started at {START_AGE} with $1,000 and earned the rest from paycheck coins. Prices rose{" "}
          {Math.round((game.priceLevel - 1) * 100)}% along the way, so your money buys about what{" "}
          {money(realValue)} would have bought when you started.
        </p>

        <div className="market-profile">
          <div className="market-stars" aria-label={`${stars} out of 3 stars`}>
            {[0, 1, 2].map((index) => (
              <Star
                key={index}
                size={30}
                aria-hidden="true"
                className={index < stars ? "is-on" : ""}
                style={{ animationDelay: `${0.5 + index * 0.25}s` }}
              />
            ))}
          </div>
          <div>
            <strong>{profile.title}</strong>
            <p>{profile.description}</p>
          </div>
        </div>
        <ul className="market-star-goals">
          <StarGoal done={beat("cash")} text="Beat keeping everything as cash" />
          <StarGoal done={beat("bank")} text="Beat the savings bank" />
          <StarGoal done={beat("index")} text="Beat the Whole Market Fund" />
        </ul>

        <h3>What if you’d chosen differently?</h3>
        <p className="market-paper-sub">
          Each line got the same paychecks and surprise bills you did, so the only difference is where the money went.
        </p>
        <WorthChart paths={paths} years={game.years} />
        <ol className="market-ranking">
          {ranking.map((strategy) => (
            <li key={strategy} className={strategy === "you" ? "is-you" : ""}>
              <i style={{ background: LINE_COLORS[strategy] }} />
              <span>{STRATEGY_LABELS[strategy]}</span>
              <strong>{money(paths[strategy][game.years])}</strong>
            </li>
          ))}
        </ol>

        <h3>What this game taught you</h3>
        <ul className="market-lessons">
          {lessons.map((lesson) => (
            <li key={lesson.id} className={`is-${lesson.tone}`}>
              {lesson.tone === "good" ? (
                <CheckCircle2 size={20} aria-hidden="true" />
              ) : (
                <Lightbulb size={20} aria-hidden="true" />
              )}
              <div>
                <strong>{lesson.title}</strong>
                <p>{lesson.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="market-final-actions">
          <button type="button" className="market-advance" onClick={onReplay}>
            <RotateCcw size={18} aria-hidden="true" /> Replay these same years
          </button>
          <button type="button" className="market-secondary" onClick={onNewGame}>
            <Shuffle size={18} aria-hidden="true" /> Play a new market
          </button>
        </div>
        <p className="market-panel-foot">
          Replaying keeps every headline and price move the same, so you can test a different plan against the exact same luck.
        </p>
      </article>
    </div>
  );
}

function StarGoal({ done, text }: { done: boolean; text: string }) {
  return (
    <li className={done ? "is-done" : ""}>
      <Star size={15} aria-hidden="true" /> {text}
      <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
    </li>
  );
}

function WorthChart({ paths, years }: { paths: Record<Strategy, number[]>; years: number }) {
  const titleId = useId();
  const width = 600;
  const height = 240;
  const pad = { top: 14, right: 16, bottom: 30, left: 56 };
  const top = Math.max(...Object.values(paths).flat()) * 1.06;
  const x = (year: number) => pad.left + (year / years) * (width - pad.left - pad.right);
  const y = (value: number) => pad.top + (1 - value / top) * (height - pad.top - pad.bottom);
  const order: Strategy[] = ["cash", "bank", "mix", "rocket", "index", "you"];

  return (
    <figure className="market-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          {`Your money over ${years} years compared with other strategies. You ended with ${money(paths.you[years])}, the Whole Market Fund with ${money(paths.index[years])}, and cash with ${money(paths.cash[years])}.`}
        </title>
        {[0, top / 2, top].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="rgb(6 27 69 / 0.08)" />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="chart-label">
              {money(tick)}
            </text>
          </g>
        ))}
        {Array.from({ length: years + 1 }, (_, year) => year)
          .filter((year) => years <= 5 || year % 2 === 0)
          .map((year) => (
            <text key={year} x={x(year)} y={height - 8} textAnchor="middle" className="chart-label">
              {START_AGE + year}
            </text>
          ))}
        {order.map((strategy) => (
          <polyline
            key={strategy}
            points={paths[strategy].map((value, year) => `${x(year)},${y(value)}`).join(" ")}
            fill="none"
            stroke={LINE_COLORS[strategy]}
            strokeWidth={strategy === "you" ? 4 : 2.5}
            strokeDasharray={strategy === "rocket" ? "6 5" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {paths.you.map((value, year) => (
          <circle key={year} cx={x(year)} cy={y(value)} r="4.5" fill="#ffca20" stroke="#061b45" strokeWidth="2" />
        ))}
      </svg>
    </figure>
  );
}
