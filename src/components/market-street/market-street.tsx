"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock3,
  Coins,
  Keyboard,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ASSETS, ASSET_IDS, assetById } from "@/lib/market-data";
import {
  COINS_PER_YEAR,
  START_AGE,
  buy,
  coinValues,
  collectCoin,
  createGame,
  endYear,
  invested,
  isFinished,
  netWorth,
  sell,
  type GameState,
  type YearRecord,
} from "@/lib/market-game";
import CoinMascot from "@/components/coin-mascot";
import { FinalReport } from "./final-report";
import { money, signedMoney, signedPercent } from "./format";
import { ClockPanel, PlacePanel } from "./place-panel";
import { createSound } from "./sound";
import { useCountUp } from "./use-count-up";
import type { World, ZoneId } from "./world";
import { YearReview } from "./year-review";

type Phase = "intro" | "play" | "year-end" | "review" | "done";
type WorldStatus = "loading" | "ready" | "failed";

const MOVE_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"];

function coinSeed(game: GameState) {
  return game.seed * 31 + game.year * 101;
}

export default function MarketStreet() {
  const shell = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const minimap = useRef<HTMLCanvasElement>(null);
  const world = useRef<World | null>(null);
  const [sound] = useState(createSound);
  const [status, setStatus] = useState<WorldStatus>("loading");
  const [phase, setPhase] = useState<Phase>("intro");
  const [game, setGame] = useState<GameState>(() => createGame(1, 10));
  const [zone, setZone] = useState<ZoneId | null>(null);
  const [panel, setPanel] = useState<ZoneId | null>(null);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [coinsLeft, setCoinsLeft] = useState(COINS_PER_YEAR);
  const [review, setReview] = useState<{ record: YearRecord; coins: number } | null>(null);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let created: World | null = null;
    import("./world")
      .then(({ createWorld }) => {
        if (cancelled) return null;
        return createWorld(stage.current!, overlay.current!, minimap.current!, {
          onCoin: (value) => {
            setGame((current) => collectCoin(current, value));
            setCoinsLeft((count) => Math.max(0, count - 1));
            sound.coin();
          },
          onZone: (next) => {
            setZone(next);
            setPanel(next);
            if (next) setPlacesOpen(false);
          },
        });
      })
      .then((instance) => {
        if (!instance) return;
        if (cancelled) {
          instance.dispose();
          return;
        }
        created = instance;
        world.current = instance;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
      created?.dispose();
      world.current = null;
    };
  }, [sound]);

  useEffect(() => {
    world.current?.setControls(phase === "play");
  }, [phase, status]);

  useEffect(() => {
    world.current?.setPanelOpen(Boolean(panel));
  }, [panel]);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  function beginYear(next: GameState) {
    setZone(null);
    setPanel(null);
    if (status === "ready" && world.current) {
      const lastYear = next.timeline[next.year - 1];
      world.current.setLabelDetails(
        Object.fromEntries(
          ASSETS.map((asset) => [
            asset.id,
            lastYear ? `${signedPercent(lastYear.returns[asset.id], 0)} last year` : asset.kind,
          ]),
        ),
      );
      world.current.spawnCoins(coinValues(next.year), coinSeed(next));
      world.current.startYear();
      setCoinsLeft(COINS_PER_YEAR);
      setGame(next);
    } else {
      // Without 3D there is nothing to walk to, so the paycheck arrives on its own.
      setCoinsLeft(0);
      setGame(coinValues(next.year).reduce(collectCoin, next));
    }
    setPhase("play");
    shell.current?.focus({ preventScroll: true });
  }

  function startGame(seed: number, years: number) {
    sound.unlock();
    world.current?.resetPlayer();
    setReview(null);
    beginYear(createGame(seed, years));
  }

  async function advanceYear() {
    const next = endYear(game);
    const record = next.history[next.history.length - 1];
    const coins = COINS_PER_YEAR - coinsLeft;
    setPanel(null);
    setPlacesOpen(false);
    setPhase("year-end");
    sound.fastForward();
    const outcome = game.timeline[game.year];
    await world.current?.playYearEnd(outcome.returns, outcome.economy);
    if (record.gain >= 0) sound.good();
    else sound.bad();
    setGame(next);
    setReview({ record, coins });
    setPhase("review");
  }

  function continueAfterReview() {
    setReview(null);
    if (isFinished(game)) {
      setPhase("done");
      return;
    }
    beginYear(game);
  }

  function openPlace(target: ZoneId) {
    setPlacesOpen(false);
    if (status !== "ready" || zone === target) {
      setPanel(target);
      return;
    }
    world.current?.walkTo(target);
    shell.current?.focus({ preventScroll: true });
  }

  function trade(kind: "buy" | "sell", asset: (typeof ASSET_IDS)[number], amount: number) {
    setGame((current) => (kind === "buy" ? buy(current, asset, amount) : sell(current, asset, amount)));
    if (kind === "buy") sound.buy();
    else sound.sell();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shell.current?.requestFullscreen?.();
  }

  function toggleMute() {
    sound.setMuted(!muted);
    setMuted(!muted);
  }

  const playing = phase === "play";
  const worth = netWorth(game);
  const shownWorth = useCountUp(worth);
  const lastRecord = game.history[game.history.length - 1];
  const canFullscreen = typeof document !== "undefined" && document.fullscreenEnabled;
  const age = START_AGE + Math.min(game.year, game.years);
  const hint =
    status !== "ready"
      ? "Open Places to visit a building and invest, then use the Clock Tower to skip ahead a year."
      : zone
        ? `Press E or tap ${zone === "clock" ? "the Clock Tower" : assetById(zone).name} to open it again.`
        : coinsLeft > 0
        ? game.year === 0 && invested(game) === 0
          ? "Grab the gold coins from your part-time job, then walk into a glowing circle to invest."
          : `${coinsLeft} paycheck ${coinsLeft === 1 ? "coin" : "coins"} left, and they disappear when the year ends.`
        : "All coins collected. Invest your cash, then head to the Clock Tower to skip ahead a year.";

  return (
    <div
      ref={shell}
      className={`market-shell ${fullscreen ? "is-fullscreen" : ""} ${playing ? "is-playing" : ""}`}
      tabIndex={-1}
      aria-label="Market Street game"
      onKeyDown={(event) => {
        if (!playing) return;
        if (MOVE_KEYS.includes(event.code)) {
          event.preventDefault();
          world.current?.setKey(event.code, true);
        } else if (event.key === "Escape") {
          setPanel(null);
          setPlacesOpen(false);
        } else if ((event.key === "e" || event.key === "Enter") && event.target === shell.current && zone && !panel) {
          setPanel(zone);
        }
      }}
      onKeyUp={(event) => world.current?.setKey(event.code, false)}
      onBlur={(event) => {
        if (!shell.current?.contains(event.relatedTarget as Node | null)) world.current?.releaseKeys();
      }}
    >
      <div ref={stage} className="market-stage" />
      <div ref={overlay} className="world-overlay" aria-hidden="true" />
      <canvas
        ref={minimap}
        className="market-minimap"
        hidden={!playing || status !== "ready"}
        aria-label="Map of Market Street. Click a spot to walk there."
      />

      {phase !== "intro" && phase !== "done" && (
        <>
          <div className="market-hud">
            <p className="market-age">
              Age {age} <span>· Year {Math.min(game.year + 1, game.years)} of {game.years}</span>
            </p>
            <p className="market-worth">{money(shownWorth)}</p>
            {lastRecord && (
              <p className={`market-last ${lastRecord.gain >= 0 ? "is-up" : "is-down"}`}>
                {signedMoney(lastRecord.gain)} from investing last year
              </p>
            )}
            <p className="market-split">
              <span>Cash {money(game.cash)}</span>
              <span>Invested {money(invested(game))}</span>
            </p>
            <div className="market-allocation" aria-hidden="true">
              <span style={{ flexGrow: game.cash, background: "#c8d3e0" }} />
              {ASSETS.map((asset) => (
                <span key={asset.id} style={{ flexGrow: game.holdings[asset.id], background: asset.color }} />
              ))}
            </div>
          </div>

          <div className="market-tools" hidden={phase === "year-end"}>
            {status === "ready" && (
              <p className="market-coins" aria-label={`${COINS_PER_YEAR - coinsLeft} of ${COINS_PER_YEAR} paycheck coins collected`}>
                <Coins size={17} aria-hidden="true" /> {COINS_PER_YEAR - coinsLeft}/{COINS_PER_YEAR}
              </p>
            )}
            <button
              type="button"
              className="market-icon-button"
              onClick={() => setPlacesOpen(!placesOpen)}
              aria-expanded={placesOpen}
              aria-label="Places"
              disabled={!playing}
            >
              <MapIcon size={19} />
            </button>
            <button type="button" className="market-icon-button" onClick={toggleMute} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            {canFullscreen && (
              <button
                type="button"
                className="market-icon-button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              >
                {fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
              </button>
            )}
          </div>

          {placesOpen && playing && (
            <nav className="market-places" aria-label="Places on Market Street">
              <header>
                <strong>Places</strong>
                <button type="button" className="market-icon-button" onClick={() => setPlacesOpen(false)} aria-label="Close places">
                  <X size={17} />
                </button>
              </header>
              <ul>
                {ASSETS.map((asset) => (
                  <li key={asset.id}>
                    <button type="button" onClick={() => openPlace(asset.id)}>
                      <i style={{ background: asset.color }} />
                      <span>
                        {asset.name}
                        <small>{asset.kind}</small>
                      </span>
                      <b>{game.holdings[asset.id] > 0 ? money(game.holdings[asset.id]) : ""}</b>
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={() => openPlace("clock")}>
                    <i style={{ background: "#ffca20" }} />
                    <span>
                      Clock Tower
                      <small>Skip to next year</small>
                    </span>
                    <Clock3 size={16} aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {playing && !panel && <p className="market-hint">{hint}</p>}

          {playing && panel === "clock" && (
            <ClockPanel game={game} coinsLeft={coinsLeft} onAdvance={advanceYear} onClose={() => setPanel(null)} />
          )}
          {playing && panel && panel !== "clock" && (
            <PlacePanel
              asset={assetById(panel)}
              game={game}
              onBuy={(amount) => trade("buy", panel, amount)}
              onSell={(amount) => trade("sell", panel, amount)}
              onClose={() => {
                setPanel(null);
                shell.current?.focus({ preventScroll: true });
              }}
            />
          )}
        </>
      )}

      {phase === "intro" && (
        <Intro status={status} onStart={(years) => startGame(Math.floor(Math.random() * 1_000_000), years)} />
      )}
      {phase === "review" && review && (
        <YearReview game={game} record={review.record} coinsCollected={review.coins} onContinue={continueAfterReview} />
      )}
      {phase === "done" && (
        <FinalReport
          game={game}
          onReplay={() => startGame(game.seed, game.years)}
          onNewGame={() => startGame(Math.floor(Math.random() * 1_000_000), game.years)}
        />
      )}
    </div>
  );
}

function Intro({ status, onStart }: { status: WorldStatus; onStart: (years: number) => void }) {
  return (
    <div className="market-modal">
      <article className="market-paper market-intro">
        <CoinMascot className="market-intro-mascot" />
        <p className="market-economy is-boom">Market Street</p>
        <h2>You’re {START_AGE} with $1,000. Where will it be in ten years?</h2>
        <p className="market-paper-sub">
          Walk around town, collect the paychecks from your part-time job, and decide where your money goes. Every
          trip to the Clock Tower skips ahead a year, and the market will not always be kind.
        </p>
        <ul className="market-howto">
          <li>
            <Coins size={22} aria-hidden="true" />
            <span>
              <strong>Collect coins</strong> Each year your job pays out in gold coins around town, so grab them before
              the year ends.
            </span>
          </li>
          <li>
            <MousePointerClick size={22} aria-hidden="true" />
            <span>
              <strong>Invest in buildings</strong> Step into a glowing circle to buy or sell, from a safe savings
              account to a risky hype coin.
            </span>
          </li>
          <li>
            <Clock3 size={22} aria-hidden="true" />
            <span>
              <strong>Skip ahead</strong> The Clock Tower moves time forward a year, and the newspaper tells you what
              happened.
            </span>
          </li>
          <li>
            <Keyboard size={22} aria-hidden="true" />
            <span>
              <strong>Controls</strong> Use WASD or the arrow keys, or click anywhere to walk there. On a tablet, hold
              your finger down to steer.
            </span>
          </li>
        </ul>
        {status === "failed" && (
          <p className="market-hype">
            Your browser can’t show the 3D town, so you’ll play from the Places menu instead and your paychecks will
            arrive on their own.
          </p>
        )}
        <div className="market-final-actions">
          <button type="button" className="market-advance" disabled={status === "loading"} onClick={() => onStart(10)}>
            {status === "loading" ? "Building the town…" : "Play 10 years"}
          </button>
          <button type="button" className="market-secondary" disabled={status === "loading"} onClick={() => onStart(5)}>
            Quick game, 5 years
          </button>
        </div>
      </article>
    </div>
  );
}
