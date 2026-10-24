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

The static export is written to `out/`. Routes include Home, About, Games & tools, a five-week savings game, a headline-sorting stock game, and Contact & get involved.

## Before public launch

- Add Mr. Ferla’s portrait on the About page when a photo is ready. His story is already written there.
- Add confirmed contact details in `src/app/get-involved/page.tsx`. The inquiry builder only previews and downloads text; it does not send or store submissions.
- Confirm final nonprofit copy and Instagram handle, then remove the draft’s `noindex` setting in `src/app/layout.tsx`.

The supplied logo is preserved in `public/coinnect-logo.png`. The shared styles in `src/app/globals.css` and `src/app/homepage.css` cover page layouts, learning demos, and responsive navigation. Calculations and game state run in the browser, with no accounts or analytics.
