"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock3,
  Coins,
  Footprints,
  HandCoins,
  Lock,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Volume2,
  VolumeX,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ASSETS,
  DREAMS,
  assetById,
  badgeById,
  dreamById,
  hatById,
  unlockYear,
  type AssetId,
  type BadgeId,
  type DreamId,
  type HatId,
} from "@/lib/market-data";
import {
  BONUS_COINS,
  ageAt,
  applyChoice,
  buy,
  buyHat,
  collectCoin,
  createGame,
  endYear,
  eventCard,
  invested,
  isFinished,
  isUnlocked,
  netWorth,
  payday,
  salaryFor,
  sell,
  unlocksThisYear,
  wearHat,
  type EventCard,
  type GameState,
  type YearRecord,
} from "@/lib/market-game";
import CoinMascot from "@/components/coin-mascot";
import { FinalReport } from "./final-report";
import { money, signedMoney, signedPercent } from "./format";
import { BADGE_ICONS, DREAM_ICONS } from "./icons";
import { ClockPanel, PlacePanel, ShopPanel } from "./place-panel";
import { createSound } from "./sound";
import { StoryCard, type Story } from "./story-card";
import { useCountUp } from "./use-count-up";
import type { World, ZoneId } from "./world";
import { YearReview } from "./year-review";

type Phase = "intro" | "play" | "year-end" | "review" | "done";
type WorldStatus = "loading" | "ready" | "failed";
type Toast = { id: number; text: string; Icon: LucideIcon };

const MOVE_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"];

function coinSeed(game: GameState) {
  return game.seed * 31 + game.year * 101;
}

function eventFocus(card: EventCard, game: GameState): ZoneId | null {
  const event = game.timeline[game.year]?.event;
  if (card.kind === "crash") return "index";
  if (card.kind === "hype") return "rocket";
  if (card.kind === "tip" && event?.kind === "tip") return event.tip.asset;
  return "shop";
}

function labelsFor(game: GameState) {
  const labels: Partial<Record<ZoneId, string>> = { clock: `Skip to age ${ageAt(game.year) + 1}` };
  for (const asset of ASSETS) {
    labels[asset.id] = isUnlocked(game, asset.id)
      ? asset.kind
      : `Opens at age ${ageAt(unlockYear(asset.id, game.years))}`;
  }
  return labels;
}

function guideFor(game: GameState, visited: ZoneId[], coinsLeft: number): { zone: ZoneId | null; text: string } {
  const fresh = unlocksThisYear(game)
    .flatMap((story) => story.ids)
    .find((id) => !visited.includes(id));
  if (game.year === 0 && invested(game) === 0) {
    return {
      zone: "bank",
      text: `Follow the gold trail to the Savings Bank and step into its glowing circle to put some money in.${coinsLeft ? " Grab the bonus coins on the way!" : ""}`,
    };
  }
  if (fresh) {
    return { zone: fresh, text: `${assetById(fresh).name} just opened. Follow the gold trail and step into its circle to take a look.` };
  }
  if (game.cash >= 100) {
    return {
      zone: null,
      text: `You have ${money(game.cash)} in your pocket, where it won’t grow. Put it to work somewhere, keep a little for surprises, or treat Penny at the Style Shop.`,
    };
  }
  return { zone: "clock", text: "Nice work. When you’re ready, follow the gold trail to the Clock Tower to skip ahead a year." };
}

