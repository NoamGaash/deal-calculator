import { test, expect } from '@playwright/test';
import { fillNumber } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('save scenario A, create scenario B, switching back to A restores its price', async ({ page }) => {
  // ── Scenario A ──
  await fillNumber(page, 'מחיר הנכס', 1_500_000);
  await page.locator('button', { hasText: 'שמור...' }).click();
  await page.locator('input[placeholder="שם התרחיש"]').fill('תרחיש א');
  await page.locator('input[placeholder="שם התרחיש"]').press('Enter');
  await expect(page.getByRole('button', { name: 'תרחיש א' })).toBeVisible();

  // ── Scenario B ──
  await page.locator('button', { hasText: 'חדש' }).click();
  await fillNumber(page, 'מחיר הנכס', 2_500_000);
  await page.locator('button', { hasText: 'שמור...' }).click();
  await page.locator('input[placeholder="שם התרחיש"]').fill('תרחיש ב');
  await page.locator('input[placeholder="שם התרחיש"]').press('Enter');

  // ── Switch back to A ──
  await page.getByRole('button', { name: 'תרחיש א' }).click();
  const container = page.locator('label').filter({ hasText: 'מחיר הנכס' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('1500000');
});

test('שמור button on existing scenario saves without a dialog', async ({ page }) => {
  // Create and save
  await fillNumber(page, 'מחיר הנכס', 1_000_000);
  await page.locator('button', { hasText: 'שמור...' }).click();
  await page.locator('input[placeholder="שם התרחיש"]').fill('תרחיש');
  await page.locator('input[placeholder="שם התרחיש"]').press('Enter');

  // Edit and re-save directly (no dialog)
  await fillNumber(page, 'מחיר הנכס', 1_200_000);
  await page.locator('button', { hasText: 'שמור' }).first().click();

  // Switch away then back — should see the updated price
  await page.locator('button', { hasText: 'חדש' }).click();
  await page.getByRole('button', { name: 'תרחיש' }).click();
  const container = page.locator('label').filter({ hasText: 'מחיר הנכס' }).first().locator('..');
  await expect(container.locator('input[type="number"]').first()).toHaveValue('1200000');
});
