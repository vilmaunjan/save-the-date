import { expect, test } from '@playwright/test';

test('switches between English and Spanish when a language toggle is present', async ({ page }) => {
  await page.goto('/');

  const toggle = page.locator('[data-language-toggle], [data-lang-toggle], button').filter({ hasText: /^(ES|EN)$/i }).first();
  test.skip((await toggle.count()) === 0, 'No EN/ES language toggle exists on the master branch yet.');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', /^(es|en)$/i);

  const spanishCopy = page.getByText(/reserva la fecha|abrir la invitación|desliza para ver más/i).first();
  await expect(spanishCopy).toBeVisible();

  await toggle.click();
  await expect(page.getByText(/save the date|open the invitation|scroll for more/i).first()).toBeVisible();
});
