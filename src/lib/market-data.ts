export type AssetId =
  | "bank"
  | "bonds"
  | "index"
  | "snacks"
  | "bikes"
  | "pixel"
  | "rocket";

export type Asset = {
  id: AssetId;
  name: string;
  kind: string;
  blurb: string;
  risk: 1 | 2 | 3 | 4 | 5;
  typical: string;
  color: string;
};

export const ASSETS: Asset[] = [
  {
    id: "bank",
    name: "Penny Savings Bank",
    kind: "Savings account",
    blurb:
      "The bank pays you interest for keeping your money there. Your balance never goes down, but the interest is small and barely keeps up with rising prices.",
    risk: 1,
    typical: "Usually earns 1% to 4.5% a year and never loses money.",
    color: "#3d9be9",
  },
  {
    id: "bonds",
    name: "Harbor Bond House",
    kind: "Bonds",
    blurb:
      "A bond is a loan you make to a government or a large company, which pays you back with interest. Bonds move a little, and they often hold up when stocks fall.",
    risk: 2,
    typical: "Usually somewhere between −3% and +10% in a year.",
    color: "#1f9e8f",
  },
  {
    id: "index",
    name: "Whole Market Fund",
    kind: "Index fund",
    blurb:
      "One purchase buys a small slice of 500 companies at once. When one company stumbles, the others soften the blow, but the fund still rises and falls with the whole economy.",
    risk: 3,
    typical:
      "Bad years can drop 25% and good years can gain 30%, but it has averaged about 8% a year over long periods.",
    color: "#061b45",
  },
  {
    id: "snacks",
    name: "Sunbeam Snacks",
    kind: "Company stock",
    blurb:
      "A share of a snack company. People buy snacks in good times and bad, so this stock usually moves less than others, although ingredient prices can squeeze its profits.",
    risk: 3,
    typical: "Usually somewhere between −15% and +25% in a year.",
    color: "#f59e0b",
  },
  {
    id: "bikes",
    name: "Loop Bikes",
    kind: "Company stock",
    blurb:
      "A share of a company that makes e-bikes. You own a tiny piece of one business, so its good and bad news hit your money directly.",
    risk: 4,
    typical: "Can swing 40% or more in a single year.",
    color: "#ef5b3b",
  },
  {
    id: "pixel",
    name: "Pixel Play",
    kind: "Company stock",
    blurb:
      "A share of a video game studio. One hit game can send the stock soaring, while a delay or a flop can sink it.",
    risk: 5,
    typical: "Can double or get cut in half in a single year.",
    color: "#8b5cf6",
  },
  {
    id: "rocket",
    name: "Rocket Coin",
    kind: "Hype coin",
    blurb:
      "A digital coin with no business behind it. Its price depends only on whether people stay excited about it, so it can skyrocket or collapse.",
    risk: 5,
    typical: "Anything from −90% to +150% in a year.",
    color: "#e0457b",
  },
];

export const ASSET_IDS = ASSETS.map((asset) => asset.id);

export function assetById(id: AssetId) {
  return ASSETS.find((asset) => asset.id === id)!;
}

export type Economy = "boom" | "normal" | "slowdown" | "crash";

export const ECONOMY_HEADLINES: Record<Economy, string[]> = {
  boom: [
    "Shoppers are spending and companies are hiring",
    "Stocks climb as company profits hit records",
    "A strong economy lifts almost every business",
  ],
  normal: [
    "The economy keeps growing at a steady pace",
    "Most companies grow a little, and so do their stocks",
    "A calm, ordinary year for the stock market",
  ],
  slowdown: [
    "The economy cools and investors get cautious",
    "Growth slows and stocks mostly go sideways",
    "Worries about a slowdown keep the market flat",
  ],
  crash: [
    "Recession hits and stocks tumble as businesses cut back",
    "Market crash as panicked investors sell everything",
    "The economy shrinks and stock prices fall hard",
  ],
};

export const ECONOMY_TIPS: Record<Economy, string> = {
  boom: "Great years feel like they’ll last forever, but they don’t. Spreading your money across different investments protects you when the mood changes.",
  normal:
    "In a quiet year, compounding does the work. Gains from earlier years start earning gains of their own.",
  slowdown:
    "When stocks stall, savings and bonds often hold steady. That’s why many investors keep a mix of both.",
  crash:
    "Crashes are scary, but the overall market has always recovered over time. People who sell in a panic lock in their losses and often miss the bounce back.",
};

