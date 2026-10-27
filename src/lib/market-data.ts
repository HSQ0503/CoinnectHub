export type AssetId = "bank" | "index" | "snacks" | "pixel" | "rocket";

export type Asset = {
  id: AssetId;
  name: string;
  kind: string;
  short: string;
  bumpy: 1 | 2 | 3 | 4 | 5;
  typical: string;
  color: string;
};

export const ASSETS: Asset[] = [
  {
    id: "bank",
    name: "Savings Bank",
    kind: "Savings account",
    short: "The bank pays you a little interest every year for keeping your money there, and the amount you put in never goes down.",
    bumpy: 1,
    typical: "$100 usually turns into about $103 after a year.",
    color: "#3d9be9",
  },
  {
    id: "index",
    name: "Market Fund",
    kind: "Index fund",
    short: "One fund that owns a small slice of every company in town, so your money grows when the whole economy grows.",
    bumpy: 3,
    typical: "$100 usually turns into about $110, but in a really bad year it can drop to $75.",
    color: "#061b45",
  },
  {
    id: "snacks",
    name: "Sunbeam Snacks",
    kind: "Company stock",
    short: "A share of one snack company. People buy snacks in good times and bad, so this stock moves less than most.",
    bumpy: 3,
    typical: "$100 usually ends up somewhere between $85 and $125.",
    color: "#f59e0b",
  },
  {
    id: "pixel",
    name: "Pixel Play",
    kind: "Company stock",
    short: "A share of one video game studio. A hit game can send it soaring, and a flop can cut it in half.",
    bumpy: 4,
    typical: "In one year, $100 could become $180, or it could shrink to $50.",
    color: "#8b5cf6",
  },
  {
    id: "rocket",
    name: "Rocket Coin",
    kind: "Hype coin",
    short: "A digital coin with no business behind it. Its price only goes up while people stay excited about it.",
    bumpy: 5,
    typical: "In one year, $100 could become $250, or it could crash to $10.",
    color: "#e0457b",
  },
];

export const ASSET_IDS = ASSETS.map((asset) => asset.id);

export function assetById(id: AssetId) {
  return ASSETS.find((asset) => asset.id === id)!;
}

// Places open one at a time so each new idea gets its own year before the next one arrives.
const UNLOCKS: Record<AssetId, { long: number; quick: number }> = {
  bank: { long: 0, quick: 0 },
  index: { long: 1, quick: 0 },
  snacks: { long: 2, quick: 1 },
  pixel: { long: 2, quick: 1 },
  rocket: { long: 3, quick: 2 },
};

export function unlockYear(id: AssetId, years: number) {
  return years >= 8 ? UNLOCKS[id].long : UNLOCKS[id].quick;
}

export type Unlock = { ids: AssetId[]; title: string; body: string };

export const UNLOCK_STORIES: Unlock[] = [
  {
    ids: ["bank"],
    title: "The Savings Bank is open",
    body: "Banks pay you interest, which is a small reward for letting them hold your money. Put $100 in and it grows to about $103 by next year without you doing anything, and it can never go down.",
  },
  {
    ids: ["index"],
    title: "The Market Fund just opened",
    body: "Buying into the Market Fund means owning a tiny slice of every company in town at once. Most years it grows a lot more than the bank, but some years it drops, and you have to be okay with that.",
  },
  {
    ids: ["snacks", "pixel"],
    title: "Two companies are selling shares",
    body: "A share is a small piece of one company, so that company’s good and bad news hits your money directly. Sunbeam Snacks is usually steady, while Pixel Play is a wild ride.",
  },
  {
    ids: ["rocket"],
    title: "Rocket Coin has landed",
    body: "Everyone is talking about Rocket Coin, but there’s no business behind it. Its price depends only on hype, so it could jump way up or crash to almost nothing.",
  },
];

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
  boom: "Great years feel like they’ll last forever, but they never do. Spreading your money out keeps you safe when the mood changes.",
  normal:
    "Quiet years are when compounding does its work, because the money you gained in earlier years starts earning money of its own.",
  slowdown:
    "When stocks stall, the money in the bank keeps growing. That’s why a lot of people keep some savings and some investments.",
  crash:
    "Crashes are scary, but the whole market has always recovered over time. People who sell in a panic lock in their losses and usually miss the bounce back.",
};

