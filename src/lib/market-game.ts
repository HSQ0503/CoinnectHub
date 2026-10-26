import {
  ASSET_IDS,
  BOND_HEADLINES,
  COMPANY_EVENTS,
  ECONOMY_HEADLINES,
  LIFE_COSTS,
  LIFE_GIFTS,
  ROCKET_EVENTS,
  STOCK_BETA,
  assetById,
  type AssetId,
  type CompanyEvent,
  type Economy,
  type LifeEvent,
  type RocketMove,
} from "./market-data.ts";

export const START_AGE = 15;
export const START_CASH = 1000;
export const COINS_PER_YEAR = 9;

export type Holdings = Record<AssetId, number>;

export type YearOutcome = {
  economy: Economy;
  headline: string;
  inflation: number;
  returns: Holdings;
  news: Partial<Record<AssetId, string>>;
  lifeEvent: LifeEvent | null;
};

export type Trade = { year: number; asset: AssetId; amount: number };

export type YearRecord = {
  year: number;
  startWorth: number;
  endWorth: number;
  income: number;
  gain: number;
  forcedSales: number;
  shares: Holdings;
  cashShare: number;
};

export type GameState = {
  seed: number;
  years: number;
  year: number;
  cash: number;
  holdings: Holdings;
  basis: Holdings;
  timeline: YearOutcome[];
  income: number[];
  trades: Trade[];
  history: YearRecord[];
  priceLevel: number;
};

export function emptyHoldings(): Holdings {
  return { bank: 0, bonds: 0, index: 0, snacks: 0, bikes: 0, pixel: 0, rocket: 0 };
}

export function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

const between = (rng: Rng, [low, high]: [number, number]) =>
  low + rng() * (high - low);
const round3 = (value: number) => Math.round(value * 1000) / 1000;

function pick<T>(rng: Rng, items: T[]) {
  return items[Math.floor(rng() * items.length)];
}

function weighted<T>(rng: Rng, items: { item: T; weight: number }[]) {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll < 0) return entry.item;
  }
  return items[items.length - 1].item;
}

const MARKET_RANGE: Record<Economy, [number, number]> = {
  boom: [0.16, 0.32],
  normal: [0.06, 0.16],
  slowdown: [-0.06, 0.04],
  crash: [-0.32, -0.18],
};
const INFLATION_RANGE: Record<Economy, [number, number]> = {
  boom: [0.03, 0.05],
  normal: [0.02, 0.035],
  slowdown: [0.015, 0.03],
  crash: [0.005, 0.02],
};
const BANK_RANGE: Record<Economy, [number, number]> = {
  boom: [0.035, 0.045],
  normal: [0.03, 0.04],
  slowdown: [0.02, 0.03],
  crash: [0.01, 0.02],
};
const BOND_TILT: Record<Economy, number> = {
  boom: -0.03,
  normal: 0,
  slowdown: 0.03,
  crash: 0.06,
};

function drawEconomies(rng: Rng, years: number): Economy[] {
  // Every game gets one crash away from the edges, because living through one is the lesson.
  const crashYear = 1 + Math.floor(rng() * (years - 2));
  return Array.from({ length: years }, (_, year) => {
    if (year === crashYear) return "crash";
    if (year === crashYear + 1) {
      return weighted<Economy>(rng, [
        { item: "boom", weight: 5.5 },
        { item: "normal", weight: 3.5 },
        { item: "slowdown", weight: 1 },
      ]);
    }
    return weighted<Economy>(rng, [
      { item: "boom", weight: 2.5 },
      { item: "normal", weight: 5 },
      { item: "slowdown", weight: 2.5 },
    ]);
  });
}

function rocketMove(rng: Rng, economy: Economy): RocketMove {
  const weights: Record<RocketMove, number> =
    economy === "crash"
      ? { moon: 1, drift: 2, crash: 4.5, wipeout: 2.5 }
      : { moon: 2.7, drift: 3.2, crash: 3.3, wipeout: 0.8 };
  return weighted(
    rng,
    (Object.keys(weights) as RocketMove[]).map((item) => ({
      item,
      weight: weights[item],
    })),
  );
}

