const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function money(value: number) {
  return dollars.format(Math.round(value));
}

export function signedMoney(value: number) {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : "−"}${dollars.format(Math.abs(rounded))}`;
}

export function signedPercent(value: number, digits = 1) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(digits)}%`;
}
