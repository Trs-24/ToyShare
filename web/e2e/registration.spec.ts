import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should display step 1 of the registration form', async ({ page }) => {
    await page.goto('/register');

    // Step 1 should be visible
    await expect(page.locator('h1')).toContainText('ToyShare');
    await expect(page.locator('input[placeholder="Ваше ім\'я"]')).toBeVisible();
    await expect(page.locator('input[placeholder="your@email.com"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Далі/i })).toBeVisible();
  });

  test('should validate step 1 fields before proceeding', async ({ page }) => {
    await page.goto('/register');

    // Try to proceed without filling in fields — browser HTML validation should prevent
    await page.getByRole('button', { name: /Далі/i }).click();

    // Should still be on step 1
    await expect(page.locator('input[placeholder="Ваше ім\'я"]')).toBeVisible();
  });

  test('should navigate to step 2 after filling step 1', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[placeholder="Ваше ім\'я"]').fill('Test User');
    await page.locator('input[placeholder="your@email.com"]').fill('e2e-test@test.com');
    await page.locator('input[type="password"]').fill('password123');

    await page.getByRole('button', { name: /Далі/i }).click();

    // Step 2 should be visible (phone field)
    await expect(page.locator('input[placeholder="+380 XX XXX XX XX"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show link to login page', async ({ page }) => {
    await page.goto('/register');

    const loginLink = page.getByRole('link', { name: /Увійти/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });
});
