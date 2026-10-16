# Phase 2: Page structure (shape)

Direction: category standard, at the level of Ekstedt. Tokens and components are defined in `DESIGN.md`.

## Shared elements

- **Header (desktop)**
  - "Braise" logo in serif.
  - Accueil, La carte, Galerie, Avis, Contact.
  - "Réserver" primary button.
  - Transparent over the hero, solid night once you scroll (no blur).
- **Header (mobile)**
  - Logo and a menu button (44 px).
  - The full-screen menu lists the 5 links plus today's hours.
- **Mobile booking bar**
  - Fixed at the bottom, visible **from the first screen**.
  - Hidden on /reservation.
  - Replaces the current floating CTA, which only appeared after 420 px.
- **Footer**
  - Three columns: La maison (2 lines + Instagram), Horaires (today highlighted), Contact (address, phone, email, booking).
  - Then a single line with © and links.
  - The giant faded "BRAISE" goes.
- **Removed everywhere**: GlassCard, Glow, gridlines, grain, gradient text, marquees, Cursor, MagneticButton, Lenis, ScrollProgress, SplitText, and the "Fig." / "(01)" numbering.

## Accueil (Persuade)

1. **Hero** (100svh, not pinned)
   - Full-bleed photo of the côte de bœuf over the embers.
   - Kicker, then "Braise", then a brass rule.
   - "Réserver une table" and "Voir la carte" buttons.
   - At the bottom of the screen: "Ouvert ce soir · 19h – 22h · 14 rue des Tanneurs".
2. **La maison**
   - Text on the left (2 short paragraphs: the fire, the market, 30 covers).
   - Photo of the dining room on the right.
   - Underneath, 3 facts in serif: "Feu de hêtre et de chêne", "Carte du marché de Wazemmes", "Trente couverts".
3. **Les signatures**
   - 3 dish cards with photos (côte de bœuf, lieu jaune, risotto), then "Voir toute la carte".
   - Then a booking CTA band: "Une table ce soir ?" with a button.
4. **Le feu** (full-width band)
   - A photo of flames or the hearth, with a single short line.
   - A breathing moment before the proof.
5. **Avis**
   - "4,8 / 5 · 327 avis Google" (demo content).
   - 3 static excerpts (no ticker), then "Lire les avis".
6. **Closing**
   - Hours, address, "Réserver une table" button and "Itinéraire" link.
   - The page ends on booking.

## La carte (Operate)

1. **Page header**: kicker "La carte du moment", H1 "La carte", one line of introduction.
2. **Filters**
   - Desktop: a slim sticky bar with categories, a Régime group (labelled), a Prix group (labelled) and an "Allergènes" button.
   - Mobile: a single scrolling row of categories plus a "Filtres (n)" button that opens a bottom panel with diet, price and allergens.
   - An unselected group means "all"; no "Tous régimes / Tous prix" chip.
   - A live counter shows "12 plats".
3. **Signatures**: 3 dish cards with photos (4 if the filter allows), sized so the tablet layout leaves no orphan card.
4. **Booking CTA** right after the signatures.
5. **Sections** (Entrées, Plats, Desserts, Boissons)
   - Lines in the form name … price, then the description underneath.
   - Then "Contient : …" at 14 px and "Végétarien / Vegan" written in full.
6. **Empty state**: a sentence, then "Réinitialiser les filtres" and "Demandez en salle".
7. **Note**: "Allergènes : liste des 14 réglementaires disponible sur demande", in place of the current partial list of 7.

## Réservation (Operate)

1. **Header**: H1 "Réserver une table", one line, and the phone number as a 44 px link.
2. **Step 1** (three decisions)
   - **Day strip**: closed days are marked "Fermé" and disabled. The default is the **next day with availability**, not today when today is closed.
   - **Party size**: −/+ stepper (48 px). From 7 people, the prepayment notice appears.
   - **Slots**: 48 px grid, grouped "Midi" and "Soir". Full slots are struck through, and "dernières places" is spelled out.
   - **Empty states, distinguished**:
     - closed: "Fermé le lundi — la braise se repose";
     - full: "Complet ce jour-là";
     - with a "Prochain créneau libre : sam. 18, 19h30" button and the phone number in both cases.
3. **Step 2**
   - Recap "Samedi 18 oct. · 20h · 4 couverts" with a "Modifier" link.
   - Name, Email, Téléphone fields at 16 px with labels above.
   - "Confirmer la réservation" button.
   - **Focus moves** to the form.
4. **Errors**
   - An alert region that is **always mounted** above both steps.
   - On a 409 ("Ce créneau vient d'être pris"), you go back to step 1 with the details you entered kept and focus moved to the message.
5. **Confirmation**
   - Large title "À samedi 18 octobre, 20h".
   - Recap of covers, name and email.
   - "Un empêchement ? Appelez-nous" line.
   - Focus moves to the title.
6. **Step labels**: the step names stay visible on mobile.

## Galerie (Persuade/Experience)

1. Page header.
2. **Uniform 4:3 grid** (2 columns on mobile, 3 on desktop) with a zoom on hover only.
   - Photos re-selected to match the menu and the dining room; the burger goes.
   - Exact alt texts.
3. **Lightbox**: arrows, Échap, and a counter. **Focus is trapped** in the lightbox and returned to the thumbnail on close.
4. Booking CTA at the bottom.

## Avis (Persuade)

1. Page header.
2. **Summary**
   - 4.8 in large serif, then stars, then "327 avis Google".
   - The star distribution is labelled "sur les avis affichés", or removed.
3. **Grid of reviews**, all equal (2 columns on desktop, 1 on mobile): quote in italic, author, date.
4. **Closing**: "Réserver une table" and "Laisser un avis Google".

## Contact (Persuade)

1. Page header.
2. **Two columns**
   - Left: hours (today highlighted with text, not with colour alone), contact details, "Itinéraire" link.
   - Right: the map. The dark-mode filter is kept but softened.
3. Booking CTA.

## Points to watch

- Do not touch `/api/*`, Prisma, filter logic, slot logic, or the hydration rules (dates are computed on the client).
- Photos: check every Unsplash URL and every alt text against what the photo actually shows.
- "Fermé" on Mondays comes from `RESTAURANT.hours`. It must never be guessed from an empty slot list.
