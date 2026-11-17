# Writing and changing tests

These rules keep the suite readable, safe against production, and in step with the test case list.
They follow the `musticker-playwright` conventions, with the `OSP` prefix.

- [Test case IDs](#test-case-ids)
- [Where a test goes](#where-a-test-goes)
- [Anatomy of a spec](#anatomy-of-a-spec)
- [Tags](#tags)
- [Locators and assertions](#locators-and-assertions)
- [Data, safety and cleanup](#data-safety-and-cleanup)
- [Known defects and preconditions](#known-defects-and-preconditions)
- [Keeping the case list current](#keeping-the-case-list-current)
- [Pull request checklist](#pull-request-checklist)

## Test case IDs

Every test title starts with its case ID: `OSP-<MODULE>-###`. The same ID is used in
[TEST-CASES.md](TEST-CASES.md), commit messages and defect reports.

| Prefix | Module | Example |
| --- | --- | --- |
| `OSP-NAV-###` | Public pages | `OSP-NAV-003 /stickers/die-cut loads with its heading and title` |
| `OSP-HDR-###` | Header navigation | `OSP-HDR-005 logo returns to the home page` |
| `OSP-FTR-###` | Footer | `OSP-FTR-002 footer shows the contact email as a mailto link` |
| `OSP-SRCH-###` | Search | `OSP-SRCH-003 an unknown term shows "No matches found" …` |
| `OSP-AUTH-###` | Sign-in & registration | `OSP-AUTH-004 unknown account shows a mismatch error` |
| `OSP-CFG-###` | Product configuration & pricing | `OSP-CFG-006 a size under 30x30mm shows the minimum-size message` |
| `OSP-CRT-###` | Cart | `OSP-CRT-001 a guest sees an empty cart page` |
| `OSP-UX-###` | Errors & accessibility | `OSP-UX-001 an unknown URL returns 404 with the not-found page` |
| `OSP-MOB-###` | Mobile layout | `OSP-MOB-002 hamburger menu reveals the main navigation` |

- IDs are never reused. A withdrawn case keeps its ID and is marked withdrawn in TEST-CASES.md with
  the reason.
- Take the next free number in the module.
- A new module gets a new prefix, a folder, and a row in this table.
- Generated cases (like `OSP-NAV-###` from the `publicPages` list) get their number from their
  position. **Add new pages at the end of the list** so existing IDs don't shift.

## Where a test goes

```
tests/e2e/<module-folder>/<suite>.spec.ts    behaviour
tests/pom/<page>.ts                          page objects
tests/fixtures/<topic>.ts                    shared helpers and data
```

| Module | Folder |
| --- | --- |
| NAV, HDR, FTR | `navigation/` |
| SRCH | `search/` |
| AUTH | `auth/` |
| CFG | `configuration/` |
| CRT | `cart/` (checkout specs will go in `checkout/`) |
| UX, MOB | `ux/` |

- **One suite per spec file.** The suite name is the top-level `describe` title (`Header navigation`,
  `Die cut configurator`). Nested `describe`s are fine for shared setup or data-driven cases.
- A new case goes into its suite's spec file. A new product configurator gets its own spec
  (`configuration/kiss-cut-configurator.spec.ts`), reusing `ProductConfigPage`.
- CI and scripts select by tag, never by folder.

## Anatomy of a spec

```ts
import { test, expect, gotoStorefront } from '../../fixtures/osp-test.js';   // never '@playwright/test'
import { Header } from '../../pom/header.js';                                // .js even for .ts files
import { search } from '../../fixtures/storefront-data.js';

test.describe('Header search', { tag: ['@regression', '@production'] }, () => {
  test('OSP-SRCH-001 typing a product name suggests that product', { tag: '@smoke' }, async ({ page }) => {
    // Arrange
    const header = new Header(page);
    await gotoStorefront(page, '/');

    // Act
    await header.search(search.hit.query);

    // Assert
    await expect(header.searchBox.getByRole('link', { name: search.hit.result })).toBeVisible();
  });
});
```

- Arrange / act / assert, separated by blank lines.
- Title: `<ID> <what happens, in plain words>`. Describe the behaviour, not the implementation.
- Each test stands alone: own page, own data, no order dependency (`fullyParallel` is on).
- A test that saves data starts with `refuseProduction()` and then checks its opt-in flag:

```ts
test.describe('Add to cart', { tag: ['@destructive', '@regression'] }, () => {
  test('OSP-CRT-002 a guest adds die cut stickers and skips artwork', async ({ page }) => {
    refuseProduction();
    test.skip(!runCartE2E, 'RUN_CART_E2E is not true');
    // …
  });
});
```

## Tags

Tags go in the `tag` option of the `describe` (and of a single `test` for `@smoke`), never in the
title text.

| Tag | When |
| --- | --- |
| `@smoke` | Fast, high-value; the PR gate. Keep the smoke set under about 2 minutes |
| `@regression` | Every test that belongs in the full run (almost all) |
| `@production` | Only if the test saves nothing. The write guard will fail it otherwise |
| `@auth` | Sign-in and registration |
| `@mobile` | Phone-only; runs only in `chromium-mobile` |
| `@destructive` | **Mandatory** when the test saves anything (cart, account, order, inquiry) |

## Locators and assertions

- **No raw selectors in specs.** Add a locator or method to a page object.
- **Order of preference:** `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` →
  CSS class. The site has no test ids; when a class is the only handle, comment why in the POM.
- Use `exact: true` for short labels ("100", "Gloss", "Register") that appear elsewhere on the page.
- **No site text in page objects or specs.** It goes in `storefront-data.ts`.
- **Never `page.waitForTimeout()`.** Wait for a locator state, a URL, a response
  (`page.waitForResponse`) or a value (`expect.poll`).
- Use web-first assertions (`await expect(locator).toHaveText(…)`), which retry. Avoid
  `expect(await locator.textContent())` unless you need the value for a later comparison.
- Compare URLs by path: `toHaveURL((url) => url.pathname === '/stickers')`.
- Compare prices relatively (greater than before, equal to the listed price), never to fixed amounts.
- Open pages with `gotoStorefront()`, never bare `page.goto()`.

## Data, safety and cleanup

- Production is read-only. If a test needs to save anything it is `@destructive`, refuses
  production and has an opt-in `RUN_*` flag.
- Use only reserved data: `@example.com` emails, `qa-e2e` prefixes, the dev QA member from `.env`.
- Never put real customer data, passwords, cookies or tokens in code, docs, reports or commits.
- New hosts go only in `environments.ts`.
- When a dev test creates accounts or orders, add cleanup (teardown or an API delete) in the same PR.

## Known defects and preconditions

- A known product defect is recorded **as data** in `knownIssues` (`tests/fixtures/known-issues.ts`)
  with a note and the Jira key, never by weakening an assertion or catching the error.
- A missing precondition (no credentials, no dev server, flag off) **skips** with a reason; it
  doesn't fail.
- When the defect is fixed, remove its entry in the same PR that confirms the fix.
- A read-only POST the write guard blocks goes into `productionWriteAllowlist` with a comment on why
  it's safe. Ask the QA lead if unsure.

## Keeping the case list current

Adding, changing or withdrawing a test also updates [TEST-CASES.md](TEST-CASES.md): ID, suite,
scenario, expected result, environment, tags. If the team adopts a workbook like Musticker's
`docs/test-cases.xlsx`, it replaces TEST-CASES.md as the single source.

## Pull request checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run test:e2e:list` count changed only by what you added or removed
- [ ] New or changed tests pass 5 times: `npx playwright test -g "<ID>" --repeat-each=5 --retries=0`
- [ ] Titles start with a new, unused `OSP-<MODULE>-###` ID
- [ ] Copy in `storefront-data.ts`, locators in a page object, no `waitForTimeout`
- [ ] Tags correct; `@production` only on tests that save nothing; `@destructive` gated
- [ ] TEST-CASES.md updated
- [ ] No `.env`, `.auth/`, secrets or reports committed
