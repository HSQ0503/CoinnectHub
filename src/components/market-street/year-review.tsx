import { useEffect, useRef } from "react";
import { ArrowRight, Coins, TrendingDown, TrendingUp } from "lucide-react";
import CoinMascot from "@/components/coin-mascot";
import { ASSETS, ECONOMY_TIPS } from "@/lib/market-data";
import {
  COINS_PER_YEAR,
  START_AGE,
  type GameState,
  type YearRecord,
} from "@/lib/market-game";
import { money, signedMoney, signedPercent } from "./format";

const ECONOMY_LABELS = {
  boom: "Boom year",
  normal: "Normal year",
  slowdown: "Slowdown",
  crash: "Crash",
};

type YearReviewProps = {
  game: GameState;
  record: YearRecord;
  coinsCollected: number;
  onContinue: () => void;
};

export function YearReview({ game, record, coinsCollected, onContinue }: YearReviewProps) {
  const outcome = game.timeline[record.year];
  const age = START_AGE + record.year;
  const change = record.endWorth - record.startWorth;
  const finished = game.year >= game.years;
  const sorted = [...ASSETS].sort((a, b) => outcome.returns[b.id] - outcome.returns[a.id]);
  const headline = useRef<HTMLHeadingElement>(null);

  // Focus the headline rather than the button so the paper opens at the top.
  useEffect(() => headline.current?.focus(), []);

  return (
    <div className="market-modal" role="dialog" aria-modal="true" aria-labelledby="review-headline">
      <article className="market-paper">
        <header className="market-paper-masthead">
          <span>The Coinnect Times</span>
          <span>
            Age {age} to {age + 1} · Year {record.year + 1} of {game.years}
          </span>
        </header>
        <p className={`market-economy is-${outcome.economy}`}>{ECONOMY_LABELS[outcome.economy]}</p>
        <h2 id="review-headline" tabIndex={-1} ref={headline}>
          {outcome.headline}
        </h2>
        <p className="market-paper-sub">
          Prices of everyday things rose {(outcome.inflation * 100).toFixed(1)}% this year.
        </p>

        <ul className="market-moves">
          {sorted.map((asset) => {
            const value = outcome.returns[asset.id];
            const owned = record.shares[asset.id] > 0;
            const ownedChange = record.shares[asset.id] * record.startWorth * value;
            return (
              <li key={asset.id} className={owned ? "is-owned" : ""}>
                <span className="market-swatch" style={{ background: asset.color }} />
                <div>
                  <strong>
                    {asset.name}
                    {owned && <em>You own this · {signedMoney(ownedChange)}</em>}
                  </strong>
                  <span>{outcome.news[asset.id]}</span>
                </div>
                <b className={value >= 0 ? "is-up" : "is-down"}>
                  {value >= 0 ? <TrendingUp size={15} aria-hidden="true" /> : <TrendingDown size={15} aria-hidden="true" />}
                  {signedPercent(value)}
                </b>
              </li>
            );
          })}
        </ul>

        {outcome.lifeEvent && (
          <p className={`market-life ${outcome.lifeEvent.amount < 0 ? "is-cost" : "is-gift"}`}>
            <strong>{outcome.lifeEvent.amount < 0 ? "Life happens" : "Lucky break"}</strong>
            {outcome.lifeEvent.text}
            {record.forcedSales > 0 &&
              ` You didn’t have enough cash, so ${money(record.forcedSales)} of your investments had to be sold to pay it.`}
          </p>
        )}

        <div className="market-year-result">
          <div>
            <span>Your money</span>
            <strong>
              {money(record.startWorth)} <ArrowRight size={18} aria-hidden="true" /> {money(record.endWorth)}
            </strong>
          </div>
          <div>
            <span>From investing</span>
            <strong className={record.gain >= 0 ? "is-up" : "is-down"}>{signedMoney(record.gain)}</strong>
          </div>
          <div>
            <span>
              <Coins size={14} aria-hidden="true" /> Paycheck coins
            </span>
            <strong>
              {coinsCollected} of {COINS_PER_YEAR}
            </strong>
          </div>
        </div>
        {change !== 0 && record.startWorth > 0 && (
          <p className="sr-only">
            Your total changed by {signedMoney(change)} this year.
          </p>
        )}

        <aside className="market-tip">
          <CoinMascot />
          <p>
            <strong>Penny’s tip</strong>
            {ECONOMY_TIPS[outcome.economy]}
          </p>
        </aside>

        <button type="button" className="market-advance" onClick={onContinue}>
          {finished ? "See how you did" : `Start age ${age + 1}`} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </article>
    </div>
  );
}
