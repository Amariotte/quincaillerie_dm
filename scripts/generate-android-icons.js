/**
 * Génère les icônes mipmap Android + le splash à partir du logo défini dans app.json.
 * Utilise jimp-compact (déjà présent via @expo/image-utils).
 *
 * Usage: node scripts/generate-android-icons.js
 */

const path = require("path");
const fs = require("fs");
const Jimp = require("jimp-compact");

const ROOT = path.resolve(__dirname, "..");
const RES_DIR = path.join(ROOT, "android", "app", "src", "main", "res");

const LOGO       = path.join(ROOT, "assets", "images", "logo.png");
const BG_IMAGE   = path.join(ROOT, "assets", "images", "android-icon-background.png");
const MONO_IMAGE = path.join(ROOT, "assets", "images", "android-icon-monochrome.png");
const SPLASH_SRC = path.join(ROOT, "assets", "images", "splash-icon.png");

// Couleur de fond adaptive icon (#E6F4FE) en RGBA int
const BG_COLOR = 0xe6f4feff;

// Densités + tailles Android standard
const DENSITIES = [
  { folder: "mipmap-mdpi",    launcher: 48,  adaptive: 108 },
  { folder: "mipmap-hdpi",    launcher: 72,  adaptive: 162 },
  { folder: "mipmap-xhdpi",   launcher: 96,  adaptive: 216 },
  { folder: "mipmap-xxhdpi",  launcher: 144, adaptive: 324 },
  { folder: "mipmap-xxxhdpi", launcher: 192, adaptive: 432 },
];

// Drawables qui contiennent le logo du splash
const DRAWABLE_SPLASH = [
  { folder: "drawable", size: 200 },
];

function log(rel, size) {
  console.log(`  ✔  ${rel} (${size}×${size})`);
}

async function write(img, destPath, size, labelSize) {
  await img.writeAsync(destPath);
  log(path.relative(ROOT, destPath), labelSize ?? size);
}

async function main() {
  if (!fs.existsSync(LOGO)) {
    console.error("❌ Logo introuvable :", LOGO);
    process.exit(1);
  }

  console.log("Logo source :", path.relative(ROOT, LOGO));
  const bgExists   = fs.existsSync(BG_IMAGE);
  const monoExists = fs.existsSync(MONO_IMAGE);

  // ── Mipmap icons ──────────────────────────────────────────────────────────
  for (const d of DENSITIES) {
    const dir = path.join(RES_DIR, d.folder);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\n${d.folder}`);

    // ic_launcher.webp
    const launcher = (await Jimp.read(LOGO)).resize(d.launcher, d.launcher, Jimp.RESIZE_BICUBIC);
    await write(launcher, path.join(dir, "ic_launcher.webp"), d.launcher);

    // ic_launcher_round.webp (même source)
    const round = (await Jimp.read(LOGO)).resize(d.launcher, d.launcher, Jimp.RESIZE_BICUBIC);
    await write(round, path.join(dir, "ic_launcher_round.webp"), d.launcher);

    // ic_launcher_foreground.webp — logo centré dans 66 % de la safe zone
    const fg     = d.adaptive;
    const safe   = Math.round(fg * 0.66);
    const offset = Math.round((fg - safe) / 2);
    const fgLogo = (await Jimp.read(LOGO)).resize(safe, safe, Jimp.RESIZE_BICUBIC);
    const fgCanvas = new Jimp(fg, fg, 0x00000000);
    fgCanvas.composite(fgLogo, offset, offset);
    await write(fgCanvas, path.join(dir, "ic_launcher_foreground.webp"), fg);

    // ic_launcher_background.webp — image de fond ou couleur unie
    let bgCanvas;
    if (bgExists) {
      bgCanvas = (await Jimp.read(BG_IMAGE)).resize(fg, fg, Jimp.RESIZE_BICUBIC);
    } else {
      bgCanvas = new Jimp(fg, fg, BG_COLOR);
    }
    await write(bgCanvas, path.join(dir, "ic_launcher_background.webp"), fg);

    // ic_launcher_monochrome.webp — image monochrome ou logo brut
    const monoSrc = monoExists ? MONO_IMAGE : LOGO;
    const monoImg = (await Jimp.read(monoSrc)).resize(fg, fg, Jimp.RESIZE_BICUBIC);
    await write(monoImg, path.join(dir, "ic_launcher_monochrome.webp"), fg);
  }

  // ── Splash logo ───────────────────────────────────────────────────────────
  const splashSrc = fs.existsSync(SPLASH_SRC) ? SPLASH_SRC : LOGO;
  console.log("\ndrawable (splash)");
  for (const d of DRAWABLE_SPLASH) {
    const dir = path.join(RES_DIR, d.folder);
    fs.mkdirSync(dir, { recursive: true });
    const splash = (await Jimp.read(splashSrc)).resize(d.size, d.size, Jimp.RESIZE_BICUBIC);
    await write(splash, path.join(dir, "splashscreen_logo.png"), d.size);
  }

  console.log("\n✅ Toutes les icônes ont été générées.");
}

main().catch((err) => {
  console.error("❌ Erreur:", err.message ?? err);
  process.exit(1);
});
