import { test, expect } from '@playwright/test';
import { fillNumber } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// ── Mortgage amount warnings ──────────────────────────────────────────────────

test('shows over-limit warning when mortgage exceeds price minus equity', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 1_000_000);
  await fillNumber(page, 'הון עצמי', 250_000);  // maxMortgage = 750,000
  await fillNumber(page, 'סכום', 900_000);        // 900K > 750K → over limit
  await expect(page.getByText('חורג מהמימון הנדרש')).toBeVisible();
});

test('shows under-limit warning when mortgage is below price minus equity', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 1_000_000);
  await fillNumber(page, 'הון עצמי', 250_000);  // maxMortgage = 750,000
  await fillNumber(page, 'סכום', 500_000);        // 500K < 742.5K (99%) → under limit
  await expect(page.getByText('נמוך מהמימון הנדרש')).toBeVisible();
});

test('no warning when mortgage equals required amount', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 1_000_000);
  await fillNumber(page, 'הון עצמי', 250_000);  // maxMortgage = 750,000
  await fillNumber(page, 'סכום', 750_000);        // exact match
  await expect(page.getByText('חורג מהמימון הנדרש')).not.toBeVisible();
  await expect(page.getByText('נמוך מהמימון הנדרש')).not.toBeVisible();
});

// ── Tranche management ────────────────────────────────────────────────────────

test('adding a second tranche shows badge "2 מסלולים"', async ({ page }) => {
  await page.locator('button', { hasText: '+ הוסף מסלול' }).click();
  await expect(page.getByText('2 מסלולים')).toBeVisible();
});

test('removing a tranche brings count back to 1', async ({ page }) => {
  await page.locator('button', { hasText: '+ הוסף מסלול' }).click();
  await page.locator('button', { hasText: 'הסר מסלול' }).last().click();
  await expect(page.getByText('1 מסלולים')).toBeVisible();
});

test('remove button is disabled when only one tranche exists', async ({ page }) => {
  await expect(page.locator('button', { hasText: 'הסר מסלול' })).toBeDisabled();
});

// ── Prime spread hint ─────────────────────────────────────────────────────────

test('negative spread shows P-X% hint', async ({ page }) => {
  await fillNumber(page, 'מרווח מפריים', -0.6);
  await expect(page.getByText('P-0.6%')).toBeVisible();
});

test('positive spread shows P+X% hint', async ({ page }) => {
  await fillNumber(page, 'מרווח מפריים', 1.5);
  await expect(page.getByText('P+1.5%')).toBeVisible();
});
