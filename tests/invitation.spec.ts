import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(overflow.scrollWidth, `page overflowed horizontally: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(
    overflow.clientWidth + 1,
  );
}

async function waitForAnimationLibrary(page: Page) {
  await page.waitForFunction(() => typeof (window as typeof window & { gsap?: unknown }).gsap !== 'undefined');
}

test.describe('save-the-date invitation', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.stage')).toBeVisible();
    await waitForAnimationLibrary(page);
  });

  test('renders the initial invitation without horizontal clipping', async ({ page }) => {
    await expect(page.locator('.envelope-photo')).toBeVisible();
    await expect(page.locator('.open-line')).toContainText(/open the invitation/i);
    await expect(page.locator('.from-names')).toHaveAttribute('aria-label', 'Edgar & Vilma');
    await expectNoHorizontalOverflow(page);
  });

  test('opens the invitation and unlocks scrolling', async ({ page }) => {
    await page.locator('.stage').click({ position: { x: 10, y: 10 } });

    await expect(page.locator('body')).toHaveClass(/unlocked/);
    await expect(page.locator('.sky-scene')).toHaveCSS('opacity', '1');
    await expect(page.locator('.save-tagline')).toContainText(/save the date/i);
    await expect(page.locator('.save-date')).toContainText('April 30th, 2027');
    await expect(page.locator('.scroll-hint')).toContainText(/scroll for more/i);
    await expectNoHorizontalOverflow(page);
  });

  test('supports scrolling through the revealed experience', async ({ page }) => {
    await page.locator('.stage').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('body')).toHaveClass(/unlocked/);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expectNoHorizontalOverflow(page);
  });

  test('a second click does not restart the invitation transition', async ({ page }) => {
    const stage = page.locator('.stage');

    await stage.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('body')).toHaveClass(/unlocked/);
    await stage.click({ position: { x: 10, y: 10 } });

    await expect(page.locator('body')).toHaveClass(/unlocked/);
    await expect(page.locator('.sky-scene')).toHaveCSS('opacity', '1');
  });
});
