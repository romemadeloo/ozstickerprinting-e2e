import { test, expect } from '../../fixtures/osp-test.js';
import { ProductConfigPage } from '../../pom/product-config-page.js';
import { dieCut } from '../../fixtures/storefront-data.js';

test.describe('Die cut configurator', { tag: ['@regression', '@production'] }, () => {
  let product: ProductConfigPage;

  test.beforeEach(async ({ page }) => {
    product = new ProductConfigPage(page);
    await product.open();
  });

  test('OSP-CFG-001 page opens with default options and a price', { tag: '@smoke' }, async () => {
    await expect(product.heading).toHaveText('Die Cut Stickers');
    await expect(product.summary).toHaveText(dieCut.defaults.summary);
    await expect(product.widthInput).toHaveValue('30');
    await expect(product.heightInput).toHaveValue('30');
    expect(await product.priceValue()).toBeGreaterThan(0);
    await expect(product.addToCartButton).toBeEnabled();
  });

  test('OSP-CFG-002 changing the finish updates the summary', async () => {
    await product.choose('Matte');

    await expect(product.summary).toContainText('/ Matte /');
  });

  test('OSP-CFG-003 a larger quantity updates the summary and raises the price', async () => {
    const basePrice = await product.priceValue();

    await product.choose(dieCut.quantities.next);

    await expect(product.summary).toContainText(`Qty : ${dieCut.quantities.next}`);
    await expect.poll(() => product.priceValue()).toBeGreaterThan(basePrice);
  });

  test('OSP-CFG-004 "See More" lists priced quantities and picking one charges the listed price', async () => {
    await product.option(dieCut.seeMore).click();

    for (const quantity of dieCut.quantities.more) {
      await expect(product.moreQuantity(quantity), `quantity ${quantity}`).toHaveCount(1);
    }
    await expect(product.moreQuantities.last()).toHaveText(dieCut.customQuantity);

    const row = product.moreQuantity('1000');
    const listedPrice = (await row.locator('em').innerText()).trim();
    await row.click();

    await expect(product.summary).toContainText('Qty : 1000');
    await expect(product.totalPrice).toHaveText(listedPrice);
  });

  test('OSP-CFG-005 changing the size updates the summary and shape', async () => {
    await product.setSize('50');

    await expect(product.summary).toContainText('Rectangle / 50x30mm');
  });

  test('OSP-CFG-006 a size under 30x30mm shows the minimum-size message', async () => {
    await product.setSize('5');

    await expect(product.message(dieCut.minSizeMessage)).toBeVisible();
  });

  test('OSP-CFG-007 an oversized width switches to the special-size quote', async () => {
    await product.setSize('2000');

    await expect(product.message(dieCut.specialSizeMessage)).toBeVisible();
    await expect(product.addToCartButton).toBeHidden();
  });

  test('OSP-CFG-008 switching material keeps the configurator usable', async () => {
    await product.choose('Kraft Paper');

    await expect(product.summary).toContainText('Die Cut /');
    expect(await product.priceValue()).toBeGreaterThan(0);
    await expect(product.addToCartButton).toBeEnabled();
  });
});
