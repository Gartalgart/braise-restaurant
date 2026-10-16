// Vérifications de la phase 7 : liens, cibles tactiles, contrastes, tailles, clavier.
// Usage : NODE_PATH=<dossier contenant playwright> node design-audit/verify.cjs [base_url]
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:3000";
const PAGES = ["/", "/menu", "/reservation", "/galerie", "/avis", "/contact"];

(async () => {
  const browser = await chromium.launch();
  const links = new Set();
  const report = {};

  for (const path of PAGES) {
    const r = (report[path] = {});
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Liens internes
    (await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")))).forEach((h) => links.add(h));

    // Cibles tactiles < 44 px (hors lien d'évitement masqué et liens dans un paragraphe)
    r.smallTargets = await page.$$eval("a, button, input", (els) =>
      els
        .filter((e) => !e.classList.contains("sr-only") && e.offsetParent !== null)
        .map((e) => ({ e, b: e.getBoundingClientRect() }))
        .filter(({ b }) => b.width > 0 && (b.height < 44 || b.width < 44))
        .map(({ e, b }) => `${(e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30)} ${Math.round(b.width)}x${Math.round(b.height)}`),
    );

    // Contraste et taille : chaque nœud texte visible contre le premier fond opaque ancêtre
    r.text = await page.evaluate(() => {
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const bgOf = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const s = getComputedStyle(n);
          if (s.backgroundImage !== "none") return null; // texte sur photo/dégradé : non mesurable ici
          const c = parse(s.backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.9)) return c;
        }
        return [20, 17, 15];
      };
      const out = { minFont: 99, minFontText: "", lowContrast: [] };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode;
        const el = t.parentElement;
        if (!t.textContent.trim() || !el || el.closest(".sr-only,[aria-hidden=true],iframe")) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none" || el.offsetParent === null) continue;
        const fs = parseFloat(s.fontSize);
        if (fs < out.minFont) { out.minFont = fs; out.minFontText = t.textContent.trim().slice(0, 40); }
        const bg = bgOf(el);
        if (!bg) continue;
        const fg = parse(s.color);
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        const ratio = (a + 0.05) / (b + 0.05);
        const large = fs >= 24 || (fs >= 18.66 && parseInt(s.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) out.lowContrast.push(`${t.textContent.trim().slice(0, 30)} ${ratio.toFixed(2)}:1`);
      }
      return out;
    });
    await page.close();
  }

  // Clavier sur l'accueil, desktop : ordre de tabulation et focus visible
  const kb = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await kb.goto(BASE + "/", { waitUntil: "networkidle" });
  const order = [];
  for (let i = 0; i < 10; i++) {
    await kb.keyboard.press("Tab");
    order.push(
      await kb.evaluate(() => {
        const a = document.activeElement;
        const s = getComputedStyle(a);
        return `${(a.textContent || a.getAttribute("aria-label") || a.tagName).trim().slice(0, 24)}[${s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 ? "focus visible" : "PAS DE FOCUS"}]`;
      }),
    );
  }
  await kb.close();

  // Statut HTTP de chaque lien interne
  const status = {};
  const req = await browser.newContext();
  for (const h of links) status[h] = (await req.request.get(BASE + h)).status();
  await browser.close();

  console.log(JSON.stringify({ report, keyboard: order, links: status }, null, 2));
})();
