import { chromium, devices } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:4173';
const currentURL = process.env.VISUAL_CURRENT_URL || 'http://127.0.0.1:4174';
const outputDir = process.env.VISUAL_OUTPUT_DIR || 'visual-regression-results';
const maxDiffRatio = Number(process.env.VISUAL_MAX_DIFF_RATIO || '0.002');

const targets = [
  { name: 'desktop', context: { viewport: { width: 1440, height: 900 } } },
  { name: 'iphone-13', context: { ...devices['iPhone 13'] } },
  { name: 'pixel-7', context: { ...devices['Pixel 7'] } },
  { name: 'ipad-mini', context: { ...devices['iPad Mini'] } },
];

const states = [
  {
    name: 'initial',
    prepare: async (page) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForSelector('.stage');
    },
  },
  {
    name: 'opened',
    prepare: async (page) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForSelector('.stage');
      await page.locator('.stage').click({ position: { x: 12, y: 12 } });
      await page.waitForFunction(() => document.body.classList.contains('unlocked'));
    },
  },
  {
    name: 'scrolled',
    prepare: async (page) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForSelector('.stage');
      await page.locator('.stage').click({ position: { x: 12, y: 12 } });
      await page.waitForFunction(() => document.body.classList.contains('unlocked'));
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(150);
    },
  },
];

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
let failed = false;
const summary = [];

try {
  for (const target of targets) {
    for (const state of states) {
      const safeName = `${target.name}-${state.name}`;
      const baseContext = await browser.newContext(target.context);
      const currentContext = await browser.newContext(target.context);
      const basePage = await baseContext.newPage();
      const currentPage = await currentContext.newPage();

      try {
        await state.prepare(basePage);
        await state.prepare(currentPage);

        const basePath = path.join(outputDir, `${safeName}-base.png`);
        const currentPath = path.join(outputDir, `${safeName}-current.png`);
        const diffPath = path.join(outputDir, `${safeName}-diff.png`);

        await basePage.screenshot({ path: basePath, fullPage: true, animations: 'disabled' });
        await currentPage.screenshot({ path: currentPath, fullPage: true, animations: 'disabled' });

        const basePng = PNG.sync.read(await fs.readFile(basePath));
        const currentPng = PNG.sync.read(await fs.readFile(currentPath));

        if (basePng.width !== currentPng.width || basePng.height !== currentPng.height) {
          failed = true;
          summary.push({ name: safeName, status: 'failed', reason: `size mismatch ${basePng.width}x${basePng.height} vs ${currentPng.width}x${currentPng.height}` });
          continue;
        }

        const diff = new PNG({ width: basePng.width, height: basePng.height });
        const diffPixels = pixelmatch(
          basePng.data,
          currentPng.data,
          diff.data,
          basePng.width,
          basePng.height,
          { threshold: 0.1, includeAA: false },
        );
        await fs.writeFile(diffPath, PNG.sync.write(diff));

        const totalPixels = basePng.width * basePng.height;
        const diffRatio = diffPixels / totalPixels;
        const status = diffRatio <= maxDiffRatio ? 'passed' : 'failed';
        if (status === 'failed') failed = true;
        summary.push({ name: safeName, status, diffPixels, totalPixels, diffRatio });
      } finally {
        await baseContext.close();
        await currentContext.close();
      }
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

for (const result of summary) {
  if (result.reason) {
    console.log(`${result.status.toUpperCase()} ${result.name}: ${result.reason}`);
  } else {
    console.log(`${result.status.toUpperCase()} ${result.name}: ${(result.diffRatio * 100).toFixed(4)}% different`);
  }
}

if (failed) process.exit(1);
