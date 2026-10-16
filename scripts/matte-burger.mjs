/**
 * Détourage hors ligne du plan burger.
 *
 * Lit un flux rgb24 1280x720 sur stdin, écrit un flux rgb24 1280x1440 sur
 * stdout : l'image détourée en haut, son masque d'opacité en bas.
 *
 * Ce que le shader ne pouvait pas faire en temps réel et qu'on fait ici :
 *
 *  - la séparation fond/sujet est TOPOLOGIQUE, par remplissage depuis le bord,
 *    et non par seuil de couleur. Un reflet clair au milieu du pain n'est donc
 *    jamais pris pour du fond, quelle que soit sa teinte : il n'est pas relié
 *    au bord de l'image. C'est ce qui supprime les trous par construction.
 *
 *  - on estime le niveau local du fond (grille de médianes, interpolée) pour
 *    RETIRER sa contribution des pixels de contour à demi couverts. C'est ce
 *    « despill » qui supprime le liseré gris sans avoir à rogner le masque.
 *
 * Ce qu'est réellement le fond du rush : un DAMIER DE TRANSPARENCE, le motif
 * gris/blanc des éditeurs d'image — cases d'environ 13 px, deux niveaux autour
 * de 175 et 234. Le rush a donc été exporté d'un asset qui possédait une couche
 * alpha, aplatie sur ce damier. Ça n'a l'air de rien mais ça conditionne tout :
 *
 *  - le damier reste achromatique, donc le remplissage depuis le bord le
 *    traverse sans peine : la silhouette est juste ;
 *  - il est en revanche à DEUX niveaux, ce qui rend vaine toute idée de « fond
 *    à peu près uniforme ». Un dégradé vertical de 236/178/204 que j'avais cru
 *    mesurer n'était que l'échantillonnage tombant tantôt sur les cases claires,
 *    tantôt sur les sombres ;
 *  - les cases ne font pas un nombre entier de pixels (rush redimensionné) :
 *    un modèle de damier calé sur une grille entière laisse un résidu moyen de
 *    17 pour une séparation de 34, donc inexploitable ;
 *  - mais son alternation est une signature locale imparable, et c'est elle qui
 *    permet de reconnaître les poches enclavées (voir CHECKER_FRAC).
 *
 * Régénérer public/burger.mp4 depuis un rush (ffmpeg requis) :
 *
 *   ffmpeg -v error -i <rush>.mp4 -f rawvideo -pix_fmt rgb24 - \
 *     | node scripts/matte-burger.mjs \
 *     | ffmpeg -y -f rawvideo -pix_fmt rgb24 -s 1280x1440 -r 24 -i - \
 *         -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset slow \
 *         -g 10 -keyint_min 10 -sc_threshold 0 -movflags +faststart \
 *         public/burger.mp4
 *
 * `-g 10` n'est pas cosmétique : le rush d'origine n'avait qu'UNE image-clé sur
 * 240, ce qui faisait grimper le coût d'un seek de 5 ms à 118 ms selon la
 * position, et l'image retardait sur le scroll. Une image-clé toutes les dix
 * frames ramène les seeks à ~10 ms partout.
 *
 * Contrôler le détourage avant d'encoder :
 *
 *   ffmpeg -v error -i <rush>.mp4 -f rawvideo -pix_fmt rgb24 - \
 *     | node scripts/matte-burger.mjs --preview
 *
 * écrit des PPM (sujet composité sur le fond du site | masque) pour quelques
 * frames. Les constantes à ajuster si le rush change de fond sont SAT_BG
 * (au-delà, un point ne peut plus appartenir au fond) et CELL.
 */

import { writeFileSync } from "node:fs";

const W = 1280;
const H = 720;
const N = W * H;
const FRAME_IN = N * 3;

/** Saturation en deçà de laquelle un point peut appartenir au fond. */
const SAT_BG = 26;

