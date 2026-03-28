import { test, expect, type Page } from '@playwright/test';
import { fillNumber, selectByLabel, summaryCard } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('additional property purchase tax is 8% on 2M (= ₪160,000)', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 2_000_000);
  await fillNumber(page, 'הון עצמי', 600_000);
  await expect(summaryCard(page, 'מס רכישה')).toContainText('160,000');
});

test('first-home purchase tax is 0 below exemption threshold (1.5M)', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 1_500_000);
  await fillNumber(page, 'הון עצמי', 400_000);
  await selectByLabel(page, 'סוג הנכס', 'first');
  const taxValue = summaryCard(page, 'מס רכישה').locator('.text-lg.font-bold');
  const text = await taxValue.textContent();
  expect(text?.replace(/\u200f/g, '').trim()).toMatch(/^0\s*₪$|^₪\s*0$/);
});

test('LTV is calculated correctly from mortgage / price', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 2_000_000);
  await fillNumber(page, 'הון עצמי', 600_000);
  await fillNumber(page, 'סכום', 1_400_000);  // LTV = 1.4M / 2M = 70%
  await expect(summaryCard(page, 'LTV')).toContainText('70.0%');
});

test('gross yield = annual rent / price', async ({ page }) => {
  await fillNumber(page, 'מחיר הנכס', 2_000_000);
  await fillNumber(page, 'הון עצמי', 600_000);
  await fillNumber(page, 'שכר דירה חודשי', 5_000);  // 60K / 2M = 3%
  await expect(summaryCard(page, 'תשואה ברוטו')).toContainText('3.0%');
});