function drawLifeEvents(rng: Rng, years: number) {
  const slots = Array.from({ length: years - 1 }, (_, index) => index + 1);
  const events: (LifeEvent | null)[] = Array(years).fill(null);
  const costCount = years >= 8 ? 3 : 1;
  for (let count = 0; count < costCount + 1 && slots.length; count++) {
    const year = slots.splice(Math.floor(rng() * slots.length), 1)[0];
    const age = START_AGE + year;
    const pool =
      count < costCount
        ? LIFE_COSTS.filter((event) => (event.minAge ?? 0) <= age)
        : LIFE_GIFTS;
    events[year] = pick(rng, pool);
  }
  return events;
}

function drawTimeline(rng: Rng, years: number): YearOutcome[] {
  const economies = drawEconomies(rng, years);
  const lifeEvents = drawLifeEvents(rng, years);

  return economies.map((economy, year) => {
    const market = between(rng, MARKET_RANGE[economy]);
    const returns = emptyHoldings();
    const news: Partial<Record<AssetId, string>> = {};

    returns.bank = between(rng, BANK_RANGE[economy]);
    news.bank = `Penny Savings Bank pays ${(round3(returns.bank) * 100).toFixed(1)}% interest`;
    returns.bonds = between(rng, [0.02, 0.05]) + BOND_TILT[economy] + between(rng, [-0.02, 0.02]);
    news.bonds = BOND_HEADLINES[economy];
    returns.index = market;
    news.index =
      market >= 0
        ? `The 500 companies in the fund grow ${Math.round(market * 100)}% together`
        : `Most of the 500 companies in the fund lose value this year`;

    for (const id of ["snacks", "bikes", "pixel"] as const) {
      const event = weighted<CompanyEvent>(
        rng,
        COMPANY_EVENTS[id].map((item) => ({ item, weight: item.weight })),
      );
      const change = Math.max(
        -0.85,
        STOCK_BETA[id] * market + between(rng, event.shock) + between(rng, [-0.03, 0.03]),
      );
      // A clearly good or bad headline should never come with a move the other way, or the news teaches nothing.
      returns[id] =
        event.shock[1] < 0 ? Math.min(change, -0.02) : event.shock[0] > 0 ? Math.max(change, 0.02) : change;
      news[id] = event.text;
    }

    const move = rocketMove(rng, economy);
    returns.rocket = between(rng, ROCKET_EVENTS[move].range);
    news.rocket = ROCKET_EVENTS[move].text;

    for (const id of ASSET_IDS) returns[id] = round3(returns[id]);

    return {
      economy,
      headline: pick(rng, ECONOMY_HEADLINES[economy]),
      inflation: round3(between(rng, INFLATION_RANGE[economy])),
      returns,
      news,
      lifeEvent: lifeEvents[year],
    };
  });
}

export function growthOf(timeline: YearOutcome[], id: AssetId) {
  return timeline.reduce((total, year) => total * (1 + year.returns[id]), 1);
}

function isTeachable(timeline: YearOutcome[]) {
  const index = growthOf(timeline, "index");
  const bank = growthOf(timeline, "bank");
  const margin = timeline.length >= 8 ? 1.15 : 1.04;
  return index > bank * margin && growthOf(timeline, "rocket") < index * 4;
}

export function generateTimeline(seed: number, years: number) {
  // Real markets usually reward patience over a decade, so reroll the rare runs that teach the opposite.
  for (let attempt = 0; attempt < 60; attempt++) {
    const timeline = drawTimeline(createRng(seed + attempt * 7919), years);
    if (isTeachable(timeline)) return timeline;
  }
  return drawTimeline(createRng(seed), years);
}