/**
 * Poches de fond enclavées.
 *
 * Le remplissage depuis le bord ne les atteint pas : quand les étages se
 * séparent, une coulée de fromage relie le pain au steak et referme des poches
 * de fond entre les couches. Elles restaient opaques — un pavé gris en plein
 * milieu du burger, surtout visible au défilement puisque ces frames sont au
 * milieu du plan.
 *
 * Elles se reconnaissent à ce qu'est vraiment le fond : un DAMIER de
 * transparence, à deux niveaux qui alternent tous les ~13 px (voir l'en-tête).
 * Une poche en contient donc une part substantielle de chacun des deux niveaux.
 * Un reflet spéculaire sur le pain — clair, achromatique et enclavé lui aussi,
 * donc impossible à distinguer par la couleur seule — est une brillance lisse :
 * ses pixels se massent sur une seule valeur.
 *
 * Mesuré sur les frames concernées, le critère sépare sans recouvrement :
 *
 *   composantes >= 800 px : 15 sur 35 retenues — exactement les poches claires,
 *                           les 20 autres étant des zones sombres du sujet
 *                           (1 % et 0 % aux deux niveaux, donc rejetées)
 *   composantes <  500 px : 13 sur 298 retenues, toutes de vraies petites
 *                           poches (24-33 % / 28-50 %)
 *
 * Décisif : le critère ne dépend pas de la taille. Les seuils de surface et
 * d'écart au fond que j'avais essayés avant échangeaient du fond retenu contre
 * des reflets percés, à peu près un pour un.
 */
const CHECKER_DARK = [165, 197];
const CHECKER_LIGHT = [218, 250];
/** Part minimale de la composante à chacun des deux niveaux du damier. */
const CHECKER_FRAC = 0.22;
/** En deçà, la statistique n'est plus fiable. */
const POCKET_MIN_AREA = 60;
/** Sous ce seuil d'opacité, on ne tente pas de retirer le fond : trop bruité. */
const DESPILL_MIN = 0.12;
/** Taille des cellules servant à estimer le niveau du fond. */
const CELL = 32;

const preview = process.argv.includes("--preview");
const previewFrames = new Set([0, 60, 120, 180, 239]);

/* -------------------------------------------------------------------------- */

const sat = new Uint8Array(N);
const lum = new Uint8Array(N);
const isBg = new Uint8Array(N);
const hard = new Float32Array(N);
const tmp = new Float32Array(N);
const alpha = new Float32Array(N);
const stack = new Int32Array(N);

const GW = Math.ceil(W / CELL);
const GH = Math.ceil(H / CELL);
const cellVal = new Float32Array(GW * GH);
const cellHas = new Uint8Array(GW * GH);

function analyse(src) {
  for (let p = 0, i = 0; p < N; p++, i += 3) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
    const mn = r < g ? (r < b ? r : b) : g < b ? g : b;
    lum[p] = mx;
    sat[p] = mx - mn;
  }
}

/** Remplissage depuis les quatre bords : seul ce qui y est relié est du fond. */
function floodBackground() {
  isBg.fill(0);
  let top = 0;
  const push = (p) => {
    if (!isBg[p] && sat[p] < SAT_BG) {
      isBg[p] = 1;
      stack[top++] = p;
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (top > 0) {
    const p = stack[--top];
    const x = p % W;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (p >= W) push(p - W);
    if (p < N - W) push(p + W);
  }
}

const label = new Int32Array(N);

/**
 * Rattache au fond les poches enclavées où l'on retrouve le damier : une part
 * substantielle de la composante à chacun de ses deux niveaux.
 */
function fillPockets() {
  label.fill(0);
  let filled = 0;
  for (let seed = 0; seed < N; seed++) {
    if (isBg[seed] || label[seed] || sat[seed] >= SAT_BG) continue;

    // Parcours de la composante, en mémorisant ses points pour pouvoir la
    // basculer d'un bloc si elle s'avère être du fond.
    let top = 0;
    let count = 0;
    let dark = 0;
    let light = 0;
    stack[top++] = seed;
    label[seed] = 1;
    const members = [];
    while (top > 0) {
      const p = stack[--top];
      members.push(p);
      count++;
      const v = lum[p];
      if (v >= CHECKER_DARK[0] && v <= CHECKER_DARK[1]) dark++;
      else if (v >= CHECKER_LIGHT[0] && v <= CHECKER_LIGHT[1]) light++;
      const x = p % W;
      const nb = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p >= W ? p - W : -1, p < N - W ? p + W : -1];
      for (const m of nb) {
        if (m >= 0 && !isBg[m] && !label[m] && sat[m] < SAT_BG) {
          label[m] = 1;
          stack[top++] = m;
        }
      }
    }

    if (count < POCKET_MIN_AREA) continue;
    if (dark / count < CHECKER_FRAC || light / count < CHECKER_FRAC) continue;
    for (const p of members) isBg[p] = 1;
    filled += count;
  }
  return filled;
}

/** Flou binomial séparable (1 4 6 4 1) : donne le fondu du contour. */
function feather() {
  for (let p = 0; p < N; p++) hard[p] = isBg[p] ? 0 : 1;
  const at = (x, y) => hard[(y < 0 ? 0 : y >= H ? H - 1 : y) * W + (x < 0 ? 0 : x >= W ? W - 1 : x)];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] =
        (at(x - 2, y) + 4 * at(x - 1, y) + 6 * at(x, y) + 4 * at(x + 1, y) + at(x + 2, y)) / 16;
    }
  }
  const at2 = (x, y) => tmp[(y < 0 ? 0 : y >= H ? H - 1 : y) * W + x];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      alpha[y * W + x] =
        (at2(x, y - 2) + 4 * at2(x, y - 1) + 6 * at2(x, y) + 4 * at2(x, y + 1) + at2(x, y + 2)) / 16;
    }
  }
}