export default function MarketStreet() {
  const shell = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const minimap = useRef<HTMLCanvasElement>(null);
  const world = useRef<World | null>(null);
  const toastId = useRef(0);
  const [sound] = useState(createSound);
  const [status, setStatus] = useState<WorldStatus>("loading");
  const [phase, setPhase] = useState<Phase>("intro");
  const [game, setGame] = useState<GameState>(() => createGame(1, 10));
  const [zone, setZone] = useState<ZoneId | null>(null);
  const [panel, setPanel] = useState<ZoneId | null>(null);
  const [visited, setVisited] = useState<ZoneId[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [coinsLeft, setCoinsLeft] = useState(BONUS_COINS.length);
  const [review, setReview] = useState<{ record: YearRecord; badges: BadgeId[] } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const story = stories[0] ?? null;
  const playing = phase === "play";
  const guide = guideFor(game, visited, coinsLeft);

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
            if (!next) return;
            setPlacesOpen(false);
            setVisited((current) => (current.includes(next) ? current : [...current, next]));
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
    world.current?.setControls(playing && !story);
  }, [playing, story, status]);

  useEffect(() => {
    world.current?.setPanelOpen(Boolean(panel));
  }, [panel]);

  useEffect(() => {
    world.current?.setGuide(playing && !story && !panel ? guide.zone : null);
  }, [playing, story, panel, guide.zone]);

  // Each story card points the camera at the place it talks about, and an unlock opens that building with a party.
  useEffect(() => {
    const instance = world.current;
    if (!instance || phase !== "play") return;
    if (!story) {
      instance.focus(null);
      return;
    }
    if (story.type === "unlock") {
      instance.setLocked(Object.fromEntries(story.unlock.ids.map((id) => [id, false])));
      instance.celebrate(story.unlock.ids);
      instance.focus(story.unlock.ids[0]);
      sound.fanfare();
    } else {
      instance.focus(eventFocus(story.card, game));
    }
    // The camera only needs to move when a new card appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, phase]);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  function pushToast(text: string, Icon: LucideIcon) {
    const id = ++toastId.current;
    setToasts((current) => [...current.slice(-2), { id, text, Icon }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }

  function commit(next: GameState) {
    for (const id of next.badges.filter((badge) => !game.badges.includes(badge))) {
      pushToast(`Badge earned: ${badgeById(id).name}`, BADGE_ICONS[id]);
      sound.good();
    }
    setGame(next);
    world.current?.setStacks(next.holdings);
  }

  function beginYear(start: GameState) {
    let next = payday(start);
    const salary = salaryFor(next.year);
    const raise = next.year > 0 && salary > salaryFor(next.year - 1);
    const fresh = new Set(unlocksThisYear(next).flatMap((unlock) => unlock.ids));
    const card = eventCard(next);
    setZone(null);
    setPanel(null);
    setVisited([]);
    setStories([
      ...unlocksThisYear(next).map((unlock, index): Story => ({ type: "unlock", unlock, welcome: next.year === 0 && index === 0 })),
      ...(card ? [{ type: "event", card } satisfies Story] : []),
    ]);

    const instance = world.current;
    if (status === "ready" && instance) {
      instance.setLocked(Object.fromEntries(ASSETS.map((asset) => [asset.id, !isUnlocked(next, asset.id) || fresh.has(asset.id)])));
      instance.setLabels(labelsFor(next));
      instance.setStacks(next.holdings, true);
      instance.spawnCoins(BONUS_COINS, coinSeed(next));
      instance.startYear();
      instance.payday();
      setCoinsLeft(BONUS_COINS.length);
    } else {
      // Without 3D there is nothing to walk to, so the bonus coins arrive on their own.
      setCoinsLeft(0);
      next = BONUS_COINS.reduce(collectCoin, next);
    }
    sound.payday();
    pushToast(
      raise ? `You got a raise! Burger Barn now pays you ${money(salary)} a year.` : `Payday! Burger Barn paid you ${money(salary)}.`,
      raise ? TrendingUp : HandCoins,
    );
    setGame(next);
    setPhase("play");
    shell.current?.focus({ preventScroll: true });
  }

  function startGame(seed: number, years: number, dream: DreamId) {
    sound.unlock();
    world.current?.resetPlayer();
    world.current?.setHat(null);
    setReview(null);
    setToasts([]);
    beginYear(createGame(seed, years, dream));
  }

  function finishStory(choice?: string) {
    if (story?.type === "event" && choice) {
      const next = applyChoice(game, choice);
      const spent = next.purchases.length > game.purchases.length;
      const moved = ASSETS.map((asset) => asset.id).filter((id) => next.holdings[id] !== game.holdings[id]);
      for (const id of moved) {
        const change = next.holdings[id] - game.holdings[id];
        world.current?.flyCoins(id, change > 0 ? "in" : "out", Math.abs(change));
      }
      if (spent) world.current?.flyCoins("shop", "in", game.cash - next.cash);
      if (moved.length || spent) sound.buy();
      commit(next);
    }
    setStories((current) => current.slice(1));
    shell.current?.focus({ preventScroll: true });
  }

  async function advanceYear() {
    const next = endYear(game);
    const record = next.history[next.history.length - 1];
    const outcome = game.timeline[game.year];
    setPanel(null);
    setPlacesOpen(false);
    setPhase("year-end");
    sound.fastForward();
    const tags = Object.fromEntries(
      ASSETS.filter((asset) => isUnlocked(game, asset.id)).map((asset) => {
        const held = record.startHoldings[asset.id];
        const change = outcome.returns[asset.id];
        return [
          asset.id,
          held >= 1
            ? { text: signedMoney(held * change), up: change >= 0, owned: true }
            : { text: signedPercent(change, 0), up: change >= 0, owned: false },
        ];
      }),
    );
    await world.current?.playYearEnd({ economy: outcome.economy, stacks: next.holdings, tags });
    if (record.endWorth >= record.startWorth) sound.good();
    else sound.bad();
    setGame(next);
    setReview({ record, badges: next.badges.filter((badge) => !game.badges.includes(badge)) });
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

  function trade(kind: "buy" | "sell", asset: AssetId, amount: number) {
    const next = kind === "buy" ? buy(game, asset, amount) : sell(game, asset, amount);
    if (next === game) return;
    world.current?.flyCoins(asset, kind === "buy" ? "in" : "out", Math.abs(next.cash - game.cash));
    if (kind === "buy") sound.buy();
    else sound.sell();
    commit(next);
  }

  function shopHat(hat: HatId) {
    const next = buyHat(game, hat);
    if (next === game) return;
    world.current?.flyCoins("shop", "in", hatById(hat).price);
    world.current?.setHat(hat);
    sound.buy();
    pushToast(`Penny is wearing the ${hatById(hat).name.toLowerCase()}.`, ShoppingBag);
    commit(next);
  }

  function changeHat(hat: HatId | null) {
    world.current?.setHat(hat);
    setGame(wearHat(game, hat));
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shell.current?.requestFullscreen?.();
  }

  function toggleMute() {
    sound.setMuted(!muted);
    setMuted(!muted);
  }

  const worth = netWorth(game);
  const shownWorth = useCountUp(worth);
  const lastRecord = game.history[game.history.length - 1];
  const canFullscreen = typeof document !== "undefined" && document.fullscreenEnabled;
  const age = ageAt(Math.min(game.year, game.years));
  const dream = dreamById(game.dream);
  const DreamIcon = DREAM_ICONS[game.dream];
  const progress = Math.min(1, worth / game.goal);

  return (
    <div
      ref={shell}
      className={`market-shell ${fullscreen ? "is-fullscreen" : ""} ${playing ? "is-playing" : ""} ${story ? "has-story" : ""}`}
      tabIndex={-1}
      aria-label="Market Street game"
      onKeyDown={(event) => {
        if (!playing || story) return;
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
        hidden={!playing || status !== "ready" || Boolean(story)}
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
            <p className="market-pocket">
              <Wallet size={15} aria-hidden="true" /> In your pocket <strong>{money(game.cash)}</strong>
            </p>
            <div className="market-goal">
              <p>
                <DreamIcon size={15} aria-hidden="true" /> {dream.label}
                <strong>{money(game.goal)}</strong>
              </p>
              <div
                className="market-goal-bar"
                role="progressbar"
                aria-label={`Progress toward ${dream.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <span style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="market-tools" hidden={phase === "year-end"}>
            {status === "ready" && (
              <p
                className="market-coins"
                aria-label={`${BONUS_COINS.length - coinsLeft} of ${BONUS_COINS.length} bonus coins collected`}
              >
                <Coins size={17} aria-hidden="true" /> {BONUS_COINS.length - coinsLeft}/{BONUS_COINS.length}
              </p>
            )}
            <button
              type="button"
              className="market-icon-button"
              onClick={() => setPlacesOpen(!placesOpen)}
              aria-expanded={placesOpen}
              aria-label="Places"
              disabled={!playing || Boolean(story)}
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
                {ASSETS.map((asset) => {
                  const open = isUnlocked(game, asset.id) && !stories.some((item) => item.type === "unlock" && item.unlock.ids.includes(asset.id));
                  return (
                    <li key={asset.id}>
                      <button type="button" onClick={() => openPlace(asset.id)} disabled={!open}>
                        <i style={{ background: open ? asset.color : "#94a3b8" }} />
                        <span>
                          {asset.name}
                          <small>{open ? asset.kind : `Opens at age ${ageAt(unlockYear(asset.id, game.years))}`}</small>
                        </span>
                        {open ? <b>{game.holdings[asset.id] > 0 ? money(game.holdings[asset.id]) : ""}</b> : <Lock size={15} aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button type="button" onClick={() => openPlace("shop")}>
                    <i style={{ background: "#1f9e8f" }} />
                    <span>
                      Style Shop
                      <small>Hats for Penny</small>
                    </span>
                    <ShoppingBag size={16} aria-hidden="true" />
                  </button>
                </li>
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

          {playing && !panel && !story && (
            <div className="market-guide">
              <CoinMascot />
              <p>{status === "ready" ? guide.text : "Open Places to visit a building, then use the Clock Tower to skip ahead a year."}</p>
            </div>
          )}

          {playing && !story && panel === "clock" && (
            <ClockPanel game={game} coinsLeft={coinsLeft} onAdvance={advanceYear} onClose={() => setPanel(null)} />
          )}
          {playing && !story && panel === "shop" && (
            <ShopPanel game={game} onBuy={shopHat} onWear={changeHat} onClose={() => setPanel(null)} />
          )}
          {playing && !story && panel && panel !== "clock" && panel !== "shop" && (
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

          {playing && story && <StoryCard story={story} game={game} onDone={finishStory} />}

          {phase === "year-end" && (
            <p className="market-banner" role="status">
              A year goes by… <strong>Age {age + 1}</strong>
            </p>
          )}

          <ul className="market-toasts" aria-live="polite">
            {toasts.map(({ id, text, Icon }) => (
              <li key={id}>
                <Icon size={18} aria-hidden="true" /> {text}
              </li>
            ))}
          </ul>
        </>
      )}

      {phase === "intro" && <Intro status={status} onStart={(years, pick) => startGame(Math.floor(Math.random() * 1_000_000), years, pick)} />}
      {phase === "review" && review && (
        <YearReview game={game} record={review.record} badges={review.badges} onContinue={continueAfterReview} />
      )}
      {phase === "done" && (
        <FinalReport
          game={game}
          onReplay={() => startGame(game.seed, game.years, game.dream)}
          onNewGame={() => startGame(Math.floor(Math.random() * 1_000_000), game.years, game.dream)}
        />
      )}
    </div>
  );
}

function Intro({ status, onStart }: { status: WorldStatus; onStart: (years: number, dream: DreamId) => void }) {
  const [dream, setDream] = useState<DreamId>("car");
  return (
    <div className="market-modal">
      <article className="market-paper market-intro">
        <CoinMascot className="market-intro-mascot" />
        <p className="market-economy is-boom">Market Street</p>
        <h2>You’re 15 with $1,000 and a new job. Can you grow it into your dream?</h2>
        <p className="market-paper-sub">
          Every year Burger Barn pays you, and you decide what to do with the money. New places open in town as you get
          older, and the market won’t always be kind.
        </p>

        <fieldset className="market-dreams">
          <legend>Pick your dream</legend>
          {DREAMS.map((option) => {
            const Icon = DREAM_ICONS[option.id];
            return (
              <label key={option.id} className={dream === option.id ? "is-picked" : ""}>
                <input type="radio" name="dream" value={option.id} checked={dream === option.id} onChange={() => setDream(option.id)} />
                <Icon size={26} aria-hidden="true" />
                <span>{option.label}</span>
              </label>
            );
          })}
        </fieldset>

        <ul className="market-howto">
          <li>
            <Footprints size={22} aria-hidden="true" />
            <span>
              <strong>Walk around town</strong> Use WASD or the arrow keys, or click where you want to go. On a tablet,
              hold your finger down to steer.
            </span>
          </li>
          <li>
            <MousePointerClick size={22} aria-hidden="true" />
            <span>
              <strong>Step into a glowing circle</strong> Each building has one. Stand in it to put money in or take it
              out, and watch your pile of coins grow.
            </span>
          </li>
          <li>
            <Clock3 size={22} aria-hidden="true" />
            <span>
              <strong>Skip ahead at the Clock Tower</strong> A year flies by, your money goes up or down, and the
              newspaper explains what happened.
            </span>
          </li>
        </ul>
        {status === "failed" && (
          <p className="market-hype">
            Your browser can’t show the 3D town, so you’ll play from the Places menu instead and your bonus coins will
            arrive on their own.
          </p>
        )}
        <div className="market-final-actions">
          <button type="button" className="market-advance" disabled={status === "loading"} onClick={() => onStart(10, dream)}>
            {status === "loading" ? "Building the town…" : "Play 10 years"}
          </button>
          <button type="button" className="market-secondary" disabled={status === "loading"} onClick={() => onStart(5, dream)}>
            Quick game, 5 years
          </button>
        </div>
      </article>
    </div>
  );
}
