import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('button', { hasText: '+ הוסף שיפוץ' }).click();
});

test('timing = 0 shows "נכלל בהשקעה הראשונית" badge', async ({ page }) => {
  // Default new entry has timingValue=0 → treated as initial investment
  await expect(page.getByText('נכלל בהשקעה הראשונית')).toBeVisible();
});

test('timing > 0 does not show initial investment badge', async ({ page }) => {
  await page.getByLabel('תזמון שיפוץ').fill('6');
  await expect(page.getByText('נכלל בהשקעה הראשונית')).not.toBeVisible();
});

test('adding renovations increments the section badge count', async ({ page }) => {
  await expect(page.locator('button').filter({ hasText: 'שיפוצים' }).first()).toContainText('1');
  await page.locator('button', { hasText: '+ הוסף שיפוץ' }).click();
  await expect(page.locator('button').filter({ hasText: 'שיפוצים' }).first()).toContainText('2');
});

test('removing a renovation entry shows empty state', async ({ page }) => {
  // Remove the entry added in beforeEach
  await page.getByLabel('כותרת שיפוץ').locator('../..').locator('button.text-gray-500').click();
  await expect(page.getByText('אין שיפוצים מתוכננים')).toBeVisible();
});