/**
 * Niveau du fond, estimé par cellules puis interpolé. Le fond est un dégradé
 * lisse : une grille de médianes locales le décrit bien mieux qu'une constante,
 * et permet d'extrapoler sous le sujet, là où on n'observe rien.
 */
function backgroundField() {
  const bucket = [];
  for (let cy = 0; cy < GH; cy++) {
    for (let cx = 0; cx < GW; cx++) {
      bucket.length = 0;
      const x1 = Math.min(W, (cx + 1) * CELL);
      const y1 = Math.min(H, (cy + 1) * CELL);
      for (let y = cy * CELL; y < y1; y += 2) {
        for (let x = cx * CELL; x < x1; x += 2) {
          const p = y * W + x;
          if (isBg[p]) bucket.push(lum[p]);
        }
      }
      const c = cy * GW + cx;
      if (bucket.length >= 8) {
        bucket.sort((a, b) => a - b);
        cellVal[c] = bucket[bucket.length >> 1];
        cellHas[c] = 1;
      } else {
        cellHas[c] = 0;
      }
    }
  }
  // Cellules vides (sous le sujet) : comblées de proche en proche.
  for (let pass = 0; pass < GW + GH; pass++) {
    let changed = false;
    for (let c = 0; c < GW * GH; c++) {
      if (cellHas[c]) continue;
      const cx = c % GW;
      const cy = (c - cx) / GW;
      let sum = 0;
      let n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
        const nc = ny * GW + nx;
        if (cellHas[nc] === 1) {
          sum += cellVal[nc];
          n++;
        }
      }
      if (n) {
        cellVal[c] = sum / n;
        cellHas[c] = 2; // comblée : utilisable, mais ne propage qu'au tour suivant
        changed = true;
      }
    }
    for (let c = 0; c < GW * GH; c++) if (cellHas[c] === 2) cellHas[c] = 1;
    if (!changed) break;
  }
}

/** Niveau du fond en (x,y), par interpolation bilinéaire de la grille. */
function bgAt(x, y) {
  const fx = Math.min(GW - 1.001, Math.max(0, x / CELL - 0.5));
  const fy = Math.min(GH - 1.001, Math.max(0, y / CELL - 0.5));
  const x0 = fx | 0;
  const y0 = fy | 0;
  const tx = fx - x0;
  const ty = fy - y0;
  const v00 = cellVal[y0 * GW + x0];
  const v10 = cellVal[y0 * GW + x0 + 1];
  const v01 = cellVal[(y0 + 1) * GW + x0];
  const v11 = cellVal[(y0 + 1) * GW + x0 + 1];
  return (v00 * (1 - tx) + v10 * tx) * (1 - ty) + (v01 * (1 - tx) + v11 * tx) * ty;
}

