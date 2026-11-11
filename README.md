# GardenWow — The City Gardener's Field Guide

A hand-built, one-page website for a fictional city-gardening brand, **GardenWow**. It is a complete static site: no framework, no build step, no external runtime dependencies.

## Pages

| Page | File | What it is |
| --- | --- | --- |
| Main guide | [`index.html`](index.html) | The one-page guide: hero, field guide, plant matcher, seasonal calendar, weekly checklist, FAQ and footer. |
| Privacy policy | [`privacy.html`](privacy.html) | A plain-language privacy policy aligned with how the site actually behaves. |
| Terms of service | [`terms.html`](terms.html) | Ground rules, gardening safety, IP, disclaimers and governing law. |

## Run it

Serve the folder locally for the intended typography:

```bash
cd default-workspace
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

Opening `index.html` directly also works, but browsers may block self-hosted webfonts on `file://` URLs, so the type will fall back to system serif and sans-serif fonts. Use the local server for an accurate preview.

## What is interactive

- **Plant matcher** — 18 plants scored against light, space and care preferences. Results update instantly and the reset link restores the defaults.
- **City seasons** — five tabbed seasonal panels. The tab matching the current month is selected automatically. Arrow keys, Home and End work on the tab list.
- **Weekly reset** — six-task checklist with a progress bar. Progress is saved in `localStorage` on the visitor's device only; the reset button clears it.
- **Mobile menu** — full-screen navigation with focus handling and Escape-to-close.
- **Scroll reveals** — subtle on-load reveals that respect `prefers-reduced-motion`. The animation is opt-in from JavaScript, so content stays visible if the script fails or is disabled.
- **Legal pages** — sticky table of contents, readable long-form layout and print-friendly base styles.

## Project structure

```text
.
├── index.html
├── privacy.html
├── terms.html
├── assets/
│   ├── favicon.svg
│   ├── styles.css
│   ├── script.js
│   ├── fonts/
│   │   ├── dm-sans-normal.woff2
│   │   ├── dm-sans-italic.woff2
│   │   ├── fraunces-normal.woff2
│   │   └── fraunces-italic.woff2
│   └── images/
│       ├── hero-balcony-600.webp
│       ├── hero-balcony-1000.webp
│       ├── hero-balcony-1400.webp
│       ├── herbs-500.webp
│       └── herbs-900.webp
├── preview/
│   ├── desktop.webp
│   └── mobile.webp
└── README.md
```

## Design notes

- **Palette:** deep forest ink, warm paper, chartreuse lime and terracotta clay.
- **Type:** Fraunces for editorial display; DM Sans for body and interface text. Both are self-hosted, so the site loads no third-party fonts.
- **Images:** WebP, locally hosted, with responsive `srcset` for the hero.
- **Accessibility:** semantic landmarks, skip link, visible focus states, labelled controls, keyboard tabs, mobile-menu focus trap, reduced-motion support and WCAG AA colour contrast. Tested with axe-core against WCAG 2.1 A/AA with zero reported violations.

## Before publishing

1. **Replace the placeholder contact details.** The email `hello@gardenwow.co` and the domain `gardenwow.co` are used throughout. Swap in the real domain and inbox.
2. **Have the legal pages reviewed.** The privacy policy and terms are written to match this specific static site (no accounts, no analytics, no newsletter, local-only checklist). They are a practical starting point, not legal advice. Update them if analytics, forms, affiliate links or payments are added.
3. **Check local requirements** for privacy, consumer law and gardening-related claims in the jurisdiction you publish from.
4. **Keep image and font licences.** See credits below.

## Credits

### Photography

- Hero balcony: [“Charming urban balcony garden in Batumi”](https://www.pexels.com/photo/charming-urban-balcony-garden-in-batumi-38712656/) by Zülfü Demir, via Pexels.
- Windowsill herbs: [“Potted green plants on outdoor balcony railing”](https://www.pexels.com/photo/potted-green-plants-on-outdoor-balcony-railing-32254888/) by Nadin Sh, via Pexels.

Both photographs are used under the [Pexels licence](https://www.pexels.com/license/).

### Fonts

- **Fraunces** by Undercase Type
- **DM Sans** by Colophon Foundry

Both are distributed under the SIL Open Font License via Google Fonts. The self-hosted `.woff2` files are included in `assets/fonts/`.

## A note on content

GardenWow is a fictional brand created for this project. Plant advice, seasonal notes and safety guidance are general editorial content and should be checked against local conditions, building rules and professional advice before publication or use.
