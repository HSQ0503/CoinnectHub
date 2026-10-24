export type Side = "buyers" | "sellers" | "unsure";

export type Fact = {
  id: string;
  text: string;
  side: Side;
  why: string;
};

export type Round = {
  company: string;
  headline: string;
  expected: string;
  happened: string;
  facts: Fact[];
  lesson: string;
};

export const ROUNDS: Round[] = [
  {
    company: "Loop Bikes",
    headline: "More riders. More orders.",
    expected: "Investors expected an ordinary sales report.",
    happened: "Orders came in far above that, and costs stayed steady.",
    facts: [
      {
        id: "orders",
        text: "Orders were far above what investors expected",
        side: "buyers",
        why: "People expected an ordinary report. The extra orders are the part that changes it.",
      },
      {
        id: "costs",
        text: "Costs stayed steady",
        side: "buyers",
        why: "Sales went up and costs didn't. More of the money can be left as profit.",
      },
    ],
    lesson: "The report beat an ordinary forecast, and costs stayed flat.",
  },
  {
    company: "Pixel Play",
    headline: "The big release will have to wait.",
    expected: "Investors expected the biggest game to come out this year.",
    happened:
      "The game slips to next year. This year's sales look lower, and development costs keep rising.",
    facts: [
      {
        id: "delay",
        text: "The biggest game is delayed",
        side: "sellers",
        why: "The game was supposed to ship this year. The sales show up next year.",
      },
      {
        id: "sales",
        text: "This year's sales are now expected to be lower",
        side: "sellers",
        why: "They cut this year's sales forecast before the year ended. People react to that number.",
      },
      {
        id: "costs",
        text: "Development costs keep rising",
        side: "sellers",
        why: "Building the game costs more, so less of the sales money is left.",
      },
    ],
    lesson:
      "The game is still in development. People are reacting to next year's date and this year's lower forecast.",
  },
  {
    company: "Sunbeam Snacks",
    headline: "A hit snack. A bigger bill.",
    expected: "Investors expected a normal launch.",
    happened:
      "The snack is selling better than expected, ingredients cost more, and the company hasn't said what happens to profit.",
    facts: [
      {
        id: "demand",
        text: "The snack is selling better than expected",
        side: "buyers",
        why: "People bought more of the snack than investors had guessed.",
      },
      {
        id: "ingredients",
        text: "Ingredients cost much more",
        side: "sellers",
        why: "Ingredients got more expensive, so the extra sales might not mean extra profit.",
      },
      {
        id: "profits",
        text: "The company hasn't said what happens to profits",
        side: "unsure",
        why: "Nobody said which effect wins. Buyers and sellers can both make a case.",
      },
    ],
    lesson:
      "Demand pulls one way and costs pull the other. The price can sit still while people argue.",
  },
];

export const SIDES: { id: Side; label: string }[] = [
  { id: "sellers", label: "Sellers" },
  { id: "unsure", label: "Not sure" },
  { id: "buyers", label: "Buyers" },
];

export function tilt(sides: Side[], total = sides.length) {
  if (total <= 0) return 0;
  let buyers = 0;
  let sellers = 0;
  for (const side of sides) {
    if (side === "buyers") buyers += 1;
    if (side === "sellers") sellers += 1;
  }
  return (buyers - sellers) / total;
}

export function tiltPercent(value: number) {
  return ((value + 1) / 2) * 100;
}

export function placedSides(facts: Fact[], placements: Record<string, Side>) {
  return facts.flatMap((fact) => {
    const side = placements[fact.id];
    return side ? [side] : [];
  });
}

export function allPlaced(facts: Fact[], placements: Record<string, Side>) {
  return facts.every((fact) => placements[fact.id]);
}

export function matchedFacts(facts: Fact[], placements: Record<string, Side>) {
  return facts.filter((fact) => placements[fact.id] === fact.side).length;
}

export function factTotal(rounds: Round[]) {
  return rounds.reduce((total, round) => total + round.facts.length, 0);
}

export function leanLabel(value: number) {
  if (value > 0.2) return "The scale leans toward buyers.";
  if (value < -0.2) return "The scale leans toward sellers.";
  return "The scale stays near the middle.";
}
