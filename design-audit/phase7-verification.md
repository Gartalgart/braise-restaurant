# Phase 7: Verification and finishing (16/10/2026)

All checks were run against a **production build** (`pnpm build` then `pnpm start`), not the dev server.

## Available evidence

| Item | Location |
|---|---|
| "After" screenshots, 6 pages × 3 viewports (full page + first screen) | `design-audit/apres/` |
| Before/after comparisons | `design-audit/comparaison-*.png` |
| Raw automated results | `design-audit/apres/verification.json` |
| Capture script | `design-audit/capture.cjs` |
| Verification script | `design-audit/verify.cjs` |

## Automated results

| Check | Before | After |
|---|---|---|
| Console errors (18 views) | intermittent in dev (`SyntaxError`, 500 on /menu) | **0** (prod build) |
| Horizontal scroll | 0 | **0** |
| Touch targets < 44 px, /menu, 375 px wide | 19 of 22 | **0** (all pages) |
| Text below WCAG AA contrast | `ash/70`, `/60`, `/50` at 2.1–3.1:1 | **0** measured (text on a solid background) |
| Smallest text | 8.8–11.2 px (uppercase mono) | **13 px** (labels), 15–17 px running text |
| Visible keyboard focus (first 10 tabs) | yes | **yes**, logical order: skip link → logo → nav → Réserver → CTAs |
| Internal links | — | **6 of 6 return 200** |
| Impeccable detector (source) | 3 findings (gradient text ×2, decorative grid) | **0** |
| Mobile filter bar on /menu | 411 px (60% of the screen) | **68 px** sticky row + "Filtres" panel |
| Booking CTA in the first mobile screen | home only | **every page** (bottom bar) |

The contrast check only covers text on a solid background. Text placed over a photo is not measured; it sits on a night veil of 60–90%.

## Behaviour tested in the browser

- **Booking**: a complete booking succeeded.
  - Closed days are disabled.
  - A full day shows "Complet" and suggests the next free slot.
  - Focus moves to the "Nom" field at step 2, then to the title at confirmation.
- **Menu**: the mobile "Filtres" panel works.
  - Choosing "Vegan" shows "Voir 4 plats".
  - Esc closes the panel and returns focus to the button.
- **Gallery lightbox**:
  - Enter opens it, with focus on "Fermer".
  - The arrows change photo and the counter is announced.
  - Tab stays inside the lightbox.
  - Esc closes it and returns focus to the thumbnail.
- **Map (Contact)**: it loads lazily once you scroll down to it.

## Impeccable audit (rescored)

| # | Dimension | Before | After | Remaining |
|---|---|---|---|---|
| 1 | Accessibility | 2 | 3 | No screen-reader test with NVDA/VoiceOver; 200% zoom not tested |
| 2 | Performance | 2 | 3 | Remote photos with no image of our own; First Load JS 104–117 KB; no Lighthouse measurement taken |
| 3 | Theming / tokens | 3 | 4 | — |
| 4 | Responsive | 2 | 4 | — |
| 5 | Integrity | 1 | 4 | Detector clean; template tells removed |
| | **Total** | **10/20** | **18/20** | |

The 18/20 is my own assessment from the checks above. **I did not rerun the UX critique (two independent agents)**, so the 22/40 from phase 1 has no comparable score after the redesign.

## Polish carried out in this phase

- **Touch targets**: the "Braise" logo and the text links ("Découvrir le lieu", etc.) were 28 px tall; they are now 44 px.
- **DESIGN.md**: updated to describe what was actually built, including tokens, components and motion.
- **Photo provenance**: listed in `design-audit/photos.md`.

## Before / after summary

- **Identity**: the generic "dark tech" template becomes a fine-dining restaurant site.
  - Gone: glass, halos, gradient text, grid background, "Fig." captions, marquees, custom cursor, magnetic buttons.
  - Instead: night background, cream text, a single brass accent, Gilda Display + Hanken Grotesk.
- **Product truth**: the hero shows a real dish (rib of beef over the fire) instead of a burger the menu doesn't offer. Photos and alt texts now match what each image shows.
- **Booking**: no more false "Fermé" messages. The 409 error is visible, focus is managed between steps, and slots follow the opening hours (seed fixed).
- **Mobile**: the CTA is in the first screen everywhere, filters are compact, targets are 44 px, and fields are 16 px (no zoom on iOS).
- **Lighter**: `motion` and `lenis` are gone, along with the 3.6 MB burger video and 18 components.