/**
 * Écrit la frame de sortie : image détourée en haut, masque en bas.
 * Le fond est retiré des pixels partiels — sans quoi ils gardent sa teinte et
 * cernent le sujet d'un liseré clair sur fond sombre.
 */
function compose(src, dst) {
  const half = N * 3;
  for (let y = 0; y < H; y++) {
    const g = bgAt(0, y); // recalculé par colonne juste en dessous
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const i = p * 3;
      const a = alpha[p];
      let r = src[i];
      let gr = src[i + 1];
      let b = src[i + 2];
      if (a > DESPILL_MIN && a < 0.999) {
        const bg = bgAt(x, y);
        const k = (1 - a) * bg;
        r = (r - k) / a;
        gr = (gr - k) / a;
        b = (b - k) / a;
      }
      // Sortie en alpha prémultiplié : le fond tombe à zéro — donc il ne coûte
      // plus de bitrate — et l'interpolation bilinéaire du GPU devient exacte
      // au lieu de tirer les contours vers une couleur de fond arbitraire.
      r *= a;
      gr *= a;
      b *= a;
      dst[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      dst[i + 1] = gr < 0 ? 0 : gr > 255 ? 255 : gr;
      dst[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      const m = Math.round(a * 255);
      dst[half + i] = m;
      dst[half + i + 1] = m;
      dst[half + i + 2] = m;
      void g;
    }
  }
}

function processFrame(src, dst) {
  analyse(src);
  floodBackground();
  pocketPixels += fillPockets();
  // Le champ de fond sert au despill : il se calcule une fois les poches
  // rattachées, pour ne pas être biaisé par elles.
  backgroundField();
  feather();
  compose(src, dst);
}

/* ------------------------------ flux ------------------------------------- */

const out = Buffer.allocUnsafe(FRAME_IN * 2);
let carry = Buffer.alloc(0);
let index = 0;
let bgPixels = 0;
let pocketPixels = 0;

process.stdin.on("data", (chunk) => {
  carry = carry.length ? Buffer.concat([carry, chunk]) : chunk;
  while (carry.length >= FRAME_IN) {
    const src = carry.subarray(0, FRAME_IN);
    carry = carry.subarray(FRAME_IN);
    processFrame(src, out);
    let n = 0;
    for (let p = 0; p < N; p++) if (isBg[p]) n++;
    bgPixels += n;
    if (preview) {
      if (previewFrames.has(index)) writePreview(index, src);
    } else {
      process.stdout.write(Buffer.from(out));
    }
    index++;
  }
});

process.stdin.on("end", () => {
  const pct = ((bgPixels / (N * Math.max(1, index))) * 100).toFixed(1);
  const poches = Math.round(pocketPixels / Math.max(1, index));
  process.stderr.write(`frames=${index} fond=${pct}% poches=${poches} px/frame\n`);
  if (preview) process.exit(0);
});

/** Aperçu : sujet composité sur le brun sombre du site, masque à côté. */
function writePreview(i, src) {
  const BG = [26, 15, 10];
  const w2 = W * 2;
  const buf = Buffer.allocUnsafe(w2 * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const a = alpha[p];
      let r = src[p * 3];
      let g = src[p * 3 + 1];
      let b = src[p * 3 + 2];
      if (a > DESPILL_MIN && a < 0.999) {
        const k = (1 - a) * bgAt(x, y);
        r = (r - k) / a;
        g = (g - k) / a;
        b = (b - k) / a;
      }
      const o = (y * w2 + x) * 3;
      buf[o] = Math.max(0, Math.min(255, r * a + BG[0] * (1 - a)));
      buf[o + 1] = Math.max(0, Math.min(255, g * a + BG[1] * (1 - a)));
      buf[o + 2] = Math.max(0, Math.min(255, b * a + BG[2] * (1 - a)));
      const o2 = (y * w2 + W + x) * 3;
      const m = Math.round(a * 255);
      buf[o2] = m;
      buf[o2 + 1] = m;
      buf[o2 + 2] = m;
    }
  }
  writeFileSync(
    `preview-${String(i).padStart(3, "0")}.ppm`,
    Buffer.concat([Buffer.from(`P6\n${w2} ${H}\n255\n`), buf]),
  );
}
