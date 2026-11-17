import type { Locator, Page } from '@playwright/test';
import { dieCut } from '../fixtures/storefront-data.js';
import { gotoStorefront } from '../fixtures/osp-test.js';

/** Product configurator (material, size, shape, finish, adhesive, quantity, price, add to cart). */
export class ProductConfigPage {
  readonly heading: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly summary: Locator;
  readonly totalPrice: Locator;
  readonly addToCartButton: Locator;
  readonly quantityRule: Locator;
  readonly artworkModal: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.widthInput = page.locator('input[name="width"]');
    this.heightInput = page.locator('input[name="height"]');
    // The one-line order summary, e.g. "Die Cut / Square / 30x30mm / Gloss / Normal / Qty : 100".
    this.summary = page.getByText(/\/ Qty : \d+/).first();
    this.totalPrice = page
      .getByText(dieCut.totalPrice, { exact: true })
      .locator('xpath=..')
      .getByText(/^\$[\d,]+\.\d{2}$/);
    this.addToCartButton = page.getByRole('button', { name: dieCut.addToCart });
    this.quantityRule = page.getByText(dieCut.quantityRule);
    this.artworkModal = page.locator('.up_artwork_modal');
    this.moreQuantities = page.locator('ul.custom_quantity_modal > li');
  }

  /** Rows of the "See More" quantity list: "<qty> $<price> <n>%off", plus "Custom Quantity". */
  readonly moreQuantities: Locator;

  moreQuantity(quantity: string): Locator {
    return this.moreQuantities.filter({ hasText: new RegExp(`^\\s*${quantity}\\s+\\$`) });
  }

  async open(path: string = dieCut.path) {
    await gotoStorefront(this.page, path);
    // The summary first renders another product's defaults, then this page's; wait for the size
    // inputs, which only exist once the page's own configuration has loaded.
    await this.widthInput.waitFor();
    await this.summary.waitFor();
  }

  /** Clicks a configurator option chip (material, finish, quantity, ...) by its exact label. */
  option(label: string): Locator {
    return this.page.getByText(label, { exact: true }).first();
  }

  async choose(label: string) {
    const before = await this.summary.innerText();
    await this.option(label).click();
    // The summary re-renders after the pricing call; wait for it rather than sleeping.
    await this.page.waitForFunction(
      ([text]) => !document.body.innerText.includes(text),
      [before],
      { timeout: 10_000 }
    ).catch(() => undefined);
  }

  async setSize(width: string, height?: string) {
    await this.widthInput.fill(width);
    await this.widthInput.press('Tab');
    if (height !== undefined) {
      await this.heightInput.fill(height);
      await this.heightInput.press('Tab');
    }
  }

  async priceValue(): Promise<number> {
    const text = await this.totalPrice.innerText();
    return Number(text.replace(/[$,]/g, ''));
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }
}
