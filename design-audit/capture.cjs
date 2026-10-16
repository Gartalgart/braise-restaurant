// Captures pleine page après défilement progressif (déclenche les révélations au scroll)
// Usage : NODE_PATH=<dossier contenant playwright> [ONLY=accueil,menu] node design-audit/capture.cjs avant|apres [base_url]
const { chromium } = require("playwright");
const fs = require("fs");
const OUT = `design-audit/${process.argv[2] || "avant"}`;
const BASE = process.argv[3] || "http://localhost:3000";
const PAGES = { accueil: "/", menu: "/menu", reservation: "/reservation", galerie: "/galerie", avis: "/avis", contact: "/contact" };
const VIEWPORTS = { desktop: [1440, 900], tablette: [768, 1024], mobile: [375, 812] };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = [];
  for (const [vpName, [width, height]] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    for (const [name, path] of Object.entries(PAGES).filter(([n]) => !process.env.ONLY || process.env.ONLY.split(",").includes(n))) {
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      // Défilement par pas : chaque section passe dans le viewport
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += Math.round(height * 0.6)) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(250);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);
      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await page.screenshot({ path: `${OUT}/${name}-${vpName}.png`, fullPage: true });
      // Premier écran seul, plus lisible que la page entière
      await page.screenshot({ path: `${OUT}/${name}-${vpName}-ecran1.png` });
      report.push({ page: name, viewport: vpName, overflowX, errors });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/rapport.json`, JSON.stringify(report, null, 2));
  for (const r of report) console.log(`${r.page}-${r.viewport} overflowX=${r.overflowX} errors=${r.errors.length}`);
})();
