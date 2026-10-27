import assert from "node:assert/strict";
import test from "node:test";
import {
  ROUND_SIZE,
  SCENARIOS,
  pickRound,
  scoreMessage,
} from "./stock-quiz.ts";

test("the scenario pool has unique ids and both directions", () => {
  const ids = new Set(SCENARIOS.map((item) => item.id));
  assert.equal(ids.size, SCENARIOS.length);
  assert.ok(SCENARIOS.filter((item) => item.direction === "up").length >= 3);
  assert.ok(SCENARIOS.filter((item) => item.direction === "down").length >= 3);
  for (const item of SCENARIOS) {
    assert.ok(item.news.length > 40, `${item.id} needs enough context`);
    assert.ok(item.explanation.length > 40, `${item.id} needs an explanation`);
  }
});

test("a round has five distinct scenarios with a mix of answers", () => {
  for (let seed = 1; seed < 200; seed++) {
    const round = pickRound(seed);
    assert.equal(round.length, ROUND_SIZE);
    assert.equal(new Set(round.map((item) => item.id)).size, ROUND_SIZE);
    const ups = round.filter((item) => item.direction === "up").length;
    assert.ok(ups >= 2 && ups <= 3, `seed ${seed} had ${ups} rising answers`);
  }
});

test("the same seed replays the same round", () => {
  assert.deepEqual(
    pickRound(42).map((item) => item.id),
    pickRound(42).map((item) => item.id),
  );
  assert.notDeepEqual(
    pickRound(42).map((item) => item.id),
    pickRound(43).map((item) => item.id),
  );
});

test("score messages cover every result", () => {
  for (let score = 0; score <= ROUND_SIZE; score++) {
    assert.ok(scoreMessage(score, ROUND_SIZE).length > 10);
  }
});
