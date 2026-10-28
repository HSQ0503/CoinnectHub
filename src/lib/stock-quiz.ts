export type Direction = "up" | "down";

export type Scenario = {
  id: string;
  company: string;
  news: string;
  direction: Direction;
  explanation: string;
};

export const ROUND_SIZE = 5;

export const DIRECTION_LABELS: Record<Direction, string> = {
  up: "Rise",
  down: "Fall",
};

// Every company is made up. Each scenario gives enough context for one reasonable answer.
export const SCENARIOS: Scenario[] = [
  {
    id: "beat-forecast",
    company: "Northwind Robotics",
    news: "Investors expected Northwind Robotics’ profits to grow by 5%. Instead, profits grew by 20%, and the company raised its forecast for next year.",
    direction: "up",
    explanation:
      "The company performed better than investors expected and now expects stronger results ahead. That can make its shares more attractive to buyers.",
  },
  {
    id: "lost-customer",
    company: "Harbor Packaging",
    news: "Harbor Packaging unexpectedly loses a major customer that accounts for a large share of its sales.",
    direction: "down",
    explanation:
      "Investors may expect lower sales and profits after losing that customer, which can put pressure on the stock price.",
  },
  {
    id: "good-but-less",
    company: "Pinecrest Retail",
    news: "Pinecrest Retail’s profits grew 10% this year. Investors had been expecting growth closer to 25%, and the company said next year will be slower.",
    direction: "down",
    explanation:
      "Growth sounds like good news, but the price already reflected the bigger growth investors were counting on. Falling short of expectations can send a stock down, even when profits rise.",
  },
  {
    id: "smaller-loss",
    company: "Bluefin Airlines",
    news: "Bluefin Airlines reported a loss for the quarter, but the loss was far smaller than investors feared, and bookings for next summer are the strongest in years.",
    direction: "up",
    explanation:
      "A loss sounds bad, but investors had expected something worse. Doing better than feared, plus a strong outlook, can push a stock up.",
  },
  {
    id: "recall",
    company: "Maple Mobile",
    news: "Maple Mobile must recall its best-selling phone after a battery problem. Fixing the phones is expected to cost hundreds of millions of dollars.",
    direction: "down",
    explanation:
      "A recall means big unexpected costs and lost sales, and it can hurt trust in the brand. Investors often expect lower profits, so the price tends to fall.",
  },
  {
    id: "buyout",
    company: "Sunbeam Snacks",
    news: "A larger food company agrees to buy Sunbeam Snacks for 30% more per share than the stock’s current price.",
    direction: "up",
    explanation:
      "When a buyer offers more than the current price for every share, the stock usually jumps toward that offer, because each share is now worth close to that amount.",
  },
  {
    id: "delay",
    company: "Pixel Play",
    news: "Pixel Play delays its biggest game of the year by nine months, so the sales investors expected this year will not arrive until next year.",
    direction: "down",
    explanation:
      "Investors were counting on those sales this year. Pushing them back means less money coming in for now, and some worry the game may slip again.",
  },
  {
    id: "ceo-leaves",
    company: "Cedar Bank",
    news: "The CEO who led Cedar Bank through 15 years of steady growth resigns without warning, and the company has not named a replacement.",
    direction: "down",
    explanation:
      "A surprise exit by a trusted leader creates uncertainty about what comes next. Investors tend to dislike uncertainty, so the stock often dips.",
  },
  {
    id: "hit-product",
    company: "Glacier Energy",
    news: "Glacier Energy launches a home battery that cuts customers’ electricity bills in half. Pre-orders are already far above the company’s own goal.",
    direction: "up",
    explanation:
      "A product people clearly want points to higher sales and profits ahead. Investors buy shares when they expect the company to earn more, pushing the price up.",
  },
  {
    id: "record-sales-warning",
    company: "Orchid Fashion",
    news: "Orchid Fashion reports record sales, but warns that rising costs will shrink its profits next year and cuts its forecast.",
    direction: "down",
    explanation:
      "Record sales are good, but investors care most about what comes next. A lower forecast means smaller profits ahead, so the warning tends to outweigh the good news.",
  },
  {
    id: "rival-closes",
    company: "Atlas Shipping",
    news: "Atlas Shipping’s biggest rival goes out of business, leaving Atlas as the main company serving its shipping routes.",
    direction: "up",
    explanation:
      "With its main competitor gone, Atlas can expect more customers and less pressure to cut prices. Investors see a chance for higher profits.",
  },
  {
    id: "lawsuit",
    company: "Summit Soda",
    news: "Tests show Summit Soda’s drinks contain a banned ingredient. Several big supermarket chains pull the drinks from their shelves, and a lawsuit is filed.",
    direction: "down",
    explanation:
      "Losing shelf space means lower sales right away, and the lawsuit adds costs and uncertainty. Investors expect weaker profits, so the stock tends to fall.",
  },
];

// A small seeded generator so a round can be replayed and tested.
export function createRng(seed: number) {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1_000_000) / 1_000_000;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

// Each round mixes both directions, so players can't win by always picking the same answer.
export function pickRound(seed: number, size = ROUND_SIZE, pool = SCENARIOS) {
  const random = createRng(seed);
  const ups = shuffle(pool.filter((item) => item.direction === "up"), random);
  const downs = shuffle(pool.filter((item) => item.direction === "down"), random);
  const larger = Math.ceil(size / 2);
  const smaller = size - larger;
  const upsFirst = random() < 0.5;
  const chosen = [
    ...ups.slice(0, upsFirst ? larger : smaller),
    ...downs.slice(0, upsFirst ? smaller : larger),
  ];
  return shuffle(chosen, random).slice(0, size);
}

export function scoreMessage(score: number, total: number) {
  if (score === total) return "You read the market like a pro.";
  if (score >= total - 1) return "Nice work. You’ve got a feel for how expectations move prices.";
  if (score >= Math.ceil(total / 2)) return "Good start. The tricky ones show why good news isn’t always enough.";
  return "Tough round. Remember, prices move on surprises, not just on good or bad news.";
}
