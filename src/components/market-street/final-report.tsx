import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Lightbulb, MessagesSquare, RotateCcw, Shuffle, Trophy } from "lucide-react";
import { BADGES, dreamById } from "@/lib/market-data";
import {
  START_CASH,
  STRATEGY_LABELS,
  ageAt,
  benchmarkPaths,
  lessonsFor,
  netWorth,
  type GameState,
  type Strategy,
} from "@/lib/market-game";
import { money } from "./format";
import { BADGE_ICONS, DREAM_ICONS } from "./icons";
import { useCountUp } from "./use-count-up";

const LINE_COLORS: Record<Strategy, string> = {
  you: "#061b45",
  index: "#0875cf",
  bank: "#7fb6e6",
  cash: "#94a3b8",
  rocket: "#e0457b",
};

const TALK_ABOUT_IT = [
  "When the market crashed, what did you feel like doing? Why is it so hard to hold on when everyone else is panicking?",
  "Why do you think the Market Fund came back after the crash, while Rocket Coin usually didn’t?",
  "If you could replay these exact same years, what would you do differently, and why?",
];

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
  const reached = final >= game.goal;
  const dream = dreamById(game.dream);
  const DreamIcon = DREAM_ICONS[game.dream];
  const lessons = lessonsFor(game);
  const ranking = (Object.keys(paths) as Strategy[]).sort((a, b) => paths[b][game.years] - paths[a][game.years]);
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
        <p className="market-economy is-normal">Age {ageAt(game.years)} · Game over</p>
        <h2 id="final-heading" tabIndex={-1} ref={heading}>
          <span aria-hidden="true">You finished with {money(shownFinal)}</span>
          <span className="sr-only">You finished with {money(final)}</span>
        </h2>

        <div className={`market-dream ${reached ? "is-reached" : ""}`}>
          <DreamIcon size={30} aria-hidden="true" />
          <div>
            <strong>
              {reached
                ? `You can afford ${dream.name}!`
                : `You came up ${money(game.goal - final)} short of ${dream.name}.`}
            </strong>
            <p>
              Your goal was {money(game.goal)}.{" "}
              {reached
                ? `You beat it by ${money(final - game.goal)}, starting from just ${money(START_CASH)} and a part-time job.`
                : "Replay the same years and see whether a different plan gets you there."}
            </p>
          </div>
        </div>
        {previousBest !== null && (
          <p className={`market-best ${newBest ? "is-new" : ""}`}>
            <Trophy size={16} aria-hidden="true" />
            {newBest
              ? `New personal best! Your old ${game.years}-year record was ${money(previousBest)}.`
              : `Your best ${game.years}-year game so far is ${money(previousBest)}.`}
          </p>
        )}

        <h3>
          Your badges <span>{game.badges.length} of {BADGES.length}</span>
        </h3>
        <ul className="market-badges">
          {BADGES.map((badge, index) => {
            const Icon = BADGE_ICONS[badge.id];
            const earned = game.badges.includes(badge.id);
            return (
              <li key={badge.id} className={earned ? "is-earned" : ""} style={{ animationDelay: `${0.3 + index * 0.08}s` }}>
                <Icon size={24} aria-hidden="true" />
                <strong>{badge.name}</strong>
                <span>{badge.how}</span>
                <span className="sr-only">{earned ? "Earned" : "Not earned yet"}</span>
              </li>
            );
          })}
        </ul>

        <h3>What if you’d chosen differently?</h3>
        <p className="market-paper-sub">
          Each line got the same paychecks, coins, and surprise bills you did, so the only difference is where the money
          went. They also never spent anything.
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

        <h3>Talk about it</h3>
        <ol className="market-talk">
          {TALK_ABOUT_IT.map((question) => (
            <li key={question}>
              <MessagesSquare size={18} aria-hidden="true" />
              <span>{question}</span>
            </li>
          ))}
        </ol>

        <div className="market-final-actions">
          <button type="button" className="market-advance" onClick={onReplay}>
            <RotateCcw size={18} aria-hidden="true" /> Replay these same years
          </button>
          <button type="button" className="market-secondary" onClick={onNewGame}>
            <Shuffle size={18} aria-hidden="true" /> Play a new market
          </button>
        </div>
        <p className="market-panel-foot">
          Replaying keeps every headline and price move the same, so you can test a different plan against the exact
          same luck.
        </p>
      </article>
    </div>
  );
}

// Rounds the chart's top up to a friendly number like $5,000 or $12,500 so the axis labels read cleanly.
function niceCeiling(value: number) {
  const scale = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((option) => option * scale >= value)!;
  return step * scale;
}

function WorthChart({ paths, years }: { paths: Record<Strategy, number[]>; years: number }) {
  const titleId = useId();
  const width = 600;
  const height = 240;
  const pad = { top: 14, right: 16, bottom: 30, left: 56 };
  const top = niceCeiling(Math.max(...Object.values(paths).flat()) * 1.04);
  const x = (year: number) => pad.left + (year / years) * (width - pad.left - pad.right);
  const y = (value: number) => pad.top + (1 - value / top) * (height - pad.top - pad.bottom);
  const order: Strategy[] = ["cash", "bank", "rocket", "index", "you"];

  return (
    <figure className="market-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          {`Your money over ${years} years compared with other plans. You ended with ${money(paths.you[years])}, everything in the Market Fund would have ended with ${money(paths.index[years])}, and keeping it all in your pocket would have ended with ${money(paths.cash[years])}.`}
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
              {ageAt(year)}
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
