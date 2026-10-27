# CoinnectHub

Website for a youth financial literacy nonprofit. Built with Next.js App Router, TypeScript, and Tailwind CSS.

The site pairs Sora headings with Manrope body text and uses CoinnectHub’s blue, yellow, and navy palette. Penny, the coin mascot, introduces an interactive savings lesson in the homepage hero, every tool works by keyboard, and transitions respect reduced-motion preferences.

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

The static export is written to `out/`. Routes include Home, About, Games & tools, the savings planner (`/games/savings`), Market Street (`/games/stocks`), the What Moves a Stock? quiz (`/games/stock-quiz`), and Contact & get involved.

## The tools

- **Savings planner** works out when you can afford a goal, or how much to save per week, every 2 weeks, or every month to hit a deadline. It handles interest (APY), a rising price, and share of weekly pay, and its math lives in `src/lib/savings.ts`.
- **What Moves a Stock?** is a five-question quiz. Each question shows a short news story about a made-up company, asks whether the stock is more likely to rise or fall, and explains the answer in plain language, with scenarios that show why prices respond to expectations rather than to good or bad news on its own. The scenario pool and round picker live in `src/lib/stock-quiz.ts`.
- **Market Street** is a 3D investing game built with three.js for middle schoolers. Players pick a dream, get a calibrated savings goal that the bank alone can’t reach, and spend 5 or 10 in-game years walking around a town. Places open one at a time (a savings bank, then an index fund, then two company stocks, then a hype coin), each with a short just-in-time explanation, and every deposit shows up as a growing pile of coins beside the building. Decision cards ask players what to do after a crash, during a hype spike, after a hot tip, or when tempted to spend, and the year-end newspaper explains how each choice played out. Badges reward habits like holding through the crash and keeping savings for surprise bills, and the final report compares the player against simple plans, shows what their spending would have grown to, and ends with discussion questions. Game rules and the seeded market generator live in `src/lib/market-game.ts` and `src/lib/market-data.ts`, while the 3D town lives in `src/components/market-street/world.ts` and loads only on that page.

## Before public launch

- Add confirmed contact details in `src/app/get-involved/page.tsx`. The inquiry builder only previews and downloads text; it does not send or store submissions.
- Confirm final nonprofit copy and Instagram handle, then remove the draft’s `noindex` setting in `src/app/layout.tsx`.

The supplied logo is preserved in `public/coinnect-logo.png`, and `public/market-street-cover.webp` is a framed screenshot of the game used on the Market Street card. The shared styles in `src/app/globals.css` and `src/app/homepage.css` cover page layouts, learning demos, and responsive navigation, and `src/app/games.css` styles the planner, Market Street, and the quiz. Calculations and game state run in the browser, with no accounts or analytics.
