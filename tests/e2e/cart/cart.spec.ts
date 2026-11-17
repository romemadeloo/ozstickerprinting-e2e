import { test, expect, gotoStorefront, refuseProduction } from '../../fixtures/osp-test.js';
import { Header } from '../../pom/header.js';
import { ProductConfigPage } from '../../pom/product-config-page.js';
import { cart, dieCut } from '../../fixtures/storefront-data.js';
import { runCartE2E } from '../../fixtures/env.js';

test.describe('Cart page @regression @production', () => {
  test('OSP-CRT-001 a guest sees an empty cart page', async ({ page }) => {
    await gotoStorefront(page, '/cart');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(cart.emptyPageHeading);
  });
});

// "Add to Cart" calls cart-items/create immediately, before the artwork modal, so this writes data.
// It never runs on production and needs RUN_CART_E2E=true on a dev server.
test.describe('Add to cart @destructive @regression', () => {
  test('OSP-CRT-002 a guest adds die cut stickers and skips artwork', async ({ page }) => {
    refuseProduction();
    test.skip(!runCartE2E, 'RUN_CART_E2E is not true');
    const product = new ProductConfigPage(page);
    const header = new Header(page);
    await product.open();
    const summary = await product.summary.innerText();

    await product.addToCartButton.click();
    await expect(product.artworkModal).toBeVisible();
    await product.artworkModal.getByText(dieCut.artworkModal.skip).click();

    await expect(header.cartCount).toHaveText('1');
    await gotoStorefront(page, '/cart');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(cart.pageHeading);
    await expect(page.getByText(summary.split(' / Qty')[0]).first()).toBeVisible();
  });
});
