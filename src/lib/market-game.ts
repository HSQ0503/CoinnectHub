import {
  ASSET_IDS,
  COMPANY_EVENTS,
  ECONOMY_HEADLINES,
  LIFE_COSTS,
  LIFE_GIFTS,
  ROCKET_EVENTS,
  STOCK_BETA,
  TEMPTATIONS,
  TIPS,
  UNLOCK_STORIES,
  assetById,
  hatById,
  unlockYear,
  type AssetId,
  type BadgeId,
  type CompanyEvent,
  type DreamId,
  type Economy,
  type HatId,
  type LifeEvent,
  type RocketMove,
  type Temptation,
  type Tip,
} from "./market-data.ts";

export const START_AGE = 15;
export const START_CASH = 1000;
export const BONUS_COINS = [10, 10, 10, 10, 10, 10, 40];
const BONUS_TOTAL = BONUS_COINS.reduce((total, value) => total + value, 0);

export type Holdings = Record<AssetId, number>;

export type YearEvent =
  | { kind: "crash" }
  | { kind: "hype" }
  | { kind: "tip"; tip: Tip }
  | { kind: "temptation"; temptation: Temptation };

export type YearOutcome = {
  economy: Economy;
  headline: string;
  inflation: number;
  returns: Holdings;
  news: Record<AssetId, string>;
  lifeEvent: LifeEvent | null;
  event: YearEvent | null;
};

export type Trade = { year: number; asset: AssetId; amount: number };
export type Purchase = { year: number; name: string; price: number };
export type ChoiceRecord = { id: string; amount: number };

export type YearRecord = {
  year: number;
  startWorth: number;
  endWorth: number;
  income: number;
  gain: number;
  startHoldings: Holdings;
  forcedSales: number;
  shares: Holdings;
  cashShare: number;
};

export type GameState = {
  seed: number;
  years: number;
  year: number;
  dream: DreamId;
  goal: number;
  cash: number;
  holdings: Holdings;
  basis: Holdings;
  timeline: YearOutcome[];
  income: number[];
  paydays: number;
  trades: Trade[];
  purchases: Purchase[];
  choices: Partial<Record<number, ChoiceRecord>>;
  hats: HatId[];
  hat: HatId | null;
  badges: BadgeId[];
  history: YearRecord[];
  priceLevel: number;
};

