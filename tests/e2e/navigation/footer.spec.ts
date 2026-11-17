import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { contactEmail, footerLinks } from '../../fixtures/storefront-data.js';

test.describe('Footer', { tag: ['@regression', '@production'] }, () => {
  test('OSP-FTR-001 footer links point at live pages', async ({ page, request }) => {
    await gotoStorefront(page, '/');
    const footer = page.locator('footer');

    for (const link of footerLinks) {
      const anchor = footer.getByRole('link', { name: link.name, exact: true });
      await expect(anchor, link.name).toHaveAttribute('href', link.path);
      const response = await request.get(link.path);
      expect(response.status(), `${link.name} -> ${link.path}`).toBe(200);
    }
  });

  test('OSP-FTR-002 footer shows the contact email as a mailto link', async ({ page }) => {
    await gotoStorefront(page, '/');

    await expect(page.locator('footer').getByRole('link', { name: contactEmail })).toHaveAttribute(
      'href',
      `mailto:${contactEmail}`
    );
  });

  test('OSP-FTR-003 footer link opens its page', async ({ page }) => {
    await gotoStorefront(page, '/');

    await page.locator('footer').getByRole('link', { name: 'FAQ', exact: true }).click();

    await expect(page).toHaveURL((url) => url.pathname === '/user-guide/faq');
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText('FAQ');
  });
});
