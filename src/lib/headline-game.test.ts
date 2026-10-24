import assert from "node:assert/strict";
import test from "node:test";
import {
  ROUNDS,
  allPlaced,
  factTotal,
  leanLabel,
  matchedFacts,
  placedSides,
  tilt,
  tiltPercent,
} from "./headline-game.ts";

test("opposing facts hold the scale in the middle", () => {
  assert.equal(tilt(["buyers", "sellers", "unsure"], 3), 0);
  assert.equal(tiltPercent(0), 50);
  assert.equal(leanLabel(0), "The scale stays near the middle.");
});

test("a one-sided story tips the scale all the way", () => {
  const round = ROUNDS[0];
  assert.equal(tilt(round.facts.map((fact) => fact.side), round.facts.length), 1);
  assert.equal(tilt(["buyers"], 2), 0.5);
  assert.equal(tiltPercent(1), 100);
  assert.equal(leanLabel(1), "The scale leans toward buyers.");
});

test("the mixed round is the only one with an unsure piece", () => {
  const unsure = ROUNDS.flatMap((round) => round.facts).filter(
    (fact) => fact.side === "unsure",
  );
  assert.equal(unsure.length, 1);
  assert.equal(unsure[0]?.id, "profits");
});

test("score counts pieces placed on the stronger side", () => {
  const facts = ROUNDS[2].facts;
  const placements = {
    demand: "buyers" as const,
    ingredients: "buyers" as const,
    profits: "unsure" as const,
  };
  assert.equal(allPlaced(facts, placements), true);
  assert.equal(matchedFacts(facts, placements), 2);
  assert.deepEqual(placedSides(facts, placements), [
    "buyers",
    "buyers",
    "unsure",
  ]);
  assert.equal(factTotal(ROUNDS), 8);
});
