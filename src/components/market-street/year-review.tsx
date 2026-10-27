import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, Info, Lightbulb, Trophy } from "lucide-react";
import CoinMascot from "@/components/coin-mascot";
import { ASSETS, ECONOMY_TIPS, badgeById, unlockYear, type BadgeId } from "@/lib/market-data";
import { ageAt, eventFeedback, type GameState, type YearRecord } from "@/lib/market-game";
import { money, signedMoney } from "./format";
import { BADGE_ICONS } from "./icons";

const ECONOMY_LABELS = {
  boom: "Boom year",
  normal: "Normal year",
  slowdown: "Slowdown",
  crash: "Crash",
};

const FEEDBACK_ICONS = { good: CheckCircle2, watch: Lightbulb, neutral: Info };

type YearReviewProps = {
  game: GameState;
  record: YearRecord;
  badges: BadgeId[];
  onContinue: () => void;
};

export function YearReview({ game, record, badges, onContinue }: YearReviewProps) {
  const outcome = game.timeline[record.year];
  const age = ageAt(record.year);
  const change = record.endWorth - record.startWorth;
  const finished = game.year >= game.years;
  const open = ASSETS.filter((asset) => unlockYear(asset.id, game.years) <= record.year);
  const owned = open.filter((asset) => record.startHoldings[asset.id] >= 1);
  const others = open.filter((asset) => record.startHoldings[asset.id] < 1);
  const feedback = eventFeedback(game, record.year);
  const FeedbackIcon = feedback ? FEEDBACK_ICONS[feedback.tone] : null;
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

        <div className="market-year-total">
          <span>Your money</span>
          <strong>
            {money(record.startWorth)} <ArrowRight size={20} aria-hidden="true" /> {money(record.endWorth)}
          </strong>
          <b className={change >= 0 ? "is-up" : "is-down"}>{signedMoney(change)}</b>
        </div>

        {record.endWorth >= game.goal && record.startWorth < game.goal && (
          <p className="market-badge-earned">
            <Trophy size={24} aria-hidden="true" />
            <span>
              <strong>You passed your goal of {money(game.goal)}!</strong>
              {finished
                ? "You made it just in time."
                : `Now the challenge is keeping it there until age ${ageAt(game.years)}, because markets can still drop.`}
            </span>
          </p>
        )}

        {owned.length > 0 ? (
          <>
            <h3>Where your money was</h3>
            <ul className="market-moves">
              {owned.map((asset) => {
                const before = record.startHoldings[asset.id];
                const after = before * (1 + outcome.returns[asset.id]);
                return (
                  <li key={asset.id}>
                    <span className="market-swatch" style={{ background: asset.color }} />
                    <div>
                      <strong>{asset.name}</strong>
                      <span>{outcome.news[asset.id]}</span>
                    </div>
                    <p>
                      <small>
                        {money(before)} → {money(after)}
                      </small>
                      <b className={after >= before ? "is-up" : "is-down"}>{signedMoney(after - before)}</b>
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="market-paper-sub">
            None of your money was invested this year, so it didn’t grow at all while prices rose{" "}
            {(outcome.inflation * 100).toFixed(1)}%.
          </p>
        )}

        {others.length > 0 && (
          <>
            <h3>Around town</h3>
            <ul className="market-around">
              {others.map((asset) => (
                <li key={asset.id}>
                  <i style={{ background: asset.color }} />
                  <span>{asset.name}</span>
                  <strong className={outcome.returns[asset.id] >= 0 ? "is-up" : "is-down"}>
                    $100 → {money(100 * (1 + outcome.returns[asset.id]))}
                  </strong>
                </li>
              ))}
            </ul>
          </>
        )}

        {feedback && FeedbackIcon && (
          <p className={`market-feedback is-${feedback.tone}`}>
            <FeedbackIcon size={20} aria-hidden="true" />
            <span>{feedback.text}</span>
          </p>
        )}

        {outcome.lifeEvent && (
          <p className={`market-life ${outcome.lifeEvent.amount < 0 ? "is-cost" : "is-gift"}`}>
            <strong>{outcome.lifeEvent.amount < 0 ? "Life happens" : "Lucky break"}</strong>
            {outcome.lifeEvent.text}
            {outcome.lifeEvent.amount < 0 &&
              (record.forcedSales > 0
                ? ` You didn’t have enough in your pocket or the bank, so ${money(record.forcedSales)} of your investments had to be sold to pay it.`
                : " Your pocket money and savings covered it, so none of your investments had to be sold.")}
          </p>
        )}

        {badges.map((id) => {
          const Icon = BADGE_ICONS[id];
          const badge = badgeById(id);
          return (
            <p key={id} className="market-badge-earned">
              <Icon size={24} aria-hidden="true" />
              <span>
                <strong>New badge: {badge.name}</strong>
                {badge.how}
              </span>
            </p>
          );
        })}

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
