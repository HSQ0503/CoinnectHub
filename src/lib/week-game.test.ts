import assert from "node:assert/strict";
import test from "node:test";
import {
  createRun,
  lockWeek,
  phase,
  readCustomGoal,
  snapshot,
  splitAmount,
  weeksLeft,
} from "./week-game.ts";

test("splits a weekly amount into a middle choice of whole dollars", () => {
  assert.equal(splitAmount(10), 5);
  assert.equal(splitAmount(15), 10);
  assert.equal(splitAmount(20), 10);
});

test("weeks left uses the pace and stops at the goal", () => {
  assert.equal(weeksLeft(80, 15), 6);
  assert.equal(weeksLeft(80, 0), null);
  assert.equal(weeksLeft(0, 0), 0);
});

test("a live choice previews the pace without locking the week", () => {
  const run = createRun({ name: "Headphones", price: 120, saved: 40, pay: 15 });
  const preview = snapshot({ ...run, pending: 15 });
  assert.equal(preview.saved, 55);
  assert.equal(preview.remaining, 65);
  assert.equal(preview.weeks, 5);
  assert.equal(preview.benchmark, 6);
  assert.equal(phase({ ...run, pending: 15 }), "play");
});

test("locking the last needed dollars finishes the run", () => {
  const run = createRun({ name: "Bike lights", price: 50, saved: 10, pay: 20 });
  const locked = lockWeek({ ...run, pending: 20 });
  const again = lockWeek({ ...locked, pending: 20 });
  assert.equal(snapshot(again).reached, true);
  assert.equal(phase(again), "done");
});

test("five kept weeks end the run even if the goal is still ahead", () => {
  let run = createRun({ name: "Headphones", price: 120, saved: 40, pay: 10 });
  for (let week = 0; week < 5; week += 1) {
    run = lockWeek({ ...run, pending: 0 });
  }
  assert.equal(run.committed.length, 5);
  assert.equal(snapshot(run).reached, false);
  assert.equal(phase(run), "done");
  assert.equal(snapshot(run).kept, 50);
});

test("custom goals accept whole dollars and reject junk", () => {
  assert.deepEqual(readCustomGoal("80", "0"), { ok: true, price: 80, saved: 0 });
  const missing = readCustomGoal("", "5");
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.ok(missing.priceError);
  const cents = readCustomGoal("10.5", "0");
  assert.equal(cents.ok, false);
  const huge = readCustomGoal("2001", "0");
  assert.equal(huge.ok, false);
});