export type CompanyEvent = {
  text: string;
  shock: [number, number];
  weight: number;
};

export const COMPANY_EVENTS: Record<"snacks" | "bikes" | "pixel", CompanyEvent[]> =
  {
    snacks: [
      {
        text: "Sunbeam Snacks lands a deal with a national grocery chain",
        shock: [0.08, 0.18],
        weight: 2,
      },
      {
        text: "Sunbeam’s new snack is a hit, even though ingredients cost more",
        shock: [0.02, 0.08],
        weight: 2,
      },
      {
        text: "Cocoa prices double and squeeze Sunbeam’s profits",
        shock: [-0.18, -0.08],
        weight: 2,
      },
      {
        text: "People keep buying Sunbeam Snacks like they always do",
        shock: [-0.02, 0.04],
        weight: 3,
      },
    ],
    bikes: [
      {
        text: "Loop Bikes orders come in far above what investors expected",
        shock: [0.18, 0.38],
        weight: 2,
      },
      {
        text: "Loop Bikes opens shops in five new cities",
        shock: [0.06, 0.16],
        weight: 2,
      },
      {
        text: "Loop Bikes recalls 20,000 bikes because of faulty brakes",
        shock: [-0.42, -0.22],
        weight: 2,
      },
      {
        text: "A bigger rival cuts its e-bike prices in half",
        shock: [-0.22, -0.08],
        weight: 2,
      },
      {
        text: "Loop Bikes has a quiet year with steady sales",
        shock: [-0.04, 0.04],
        weight: 2,
      },
    ],
    pixel: [
      {
        text: "Pixel Play’s new game sells 10 million copies in a month",
        shock: [0.45, 0.85],
        weight: 2,
      },
      {
        text: "Pixel Play signs a deal to turn its biggest game into a movie",
        shock: [0.1, 0.25],
        weight: 2,
      },
      {
        text: "Pixel Play delays its biggest game until next year",
        shock: [-0.4, -0.22],
        weight: 2,
      },
      {
        text: "Players hate Pixel Play’s new release and sales flop",
        shock: [-0.55, -0.32],
        weight: 2,
      },
      {
        text: "Pixel Play’s older games keep selling while the next one is built",
        shock: [-0.06, 0.06],
        weight: 2,
      },
    ],
  };

export const STOCK_BETA: Record<"snacks" | "bikes" | "pixel", number> = {
  snacks: 0.6,
  bikes: 1.1,
  pixel: 1.3,
};

export type RocketMove = "moon" | "drift" | "crash" | "wipeout";

export const ROCKET_EVENTS: Record<
  RocketMove,
  { text: string; range: [number, number] }
> = {
  moon: {
    text: "Rocket Coin goes viral and everyone at school is talking about it",
    range: [0.8, 1.5],
  },
  drift: {
    text: "Rocket Coin drifts as the hype moves on to a newer coin",
    range: [-0.15, 0.25],
  },
  crash: {
    text: "Rocket Coin crashes after its founders stop answering questions",
    range: [-0.7, -0.45],
  },
  wipeout: {
    text: "Hackers drain Rocket Coin’s biggest exchange and the price collapses",
    range: [-0.93, -0.8],
  },
};

export const BOND_HEADLINES: Record<Economy, string> = {
  boom: "Bonds lag behind while investors chase stocks",
  normal: "Bonds pay their steady interest",
  slowdown: "Bonds rise as investors look for somewhere safer",
  crash: "Investors rush into safe bonds while stocks fall",
};

export type LifeEvent = {
  text: string;
  amount: number;
  minAge?: number;
};

export const LIFE_COSTS: LifeEvent[] = [
  { text: "Your phone screen cracked, and the repair costs $150.", amount: -150 },
  { text: "A surprise dentist bill arrives for $250.", amount: -250 },
  {
    text: "Your car needs new brakes, which costs $400.",
    amount: -400,
    minAge: 17,
  },
  {
    text: "You need a laptop for college classes, which costs $600.",
    amount: -600,
    minAge: 18,
  },
  {
    text: "Your apartment needs a security deposit of $500.",
    amount: -500,
    minAge: 19,
  },
];

export const LIFE_GIFTS: LifeEvent[] = [
  { text: "Your grandparents send $200 for your birthday.", amount: 200 },
  { text: "You win $150 in a school art contest.", amount: 150 },
  { text: "Your boss gives you a $250 holiday bonus.", amount: 250 },
];
