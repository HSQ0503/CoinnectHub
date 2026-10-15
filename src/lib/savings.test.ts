import assert from "node:assert/strict";
import test from "node:test";
import { calculateSavings } from "./savings.ts";

const today = new Date(2026, 9, 15, 12);

test("rounds up to a full weekly deposit and moves by calendar weeks", () => {
  const result = calculateSavings(
    { price: "129", saved: "40", weekly: "15" },
    today,
  );
  assert.equal(result.status, "planned");
  if (result.status !== "planned") return;
  assert.equal(result.weeks, 6);
  assert.equal(result.remainingCents, 8900);
  assert.equal(result.targetDate?.getFullYear(), 2026);
  assert.equal(result.targetDate?.getMonth(), 10);
  assert.equal(result.targetDate?.getDate(), 26);
  assert.equal(today.getDate(), 15);
});

test("calculates fractional dollar amounts in cents", () => {
  const result = calculateSavings(
    { price: "0.30", saved: "0.10", weekly: "0.10" },
    today,
  );
  assert.equal(result.status, "planned");
  if (result.status !== "planned") return;
  assert.equal(result.weeks, 2);
  assert.equal(result.remainingCents, 20);
});

test("a reached goal needs no more deposits even when weekly savings are zero", () => {
  const result = calculateSavings(
    { price: "100", saved: "120", weekly: "0" },
    today,
  );
  assert.equal(result.status, "complete");
  assert.equal(result.progress, 100);
  assert.equal(result.remainingCents, 0);
});

test("zero weekly savings pauses an unfinished goal", () => {
  assert.equal(
    calculateSavings({ price: "100", saved: "20", weekly: "0" }, today).status,
    "paused",
  );
});

test("rejects missing, negative, nonfinite, excessive, and sub-cent inputs", () => {
  for (const price of [
    "",
    " ",
    "-10",
    "Infinity",
    "NaN",
    "1000001",
    "1.005",
    "1e2",
    "0",
  ]) {
    const result = calculateSavings({ price, saved: "0", weekly: "10" }, today);
    assert.equal(result.status, "invalid", `Expected invalid price: ${price}`);
    if (result.status === "invalid") assert.ok(result.errors.price);
  }
  assert.equal(
    calculateSavings({ price: "100", saved: "-1", weekly: "10" }).status,
    "invalid",
  );
  assert.equal(
    calculateSavings({ price: "100", saved: "0", weekly: "" }).status,
    "invalid",
  );
});

test("very long plans retain a week count without producing an invalid date", () => {
  const result = calculateSavings(
    { price: "1000000", saved: "0", weekly: "0.01" },
    today,
  );
  assert.equal(result.status, "planned");
  if (result.status !== "planned") return;
  assert.equal(result.weeks, 100_000_000);
  assert.equal(result.targetDate, null);
});

test("invalid starting dates cannot leak invalid dates into the result", () => {
  const result = calculateSavings(
    { price: "100", saved: "0", weekly: "10" },
    new Date("invalid"),
  );
  assert.equal(result.status, "planned");
  if (result.status === "planned") assert.equal(result.targetDate, null);
});
