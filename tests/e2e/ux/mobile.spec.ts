import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { Header } from '../../pom/header.js';

test.describe('Mobile layout @mobile @smoke @production', () => {
  test('OSP-MOB-001 home page fits the phone width without horizontal scroll', async ({ page }) => {
    await gotoStorefront(page, '/');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('OSP-MOB-002 hamburger menu reveals the main navigation', async ({ page }) => {
    const header = new Header(page);
    await gotoStorefront(page, '/');

    await header.mobileMenuToggle.click();

    await expect(header.navLink('STICKERS')).toBeVisible();
    await header.navLink('STICKERS').click();
    await expect(page).toHaveURL((url) => url.pathname === '/stickers');
  });
});
