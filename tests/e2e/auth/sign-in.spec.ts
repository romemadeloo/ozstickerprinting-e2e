import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';
import { Header } from '../../pom/header.js';
import { AuthModal } from '../../pom/auth-modal.js';
import { auth } from '../../fixtures/storefront-data.js';

test.describe('Sign in modal', { tag: ['@auth', '@regression', '@production'] }, () => {
  let modal: AuthModal;

  test.beforeEach(async ({ page }) => {
    await gotoStorefront(page, '/');
    await new Header(page).openSignIn();
    modal = new AuthModal(page);
    await expect(modal.heading).toHaveText(auth.signInHeading);
  });

  test('OSP-AUTH-001 sign-in modal shows member form and social logins', { tag: '@smoke' }, async () => {
    await expect(modal.tab(auth.tabs.member)).toHaveClass(/selected/);
    await expect(modal.input(auth.labels.email)).toBeVisible();
    await expect(modal.input(auth.labels.password)).toHaveAttribute('type', 'password');
    await expect(modal.button(auth.buttons.signIn)).toBeVisible();
    await expect(modal.root.getByRole('button', { name: auth.buttons.facebook })).toBeVisible();
    await expect(modal.root.getByRole('button', { name: auth.buttons.google })).toBeVisible();
  });

  test('OSP-AUTH-002 empty submit shows required-field errors', async () => {
    await modal.button(auth.buttons.signIn).click();

    await expect(modal.field(auth.labels.email)).toContainText(auth.errors.emailRequired);
    await expect(modal.field(auth.labels.password)).toContainText(auth.errors.passwordRequired);
  });

  test('OSP-AUTH-003 malformed email is rejected before submit', async () => {
    await modal.input(auth.labels.email).fill('not-an-email');
    await modal.button(auth.buttons.signIn).click();

    await expect(modal.field(auth.labels.email)).toContainText(auth.errors.invalidEmail);
  });

  test('OSP-AUTH-004 unknown account shows a mismatch error', async ({ page }) => {
    const login = page.waitForResponse((response) => response.url().includes('/api/security/soft-login'));

    await modal.signIn(auth.unknownMember.email, auth.unknownMember.password);

    const body = await (await login).json();
    expect(body.status).toBe('FAIL');
    await expect(modal.formError).toHaveText(auth.errors.badCredentials);
    await expect(modal.root).toBeVisible();
  });

  test('OSP-AUTH-005 password visibility toggle reveals the password', async () => {
    const password = modal.input(auth.labels.password);
    await password.fill('Secret123!');

    await modal.field(auth.labels.password).getByRole('button').click();

    await expect(password).toHaveAttribute('type', 'text');
  });

  test('OSP-AUTH-006 non-member tab shows the guest order lookup form', async () => {
    await modal.tab(auth.tabs.nonMember).click();

    await expect(modal.input(auth.labels.email)).toBeVisible();
    await expect(modal.input(auth.labels.orderNumber)).toBeVisible();
    await expect(modal.button(auth.buttons.checkOrder)).toBeVisible();
    await expect(modal.input(auth.labels.password)).toHaveCount(0);
  });

  test('OSP-AUTH-007 close button dismisses the modal', async () => {
    await modal.closeButton.click();

    await expect(modal.root).toBeHidden();
  });
});

test.describe('Register modal', { tag: ['@auth', '@regression', '@production'] }, () => {
  test('OSP-AUTH-008 register modal validates required fields', async ({ page }) => {
    await gotoStorefront(page, '/');
    await new Header(page).openRegister();
    const modal = new AuthModal(page);
    await expect(modal.title(auth.registerHeading)).toBeVisible();

    await modal.button(auth.buttons.register).click();

    await expect(modal.field(auth.labels.firstName)).toContainText(auth.errors.firstNameRequired);
    await expect(modal.field(auth.labels.lastName)).toContainText(auth.errors.lastNameRequired);
    await expect(modal.field(auth.labels.email)).toContainText(auth.errors.emailRequired);
    await expect(modal.field(auth.labels.password)).toContainText(auth.errors.passwordRequired);
  });
});
