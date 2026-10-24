export const WEEK_COUNT = 5;
export const PAYS = [10, 15, 20] as const;
export const GOAL_LIMIT = 2_000;

export type Pay = (typeof PAYS)[number];

export type Goal = {
  id: string;
  name: string;
  price: number;
  saved: number;
};

export const GOALS: Goal[] = [
  { id: "headphones", name: "Headphones", price: 120, saved: 40 },
  { id: "concert", name: "Concert ticket", price: 70, saved: 10 },
  { id: "lights", name: "Bike lights", price: 50, saved: 10 },
];

export const WEEK_BEATS = [
  {
    title: "Nothing on the calendar",
    detail: "No pizza, no bill. This week's cash can stay in your pocket or go on the goal.",
  },
  {
    title: "Friends are getting food",
    detail: "Figure about $10 if you go. The rest of the week can still hit the goal.",
  },
  {
    title: "A song, a snack, whatever",
    detail: "Small, and it still comes out of this week's cash.",
  },
  {
    title: "You might need the bus",
    detail: "Hold $5 if the fare might come up. Whatever's left can go to the goal.",
  },
  {
    title: "Week 5",
    detail: "Last choice. After this you'll see how far the price moved.",
  },
];

export type Run = {
  name: string;
  price: number;
  startSaved: number;
  pay: Pay;
  committed: number[];
  pending: number | null;
};

export type GoalRead =
  | { ok: true; price: number; saved: number }
  | { ok: false; priceError?: string; savedError?: string };

export function splitAmount(pay: number) {
  return Math.round(Math.round(pay / 2) / 5) * 5;
}

export function choiceAmounts(pay: number) {
  return [0, splitAmount(pay), pay];
}

export function weeksLeft(remaining: number, pace: number) {
  if (remaining <= 0) return 0;
  if (pace <= 0) return null;
  return Math.ceil(remaining / pace);
}

export function createRun(goal: {
  name: string;
  price: number;
  saved: number;
  pay: Pay;
}): Run {
  return {
    name: goal.name,
    price: goal.price,
    startSaved: goal.saved,
    pay: goal.pay,
    committed: [],
    pending: null,
  };
}

export function snapshot(run: Run) {
  const amounts =
    run.pending === null ? run.committed : [...run.committed, run.pending];
  const added = amounts.reduce((total, amount) => total + amount, 0);
  const saved = run.startSaved + added;
  const remaining = Math.max(0, run.price - saved);
  const kept = amounts.reduce((total, amount) => total + (run.pay - amount), 0);
  const pace = amounts.length === 0 ? 0 : added / amounts.length;
  return {
    saved,
    remaining,
    kept,
    pace,
    weeks: weeksLeft(remaining, pace),
    benchmark: weeksLeft(Math.max(0, run.price - run.startSaved), run.pay),
    reached: saved >= run.price,
  };
}

export function phase(run: Run) {
  if (run.pending !== null) return "play" as const;
  const saved =
    run.startSaved + run.committed.reduce((total, amount) => total + amount, 0);
  if (saved >= run.price || run.committed.length >= WEEK_COUNT) return "done" as const;
  return "play" as const;
}

export function lockWeek(run: Run) {
  if (run.pending === null) return run;
  return { ...run, committed: [...run.committed, run.pending], pending: null };
}

function readDollars(raw: string, field: "price" | "saved") {
  const trimmed = raw.trim();
  if (!trimmed) {
    return field === "price"
      ? "Enter the price."
      : "Enter what you've saved. Use 0 if you're starting from zero.";
  }
  if (!/^\d+$/.test(trimmed)) return "Use whole dollars, with no cents.";
  const value = Number(trimmed);
  if (value > GOAL_LIMIT) return `Keep this game at $${GOAL_LIMIT.toLocaleString("en-US")} or less.`;
  if (field === "price" && value < 1) return "Enter a price of at least $1.";
  return null;
}

export function readCustomGoal(priceRaw: string, savedRaw: string): GoalRead {
  const priceError = readDollars(priceRaw, "price");
  const savedError = readDollars(savedRaw, "saved");
  if (priceError || savedError) {
    return {
      ok: false,
      ...(priceError ? { priceError } : {}),
      ...(savedError ? { savedError } : {}),
    };
  }
  return { ok: true, price: Number(priceRaw.trim()), saved: Number(savedRaw.trim()) };
}
