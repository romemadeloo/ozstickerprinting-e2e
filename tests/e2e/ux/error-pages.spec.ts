import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { notFound } from '../../fixtures/storefront-data.js';

test.describe('Error pages', { tag: ['@regression', '@production'] }, () => {
  test.use({ allowNotFoundPaths: [notFound.path] });

  test('OSP-UX-001 an unknown URL returns 404 with the not-found page', async ({ page }) => {
    const response = await gotoStorefront(page, notFound.path);

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(notFound.title);
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(notFound.h1);
  });
});
