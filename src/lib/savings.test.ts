import assert from "node:assert/strict";
import test from "node:test";
import {
  addPeriods,
  depositsBefore,
  milestoneDates,
  planForDeadline,
  projectPlan,
  readMoney,
  readPercent,
} from "./savings.ts";

const start = new Date(2026, 9, 15, 12);
const base = {
  price: 129,
  saved: 40,
  deposit: 15,
  frequency: "weekly" as const,
  apy: 0,
  priceGrowth: 0,
  start,
};

test("weekly deposits without interest round up to a whole deposit", () => {
  const plan = projectPlan(base);
  assert.equal(plan.reached, true);
  assert.equal(plan.deposits, 6);
  assert.equal(plan.finishDate?.getMonth(), 10);
  assert.equal(plan.finishDate?.getDate(), 26);
  assert.equal(plan.deposited, 130);
  assert.equal(plan.interest, 0);
  assert.equal(start.getDate(), 15);
});

test("monthly periods clamp to the end of shorter months", () => {
  const date = addPeriods(new Date(2027, 0, 31), "monthly", 1);
  assert.equal(date.getMonth(), 1);
  assert.equal(date.getDate(), 28);
  assert.equal(addPeriods(new Date(2027, 0, 31), "monthly", 2).getDate(), 31);
});

test("interest shortens the plan and is reported separately", () => {
  const big = { ...base, price: 5000, saved: 1000, deposit: 25 };
  const plain = projectPlan(big);
  const withInterest = projectPlan({ ...big, apy: 5 });
  assert.ok(withInterest.deposits < plain.deposits);
  assert.ok(withInterest.interest > 0);
  const last = withInterest.points[withInterest.points.length - 1];
  assert.ok(Math.abs(last.balance - (last.deposited + last.interest)) < 1e-6);
});

test("a rising price pushes the finish date later", () => {
  const flat = projectPlan({ ...base, price: 1000, saved: 0, deposit: 20 });
  const rising = projectPlan({
    ...base,
    price: 1000,
    saved: 0,
    deposit: 20,
    priceGrowth: 10,
  });
  assert.ok(rising.deposits > flat.deposits);
  assert.ok(rising.finalPrice > 1000);
});

test("a goal that is already covered needs no deposits", () => {
  const plan = projectPlan({ ...base, saved: 200, deposit: 0 });
  assert.equal(plan.reached, true);
  assert.equal(plan.deposits, 0);
});

test("zero deposits and zero interest never reach the goal", () => {
  const plan = projectPlan({ ...base, deposit: 0 });
  assert.equal(plan.reached, false);
  assert.equal(plan.finishDate, null);
});

test("deadline plans find the smallest deposit that gets there in time", () => {
  const deadline = new Date(2026, 11, 31);
  const result = planForDeadline(base, deadline);
  assert.equal(result.status, "planned");
  if (result.status !== "planned") return;
  assert.equal(result.deposits, depositsBefore(start, "weekly", deadline));
  assert.equal(result.deposits, 11);
  assert.equal(result.deposit, 8.1);
  assert.equal(result.plan.reached, true);
  assert.ok(result.plan.deposits <= result.deposits);
  const oneCentLess = projectPlan({ ...base, deposit: result.deposit - 0.01 });
  assert.ok(oneCentLess.deposits > result.deposits);
});

test("deadline plans account for interest", () => {
  const deadline = new Date(2030, 9, 15);
  const input = { ...base, price: 3000, saved: 500 };
  const plain = planForDeadline({ ...input, frequency: "monthly" }, deadline);
  const earning = planForDeadline(
    { ...input, frequency: "monthly", apy: 4 },
    deadline,
  );
  assert.equal(plain.status, "planned");
  assert.equal(earning.status, "planned");
  if (plain.status !== "planned" || earning.status !== "planned") return;
  assert.ok(earning.deposit < plain.deposit);
});

test("deadlines before the first deposit are too soon", () => {
  assert.equal(
    planForDeadline(base, new Date(2026, 9, 20)).status,
    "too-soon",
  );
  assert.equal(
    planForDeadline({ ...base, saved: 500 }, new Date(2026, 9, 20)).status,
    "already-there",
  );
});

test("milestones mark the first date past each share of the goal", () => {
  const plan = projectPlan({ ...base, saved: 0, price: 100, deposit: 10 });
  const [quarter, half] = milestoneDates(plan);
  assert.equal(quarter.date?.getTime(), plan.points[3].date.getTime());
  assert.equal(half.date?.getTime(), plan.points[5].date.getTime());
});

test("money and percent fields reject junk with friendly messages", () => {
  assert.equal(readMoney("$1,250.50"), 1250.5);
  assert.equal(readMoney(""), "Enter an amount.");
  assert.equal(readMoney("", { required: false }), 0);
  assert.equal(typeof readMoney("12.345"), "string");
  assert.equal(typeof readMoney("abc"), "string");
  assert.equal(typeof readMoney("2000000"), "string");
  assert.equal(typeof readMoney("0", { min: 1 }), "string");
  assert.equal(readPercent("4.5%", 20), 4.5);
  assert.equal(typeof readPercent("25", 20), "string");
});