export function emptyHoldings(): Holdings {
  return { bank: 0, index: 0, snacks: 0, pixel: 0, rocket: 0 };
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

const between = (rng: Rng, [low, high]: [number, number]) => low + rng() * (high - low);
const round3 = (value: number) => Math.round(value * 1000) / 1000;
const toCents = (value: number) => Math.round(value * 100) / 100;

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const money = (value: number) => dollars.format(Math.round(value));
const percent = (value: number) => `${Math.round(Math.abs(value) * 100)}%`;

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

export function ageAt(year: number) {
  return START_AGE + year;
}

export function salaryFor(year: number) {
  const age = ageAt(year);
  return age >= 21 ? 750 : age >= 18 ? 600 : 500;
}

// Every game gets one crash once the Market Fund has been open for a while, because living through one is the lesson.
function crashRange(years: number): [number, number] {
  return years >= 8 ? [3, years - 3] : [2, years - 2];
}

function drawEconomies(rng: Rng, years: number, crashYear: number): Economy[] {
  return Array.from({ length: years }, (_, year) => {
    if (year === crashYear) return "crash";
    if (year === crashYear + 1) {
      return weighted<Economy>(rng, [
        { item: "boom", weight: 7 },
        { item: "normal", weight: 3 },
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
      : { moon: 2.2, drift: 3.4, crash: 3.4, wipeout: 1 };
  return weighted(
    rng,
    (Object.keys(weights) as RocketMove[]).map((item) => ({ item, weight: weights[item] })),
  );
}

function drawLifeEvents(rng: Rng, years: number) {
  const slots = Array.from({ length: years - 1 }, (_, index) => index + 1);
  const events: (LifeEvent | null)[] = Array(years).fill(null);
  const costCount = years >= 8 ? 3 : 1;
  for (let count = 0; count < costCount + 1 && slots.length; count++) {
    const year = slots.splice(Math.floor(rng() * slots.length), 1)[0];
    const pool =
      count < costCount
        ? LIFE_COSTS.filter((event) => (event.minAge ?? 0) <= ageAt(year))
        : LIFE_GIFTS;
    events[year] = pick(rng, pool);
  }
  return events;
}

function planEvents(rng: Rng, years: number, crashYear: number, moonYear: number) {
  const events: (YearEvent | null)[] = Array(years).fill(null);
  if (crashYear + 1 < years) events[crashYear + 1] = { kind: "crash" };
  if (moonYear + 1 < years && !events[moonYear + 1]) events[moonYear + 1] = { kind: "hype" };
  const open = (from: number) =>
    Array.from({ length: years }, (_, year) => year).filter((year) => year >= from && !events[year]);

  const tipYears = open(unlockYear("pixel", years) + 1);
  if (tipYears.length) events[pick(rng, tipYears)] = { kind: "tip", tip: pick(rng, TIPS) };

  const temptationCount = years >= 8 ? 2 : 1;
  const used = new Set<string>();
  for (let count = 0; count < temptationCount; count++) {
    const choices = open(1);
    if (!choices.length) break;
    const year = pick(rng, choices);
    const pool = TEMPTATIONS.filter((item) => (item.minAge ?? 0) <= ageAt(year) && !used.has(item.id));
    if (!pool.length) continue;
    const temptation = pick(rng, pool);
    used.add(temptation.id);
    events[year] = { kind: "temptation", temptation };
  }
  return events;
}

function drawTimeline(rng: Rng, years: number): YearOutcome[] {
  const [low, high] = crashRange(years);
  const crashYear = low + Math.floor(rng() * (high - low + 1));
  const rocketOpens = unlockYear("rocket", years);
  let moonYear = rocketOpens + Math.floor(rng() * (years - 1 - rocketOpens));
  if (moonYear === crashYear) moonYear = crashYear > rocketOpens ? crashYear - 1 : crashYear + 1;
  const economies = drawEconomies(rng, years, crashYear);
  const lifeEvents = drawLifeEvents(rng, years);
  const events = planEvents(rng, years, crashYear, moonYear);

  return economies.map((economy, year) => {
    const market = round3(between(rng, MARKET_RANGE[economy]));
    const returns = emptyHoldings();
    const news = {} as Record<AssetId, string>;

    returns.bank = round3(between(rng, BANK_RANGE[economy]));
    news.bank = `The bank paid ${(returns.bank * 100).toFixed(1)}% interest`;
    returns.index = market;
    news.index =
      market >= 0
        ? `The companies in the fund grew ${Math.round(market * 100)}% together`
        : "Most of the companies in the fund lost value";

    for (const id of ["snacks", "pixel"] as const) {
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

    // The year everyone piles into Rocket Coin is the year it falls, which is how hype usually ends.
    const move: RocketMove =
      year === moonYear
        ? "moon"
        : year === moonYear + 1
          ? weighted<RocketMove>(rng, [
              { item: "crash", weight: 3 },
              { item: "wipeout", weight: 1 },
            ])
          : rocketMove(rng, economy);
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
      event: events[year],
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
  return (
    index > bank * margin &&
    growthOf(timeline, "rocket") < index * 3 &&
    growthOf(timeline, "pixel") < index * 2.2 &&
    growthOf(timeline, "snacks") < index * 1.8
  );
}

export function generateTimeline(seed: number, years: number) {
  // Real markets usually reward patience over a decade, so reroll the rare runs that teach the opposite.
  for (let attempt = 0; attempt < 80; attempt++) {
    const timeline = drawTimeline(createRng(seed + attempt * 7919), years);
    if (isTeachable(timeline)) return timeline;
  }
  return drawTimeline(createRng(seed), years);
}

type Pick = "cash" | AssetId;

// Plays a fixed plan with the given yearly income, using the bank until the planned place opens.
function simulate(timeline: YearOutcome[], incomes: number[], plan: Pick) {
  let value = START_CASH;
  const path = [value];
  incomes.forEach((income, year) => {
    const outcome = timeline[year];
    const asset = plan === "cash" ? null : unlockYear(plan, timeline.length) <= year ? plan : "bank";
    value = (value + income) * (1 + (asset ? outcome.returns[asset] : 0));
    value = Math.max(0, value + (outcome.lifeEvent?.amount ?? 0));
    path.push(value);
  });
  return path;
}

// The goal sits a little past what steady saving can reach, so getting there takes some investing.
const GOAL_SHARE = 0.3;

export function goalFor(timeline: YearOutcome[]) {
  const incomes = (bonus: number) => timeline.map((_, year) => salaryFor(year) + BONUS_TOTAL * bonus);
  // Assume a player grabs most of the bonus coins, but never let saving every coin in the bank be enough.
  const typical = incomes(0.6);
  const bank = simulate(timeline, typical, "bank").at(-1)!;
  const index = simulate(timeline, typical, "index").at(-1)!;
  const savedEverything = simulate(timeline, incomes(1), "bank").at(-1)!;
  const goal = Math.round((bank + GOAL_SHARE * (index - bank)) / 100) * 100;
  const margin = timeline.length >= 8 ? 1.04 : 1.02;
  return Math.max(goal, Math.ceil((savedEverything * margin) / 100) * 100);
}

export function createGame(seed: number, years: number, dream: DreamId = "car"): GameState {
  const timeline = generateTimeline(seed, years);
  return {
    seed,
    years,
    year: 0,
    dream,
    goal: goalFor(timeline),
    cash: START_CASH,
    holdings: emptyHoldings(),
    basis: emptyHoldings(),
    timeline,
    income: Array(years).fill(0),
    paydays: 0,
    trades: [],
    purchases: [],
    choices: {},
    hats: [],
    hat: null,
    badges: [],
    history: [],
    priceLevel: 1,
  };
}

export function isFinished(state: GameState) {
  return state.year >= state.years;
}

export function isUnlocked(state: GameState, id: AssetId) {
  return unlockYear(id, state.years) <= state.year;
}

export function unlocksThisYear(state: GameState) {
  return UNLOCK_STORIES.filter((story) => unlockYear(story.ids[0], state.years) === state.year);
}

export function invested(state: GameState) {
  return ASSET_IDS.reduce((total, id) => total + state.holdings[id], 0);
}

export function netWorth(state: GameState) {
  return state.cash + invested(state);
}

const MARKET_IDS: AssetId[] = ["index", "snacks", "pixel", "rocket"];

function marketValue(holdings: Holdings) {
  return MARKET_IDS.reduce((total, id) => total + holdings[id], 0);
}

function choiceFor(state: GameState, kind: YearEvent["kind"]) {
  const year = state.timeline.findIndex((outcome) => outcome.event?.kind === kind);
  return year >= 0 ? { year, choice: state.choices[year] } : null;
}

function soldAfterCrash(state: GameState) {
  const reaction = choiceFor(state, "crash");
  if (!reaction) return false;
  const manual = state.trades.some(
    (trade) => trade.year === reaction.year && trade.amount <= -100 && MARKET_IDS.includes(trade.asset),
  );
  return reaction.choice?.id === "sell" || manual;
}

function award(state: GameState): GameState {
  const earned = new Set(state.badges);
  const finishedYear = (year: number) => state.history.some((record) => record.year === year);

  if (state.trades.some((trade) => trade.year === 0 && trade.amount > 0)) earned.add("early");
  if (ASSET_IDS.filter((id) => state.holdings[id] >= 100).length >= 3) earned.add("basket");

  const reaction = choiceFor(state, "crash");
  if (reaction && finishedYear(reaction.year) && ["hold", "buy"].includes(reaction.choice?.id ?? "") && !soldAfterCrash(state)) {
    earned.add("cool");
  }
  const hype = choiceFor(state, "hype");
  const chasedHype = state.trades.some((trade) => trade.year === hype?.year && trade.asset === "rocket" && trade.amount > 0);
  if (hype && finishedYear(hype.year) && hype.choice?.id === "skip" && !chasedHype) earned.add("hype");

  if (state.history.some((record) => (state.timeline[record.year].lifeEvent?.amount ?? 0) < 0 && record.forcedSales === 0)) {
    earned.add("rainy");
  }
  if (isFinished(state) && netWorth(state) >= state.goal) earned.add("dream");

  return earned.size === state.badges.length ? state : { ...state, badges: [...earned] };
}

export function payday(state: GameState): GameState {
  if (isFinished(state) || state.paydays > state.year) return state;
  const salary = salaryFor(state.year);
  const income = [...state.income];
  income[state.year] += salary;
  return { ...state, cash: state.cash + salary, income, paydays: state.year + 1 };
}

export function collectCoin(state: GameState, value: number): GameState {
  if (isFinished(state)) return state;
  const income = [...state.income];
  income[state.year] += value;
  return { ...state, cash: state.cash + value, income };
}

export function buy(state: GameState, asset: AssetId, amount: number): GameState {
  const spend = toCents(Math.min(amount, state.cash));
  if (spend <= 0 || isFinished(state) || !isUnlocked(state, asset)) return state;
  return award({
    ...state,
    cash: toCents(state.cash - spend),
    holdings: { ...state.holdings, [asset]: state.holdings[asset] + spend },
    basis: { ...state.basis, [asset]: state.basis[asset] + spend },
    trades: [...state.trades, { year: state.year, asset, amount: spend }],
  });
}

export function sell(state: GameState, asset: AssetId, amount: number): GameState {
  const held = state.holdings[asset];
  const take = Math.min(amount, held);
  if (take <= 0 || isFinished(state)) return state;
  const left = held - take < 0.005 ? 0 : held - take;
  return award({
    ...state,
    cash: toCents(state.cash + take),
    holdings: { ...state.holdings, [asset]: left },
    basis: { ...state.basis, [asset]: left === 0 ? 0 : state.basis[asset] * (left / held) },
    trades: [...state.trades, { year: state.year, asset, amount: -take }],
  });
}

function spend(state: GameState, name: string, price: number): GameState {
  if (price > state.cash + 0.005 || isFinished(state)) return state;
  return {
    ...state,
    cash: toCents(state.cash - price),
    purchases: [...state.purchases, { year: state.year, name, price }],
  };
}

export function buyHat(state: GameState, id: HatId): GameState {
  if (state.hats.includes(id)) return { ...state, hat: id };
  const hat = hatById(id);
  const next = spend(state, hat.name.toLowerCase(), hat.price);
  return next === state ? state : { ...next, hats: [...next.hats, id], hat: id };
}

export function wearHat(state: GameState, id: HatId | null): GameState {
  return id === null || state.hats.includes(id) ? { ...state, hat: id } : state;
}

// Emergencies drain the safest money first, the way most people would cover a bill.
const SELL_ORDER: AssetId[] = ["bank", "index", "snacks", "pixel", "rocket"];

export function endYear(state: GameState): GameState {
  if (isFinished(state)) return state;
  const paid = payday(state);
  const outcome = paid.timeline[paid.year];
  const startWorth = netWorth(paid);
  const shares = emptyHoldings();
  const holdings = emptyHoldings();
  for (const id of ASSET_IDS) {
    shares[id] = startWorth > 0 ? paid.holdings[id] / startWorth : 0;
    holdings[id] = paid.holdings[id] * (1 + outcome.returns[id]);
  }
  const gain = ASSET_IDS.reduce((total, id) => total + holdings[id] - paid.holdings[id], 0);

  let cash = paid.cash + (outcome.lifeEvent?.amount ?? 0);
  // Savings are meant to cover surprises, so only money pulled out of real investments counts as a forced sale.
  let forcedSales = 0;
  const basis = { ...paid.basis };
  for (const id of SELL_ORDER) {
    if (cash >= 0) break;
    const take = Math.min(holdings[id], -cash);
    if (take <= 0) continue;
    basis[id] *= (holdings[id] - take) / holdings[id];
    holdings[id] -= take;
    cash += take;
    if (id !== "bank") forcedSales += take;
  }
  cash = Math.max(0, toCents(cash));

  const next = {
    ...paid,
    cash,
    holdings,
    basis,
    year: paid.year + 1,
    priceLevel: paid.priceLevel * (1 + outcome.inflation),
  };
  return award({
    ...next,
    history: [
      ...paid.history,
      {
        year: paid.year,
        startWorth,
        endWorth: netWorth(next),
        income: paid.income[paid.year],
        gain,
        startHoldings: { ...paid.holdings },
        forcedSales,
        shares,
        cashShare: startWorth > 0 ? paid.cash / startWorth : 1,
      },
    ],
  });
}

export type Choice = { id: string; label: string; disabled?: boolean };
export type EventCard = { kind: YearEvent["kind"]; title: string; body: string; choices: Choice[] };

const offer = (state: GameState) => Math.min(200, Math.floor(state.cash / 10) * 10);

export function eventCard(state: GameState): EventCard | null {
  const event = state.timeline[state.year]?.event;
  if (!event || state.choices[state.year]) return null;

  if (event.kind === "crash") {
    const last = state.history.at(-1);
    const loss = last ? MARKET_IDS.reduce((total, id) => total + last.startHoldings[id] * state.timeline[last.year].returns[id], 0) : 0;
    if (marketValue(state.holdings) >= 1) {
      return {
        kind: "crash",
        title: "The market crashed last year",
        body: `Your investments lost ${money(-Math.min(0, loss))}, and everyone on the news is panicking. What do you want to do?`,
        choices: [
          { id: "sell", label: "Sell everything before it drops more" },
          { id: "hold", label: "Hold on and wait it out" },
          { id: "buy", label: `Put your pocket money (${money(state.cash)}) into the Market Fund`, disabled: state.cash < 50 },
        ],
      };
    }
    return {
      kind: "crash",
      title: "Stocks are on sale",
      body: "The market crashed last year, so the Market Fund costs a lot less than it did. Nobody knows whether it will keep falling or bounce back.",
      choices: [
        { id: "buy", label: `Buy ${money(state.cash)} of the Market Fund`, disabled: state.cash < 50 },
        { id: "wait", label: "Stay out and wait to see what happens" },
      ],
    };
  }

  if (event.kind === "hype") {
    const jump = state.timeline[state.year - 1].returns.rocket;
    return {
      kind: "hype",
      title: "Everyone is buying Rocket Coin",
      body: `Rocket Coin went up ${percent(jump)} last year. Kids at school are bragging about it, and your friend says it’s headed to the moon.`,
      choices: [
        { id: "buy", label: `Buy ${money(offer(state))} of Rocket Coin`, disabled: offer(state) < 50 },
        { id: "skip", label: "Skip it" },
      ],
    };
  }

  if (event.kind === "tip") {
    return {
      kind: "tip",
      title: "You heard a hot tip",
      body: event.tip.text,
      choices: [
        { id: "buy", label: `Buy ${money(offer(state))} of ${assetById(event.tip.asset).name}`, disabled: offer(state) < 50 },
        { id: "skip", label: "Skip it" },
      ],
    };
  }

  const { temptation } = event;
  return {
    kind: "temptation",
    title: `Buy ${temptation.name}?`,
    body: `${temptation.text} It costs ${money(temptation.price)}.`,
    choices: [
      { id: "buy", label: `Buy it for ${money(temptation.price)}`, disabled: state.cash < temptation.price },
      { id: "skip", label: "Skip it and keep the money" },
    ],
  };
}

export function applyChoice(state: GameState, id: string): GameState {
  const event = state.timeline[state.year]?.event;
  const offered = eventCard(state)?.choices.find((choice) => choice.id === id);
  if (!event || !offered || offered.disabled) return state;
  let next = state;
  let amount = 0;

  if (event.kind === "crash" && id === "sell") {
    for (const asset of MARKET_IDS) next = sell(next, asset, next.holdings[asset]);
  } else if (event.kind === "crash" && id === "buy") {
    amount = next.cash;
    next = buy(next, "index", amount);
  } else if ((event.kind === "hype" || event.kind === "tip") && id === "buy") {
    amount = offer(next);
    next = buy(next, event.kind === "hype" ? "rocket" : event.tip.asset, amount);
  } else if (event.kind === "temptation" && id === "buy") {
    amount = event.temptation.price;
    next = spend(next, event.temptation.name, amount);
  }
  return { ...next, choices: { ...next.choices, [state.year]: { id, amount } } };
}

export type Feedback = { tone: "good" | "watch" | "neutral"; text: string };

export function eventFeedback(state: GameState, year: number): Feedback | null {
  const event = state.timeline[year]?.event;
  const choice = state.choices[year];
  if (!event || !choice) return null;
  const returns = state.timeline[year].returns;

  if (event.kind === "crash") {
    const bounce = returns.index;
    const up = bounce > 0;
    const texts: Record<string, Feedback> = {
      sell: up
        ? { tone: "watch", text: `You sold after the crash, and then the Market Fund bounced back ${percent(bounce)} this year. Selling turned a temporary drop into a real loss.` }
        : { tone: "neutral", text: "You sold after the crash, and the market slipped again this year. Over long periods it has always come back, though, so selling usually means missing the recovery." },
      hold: up
        ? { tone: "good", text: `You held on, and the Market Fund bounced back ${percent(bounce)} this year. Waiting it out paid off.` }
        : { tone: "neutral", text: "You held on even though the market dipped again this year. It has always recovered eventually, and people who wait usually come out ahead." },
      buy: up
        ? { tone: "good", text: `You bought while prices were low, and the Market Fund rose ${percent(bounce)}. Buying when everyone else is scared is hard, and it worked.` }
        : { tone: "neutral", text: "You bought after the crash and the market dipped a little more. Nobody can pick the exact bottom, but buying low tends to pay off over time." },
      wait: up
        ? { tone: "watch", text: `You waited, and the Market Fund rose ${percent(bounce)} without you. Nobody can tell when the bottom is, which is why many people just keep investing.` }
        : { tone: "neutral", text: "You waited, and the market slipped a little more. Nobody can tell when the bottom is, so many people just keep investing steadily." },
    };
    return texts[choice.id] ?? null;
  }

  if (event.kind === "hype") {
    const change = returns.rocket;
    if (choice.id === "buy") {
      return {
        tone: "watch",
        text: `Rocket Coin ${change < 0 ? "fell" : "rose"} ${percent(change)} this year, so the ${money(choice.amount)} you put in is now worth ${money(choice.amount * (1 + change))}. Hype usually fades as fast as it shows up.`,
      };
    }
    return change < 0
      ? { tone: "good", text: `Rocket Coin fell ${percent(change)} this year. Skipping the hype kept your money safe.` }
      : { tone: "neutral", text: `Rocket Coin rose ${percent(change)} this year. Skipping hype means sometimes missing out, but it also keeps you from the crashes.` };
  }

  if (event.kind === "tip") {
    const { name } = assetById(event.tip.asset);
    const change = returns[event.tip.asset];
    if (choice.id === "buy") {
      return change > 0
        ? { tone: "neutral", text: `${name} went up ${percent(change)}, so the tip worked this time. Tips like that are right about as often as a coin flip, so it was mostly luck.` }
        : { tone: "watch", text: `${name} dropped ${percent(change)}, so the ${money(choice.amount)} you put in is now ${money(choice.amount * (1 + change))}. Tips from friends and videos are usually just guesses.` };
    }
    return change > 0
      ? { tone: "neutral", text: `${name} went up ${percent(change)}, so you missed out this time. Tips are a coin flip, though, and ignoring them is still a smart habit.` }
      : { tone: "good", text: `${name} dropped ${percent(change)}. Ignoring the tip kept your money safe.` };
  }

  return choice.id === "buy"
    ? { tone: "neutral", text: `You bought ${event.temptation.name} for ${money(choice.amount)}. Enjoy it, and remember that money you spend stops growing.` }
    : { tone: "good", text: `You skipped ${event.temptation.name} and kept ${money(event.temptation.price)} working for you.` };
}

// A rough long-run average for the whole market, used only to show what spending could have become.
export const LONG_RUN_RETURN = 0.08;

export function couldGrowTo(amount: number, yearsLeft: number) {
  return amount * (1 + LONG_RUN_RETURN) ** yearsLeft;
}

export type Strategy = "you" | "cash" | "bank" | "index" | "rocket";

export const STRATEGY_LABELS: Record<Strategy, string> = {
  you: "Your choices",
  cash: "Kept it all in your pocket",
  bank: "Everything in the Savings Bank",
  index: "Everything in the Market Fund",
  rocket: "Everything in Rocket Coin",
};

// Each benchmark gets the same paychecks, coins, and surprise bills you did, so only the choices differ.
export function benchmarkPaths(state: GameState) {
  const incomes = state.history.map((record) => record.income);
  return {
    you: [START_CASH, ...state.history.map((record) => record.endWorth)],
    cash: simulate(state.timeline, incomes, "cash"),
    bank: simulate(state.timeline, incomes, "bank"),
    index: simulate(state.timeline, incomes, "index"),
    rocket: simulate(state.timeline, incomes, "rocket"),
  } satisfies Record<Strategy, number[]>;
}

export function spentGrowth(state: GameState) {
  return state.purchases.reduce((total, purchase) => {
    const after = state.timeline.slice(purchase.year, state.years);
    return total + after.reduce((value, outcome) => value * (1 + outcome.returns.index), purchase.price);
  }, 0);
}

export type Lesson = { id: string; tone: "good" | "watch"; title: string; body: string };

export function lessonsFor(state: GameState): Lesson[] {
  const lessons: Lesson[] = [];
  const records = state.history;
  const avgCash = records.reduce((total, record) => total + record.cashShare, 0) / records.length;
  const maxSingle = Math.max(
    ...records.map((record) => Math.max(record.shares.snacks, record.shares.pixel, record.shares.rocket)),
  );
  const spread = records.filter(
    (record) => ASSET_IDS.filter((id) => record.shares[id] >= 0.1).length >= 3,
  ).length;
  const reaction = choiceFor(state, "crash");

  if (reaction && soldAfterCrash(state)) {
    lessons.push({
      id: "panic",
      tone: "watch",
      title: "You sold after the crash",
      body: `The year after the crash, the Market Fund went ${state.timeline[reaction.year].returns.index >= 0 ? "up" : "down"} ${percent(state.timeline[reaction.year].returns.index)}. Selling after a big drop turns a temporary loss into a permanent one.`,
    });
  } else if (reaction && ["hold", "buy"].includes(reaction.choice?.id ?? "")) {
    lessons.push({
      id: "calm",
      tone: "good",
      title: "You stayed calm in the crash",
      body: "Your investments took a hit, but you didn’t sell. Staying invested is how people recover when the market bounces back.",
    });
  }

  if (maxSingle > 0.5) {
    lessons.push({
      id: "concentrated",
      tone: "watch",
      title: "A lot of your money rode on one bet",
      body: "At one point, more than half of your money was in a single company or coin. When one bet is that big, one bad headline can wipe out years of saving.",
    });
  } else if (spread >= Math.ceil(records.length / 2)) {
    lessons.push({
      id: "diversified",
      tone: "good",
      title: "You spread your money out",
      body: "Most years, your money sat in at least three places. That’s called diversifying, and it meant no single bad headline could sink you.",
    });
  }

  const spent = state.purchases.reduce((total, purchase) => total + purchase.price, 0);
  if (spent >= 100) {
    lessons.push({
      id: "spending",
      tone: "watch",
      title: `You spent ${money(spent)} on stuff`,
      body: `If that money had gone into the Market Fund instead, it would be worth about ${money(spentGrowth(state))} now. Spending on things you love is fine, as long as you know what it really costs.`,
    });
  }

  if (avgCash > 0.4) {
    lessons.push({
      id: "cash",
      tone: "watch",
      title: "Your pocket money sat still while prices rose",
      body: `Prices went up ${percent(state.priceLevel - 1)} during the game. Money in your pocket earned nothing, so each dollar bought less every year.`,
    });
  }

  const hype = choiceFor(state, "hype");
  if (hype?.choice?.id === "buy") {
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
      body: "You didn’t have enough in your pocket or the bank to cover an emergency, so some investments were sold to pay it. Keeping a few hundred dollars in savings protects your investments.",
    });
  }

  lessons.push({
    id: "compound",
    tone: "good",
    title: "Time is your biggest advantage",
    body: `$1,000 put in the Market Fund at age ${START_AGE} and left alone would be worth ${money(START_CASH * growthOf(state.timeline, "index"))} by age ${ageAt(state.years)}. Starting young gives your money more years to grow on top of itself.`,
  });

  return lessons;
}

export function hypeNote(state: GameState) {
  const last = state.timeline[state.year - 1];
  if (!last || last.returns.rocket < 0.5) return null;
  return `Rocket Coin jumped ${percent(last.returns.rocket)} last year, and everyone says it will keep climbing. A big jump doesn’t tell you what happens next.`;
}
