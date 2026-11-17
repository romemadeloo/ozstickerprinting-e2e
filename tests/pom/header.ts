import type { Locator, Page } from '@playwright/test';
import { auth, search } from '../fixtures/storefront-data.js';

/** Site header: news bar, account and cart icons, main nav, search. Shared by every page. */
export class Header {
  readonly root: Locator;
  readonly logo: Locator;
  readonly accountIcon: Locator;
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly cartDropdown: Locator;
  readonly searchIcon: Locator;
  readonly searchInput: Locator;
  readonly searchBox: Locator;
  readonly nav: Locator;
  readonly mobileMenuToggle: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('header');
    this.logo = this.root.getByRole('link', { name: 'OzStickerPrinting' });
    this.accountIcon = this.root.getByRole('link', { name: 'My Account' });
    this.cartIcon = this.root.getByRole('link', { name: 'View Cart' });
    // The site has no test ids; these class hooks are the most stable handles available.
    this.cartCount = this.cartIcon.locator('.cart_number');
    this.cartDropdown = this.root.locator('.cart_dropdown');
    this.searchIcon = this.root.getByRole('link', { name: 'Search' });
    this.searchInput = this.root.getByPlaceholder(search.placeholder);
    this.searchBox = this.root.locator('.search_box');
    this.nav = this.root.locator('nav.nav_menu');
    // Two labels toggle the same hidden checkbox (open and close); the hamburger is the visible one.
    this.mobileMenuToggle = this.root.locator('label.for_menu--').filter({ visible: true }).first();
  }

  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }

  async openSignIn() {
    await this.accountIcon.click();
    await this.page.getByRole('button', { name: auth.buttons.openSignIn }).click();
  }

  async openRegister() {
    await this.accountIcon.click();
    await this.page.getByRole('button', { name: auth.buttons.openRegister, exact: true }).click();
  }

  async search(query: string) {
    await this.searchIcon.click();
    await this.searchInput.fill(query);
  }

  searchSection(name: string): Locator {
    return this.searchBox.locator('div, section').filter({ hasText: name });
  }
}
