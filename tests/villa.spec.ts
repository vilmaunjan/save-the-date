import { expect, test } from '@playwright/test';

test.describe('villa scene', () => {
  test('renders key wedding details and remains scrollable', async ({ page }) => {
    await page.goto('/villa.html');

    await expect(page.locator('.headline')).toContainText(/save/i);
    await expect(page.locator('.date')).toContainText('April 30th, 2027');
    await expect(page.locator('.place')).toContainText(/Orlando/i);

    const dimensions = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.innerHeight);
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 1);
  });

  test('reaches the final photo state when reduced motion is enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/villa.html');

    await expect(page.locator('.layer-couple')).toHaveCSS('opacity', '1');
    await expect(page.locator('.layer-villa')).toHaveCSS('opacity', '0');
  });
});
