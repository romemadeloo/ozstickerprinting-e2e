import { test as base, expect, type Page } from '@playwright/test';
import { env, isOwnHost } from './env.js';
import { knownIssues, productionWriteAllowlist } from './known-issues.js';

export type GuardOptions = {
  /** Paths whose 404 response is the point of the test (error-page specs). */
  allowNotFoundPaths: string[];
};

type Fixtures = GuardOptions & {
  /** Collected problems; checked after each test so a passing test still fails on noise. */
  pageGuard: void;
};

function isKnown(text: string, pageUrl: string): boolean {
  return knownIssues.some((issue) => issue.match.test(text) && (!issue.onPage || issue.onPage.test(pageUrl)));
}

/**
 * Every spec imports `test` from here. It:
 * - fails the test on console errors and >=400 responses from OzStickerPrinting hosts, unless the
 *   problem is listed in known-issues.ts with a note (we record defects as data, not by loosening asserts);
 * - on production, aborts mutating API calls (POST/PUT/PATCH/DELETE) that are not allowlisted and
 *   fails the test, so a read-only spec can never create carts, accounts or orders there.
 */
export const test = base.extend<Fixtures>({
  allowNotFoundPaths: [[], { option: true }],

  pageGuard: [
    async ({ page, allowNotFoundPaths }, use, testInfo) => {
      const problems: string[] = [];
      const blockedWrites: string[] = [];

      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        // "Failed to load resource" duplicates the response check below, which knows the URL.
        if (text.startsWith('Failed to load resource')) return;
        if (isKnown(text, page.url())) return;
        problems.push(`console error on ${page.url()}: ${text.slice(0, 300)}`);
      });

      page.on('pageerror', (error) => {
        if (isKnown(error.message, page.url())) return;
        problems.push(`uncaught page error on ${page.url()}: ${error.message.slice(0, 300)}`);
      });

      page.on('response', (response) => {
        const url = response.url();
        if (response.status() < 400 || !isOwnHost(url)) return;
        const path = new URL(url).pathname;
        if (response.status() === 404 && allowNotFoundPaths.includes(path)) return;
        if (isKnown(`${response.status()} ${url}`, page.url())) return;
        problems.push(`${response.status()} ${response.request().method()} ${url}`);
      });

      if (env.isProduction) {
        const apiHost = new URL(env.apiBaseUrl).hostname;
        await page.route(
          (url) => url.hostname === apiHost,
          async (route) => {
            const request = route.request();
            const method = request.method();
            const path = new URL(request.url()).pathname;
            const readOnly = ['GET', 'HEAD', 'OPTIONS'].includes(method);
            if (readOnly || productionWriteAllowlist.some((allowed) => allowed.test(path))) {
              await route.continue();
              return;
            }
            blockedWrites.push(`${method} ${path}`);
            await route.abort('blockedbyclient');
          }
        );
      }

      await use();

      // Without this, closing the page waits for in-flight routed requests (long-polling, analytics)
      // and every test spends about a minute in teardown.
      await page.unrouteAll({ behavior: 'ignoreErrors' });

      if (blockedWrites.length > 0) {
        testInfo.annotations.push({ type: 'blocked-production-write', description: blockedWrites.join(', ') });
      }
      expect(blockedWrites, 'This spec tried to write to production; mark it @destructive and gate it').toEqual([]);
      expect(problems, 'Console errors or failing OzStickerPrinting requests').toEqual([]);
    },
    { auto: true }
  ]
});

export { expect };

/** Navigate inside the storefront and wait for Nuxt to finish hydrating. */
export async function gotoStorefront(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'load' });
  // Nuxt 2 sets window.$nuxt before click handlers and async data settle, so clicks right after it
  // are silently ignored (account menu, search, cart). Network idle is the reliable "ready" signal
  // here; it is bounded because third-party widgets can keep the network busy.
  await page.waitForFunction(() => !!(window as unknown as { $nuxt?: unknown }).$nuxt);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  return response;
}

/** Skip with a reason when a spec writes data and the target is production. */
export function refuseProduction(reason = 'writes data; refused on production (DEC-007)') {
  test.skip(env.isProduction, reason);
}
