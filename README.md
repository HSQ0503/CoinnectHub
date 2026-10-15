# CoinnectHub

First website draft for a youth financial literacy nonprofit. Built with Next.js App Router, TypeScript, and Tailwind CSS.

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

The static export is written to `out/`. Routes include Home, About, Games & tools, Savings calculator, Stock news game, and Contact & get involved.

## Before public launch

- Replace Mr. Ferla’s portrait and biography placeholders in `src/app/about/page.tsx`.
- Add confirmed contact details in `src/app/get-involved/page.tsx`. The inquiry builder only previews and downloads text; it does not send or store submissions.
- Confirm final nonprofit copy and Instagram handle, then remove the draft’s `noindex` setting in `src/app/layout.tsx`.

The supplied logo is preserved in `public/coinnect-logo.png`. Website blue is slightly deeper than the approximate brand swatch to support white body text and yellow headings. Calculations and game state run in the browser, with no accounts or analytics.
