export type SavingsFields = {
  price: string;
  saved: string;
  weekly: string;
};

export const MAX_AMOUNT = 1_000_000;

type SavingsTotals = {
  priceCents: number;
  savedCents: number;
  weeklyCents: number;
  remainingCents: number;
  progress: number;
};

export type SavingsResult =
  | { status: "invalid"; errors: Partial<Record<keyof SavingsFields, string>> }
  | (SavingsTotals & { status: "complete" | "paused" })
  | (SavingsTotals & {
      status: "planned";
      weeks: number;
      targetDate: Date | null;
    });

function validateAmount(
  raw: string,
  field: keyof SavingsFields,
): string | null {
  if (!raw.trim()) return "Enter an amount to build your plan.";
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return "Enter a valid amount.";
  if (amount < 0) return "Use zero or a positive amount.";
  if (amount > MAX_AMOUNT) return "Try an amount of $1,000,000 or less.";
  if (!/^\d+(\.\d{0,2})?$/.test(raw.trim())) {
    return "Enter dollars with no more than 2 decimal places.";
  }
  if (field === "price" && amount === 0)
    return "Enter a price greater than $0.";
  return null;
}

export function calculateSavings(
  fields: SavingsFields,
  today = new Date(),
): SavingsResult {
  const errors: Partial<Record<keyof SavingsFields, string>> = {};
  for (const field of ["price", "saved", "weekly"] as const) {
    const error = validateAmount(fields[field], field);
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const priceCents = Math.round(Number(fields.price) * 100);
  const savedCents = Math.round(Number(fields.saved) * 100);
  const weeklyCents = Math.round(Number(fields.weekly) * 100);
  const remainingCents = Math.max(0, priceCents - savedCents);
  const totals = {
    priceCents,
    savedCents,
    weeklyCents,
    remainingCents,
    progress: Math.min(100, (savedCents / priceCents) * 100),
  };

  if (remainingCents === 0) return { status: "complete", ...totals };
  if (weeklyCents === 0) return { status: "paused", ...totals };

  const weeks = Math.ceil(remainingCents / weeklyCents);
  const targetDate = new Date(today.getTime());
  targetDate.setDate(targetDate.getDate() + weeks * 7);

  return {
    status: "planned",
    ...totals,
    weeks,
    targetDate:
      Number.isFinite(targetDate.getTime()) && targetDate.getFullYear() <= 9999
        ? targetDate
        : null,
  };
}