export function createGame(seed: number, years: number): GameState {
  return {
    seed,
    years,
    year: 0,
    cash: START_CASH,
    holdings: emptyHoldings(),
    basis: emptyHoldings(),
    timeline: generateTimeline(seed, years),
    income: Array(years).fill(0),
    trades: [],
    history: [],
    priceLevel: 1,
  };
}

export function coinValues(year: number) {
  const value = START_AGE + year >= 21 ? 75 : START_AGE + year >= 18 ? 60 : 50;
  return [...Array(COINS_PER_YEAR - 1).fill(value), value * 2];
}

export function isFinished(state: GameState) {
  return state.year >= state.years;
}

export function invested(state: GameState) {
  return ASSET_IDS.reduce((total, id) => total + state.holdings[id], 0);
}

export function netWorth(state: GameState) {
  return state.cash + invested(state);
}

export function collectCoin(state: GameState, value: number): GameState {
  if (isFinished(state)) return state;
  const income = [...state.income];
  income[state.year] += value;
  return { ...state, cash: state.cash + value, income };
}

const toCents = (value: number) => Math.round(value * 100) / 100;

export function buy(state: GameState, asset: AssetId, amount: number): GameState {
  const spend = toCents(Math.min(amount, state.cash));
  if (spend <= 0 || isFinished(state)) return state;
  return {
    ...state,
    cash: toCents(state.cash - spend),
    holdings: { ...state.holdings, [asset]: state.holdings[asset] + spend },
    basis: { ...state.basis, [asset]: state.basis[asset] + spend },
    trades: [...state.trades, { year: state.year, asset, amount: spend }],
  };
}

export function sell(state: GameState, asset: AssetId, amount: number): GameState {
  const held = state.holdings[asset];
  const take = Math.min(amount, held);
  if (take <= 0 || isFinished(state)) return state;
  const left = held - take < 0.005 ? 0 : held - take;
  return {
    ...state,
    cash: toCents(state.cash + take),
    holdings: { ...state.holdings, [asset]: left },
    basis: {
      ...state.basis,
      [asset]: left === 0 ? 0 : state.basis[asset] * (left / held),
    },
    trades: [...state.trades, { year: state.year, asset, amount: -take }],
  };
}

// Emergencies drain the safest money first, the way most people would cover a bill.
const SELL_ORDER: AssetId[] = ["bank", "bonds", "index", "snacks", "bikes", "pixel", "rocket"];

export function endYear(state: GameState): GameState {
  if (isFinished(state)) return state;
  const outcome = state.timeline[state.year];
  const startWorth = netWorth(state);
  const shares = emptyHoldings();
  for (const id of ASSET_IDS) {
    shares[id] = startWorth > 0 ? state.holdings[id] / startWorth : 0;
  }

  const holdings = emptyHoldings();
  for (const id of ASSET_IDS) {
    holdings[id] = state.holdings[id] * (1 + outcome.returns[id]);
  }
  const gain = ASSET_IDS.reduce((total, id) => total + holdings[id] - state.holdings[id], 0);

  let cash = state.cash + (outcome.lifeEvent?.amount ?? 0);
  let forcedSales = 0;
  const basis = { ...state.basis };
  for (const id of SELL_ORDER) {
    if (cash >= 0) break;
    const take = Math.min(holdings[id], -cash);
    if (take <= 0) continue;
    basis[id] *= (holdings[id] - take) / holdings[id];
    holdings[id] -= take;
    cash += take;
    forcedSales += take;
  }
  cash = Math.max(0, toCents(cash));

  const next = {
    ...state,
    cash,
    holdings,
    basis,
    year: state.year + 1,
    priceLevel: state.priceLevel * (1 + outcome.inflation),
  };
  const endWorth = netWorth(next);
  return {
    ...next,
    history: [
      ...state.history,
      {
        year: state.year,
        startWorth,
        endWorth,
        income: state.income[state.year],
        gain,
        forcedSales,
        shares,
        cashShare: startWorth > 0 ? state.cash / startWorth : 1,
      },
    ],
  };
}

