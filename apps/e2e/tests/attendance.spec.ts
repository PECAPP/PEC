import { test, expect } from '@playwright/test';

test.describe('Student Attendance Dashboard Flow', () => {
  test('should authenticate student and verify glassmorphic attendance data loads via Orval hooks', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('http://localhost:3001/auth');
    
    // 2. Fill in the student credentials (seeded by Faker)
    // Adjust selector based on actual auth implementation
    await page.fill('input[type="email"]', 'test_student@pec.edu.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 3. Verify redirection to the secure dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 4. Navigate to the Attendance Module
    await page.goto('http://localhost:3001/attendance');

    // 5. Verify the Page Header
    await expect(page.getByRole('heading', { name: /Attendance/i })).toBeVisible();

    // 6. Verify the Glassmorphic Radial Chart is rendered (Proves Orval fetched data)
    await expect(page.locator('.recharts-responsive-container')).toBeVisible({ timeout: 10000 });
    
    // 7. Verify Eligibility Shield Badge
    const badge = page.locator('div:has-text("Eligible"), div:has-text("At Risk")').first();
    await expect(badge).toBeVisible();

    // 8. Verify the Course Attendance data table
    await expect(page.getByText('Course Attendance', { exact: true })).toBeVisible();
  });
});
