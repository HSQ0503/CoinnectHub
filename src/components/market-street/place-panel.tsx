import { AlertTriangle, Clock3, X } from "lucide-react";
import { ASSETS, HATS, unlockYear, type Asset, type HatId } from "@/lib/market-data";
import { ageAt, couldGrowTo, hypeNote, type GameState } from "@/lib/market-game";
import { money, signedMoney } from "./format";
import { HAT_ICONS } from "./icons";

const STEP = 100;
const BUMPY_LABELS = ["Never drops", "Gentle", "Bumpy", "Very bumpy", "Wild"];

type PanelHeadProps = { kind: string; title: string; color: string; onClose: () => void };

function PanelHead({ kind, title, color, onClose }: PanelHeadProps) {
  return (
    <header className="market-panel-head">
      <span className="market-swatch" style={{ background: color }} />
      <div>
        <p>{kind}</p>
        <h3>{title}</h3>
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="market-icon-button">
        <X size={18} />
      </button>
    </header>
  );
}

export function Bumpy({ level }: { level: number }) {
  return (
    <div className="market-bumpy">
      <span>How bumpy?</span>
      <div aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <i key={step} className={step <= level ? "is-on" : ""} />
        ))}
      </div>
      <strong>{BUMPY_LABELS[level - 1]}</strong>
    </div>
  );
}

type PlacePanelProps = {
  asset: Asset;
  game: GameState;
  onBuy: (amount: number) => void;
  onSell: (amount: number) => void;
  onClose: () => void;
};

export function PlacePanel({ asset, game, onBuy, onSell, onClose }: PlacePanelProps) {
  const held = game.holdings[asset.id];
  const gain = held - game.basis[asset.id];
  const opened = unlockYear(asset.id, game.years);
  const past = game.timeline.slice(opened, game.year).map((year) => year.returns[asset.id]);
  const biggest = Math.max(0.1, ...past.map(Math.abs));
  const hype = asset.id === "rocket" ? hypeNote(game) : null;

  return (
    <section className="market-panel" aria-label={asset.name}>
      <PanelHead kind={asset.kind} title={asset.name} color={asset.color} onClose={onClose} />
      <p className="market-panel-blurb">{asset.short}</p>
      <Bumpy level={asset.bumpy} />
      <p className="market-typical">{asset.typical}</p>

      {hype && (
        <p className="market-hype">
          <AlertTriangle size={17} aria-hidden="true" /> {hype}
        </p>
      )}

      {past.length > 0 && (
        <div className="market-history">
          <p>What $100 turned into each year</p>
          <ol>
            {past.map((change, index) => (
              <li key={index}>
                <span
                  className={change >= 0 ? "is-up" : "is-down"}
                  style={{ height: `${Math.max(6, (Math.abs(change) / biggest) * 100)}%` }}
                />
                <small>{money(100 * (1 + change))}</small>
                <em>Age {ageAt(opened + index)}</em>
              </li>
            ))}
          </ol>
        </div>
      )}

      {asset.id !== "bank" && game.cash < 100 && game.holdings.bank >= 100 && (
        <p className="market-note">
          Your pocket is almost empty. To move some of your savings here, take it out at the Savings Bank first.
        </p>
      )}

      {asset.id === "bank" && (
        <p className="market-note">
          The bank is also your safety net. If a surprise bill shows up, it gets paid from your pocket first and then
          from here, so your investments don’t have to be sold.
        </p>
      )}

      <dl className="market-owned">
        <div>
          <dt>You have here</dt>
          <dd>{money(held)}</dd>
          {held > 0 && Math.abs(gain) >= 1 && (
            <span className={gain >= 0 ? "is-up" : "is-down"}>{signedMoney(gain)} so far</span>
          )}
        </div>
        <div>
          <dt>In your pocket</dt>
          <dd>{money(game.cash)}</dd>
        </div>
      </dl>

      <div className="market-trade">
        <button type="button" className="is-out" onClick={() => onSell(STEP)} disabled={held < 0.5}>
          Take out {money(Math.min(STEP, held) || STEP)}
        </button>
        <button type="button" onClick={() => onBuy(STEP)} disabled={game.cash < 1}>
          Put in {money(Math.min(STEP, game.cash) || STEP)}
        </button>
        <button type="button" className="is-out" onClick={() => onSell(held)} disabled={held < 0.5}>
          Take it all out
        </button>
        <button type="button" onClick={() => onBuy(game.cash)} disabled={game.cash < 1}>
          Put it all in
        </button>
      </div>
      <p className="market-panel-foot">
        Prices only change when a year ends, so you can move money in and out as much as you like until then.
      </p>
      <p className="sr-only" aria-live="polite">
        You have {money(held)} in {asset.name} and {money(game.cash)} in your pocket.
      </p>
    </section>
  );
}

