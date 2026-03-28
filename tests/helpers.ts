import type { Page } from '@playwright/test';

/** Navigate to the app — each test already gets a fresh browser context */
export async function resetApp(page: Page) {
  await page.goto('/');
}

/**
 * Fill a number input by its associated label text.
 * Works for InputField, CostInput (htmlFor/id), and inline inputs (aria-label).
 */
export async function fillNumber(page: Page, label: string, value: number | string) {
  await page.getByLabel(label).first().fill(String(value));
}

/** Select an option in a <select> by its associated label text */
export async function selectByLabel(page: Page, label: string, value: string) {
  await page.getByLabel(label).first().selectOption(value);
}

/** Locate a summary card in the results panel by its title */
export function summaryCard(page: Page, title: string) {
  return page.locator('section').first()
    .locator('.bg-gray-800.border.border-gray-700.rounded-lg.p-3')
    .filter({ hasText: title });
}
