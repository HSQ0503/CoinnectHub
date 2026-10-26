# CoinnectHub

Website for a youth financial literacy nonprofit. Built with Next.js App Router, TypeScript, and Tailwind CSS.

The site pairs Sora headings with Manrope body text and uses CoinnectHub’s blue, yellow, and navy palette. Penny, the coin mascot, introduces an interactive savings lesson. The homepage budget and headline demos work by keyboard, and transitions respect reduced-motion preferences.

## Run locally

```sh
npm install
npm run dev -- --port 3107
```

Open http://localhost:3107.

## Check and build

```sh
npm run lint
npm test
npm run build
```

The static export is written to `out/`. Routes include Home, About, Games & tools, the savings planner (`/games/savings`), Market Street (`/games/stocks`), and Contact & get involved.

## The tools

- **Savings planner** works out when you can afford a goal, or how much to save per week, every 2 weeks, or every month to hit a deadline. It handles interest (APY), a rising price, and share of weekly pay, and its math lives in `src/lib/savings.ts`.
- **Market Street** is a 3D investing game built with three.js. Players spend 5 or 10 in-game years walking around a town, collecting paycheck coins, and investing in a savings bank, bonds, an index fund, three company stocks, and a hype coin. Each year ends with a flyover of the town (a storm in crash years, confetti in booms), a newspaper of market news, inflation, and occasional surprise bills. The final report compares the player against cash, savings, the index fund, an even split, and the hype coin, and the page includes tips for running it in a classroom. Game rules and the seeded market generator live in `src/lib/market-game.ts` and `src/lib/market-data.ts`, while the 3D town lives in `src/components/market-street/world.ts` and loads only on that page.

## Before public launch

- Add confirmed contact details in `src/app/get-involved/page.tsx`. The inquiry builder only previews and downloads text; it does not send or store submissions.
- Confirm final nonprofit copy and Instagram handle, then remove the draft’s `noindex` setting in `src/app/layout.tsx`.

The supplied logo is preserved in `public/coinnect-logo.png`. The shared styles in `src/app/globals.css` and `src/app/homepage.css` cover page layouts, learning demos, and responsive navigation, and `src/app/games.css` styles the planner and Market Street. Calculations and game state run in the browser, with no accounts or analytics.
