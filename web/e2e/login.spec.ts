import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display the login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('ToyShare');
    await expect(page.locator('input[placeholder="your@email.com"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // Use exact: true to avoid matching "Увійти через Google"
    await expect(page.getByRole('button', { name: 'Увійти', exact: true })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[placeholder="your@email.com"]').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'Увійти', exact: true }).click();

    // Should show an error message
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
  });

  test('should show link to register page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /Зареєструватися/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should have Google Sign-In button', async ({ page }) => {
    await page.goto('/login');

    const googleBtn = page.getByRole('button', { name: /Google/i });
    await expect(googleBtn).toBeVisible();
  });
});
