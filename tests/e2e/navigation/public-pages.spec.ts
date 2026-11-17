import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { publicPages } from '../../fixtures/storefront-data.js';

test.describe('Public pages', { tag: ['@smoke', '@regression', '@production'] }, () => {
  for (const [index, entry] of publicPages.entries()) {
    const id = `OSP-NAV-${String(index + 1).padStart(3, '0')}`;

    test(`${id} ${entry.path} loads with its heading and title`, async ({ page }) => {
      const response = await gotoStorefront(page, entry.path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(entry.title);
      await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(entry.h1);
    });
  }
});
