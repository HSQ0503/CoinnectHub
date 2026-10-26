import assert from "node:assert/strict";
import test from "node:test";
import { ASSET_IDS, COMPANY_EVENTS } from "./market-data.ts";
import {
  START_CASH,
  benchmarkPaths,
  buy,
  coinValues,
  collectCoin,
  createGame,
  endYear,
  generateTimeline,
  growthOf,
  invested,
  isFinished,
  lessonsFor,
  netWorth,
  profileFor,
  sell,
  type GameState,
} from "./market-game.ts";

function playThrough(state: GameState, plan: (state: GameState) => GameState) {
  let current = state;
  while (!isFinished(current)) {
    for (const value of coinValues(current.year)) {
      current = collectCoin(current, value);
    }
    current = endYear(plan(current));
  }
  return current;
}

test("the same seed always produces the same market", () => {
  assert.deepEqual(generateTimeline(42, 10), generateTimeline(42, 10));
  assert.notDeepEqual(generateTimeline(42, 10), generateTimeline(43, 10));
});

test("every market has exactly one crash, never in the first or last year", () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const years of [5, 10]) {
      const timeline = generateTimeline(seed, years);
      const crashes = timeline.flatMap((year, index) =>
        year.economy === "crash" ? [index] : [],
      );
      assert.equal(crashes.length, 1);
      assert.ok(crashes[0] > 0 && crashes[0] < years - 1);
    }
  }
});

test("over ten years the whole market beats the bank and hype stays risky", () => {
  let rocketLosses = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const timeline = generateTimeline(seed, 10);
    assert.ok(growthOf(timeline, "index") > growthOf(timeline, "bank"));
    for (const year of timeline) {
      assert.ok(year.returns.bank > 0);
      for (const id of ASSET_IDS) assert.ok(year.returns[id] > -0.95);
    }
    if (growthOf(timeline, "rocket") < 1) rocketLosses++;
  }
  assert.ok(rocketLosses > 120, `rocket lost money in ${rocketLosses} of 200 runs`);
});

test("company stocks always move the way their headline points", () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const year of generateTimeline(seed, 10)) {
      for (const id of ["snacks", "bikes", "pixel"] as const) {
        const event = COMPANY_EVENTS[id].find((item) => item.text === year.news[id])!;
        if (event.shock[1] < 0) assert.ok(year.returns[id] < 0, year.news[id]);
        if (event.shock[0] > 0) assert.ok(year.returns[id] > 0, year.news[id]);
      }
    }
  }
});

test("buying and selling move money between cash and holdings", () => {
  let state = createGame(7, 10);
  state = buy(state, "index", 400);
  assert.equal(state.cash, START_CASH - 400);
  assert.equal(state.holdings.index, 400);
  state = buy(state, "bank", 5000);
  assert.equal(state.cash, 0);
  assert.equal(state.holdings.bank, 600);
  state = sell(state, "bank", 100);
  assert.equal(state.cash, 100);
  assert.equal(state.basis.bank, 500);
  assert.equal(netWorth(state), START_CASH);
  assert.equal(sell(state, "pixel", 50), state);
});

test("ending a year applies each investment's return", () => {
  let state = createGame(11, 10);
  state = buy(state, "index", 500);
  state = buy(state, "bank", 300);
  const outcome = state.timeline[0];
  const next = endYear(state);
  assert.equal(next.year, 1);
  assert.ok(Math.abs(next.holdings.index - 500 * (1 + outcome.returns.index)) < 1e-9);
  assert.ok(Math.abs(next.holdings.bank - 300 * (1 + outcome.returns.bank)) < 1e-9);
  assert.equal(next.cash, 200 + (outcome.lifeEvent?.amount ?? 0));
  assert.equal(next.history[0].startWorth, START_CASH);
  assert.ok(next.priceLevel > 1);
});

test("a bill larger than your cash sells the safest investments first", () => {
  let state = createGame(5, 10);
  const year = state.timeline.findIndex((outcome) => (outcome.lifeEvent?.amount ?? 0) < 0);
  state = { ...state, year, cash: 0, holdings: { ...state.holdings, bank: 1000, rocket: 500 } };
  const bill = -state.timeline[year].lifeEvent!.amount;
  const next = endYear(state);
  const bankAfterReturn = 1000 * (1 + state.timeline[year].returns.bank);
  assert.ok(Math.abs(next.holdings.bank - (bankAfterReturn - bill)) < 1e-6);
  assert.equal(next.history[0].forcedSales, bill);
  assert.equal(next.cash, 0);
});

test("benchmarks get the same paychecks and bills as the player", () => {
  const cashOnly = playThrough(createGame(3, 10), (state) => state);
  const paths = benchmarkPaths(cashOnly);
  assert.equal(paths.you.length, 11);
  assert.ok(Math.abs(paths.cash[10] - paths.you[10]) < 1e-6);
  assert.ok(paths.index[10] > paths.bank[10]);
});

test("an all-in index player beats cash and hears about holding through the crash", () => {
  const final = playThrough(createGame(21, 10), (state) => buy(state, "index", state.cash));
  const paths = benchmarkPaths(final);
  assert.ok(Math.abs(paths.index[10] - netWorth(final)) < 1);
  assert.ok(netWorth(final) > paths.cash[10]);
  assert.equal(invested(final) > 0, true);
  const ids = lessonsFor(final).map((lesson) => lesson.id);
  assert.ok(ids.includes("calm"));
  assert.ok(ids.includes("compound"));
  assert.equal(profileFor(final).title, "The Index Investor");
});

test("panic selling after the crash is called out", () => {
  const start = createGame(9, 10);
  const crash = start.timeline.findIndex((outcome) => outcome.economy === "crash");
  const final = playThrough(start, (state) => {
    if (state.year === crash + 1) return sell(state, "index", state.holdings.index);
    if (state.year <= crash) return buy(state, "index", state.cash);
    return state;
  });
  const bounce = start.timeline[crash + 1].returns.index;
  const ids = lessonsFor(final).map((lesson) => lesson.id);
  assert.equal(ids.includes("panic"), bounce > 0);
  assert.ok(ids.includes("cash"));
});

test("putting everything on one stock is flagged as concentrated", () => {
  const final = playThrough(createGame(14, 5), (state) => buy(state, "pixel", state.cash));
  const ids = lessonsFor(final).map((lesson) => lesson.id);
  assert.ok(ids.includes("concentrated"));
  assert.equal(profileFor(final).title, "The Stock Picker");
});
