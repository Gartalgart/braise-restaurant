---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/menu/page.tsx","app/reservation/page.tsx","app/galerie/page.tsx","app/avis/page.tsx","app/contact/page.tsx"]
---

# Surface brief: Braise (whole site; entry point app/page.tsx)

## Scope and visitor mode
- **Home, Gallery, Reviews, Contact:** Persuade.
- **Menu (filters) and Booking:** Operate.
- The redesign covers all 6 pages and the shared components. Presentation only; business logic is untouched.

## Audience and task
A diner in Lille, on a phone in the evening, decides where to eat and books in 30 seconds. Proof comes from:
- photos of dishes that are actually on the menu;
- the fire and the dining room;
- the 4.8/5 rating (demo content);
- real-time slots.

## Chosen direction
Category standard, executed at full commitment. Quality bar: Ekstedt (Stockholm).

## Direction contract
- **THESIS:** a fine-dining restaurant site executed without a single false note. Photography of the fire and the dishes carries everything, the typography stays restrained, and booking is always within reach. It rejects the "dark tech" template: glass, halos, gradient text, grids, Fig. captions, marquees, custom cursor.
- **OWN-WORLD:**
  - Night ground #14110f, charcoal surfaces.
  - Cream text #f2e9da, muted text #a99d8c.
  - One accent, brass #c19a5b, used for the action and for hairline rules.
  - Fine 1px rules, square or near-square corners, no shadow, no blur.
  - Gilda Display serif for titles, Hanken Grotesk for text and labels.
- **STORY:**
  - The visitor sees the fire and a real dish.
  - They understand: wood-fire seasonal cooking, a small room, Lille.
  - They believe it through the dishes, the room and the reviews.
  - They book.
- **FIRST VIEWPORT:**
  - Full-bleed photo of the côte de bœuf over the embers, with a warm overlay.
  - Transparent header: Braise in serif on the left, 5 links in the centre, a brass "Réserver" button on the right.
  - Centred: kicker "Cuisine de saison au feu de bois — Lille", the title "Braise" at hero scale, a brass rule, then a "Réserver une table" primary button and a "Voir la carte" secondary button.
  - At the bottom of the screen, a line with today's opening hours and the address.
  - On mobile: a bottom booking bar is visible from the first screen.
- **FORM:** category standard (canon), chosen by the user from the direction round. seed:de8223e12747e2cd
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved decisions
- Phase 3 (Taste) settles motion intensity and density.
- Phase 4 settles the final photo selection, checked against the menu.
