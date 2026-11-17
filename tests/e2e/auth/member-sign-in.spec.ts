import { test, expect, gotoStorefront, refuseProduction } from '../../fixtures/osp-test.js';
import { Header } from '../../pom/header.js';
import { AuthModal } from '../../pom/auth-modal.js';
import { memberCredentials } from '../../fixtures/env.js';
import { auth } from '../../fixtures/storefront-data.js';

test.describe('Member sign in @auth @regression', () => {
  test('OSP-AUTH-009 a member can sign in with valid credentials', async ({ page }) => {
    refuseProduction('signs in a real account; run on a dev server with a QA member');
    test.skip(!memberCredentials, 'OSP_MEMBER_EMAIL / OSP_MEMBER_PASSWORD not set');
    const header = new Header(page);
    const modal = new AuthModal(page);
    await gotoStorefront(page, '/');
    await header.openSignIn();

    await modal.signIn(memberCredentials!.email, memberCredentials!.password);

    await expect(modal.root).toBeHidden();
    await header.accountIcon.click();
    await expect(page.getByRole('button', { name: auth.buttons.openSignIn })).toBeHidden();
  });
});
