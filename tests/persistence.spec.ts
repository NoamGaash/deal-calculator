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
  const container = page.locator('label').filter({ hasText: 'מחיר הנכס' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('1500000');
});

test('broker commission value persists after reload', async ({ page }) => {
  await fillNumber(page, 'עמלת מתווך', 3);
  await page.reload();
  const container = page.locator('label').filter({ hasText: 'עמלת מתווך' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('3');
});

test('attorney fee value persists after reload', async ({ page }) => {
  await fillNumber(page, 'שכ"ט עו"ד', 1);
  await page.reload();
  const container = page.locator('label').filter({ hasText: 'שכ"ט עו"ד' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('1');
});

test('monthly rent persists after reload', async ({ page }) => {
  await fillNumber(page, 'שכר דירה חודשי', 6_000);
  await page.reload();
  const container = page.locator('label').filter({ hasText: 'שכר דירה חודשי' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('6000');
});

test('renovation entry (title + cost) persists after reload', async ({ page }) => {
  await page.locator('button', { hasText: '+ הוסף שיפוץ' }).click();
  await page.locator('input[placeholder="כותרת שיפוץ"]').fill('ריצוף');
  await page.locator('input[placeholder="עלות מוערכת"]').fill('50000');
  await page.reload();
  await expect(page.locator('input[placeholder="כותרת שיפוץ"]')).toHaveValue('ריצוף');
  await expect(page.locator('input[placeholder="עלות מוערכת"]')).toHaveValue('50000');
});

test('mortgage tranche amount persists after reload', async ({ page }) => {
  await fillNumber(page, 'סכום', 800_000);
  await page.reload();
  const container = page.locator('label').filter({ hasText: 'סכום' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('800000');
});
