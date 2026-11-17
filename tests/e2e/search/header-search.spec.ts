import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { Header } from '../../pom/header.js';
import { search } from '../../fixtures/storefront-data.js';

test.describe('Header search', { tag: ['@regression', '@production'] }, () => {
  test('OSP-SRCH-001 typing a product name suggests that product', { tag: '@smoke' }, async ({ page }) => {
    const header = new Header(page);
    await gotoStorefront(page, '/');

    await header.search(search.hit.query);

    await expect(header.searchBox.getByRole('link', { name: search.hit.result })).toBeVisible();
    await expect(header.searchBox).toContainText(search.sections.products);
  });

  test('OSP-SRCH-002 choosing a suggestion opens the product page', async ({ page }) => {
    const header = new Header(page);
    await gotoStorefront(page, '/');
    await header.search(search.hit.query);

    await header.searchBox.getByRole('link', { name: search.hit.result }).click();

    await expect(page).toHaveURL((url) => url.pathname === '/stickers/special/hologram');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Hologram');
  });

  test('OSP-SRCH-003 an unknown term shows "No matches found" for products and uses', async ({ page }) => {
    const header = new Header(page);
    await gotoStorefront(page, '/');

    await header.search(search.miss.query);

    await expect(header.searchBox.getByText(search.noMatches)).toHaveCount(2);
    await expect(header.searchBox.getByRole('link')).toHaveCount(0);
  });
});
