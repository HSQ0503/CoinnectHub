import { AlertTriangle, Clock3, X } from "lucide-react";
import { ASSETS, type Asset } from "@/lib/market-data";
import {
  START_AGE,
  hypeNote,
  netWorth,
  riskLabel,
  type GameState,
} from "@/lib/market-game";
import { money, signedMoney, signedPercent } from "./format";

const AMOUNTS = [50, 100, 250];

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
  const past = game.timeline.slice(0, game.year).map((year) => year.returns[asset.id]);
  const biggest = Math.max(0.1, ...past.map(Math.abs));
  const hype = asset.id === "rocket" ? hypeNote(game) : null;

  return (
    <section className="market-panel" aria-label={asset.name}>
      <header className="market-panel-head">
        <span className="market-swatch" style={{ background: asset.color }} />
        <div>
          <p>{asset.kind}</p>
          <h3>{asset.name}</h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="market-icon-button">
          <X size={18} />
        </button>
      </header>

      <p className="market-panel-blurb">{asset.blurb}</p>

      <div className="market-risk">
        <span>Risk</span>
        <div aria-hidden="true">
          {[1, 2, 3, 4, 5].map((level) => (
            <i key={level} className={level <= asset.risk ? "is-on" : ""} />
          ))}
        </div>
        <strong>{riskLabel(asset.risk)}</strong>
      </div>
      <p className="market-typical">{asset.typical}</p>

      {hype && (
        <p className="market-hype">
          <AlertTriangle size={17} aria-hidden="true" /> {hype}
        </p>
      )}

      {past.length > 0 && (
        <div className="market-history">
          <p>How it did in your game so far</p>
          <ol>
            {past.map((change, index) => (
              <li key={index}>
                <span
                  className={change >= 0 ? "is-up" : "is-down"}
                  style={{ height: `${Math.max(6, (Math.abs(change) / biggest) * 100)}%` }}
                />
                <small>{signedPercent(change, 0)}</small>
                <em>Age {START_AGE + index}</em>
              </li>
            ))}
          </ol>
        </div>
      )}

      <dl className="market-owned">
        <div>
          <dt>You own</dt>
          <dd>{money(held)}</dd>
        </div>
        <div>
          <dt>Gain so far</dt>
          <dd className={gain >= 0 ? "text-[#15803d]" : "text-[#b42318]"}>
            {held > 0 || gain !== 0 ? signedMoney(gain) : "—"}
          </dd>
        </div>
        <div>
          <dt>Your cash</dt>
          <dd>{money(game.cash)}</dd>
        </div>
      </dl>

      <div className="market-trade">
        <p>Invest</p>
        <div>
          {AMOUNTS.map((amount) => (
            <button key={amount} type="button" onClick={() => onBuy(amount)} disabled={game.cash < amount}>
              {money(amount)}
            </button>
          ))}
          <button type="button" onClick={() => onBuy(game.cash)} disabled={game.cash < 1}>
            All cash
          </button>
        </div>
        <p>Sell</p>
        <div>
          {AMOUNTS.map((amount) => (
            <button key={amount} type="button" onClick={() => onSell(amount)} disabled={held < amount} className="is-sell">
              {money(amount)}
            </button>
          ))}
          <button type="button" onClick={() => onSell(held)} disabled={held < 0.5} className="is-sell">
            Sell all
          </button>
        </div>
      </div>
      <p className="market-panel-foot">
        Investments only change value when a year ends, so you can move money around freely until then.
      </p>
      <p className="sr-only" aria-live="polite">
        You own {money(held)} of {asset.name} and have {money(game.cash)} in cash.
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
  const age = START_AGE + game.year;
  return (
    <section className="market-panel" aria-label="Clock Tower">
      <header className="market-panel-head">
        <span className="market-swatch" style={{ background: "#ffca20" }} />
        <div>
          <p>Clock Tower</p>
          <h3>Ready for age {age + 1}?</h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="market-icon-button">
          <X size={18} />
        </button>
      </header>
      <p className="market-panel-blurb">
        When the clock spins, a whole year passes. Every investment gains or loses value, prices rise, and life might throw you a surprise.
      </p>
      {coinsLeft > 0 && (
        <p className="market-hype">
          <AlertTriangle size={17} aria-hidden="true" /> {coinsLeft} paycheck {coinsLeft === 1 ? "coin is" : "coins are"} still out on the street, and they’ll disappear when the year ends.
        </p>
      )}
      <MoneyMix game={game} />
      {game.cash >= 100 && (
        <p className="market-typical">
          You’re holding {money(game.cash)} in cash, which earns nothing while prices go up.
        </p>
      )}
      <button type="button" className="market-advance" onClick={onAdvance}>
        <Clock3 size={19} aria-hidden="true" /> Fast-forward to age {age + 1}
      </button>
    </section>
  );
}

function MoneyMix({ game }: { game: GameState }) {
  const total = netWorth(game) || 1;
  const parts = [
    { id: "cash", name: "Cash", color: "#c8d3e0", value: game.cash },
    ...ASSETS.map((asset) => ({ id: asset.id, name: asset.name, color: asset.color, value: game.holdings[asset.id] })),
  ]
    .filter((part) => part.value >= 0.5)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="market-mix">
      <p>Your money right now</p>
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
            <strong>{Math.round((part.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
