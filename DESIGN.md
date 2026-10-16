# DESIGN — Braise

> Decisions set in phase 2 of the redesign (16 Oct 2026). Direction: **category standard, executed without a false note**. Quality bar: **Ekstedt (Stockholm)**. This file will be updated from the finished build at the end of the redesign.

## Principles

1. **Photography carries everything.** The fire, the dishes on the menu and the dining room. The interface around it stays quiet.
2. **One accent, one job.** Brass marks the action (booking) and the fine rules. Nothing else is coloured.
3. **No effects.** No glass, halos, gradient text, decorative grids, "Fig." captions, marquees, custom cursor or magnetic buttons.
4. **Readable at night on a phone.** Body text 16 px minimum, labels 13 px minimum, contrast ≥ 4.5:1 everywhere.

## Physical scene

Evening, in a dimmed dining room or at home. The visitor looks at their phone with low ambient light, between two conversations. This justifies a **dark** ground: a warm, matte night that extends the room rather than a screen glowing in the dark.

## Palette (Restrained strategy: tinted neutrals + one accent)

| Token | Value | Role | Contrast on `night` |
|---|---|---|---|
| `night` | `#14110f` | Page background | — |
| `coal` | `#1b1714` | Alternate sections, footer | — |
| `ember-surface` | `#241e1a` | Cards, fields, bars | — |
| `line` | `#3a322b` | 1px dividers and borders | — |
| `cream` | `#f2e9da` | Main text, titles | ≈ 16:1 |
| `muted` | `#a99d8c` | Secondary text, metadata | ≈ 7:1 |
| `brass` | `#c19a5b` | Action, active state, rules, focus | ≈ 7:1 |
| `brass-strong` | `#d4b07a` | Brass button hover | ≈ 9:1 |
| `danger` | `#e08a6d` | Errors (always paired with a message) | ≈ 6.5:1 |

Rules:
- No opacity applied to text. A colour that needs to be fainter becomes `muted`, never `cream/60`.
- No gradient except **one** dark veil (night at 0% → 70%) over photos, for legibility.

## Typography

| Role | Face | Size | Notes |
|---|---|---|---|
| Hero | Gilda Display | clamp(3.5rem, 9vw, 8rem), line-height 1 | Normal case, letter-spacing 0.01em |
| H1 page | Gilda Display | clamp(2.75rem, 6vw, 5rem) | |
| H2 section | Gilda Display | clamp(2rem, 4vw, 3.25rem) | |
| H3 dish | Gilda Display | 1.5rem (24 px) | |
| Text | Hanken Grotesk 400 | 1.0625rem (17 px), line-height 1.65 | Maximum 65 characters per line |
| Lead | Hanken Grotesk 400 | 1.25rem (20 px) | |
| Label / kicker | Hanken Grotesk 600 | 0.8125rem (13 px), uppercase, letter-spacing 0.16em | Never for running text |
| Price | Hanken Grotesk 500 | tabular-nums | |

- Gilda Display has a single weight: hierarchy comes from size and space, never from bold.
- Only one italic is allowed, Hanken in its native italic, and only for the quote in reviews.
- No monospace face.

## Spacing and layout

- **Base 4 px.** Scale used: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- Section padding: 96 px on desktop, 64 px on mobile. There is more space above a title than below it.
- Content width: 1200 px max; text column 640 px max.
- Side gutters: 24 px on mobile, 48 px on desktop.
- Image grids are uniform: 4:3 for dishes and the gallery, 3:2 for wide bands.

## Shapes

- Corner radius: **2 px** on buttons, fields, cards and images (near-square, "printed menu" feel). Pills only for counter badges.
- Borders: `1px solid line`. A brass rule (1px × 64 px) marks a section opening.
- No shadow. Elevation is shown by a change of surface (`night` → `ember-surface`).

## Components

- **Primary button**: `brass` fill, `night` text, label 14 px / 600 uppercase, letter-spacing 0.14em, height 52 px, horizontal padding 28 px. Hover: `brass-strong`. Focus: 2px cream outline, offset 3px.
- **Secondary button**: transparent, 1px `cream` border, `cream` text. Hover: `ember-surface` background.
- **Text link**: `cream`, 1px brass underline, offset 4px.
- **Header**: transparent over the hero, `night` at 95% (solid, no blur) after scrolling. Logo "Braise" in Gilda 28 px. 5 links at 14 px. A "Réserver" primary button on desktop.
- **Mobile booking bar**: fixed at the bottom, 64 px tall, `coal` background with a top `line` border, a full-width primary button. Visible from the first screen on every page except /reservation.
- **Dish card**: 4:3 photo, name in Gilda 24 px, description 15 px `muted`, price on the right, allergens as text ("Contient : gluten, lait") at 14 px.
- **Menu line**: name … dot leaders … price (the printed-menu legacy), description underneath.
- **Filter**: a 44 px chip, 1px `line` border; active state is `brass` fill. On mobile, a single scrolling row of categories plus a "Filtres (n)" button that opens a bottom panel.
- **Field**: height 56 px, `ember-surface` background, 1px `line` border; label shown **above** the field (no floating label), 16 px text.
- **Slot**: 48 px button. Free = `line` border; chosen = `brass` fill; last seats = text "dernières places"; full = struck through + "complet" in the accessible label.

## Taste dials (validated in phase 3; do not change without notice)

- `DESIGN_VARIANCE` **3**: symmetric, centred hero allowed, elegance through alignment and space. Signatures in an asymmetric layout (1 featured + 2), never 3 equal cards.
- `MOTION_INTENSITY` **3**: hover, active, short state transitions. No scroll-triggered animation, no parallax, no infinite loop.
- `VISUAL_DENSITY` **3** on the showcase pages, **5** on La carte and Réservation.
- Icons: `@phosphor-icons/react`, one consistent weight (`regular`). No emoji or decorative Unicode symbols.

## Motion

- One curve, `cubic-bezier(0.2, 0, 0, 1)`, with durations of 160 / 240 / 400 ms.
- Content is visible by default. Animations are short fades only, and never a condition for content to appear.
- No pinned scroll, no smooth scrolling (Lenis), no custom cursor, no parallax.
- `prefers-reduced-motion`: fades are removed, state changes stay.

## Imagery

- Free stock photos (Unsplash) that **show the dishes on the menu**, the fire, the dining room and the team. The burger is removed.
- Every alt text describes what the photo actually shows.
- Hero: côte de bœuf or flames, with a dark veil from 0 to 70% at the bottom.

## Voice

- French; formal *vous*; short sentences; concrete detail (beech, oak, Wazemmes, 30 covers).
- No catchy superlatives, no invented claims (press, awards, chef names).
- Few em dashes: prefer full stops and commas.
