import assert from "node:assert/strict";
import test from "node:test";
import { ASSET_IDS, COMPANY_EVENTS, unlockYear, type AssetId } from "./market-data.ts";
import {
  BONUS_COINS,
  START_CASH,
  applyChoice,
  benchmarkPaths,
  buy,
  buyHat,
  collectCoin,
  createGame,
  endYear,
  eventCard,
  eventFeedback,
  generateTimeline,
  growthOf,
  isFinished,
  lessonsFor,
  netWorth,
  payday,
  salaryFor,
  sell,
  wearHat,
  type GameState,
} from "./market-game.ts";

type Plan = { split: Partial<Record<AssetId, number>>; choose?: (state: GameState) => string[] };

function playThrough(start: GameState, plan: Plan) {
  let state = start;
  while (!isFinished(state)) {
    state = payday(state);
    const card = eventCard(state);
    if (card) {
      const wanted = plan.choose?.(state) ?? [];
      const choice = wanted.map((id) => card.choices.find((item) => item.id === id && !item.disabled)).find(Boolean);
      state = applyChoice(state, (choice ?? card.choices.find((item) => !item.disabled)!).id);
    }
    for (const value of BONUS_COINS) state = collectCoin(state, value);
    const open = Object.entries(plan.split).filter(([id]) => unlockYear(id as AssetId, state.years) <= state.year);
    const total = open.reduce((sum, [, weight]) => sum + (weight ?? 0), 0);
    const cash = state.cash;
    for (const [id, weight] of open) state = buy(state, id as AssetId, (cash * (weight ?? 0)) / total);
    state = endYear(state);
  }
  return state;
}

const calm = () => ["hold", "wait", "skip"];

test("the same seed always produces the same market", () => {
  assert.deepEqual(generateTimeline(42, 10), generateTimeline(42, 10));
  assert.notDeepEqual(generateTimeline(42, 10), generateTimeline(43, 10));
});

test("every market has one crash in the middle, followed by a decision about it", () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const years of [5, 10]) {
      const timeline = generateTimeline(seed, years);
      const crashes = timeline.flatMap((year, index) => (year.economy === "crash" ? [index] : []));
      assert.equal(crashes.length, 1);
      assert.ok(crashes[0] >= unlockYear("index", years) + 2 && crashes[0] <= years - 2);
      assert.equal(timeline[crashes[0] + 1].event?.kind, "crash");
    }
  }
});

test("over ten years the whole market beats the bank, and hype always fades", () => {
  let rocketLosses = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const timeline = generateTimeline(seed, 10);
    assert.ok(growthOf(timeline, "index") > growthOf(timeline, "bank"));
    timeline.forEach((year, index) => {
      assert.ok(year.returns.bank > 0);
      for (const id of ASSET_IDS) assert.ok(year.returns[id] > -0.95);
      if (year.event?.kind === "hype") {
        assert.ok(timeline[index - 1].returns.rocket >= 0.8);
        assert.ok(year.returns.rocket < 0);
      }
    });
    if (growthOf(timeline, "rocket") < 1) rocketLosses++;
  }
  assert.ok(rocketLosses > 120, `rocket lost money in ${rocketLosses} of 200 runs`);
});

test("company stocks always move the way their headline points", () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const year of generateTimeline(seed, 10)) {
      for (const id of ["snacks", "pixel"] as const) {
        const event = COMPANY_EVENTS[id].find((item) => item.text === year.news[id])!;
        if (event.shock[1] < 0) assert.ok(year.returns[id] < 0, year.news[id]);
        if (event.shock[0] > 0) assert.ok(year.returns[id] > 0, year.news[id]);
      }
    }
  }
});

test("places open one at a time and stay closed until then", () => {
  let state = createGame(7, 10);
  assert.equal(buy(state, "index", 100), state);
  state = buy(state, "bank", 400);
  assert.equal(state.holdings.bank, 400);
  state = endYear(state);
  assert.equal(unlockYear("index", 10), 1);
  assert.equal(buy(state, "index", 100).holdings.index, 100);
  assert.equal(buy(state, "rocket", 100), state);
});

test("each year pays its paycheck exactly once", () => {
  let state = createGame(3, 10);
  state = payday(payday(state));
  assert.equal(state.cash, START_CASH + salaryFor(0));
  const next = endYear(createGame(3, 10));
  assert.equal(next.history[0].income, salaryFor(0));
  assert.equal(salaryFor(3), 600);
  assert.equal(salaryFor(6), 750);
});

test("buying and selling move money between your pocket and a place", () => {
  let state = createGame(7, 10);
  state = buy(state, "bank", 400);
  assert.equal(state.cash, START_CASH - 400);
  state = buy(state, "bank", 5000);
  assert.equal(state.cash, 0);
  assert.equal(state.holdings.bank, START_CASH);
  state = sell(state, "bank", 100);
  assert.equal(state.cash, 100);
  assert.equal(state.basis.bank, 900);
  assert.equal(netWorth(state), START_CASH);
  assert.equal(sell(state, "pixel", 50), state);
});

test("ending a year applies each investment's return", () => {
  let state = payday(createGame(11, 5));
  state = buy(state, "index", 500);
  state = buy(state, "bank", 300);
  const outcome = state.timeline[0];
  const next = endYear(state);
  assert.equal(next.year, 1);
  assert.ok(Math.abs(next.holdings.index - 500 * (1 + outcome.returns.index)) < 1e-9);
  assert.ok(Math.abs(next.holdings.bank - 300 * (1 + outcome.returns.bank)) < 1e-9);
  assert.equal(next.history[0].startHoldings.index, 500);
  assert.ok(next.priceLevel > 1);
});

