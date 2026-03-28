import type { Page } from '@playwright/test';

/** Navigate to the app — each test already gets a fresh browser context */
export async function resetApp(page: Page) {
  await page.goto('/');
}

/**
 * Fill a number input by its associated label text.
 * Works for both InputField and CostInput components.
 */
export async function fillNumber(page: Page, label: string, value: number | string) {
  const container = page.locator('label').filter({ hasText: label }).first().locator('..');
  await container.locator('input[type="number"]').first().fill(String(value));
}

/** Select an option in a <select> by its associated label text */
export async function selectByLabel(page: Page, label: string, value: string) {
  const container = page.locator('label').filter({ hasText: label }).first().locator('..');
  await container.locator('select').first().selectOption(value);
}

/** Locate a summary card in the results panel by its title */
export function summaryCard(page: Page, title: string) {
  return page.locator('section').first()
    .locator('.bg-gray-800.border.border-gray-700.rounded-lg.p-3')
    .filter({ hasText: title });
}