export type Strategy = "you" | "cash" | "bank" | "index" | "mix" | "rocket";

export const STRATEGY_LABELS: Record<Strategy, string> = {
  you: "Your choices",
  cash: "Kept it all as cash",
  bank: "All in the savings bank",
  index: "All in the Whole Market Fund",
  mix: "Split evenly across every building",
  rocket: "All in Rocket Coin",
};

function strategyReturn(outcome: YearOutcome, strategy: Exclude<Strategy, "you">) {
  if (strategy === "cash") return 0;
  if (strategy === "mix") {
    return ASSET_IDS.reduce((total, id) => total + outcome.returns[id], 0) / ASSET_IDS.length;
  }
  return outcome.returns[strategy];
}

// Each benchmark gets the same paychecks and surprise bills you did, so only the choices differ.
export function benchmarkPaths(state: GameState) {
  const paths = {} as Record<Strategy, number[]>;
  paths.you = [START_CASH, ...state.history.map((record) => record.endWorth)];
  for (const strategy of ["cash", "bank", "index", "mix", "rocket"] as const) {
    let value = START_CASH;
    const path = [value];
    state.history.forEach((record) => {
      const outcome = state.timeline[record.year];
      value = (value + record.income) * (1 + strategyReturn(outcome, strategy));
      value = Math.max(0, value + (outcome.lifeEvent?.amount ?? 0));
      path.push(value);
    });
    paths[strategy] = path;
  }
  return paths;
}

export type Lesson = { id: string; tone: "good" | "watch"; title: string; body: string };

const percent = (value: number) => `${Math.round(value * 100)}%`;

function soldAfterCrash(state: GameState) {
  return state.trades.some((trade) => {
    const previous = state.timeline[trade.year - 1];
    return (
      trade.amount <= -50 &&
      ["index", "snacks", "bikes", "pixel"].includes(trade.asset) &&
      previous?.economy === "crash" &&
      state.timeline[trade.year].returns[trade.asset] > 0
    );
  });
}

export function lessonsFor(state: GameState): Lesson[] {
  const lessons: Lesson[] = [];
  const records = state.history;
  const avgCash = records.reduce((total, record) => total + record.cashShare, 0) / records.length;
  const maxSingle = Math.max(
    ...records.map((record) =>
      Math.max(record.shares.snacks, record.shares.bikes, record.shares.pixel, record.shares.rocket),
    ),
  );
  const spread = records.filter(
    (record) => ASSET_IDS.filter((id) => record.shares[id] >= 0.1).length >= 3,
  ).length;
  const crashYear = state.timeline.findIndex((outcome) => outcome.economy === "crash");
  const firstThousand = START_CASH * growthOf(state.timeline, "index");

  if (soldAfterCrash(state)) {
    const bounce = state.timeline[crashYear + 1]?.returns.index ?? 0;
    lessons.push({
      id: "panic",
      tone: "watch",
      title: "You sold right after the crash",
      body: `The year after the crash, the Whole Market Fund moved ${bounce >= 0 ? "up" : "down"} ${percent(Math.abs(bounce))}. Selling after a big drop turns a temporary loss into a permanent one.`,
    });
  } else if (crashYear >= 0 && records[crashYear]?.shares.index > 0.1) {
    lessons.push({
      id: "calm",
      tone: "good",
      title: "You held on through the crash",
      body: "Your Whole Market Fund took a hit in the crash, but you didn’t sell. Staying invested is how people recover when the market bounces back.",
    });
  }

  if (maxSingle > 0.5) {
    lessons.push({
      id: "concentrated",
      tone: "watch",
      title: "A lot of your money rode on one bet",
      body: "At one point, more than half of your money was in a single company or coin. When one investment is that big, one bad headline can wipe out years of saving.",
    });
  } else if (spread >= Math.ceil(records.length / 2)) {
    lessons.push({
      id: "diversified",
      tone: "good",
      title: "You spread your money out",
      body: "Most years, your money sat in at least three places. That’s diversification, and it meant no single bad headline could sink you.",
    });
  }

  if (avgCash > 0.4) {
    lessons.push({
      id: "cash",
      tone: "watch",
      title: "Your cash sat still while prices rose",
      body: `Prices went up ${percent(state.priceLevel - 1)} during the game. Money in your wallet earned nothing, so each dollar bought less every year.`,
    });
  }

  const boughtHype = state.trades.some(
    (trade) =>
      trade.asset === "rocket" &&
      trade.amount > 0 &&
      (state.timeline[trade.year - 1]?.returns.rocket ?? 0) >= 0.5,
  );
  if (boughtHype) {
    lessons.push({
      id: "hype",
      tone: "watch",
      title: "You bought Rocket Coin after a huge jump",
      body: "Buying something because it just shot up is called chasing hype. Last year’s jump says nothing about next year, and hype coins can fall just as fast.",
    });
  }

  if (records.some((record) => record.forcedSales > 0)) {
    lessons.push({
      id: "emergency",
      tone: "watch",
      title: "A surprise bill forced you to sell",
      body: "You didn’t have enough cash for an emergency, so investments were sold to cover it. Keeping a few hundred dollars in a savings account protects your investments.",
    });
  }

  lessons.push({
    id: "compound",
    tone: "good",
    title: "Time is your biggest advantage",
    body: `$1,000 put in the Whole Market Fund at age ${START_AGE} and left alone would be worth ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(firstThousand)} by age ${START_AGE + state.years}. Starting young gives compounding more years to work.`,
  });

  return lessons;
}

