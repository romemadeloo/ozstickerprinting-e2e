import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { Header } from '../../pom/header.js';
import { cart, nav } from '../../fixtures/storefront-data.js';

test.describe('Header navigation', { tag: ['@smoke', '@regression', '@production'] }, () => {
  test.beforeEach(async ({ page }) => {
    await gotoStorefront(page, '/');
  });

  for (const [index, link] of nav.primary.entries()) {
    test(`OSP-HDR-00${index + 1} main nav "${link.name}" opens ${link.path}`, async ({ page }) => {
      const header = new Header(page);

      await header.navLink(link.name).click();

      await expect(page).toHaveURL((url) => url.pathname === link.path);
      await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(link.h1);
    });
  }

  test('OSP-HDR-005 logo returns to the home page', async ({ page }) => {
    const header = new Header(page);
    await gotoStorefront(page, '/about');

    await header.logo.click();

    await expect(page).toHaveURL((url) => url.pathname === '/');
  });

  test('OSP-HDR-006 guest cart icon shows 0 and an empty dropdown', async ({ page }) => {
    const header = new Header(page);

    await expect(header.cartCount).toHaveText('0');
    await header.cartIcon.click();

    await expect(header.cartDropdown).toBeVisible();
    await expect(header.cartDropdown.getByText(cart.emptyDropdown)).toBeVisible();
  });
});
