import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Update this to match your actual app's title
  await expect(page).toHaveTitle(/PEC App/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  // Add an assertion here once the UI is verified
  // Example: await expect(page.locator('h1')).toBeVisible();
});
