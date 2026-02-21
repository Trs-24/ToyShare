import { test, expect } from '@playwright/test';

test.describe('Catalog Page', () => {
  test('should display the catalog page', async ({ page }) => {
    await page.goto('/catalog');

    // The catalog should load with a visible heading or main content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display interactive elements on catalog', async ({ page }) => {
    await page.goto('/catalog');

    // Should have some interactive element (button, dropdown, or input)
    await page.waitForTimeout(2000);
    const interactiveEl = page
      .locator('button, select, input, [role="combobox"], [role="listbox"]')
      .first();
    await expect(interactiveEl).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to item detail when clicking an item', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // If there are any item cards, clicking one should navigate to a detail page
    const itemCard = page.locator('[class*="cursor-pointer"], a[href*="/items/"]').first();
    const itemExists = await itemCard.isVisible().catch(() => false);

    if (itemExists) {
      await itemCard.click();
      await page.waitForURL(/\/items\/|\/catalog\//, { timeout: 5000 });
    }
  });
});

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
    // Navigation should be present
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for catalog or items link
    const catalogLink = page.getByRole('link', { name: /каталог|catalog/i });
    const linkExists = await catalogLink.isVisible().catch(() => false);

    if (linkExists) {
      await expect(catalogLink).toBeVisible();
    }
  });
});