export type Profile = { title: string; description: string };

export function profileFor(state: GameState): Profile {
  const totals = emptyHoldings();
  let cash = 0;
  for (const record of state.history) {
    for (const id of ASSET_IDS) totals[id] += record.shares[id];
    cash += record.cashShare;
  }
  const safe = totals.bank + totals.bonds;
  const single = totals.snacks + totals.bikes + totals.pixel;
  const groups = [
    { key: "cash", value: cash },
    { key: "safe", value: safe },
    { key: "index", value: totals.index },
    { key: "single", value: single },
    { key: "rocket", value: totals.rocket },
  ].sort((a, b) => b.value - a.value);
  const sum = groups.reduce((total, group) => total + group.value, 0) || 1;
  const [top] = groups;

  if (top.value / sum < 0.45) {
    return {
      title: "The Balanced Builder",
      description: "You mixed safe places with growth, so no single surprise could knock you out.",
    };
  }
  const profiles: Record<string, Profile> = {
    cash: {
      title: "The Wallet Keeper",
      description: "You kept most of your money as cash. It never dropped, but it never grew either.",
    },
    safe: {
      title: "The Steady Saver",
      description: "You chose safety first with savings and bonds. Your money grew slowly and never had a scary year.",
    },
    index: {
      title: "The Index Investor",
      description: "You bet on the whole economy instead of picking winners, which is what many professionals recommend.",
    },
    single: {
      title: "The Stock Picker",
      description: "You hunted for winning companies. It’s exciting, but a single company can surprise you in either direction.",
    },
    rocket: {
      title: "The Thrill Seeker",
      description: "You went big on hype. Sometimes it pays, but most hype coins end up crashing.",
    },
  };
  return profiles[top.key];
}

export function riskLabel(risk: number) {
  return ["Very low", "Low", "Medium", "High", "Very high"][risk - 1];
}

export function hypeNote(state: GameState) {
  const last = state.timeline[state.year - 1];
  if (!last || last.returns.rocket < 0.5) return null;
  return `Rocket Coin jumped ${percent(last.returns.rocket)} last year, and everyone says it will keep climbing. Remember that a big jump doesn’t tell you what happens next.`;
}

export function assetName(id: AssetId) {
  return assetById(id).name;
}