type ShopPanelProps = {
  game: GameState;
  onBuy: (hat: HatId) => void;
  onWear: (hat: HatId | null) => void;
  onClose: () => void;
};

export function ShopPanel({ game, onBuy, onWear, onClose }: ShopPanelProps) {
  const yearsLeft = game.years - game.year;
  const endAge = ageAt(game.years);

  return (
    <section className="market-panel" aria-label="Style Shop">
      <PanelHead kind="Spending money" title="Style Shop" color="#1f9e8f" onClose={onClose} />
      <p className="market-panel-blurb">
        Everything here is just for fun. Penny would love a new look, but money you spend is gone for good and stops
        growing.
      </p>
      <ul className="market-shop">
        {HATS.map((hat) => {
          const Icon = HAT_ICONS[hat.id];
          const owned = game.hats.includes(hat.id);
          const wearing = game.hat === hat.id;
          return (
            <li key={hat.id}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <strong>
                  {hat.name} <span>{money(hat.price)}</span>
                </strong>
                <small>
                  {owned
                    ? "You already own this."
                    : `Invested instead, it could grow to about ${money(couldGrowTo(hat.price, yearsLeft))} by age ${endAge}.`}
                </small>
              </div>
              {owned ? (
                <button type="button" className="is-out" onClick={() => onWear(wearing ? null : hat.id)}>
                  {wearing ? "Take off" : "Wear"}
                </button>
              ) : (
                <button type="button" onClick={() => onBuy(hat.id)} disabled={game.cash < hat.price}>
                  Buy
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="market-panel-foot">
        You have {money(game.cash)} in your pocket. The growth numbers assume the Market Fund’s long-run average of about
        8% a year.
      </p>
    </section>
  );
}

type ClockPanelProps = {
  game: GameState;
  coinsLeft: number;
  onAdvance: () => void;
  onClose: () => void;
};

export function ClockPanel({ game, coinsLeft, onAdvance, onClose }: ClockPanelProps) {
  const age = ageAt(game.year);
  const safety = game.cash + game.holdings.bank;
  return (
    <section className="market-panel" aria-label="Clock Tower">
      <PanelHead kind="Clock Tower" title={`Ready for age ${age + 1}?`} color="#ffca20" onClose={onClose} />
      <p className="market-panel-blurb">
        When the clock spins, a whole year goes by. Your investments go up or down, and life might throw a surprise at
        you.
      </p>
      <MoneyMix game={game} />
      {game.cash >= 100 && (
        <p className="market-hype">
          <AlertTriangle size={17} aria-hidden="true" /> {money(game.cash)} is still in your pocket, where it won’t grow
          at all.
        </p>
      )}
      {coinsLeft > 0 && (
        <p className="market-hype">
          <AlertTriangle size={17} aria-hidden="true" /> {coinsLeft} bonus {coinsLeft === 1 ? "coin is" : "coins are"}{" "}
          still out on the street, and they’ll disappear when the year ends.
        </p>
      )}
      {game.year > 0 && safety < 250 && (
        <p className="market-note">
          You only have {money(safety)} in your pocket and the bank. If a surprise bill shows up, some of your
          investments will have to be sold to pay it.
        </p>
      )}
      <button type="button" className="market-advance" onClick={onAdvance}>
        <Clock3 size={19} aria-hidden="true" /> Skip ahead to age {age + 1}
      </button>
    </section>
  );
}

function MoneyMix({ game }: { game: GameState }) {
  const parts = [
    { id: "cash", name: "Pocket", color: "#c8d3e0", value: game.cash },
    ...ASSETS.map((asset) => ({ id: asset.id, name: asset.name, color: asset.color, value: game.holdings[asset.id] })),
  ]
    .filter((part) => part.value >= 0.5)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="market-mix">
      <p>Where your money is</p>
      <div className="market-mix-bar" aria-hidden="true">
        {parts.map((part) => (
          <span key={part.id} style={{ flexGrow: part.value, background: part.color }} />
        ))}
      </div>
      <ul>
        {parts.map((part) => (
          <li key={part.id}>
            <i style={{ background: part.color }} />
            <span>{part.name}</span>
            <strong>{money(part.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
