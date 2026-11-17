import type { Locator, Page } from '@playwright/test';
import { auth } from '../fixtures/storefront-data.js';

/**
 * Sign-in / register modal (`.g-modal`). Its inputs have visual labels that are not associated
 * with the input (no `for`), so fields are found through their `.g-input` wrapper's label text.
 */
export class AuthModal {
  readonly root: Locator;
  readonly heading: Locator;
  readonly closeButton: Locator;
  readonly formError: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.g-modal');
    this.heading = this.root.locator('.g-modal-header h3');
    this.closeButton = this.root.locator('.g-modal-close');
    this.formError = this.root.locator('.error_msg');
  }

  /** Sign-in puts its title in `.g-modal-header h3`; register renders it in the body, so match by text. */
  title(text: string): Locator {
    return this.root.getByText(text, { exact: true }).first();
  }

  field(label: string): Locator {
    return this.root.locator('.g-input').filter({ has: this.page.getByText(label, { exact: true }) });
  }

  input(label: string): Locator {
    return this.field(label).locator('input');
  }

  tab(name: string): Locator {
    return this.root.locator('nav.tab-primary').getByRole('link', { name, exact: true });
  }

  button(name: string): Locator {
    return this.root.getByRole('button', { name, exact: true });
  }

  async signIn(email: string, password: string) {
    await this.input(auth.labels.email).fill(email);
    await this.input(auth.labels.password).fill(password);
    await this.button(auth.buttons.signIn).click();
  }
}
