import { test, expect } from '@playwright/test';
import { fillNumber } from './helpers';

/**
 * Persistence tests — verify that Zustand's localStorage persist middleware
 * saves field changes so they survive a full page reload.
 * Pattern: change a value → reload → assert value is restored.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('property price persists after reload', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 1_500_000);
  await page.reload();
  await expect(page.getByLabel('מחיר הנכס').first()).toHaveValue('1500000');
});

test('broker commission value persists after reload', async ({ page }) => {
  await fillNumber(page, 'עמלת מתווך', 3);
  await page.reload();
  await expect(page.getByLabel('עמלת מתווך').first()).toHaveValue('3');
});

test('attorney fee value persists after reload', async ({ page }) => {
  await fillNumber(page, 'שכ"ט עו"ד', 1);
  await page.reload();
  await expect(page.getByLabel('שכ"ט עו"ד').first()).toHaveValue('1');
});

test('monthly rent persists after reload', async ({ page }) => {
  await fillNumber(page, 'שכר דירה חודשי', 6_000);
  await page.reload();
  await expect(page.getByLabel('שכר דירה חודשי').first()).toHaveValue('6000');
});

test('renovation entry (title + cost) persists after reload', async ({ page }) => {
  await page.locator('button', { hasText: '+ הוסף שיפוץ' }).click();
  await page.getByLabel('כותרת שיפוץ').fill('ריצוף');
  await page.getByLabel('עלות מוערכת').fill('50000');
  await page.reload();
  await expect(page.getByLabel('כותרת שיפוץ')).toHaveValue('ריצוף');
  await expect(page.getByLabel('עלות מוערכת')).toHaveValue('50000');
});

test('mortgage tranche amount persists after reload', async ({ page }) => {
  await fillNumber(page, 'סכום', 800_000);
  await page.reload();
  await expect(page.getByLabel('סכום').first()).toHaveValue('800000');
});