test("surprise bills come out of savings first and only then sell investments", () => {
  const start = createGame(5, 10);
  const year = start.timeline.findIndex((outcome) => (outcome.lifeEvent?.amount ?? 0) < 0);
  const bill = -start.timeline[year].lifeEvent!.amount;
  const returns = start.timeline[year].returns;

  const saver = endYear({ ...start, year, paydays: year + 1, cash: 0, holdings: { ...start.holdings, bank: 1000, rocket: 500 } });
  assert.ok(Math.abs(saver.holdings.bank - (1000 * (1 + returns.bank) - bill)) < 1e-6);
  assert.equal(saver.history[0].forcedSales, 0);
  assert.ok(saver.badges.includes("rainy"));

  const investor = endYear({ ...start, year, paydays: year + 1, cash: 0, holdings: { ...start.holdings, index: 2000 } });
  assert.ok(Math.abs(investor.history[0].forcedSales - bill) < 1e-6);
  assert.ok(Math.abs(investor.holdings.index - (2000 * (1 + returns.index) - bill)) < 1e-6);
  assert.equal(investor.cash, 0);
  assert.ok(!investor.badges.includes("rainy"));
});

test("saving everything in the bank never reaches the dream, but steady investing usually does", () => {
  let indexWins = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const saver = playThrough(createGame(seed, 10), { split: { bank: 1 }, choose: calm });
    assert.ok(netWorth(saver) < saver.goal, `seed ${seed}: ${netWorth(saver)} vs ${saver.goal}`);
    const investor = playThrough(createGame(seed, 10), { split: { bank: 1, index: 4 }, choose: calm });
    if (netWorth(investor) >= investor.goal) indexWins++;
  }
  assert.ok(indexWins >= 75, `mostly-index reached the goal in ${indexWins} of 100 games`);
});

test("selling after the crash sells every investment and gets called out", () => {
  const start = createGame(9, 10);
  const reactionYear = start.timeline.findIndex((outcome) => outcome.event?.kind === "crash");
  const final = playThrough(start, {
    split: { bank: 1, index: 3 },
    choose: () => ["sell", "wait", "skip"],
  });
  const ids = lessonsFor(final).map((lesson) => lesson.id);
  assert.ok(ids.includes("panic"));
  assert.ok(!final.badges.includes("cool"));
  const sellTrades = final.trades.filter((trade) => trade.year === reactionYear && trade.amount < 0);
  assert.ok(sellTrades.some((trade) => trade.asset === "index"));
  assert.equal(eventFeedback(final, reactionYear)?.tone, final.timeline[reactionYear].returns.index > 0 ? "watch" : "neutral");
});

test("holding through the crash and skipping hype earn badges", () => {
  const final = playThrough(createGame(21, 10), { split: { bank: 2, index: 5, snacks: 1, pixel: 1 }, choose: calm });
  for (const badge of ["early", "basket", "cool", "hype"] as const) assert.ok(final.badges.includes(badge), badge);
  assert.ok(lessonsFor(final).some((lesson) => lesson.id === "calm"));
});

test("chasing hype buys Rocket Coin right before it falls", () => {
  const start = createGame(4, 10);
  const hypeYear = start.timeline.findIndex((outcome) => outcome.event?.kind === "hype");
  assert.ok(hypeYear > 0);
  const final = playThrough(start, { split: { index: 1 }, choose: (state) => (eventCard(state)?.kind === "crash" ? ["hold"] : ["buy"]) });
  assert.equal(final.choices[hypeYear]?.id, "buy");
  assert.equal(eventFeedback(final, hypeYear)?.tone, "watch");
  assert.ok(lessonsFor(final).some((lesson) => lesson.id === "hype"));
  assert.ok(!final.badges.includes("hype"));
});

test("spending shows up as a purchase and as a lesson about what it cost", () => {
  let state = payday(createGame(6, 10));
  assert.equal(buyHat({ ...state, cash: 10 }, "crown").hats.length, 0);
  state = buyHat(state, "crown");
  assert.equal(state.hat, "crown");
  assert.equal(state.purchases[0].price, 400);
  state = wearHat(state, null);
  assert.equal(state.hat, null);
  assert.equal(buyHat(state, "crown").cash, state.cash);
  const final = playThrough(state, { split: { bank: 1, index: 3 }, choose: calm });
  const spending = lessonsFor(final).find((lesson) => lesson.id === "spending");
  assert.ok(spending);
});

test("benchmarks get the same paychecks and bills as the player", () => {
  const pocketOnly = playThrough(createGame(3, 10), { split: {}, choose: calm });
  const paths = benchmarkPaths(pocketOnly);
  assert.equal(paths.you.length, 11);
  assert.ok(Math.abs(paths.cash[10] - paths.you[10]) < 1e-6);
  assert.ok(paths.index[10] > paths.bank[10]);
});

test("putting everything on one stock is flagged as concentrated", () => {
  const final = playThrough(createGame(14, 5), { split: { pixel: 1 }, choose: calm });
  const ids = lessonsFor(final).map((lesson) => lesson.id);
  assert.ok(ids.includes("concentrated"));
});
