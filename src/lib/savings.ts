export type Frequency = "weekly" | "biweekly" | "monthly";

export const FREQUENCIES: { id: Frequency; label: string; perYear: number }[] =
  [
    { id: "weekly", label: "Every week", perYear: 52 },
    { id: "biweekly", label: "Every 2 weeks", perYear: 26 },
    { id: "monthly", label: "Every month", perYear: 12 },
  ];

export const MAX_AMOUNT = 1_000_000;
export const MAX_YEARS = 50;
const DAY_MS = 86_400_000;

export type PlanInput = {
  price: number;
  saved: number;
  deposit: number;
  frequency: Frequency;
  apy: number;
  priceGrowth: number;
  start: Date;
};

export type PlanPoint = {
  date: Date;
  balance: number;
  deposited: number;
  interest: number;
  price: number;
};

export type Plan = {
  reached: boolean;
  deposits: number;
  finishDate: Date | null;
  points: PlanPoint[];
  deposited: number;
  interest: number;
  finalPrice: number;
};

export function perYear(frequency: Frequency) {
  return FREQUENCIES.find((option) => option.id === frequency)?.perYear ?? 52;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function addPeriods(start: Date, frequency: Frequency, count: number) {
  const date = new Date(start.getTime());
  if (frequency !== "monthly") {
    date.setDate(date.getDate() + count * (frequency === "weekly" ? 7 : 14));
    return date;
  }
  // Clamp to the month's last day so Jan 31 + 1 month is Feb 28, not Mar 3.
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + count);
  date.setDate(Math.min(day, daysInMonth(date.getFullYear(), date.getMonth())));
  return date;
}

function growth(ratePercent: number, from: Date, to: Date) {
  const years = (to.getTime() - from.getTime()) / DAY_MS / 365;
  return Math.pow(1 + ratePercent / 100, years);
}

function priceAt(input: PlanInput, date: Date) {
  return input.price * growth(input.priceGrowth, input.start, date);
}

function maxDeposits(frequency: Frequency) {
  return perYear(frequency) * MAX_YEARS;
}

function simulate(input: PlanInput, stopAt: number, stopWhenReached: boolean) {
  const points: PlanPoint[] = [
    {
      date: input.start,
      balance: input.saved,
      deposited: input.saved,
      interest: 0,
      price: input.price,
    },
  ];
  let balance = input.saved;
  let deposited = input.saved;
  let interest = 0;
  let previous = input.start;
  let reachedAt: number | null = balance >= input.price ? 0 : null;

  for (let n = 1; n <= stopAt && !(stopWhenReached && reachedAt !== null); n++) {
    const date = addPeriods(input.start, input.frequency, n);
    const earned = balance * (growth(input.apy, previous, date) - 1);
    balance += earned + input.deposit;
    interest += earned;
    deposited += input.deposit;
    const price = priceAt(input, date);
    points.push({ date, balance, deposited, interest, price });
    if (reachedAt === null && balance + 1e-9 >= price) reachedAt = n;
    previous = date;
  }
  return { points, reachedAt };
}

export function projectPlan(input: PlanInput): Plan {
  const { points, reachedAt } = simulate(
    input,
    maxDeposits(input.frequency),
    true,
  );
  const last = points[points.length - 1];
  return {
    reached: reachedAt !== null,
    deposits: reachedAt ?? points.length - 1,
    finishDate: reachedAt === null ? null : points[reachedAt].date,
    points,
    deposited: last.deposited,
    interest: last.interest,
    finalPrice: last.price,
  };
}

export function depositsBefore(
  start: Date,
  frequency: Frequency,
  deadline: Date,
) {
  const endOfDeadline = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate() + 1,
  ).getTime();
  let count = 0;
  while (
    count < maxDeposits(frequency) &&
    addPeriods(start, frequency, count + 1).getTime() < endOfDeadline
  ) {
    count++;
  }
  return count;
}

export type DeadlinePlan =
  | { status: "already-there" }
  | { status: "too-soon" }
  | { status: "planned"; deposit: number; deposits: number; plan: Plan };

export function planForDeadline(
  input: Omit<PlanInput, "deposit">,
  deadline: Date,
): DeadlinePlan {
  if (input.saved >= input.price) return { status: "already-there" };
  const deposits = depositsBefore(input.start, input.frequency, deadline);
  if (deposits === 0) return { status: "too-soon" };

  // The final balance grows linearly with the deposit, so two runs give the exact answer.
  const withoutDeposits = simulate({ ...input, deposit: 0 }, deposits, false);
  const withOneDollar = simulate({ ...input, deposit: 1 }, deposits, false);
  const lastIndex = deposits;
  const base = withoutDeposits.points[lastIndex].balance;
  const perDollar = withOneDollar.points[lastIndex].balance - base;
  const target = withoutDeposits.points[lastIndex].price;
  if (base >= target) return { status: "already-there" };

  const deposit = Math.ceil(((target - base) / perDollar) * 100) / 100;
  return {
    status: "planned",
    deposit,
    deposits,
    plan: projectPlan({ ...input, deposit }),
  };
}

export function milestoneDates(plan: Plan, fractions = [0.25, 0.5, 0.75]) {
  return fractions.map((fraction) => {
    const point = plan.points.find(
      (candidate) => candidate.balance + 1e-9 >= candidate.price * fraction,
    );
    return { fraction, date: point?.date ?? null };
  });
}

export function readMoney(
  raw: string,
  { required = true, min = 0 }: { required?: boolean; min?: number } = {},
): number | string {
  const trimmed = raw.trim().replace(/[$,]/g, "");
  if (!trimmed) return required ? "Enter an amount." : 0;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    return "Use a dollar amount like 25 or 12.50.";
  }
  const value = Number(trimmed);
  if (value > MAX_AMOUNT) return "Keep this under $1,000,000.";
  if (value < min) return `Enter at least $${min}.`;
  return value;
}

export function readPercent(raw: string, max: number): number | string {
  const trimmed = raw.trim().replace("%", "");
  if (!trimmed) return 0;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return "Use a number like 4 or 4.5.";
  const value = Number(trimmed);
  if (value > max) return `Keep this at ${max}% or less.`;
  return value;
}