export type CompanyEvent = {
  text: string;
  shock: [number, number];
  weight: number;
};

export const COMPANY_EVENTS: Record<"snacks" | "pixel", CompanyEvent[]> = {
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

export const STOCK_BETA: Record<"snacks" | "pixel", number> = {
  snacks: 0.6,
  pixel: 1.3,
};

export type RocketMove = "moon" | "drift" | "crash" | "wipeout";

export const ROCKET_EVENTS: Record<RocketMove, { text: string; range: [number, number] }> = {
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

export type LifeEvent = {
  text: string;
  amount: number;
  minAge?: number;
};

export const LIFE_COSTS: LifeEvent[] = [
  { text: "Your phone screen cracked, and the repair cost $150.", amount: -150 },
  { text: "A surprise dentist bill arrived for $250.", amount: -250 },
  { text: "Your car needed new brakes, which cost $400.", amount: -400, minAge: 17 },
  { text: "You needed a laptop for college classes, which cost $600.", amount: -600, minAge: 18 },
  { text: "Your apartment needed a security deposit of $500.", amount: -500, minAge: 19 },
];

export const LIFE_GIFTS: LifeEvent[] = [
  { text: "Your grandparents sent $200 for your birthday.", amount: 200 },
  { text: "You won $150 in a school art contest.", amount: 150 },
  { text: "Your boss gave you a $250 holiday bonus.", amount: 250 },
];

export type Temptation = { id: string; name: string; price: number; text: string; minAge?: number };

export const TEMPTATIONS: Temptation[] = [
  {
    id: "console",
    name: "the new Nova console",
    price: 300,
    text: "The new Nova game console just came out, and most of your friends already have one.",
  },
  {
    id: "sneakers",
    name: "limited-edition sneakers",
    price: 220,
    text: "A pair of limited-edition sneakers just dropped, and they’ll be sold out by tonight.",
  },
  {
    id: "phone",
    name: "a new phone",
    price: 400,
    text: "Your phone works fine, but the new model has a much better camera and everyone wants one.",
    minAge: 18,
  },
];

export type Tip = { asset: "snacks" | "pixel"; text: string };

export const TIPS: Tip[] = [
  {
    asset: "pixel",
    text: "Your cousin swears that Pixel Play’s next game is going to be the biggest hit of all time.",
  },
  {
    asset: "snacks",
    text: "A video with two million views says Sunbeam Snacks is about to triple in price.",
  },
];

export type HatId = "party" | "chef" | "shades" | "headphones" | "crown";

export type Hat = { id: HatId; name: string; price: number };

export const HATS: Hat[] = [
  { id: "party", name: "Party hat", price: 40 },
  { id: "chef", name: "Chef hat", price: 70 },
  { id: "shades", name: "Cool shades", price: 100 },
  { id: "headphones", name: "Big headphones", price: 160 },
  { id: "crown", name: "Golden crown", price: 400 },
];

export function hatById(id: HatId) {
  return HATS.find((hat) => hat.id === id)!;
}

export type DreamId = "car" | "trip" | "business";

export const DREAMS: { id: DreamId; label: string; name: string }[] = [
  { id: "car", label: "A used car", name: "a used car" },
  { id: "trip", label: "A trip abroad", name: "a trip abroad with friends" },
  { id: "business", label: "Your own business", name: "starting your own business" },
];

export function dreamById(id: DreamId) {
  return DREAMS.find((dream) => dream.id === id)!;
}

export type BadgeId = "early" | "basket" | "cool" | "rainy" | "hype" | "dream";

export const BADGES: { id: BadgeId; name: string; how: string }[] = [
  { id: "early", name: "Early Bird", how: "Put money to work in your very first year." },
  { id: "basket", name: "Basket Builder", how: "Have money in three different places at the same time." },
  { id: "cool", name: "Cool Head", how: "Stay calm and don’t sell when the market crashes." },
  { id: "rainy", name: "Rainy-Day Ready", how: "Pay a surprise bill without selling any investments." },
  { id: "hype", name: "Hype-Proof", how: "Say no when everyone is buying Rocket Coin." },
  { id: "dream", name: "Dream Reached", how: "Reach your goal by the end of the game." },
];

export function badgeById(id: BadgeId) {
  return BADGES.find((badge) => badge.id === id)!;
}
