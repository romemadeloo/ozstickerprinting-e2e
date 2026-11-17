# How the suite is built

- [The big picture](#the-big-picture)
- [Configuration](#configuration)
- [The extended test](#the-extended-test)
- [Production write guard](#production-write-guard)
- [Environments and URLs](#environments-and-urls)
- [Page objects](#page-objects)
- [Resilience: hydration, loading order, copy drift](#resilience-hydration-loading-order-copy-drift)
- [Test data and cleanup](#test-data-and-cleanup)
- [Known defects in code](#known-defects-in-code)
- [Site notes](#site-notes)
- [Fixture reference](#fixture-reference)

## The big picture

```
spec (tests/e2e/<module>/<suite>.spec.ts)
  → imports { test, expect, gotoStorefront, refuseProduction } from fixtures/osp-test.ts
  → drives page objects (tests/pom/*.ts)
  → which read copy and data from fixtures/storefront-data.ts
```

- **Specs** describe behaviour: steps and assertions, titled with a case ID.
- **Page objects** own every locator and multi-step action.
- **Data** owns every string the tests depend on: paths, headings, labels, error messages.
- **Fixtures** add guards that run around every test automatically.

The suite follows the `musticker-playwright` design, without what OzStickerPrinting doesn't need
yet: no admin panel, no seeded member sessions, no self-heal reporter or dashboard reporter.

## Configuration

`playwright.config.ts`:

| Setting | Value | Why |
| --- | --- | --- |
| `testDir` | `./tests/e2e` | Specs only; POM and fixtures live beside it |
| `timeout` / `expect.timeout` | 60 s / 10 s | Pages wait for network idle; 60 s leaves room |
| `fullyParallel` | `true` | Same isolation locally and in CI |
| `retries` | 1 local, 2 CI | A retry records a trace |
| `workers` | `PW_WORKERS`, default 2 | Production firewall rate-limits per IP |
| `use.baseURL` | `env.baseUrl` | Specs use relative paths |
| `use.locale` / `timezoneId` | `en-AU` / `Australia/Sydney` | Matches the site's market |
| `trace` / `screenshot` / `video` | on first retry / only on failure / retain on failure | Evidence without bloat |
| `projects` | from `E2E_BROWSER_PROJECT` | One project per run by default |
| `metadata` | environment name and base URL | Shown in the HTML report |

`tests/fixtures/env.ts` loads `.env` (via `dotenv`) and resolves the environment at import time,
so a bad `E2E_ENVIRONMENT` fails before any browser starts.

## The extended test

`tests/fixtures/osp-test.ts` extends Playwright's `test` with an automatic `pageGuard` fixture.
Every spec gets it without asking for it.

During the test it records:

| Recorded | Ignored |
| --- | --- |
| `console.error` messages | `Failed to load resource…` (the response check reports those, with the URL) |
| Uncaught page errors (`pageerror`) | Anything matching an entry in `knownIssues` |
| Responses with status ≥ 400 from `www.`, `api.` or `static.ozstickerprinting.com` (or the dev hosts) | Third-party hosts (analytics, chat widget, social) |
| | A 404 on a path listed in `allowNotFoundPaths` |

After the test body finishes it removes the request routes, then asserts that both the
blocked-writes list and the problems list are empty. **A test whose own checks all pass still fails
if the page logged an error or a site request failed.** That's deliberate: it catches broken pages
that a narrow assertion would miss.

Options (set with `test.use()`):

| Option | Type | Default | Use |
| --- | --- | --- | --- |
| `allowNotFoundPaths` | `string[]` | `[]` | Paths whose 404 is the point of the test (`OSP-UX-001`) |

## Production write guard

When `env.isProduction` is true, the guard routes every request to the API host:

- `GET`, `HEAD`, `OPTIONS` → continue.
- `POST`, `PUT`, `PATCH`, `DELETE` → continue **only if** the path matches
  `productionWriteAllowlist` in `tests/fixtures/known-issues.ts`; otherwise **abort** the request,
  add a `blocked-production-write` annotation, and fail the test with
  `This spec tried to write to production; mark it @destructive and gate it`.

The allowlist holds calls that use POST but save nothing:

| Path | Why it's safe |
| --- | --- |
| `/api/security/soft-login` | Sign-in attempt. With an `@example.com` address it returns `{status:"FAIL"}` |
| `/api/user/signin` | Called right after a failed soft-login; only returns an error |
| `/api/site/seo` | Page metadata lookup during in-site navigation |
| `/api/site/redirect` | Redirect lookup before the 404 page is shown |

Adding to the allowlist needs evidence that the call writes nothing (response body, network tab, or
developer confirmation) and a comment saying so. Never add `cart-items`, `order`, `user/register`
or similar.

`page.unrouteAll({ behavior: 'ignoreErrors' })` runs before the page closes. Without it, closing
waits for in-flight routed requests and each test spends about a minute in teardown.

## Environments and URLs

- `tests/fixtures/environments.ts` is the only file that names hosts. `resolveEnvironment(name)`
  returns `{ name, baseUrl, apiBaseUrl, isProduction }`.
- `dev` reads `OSP_DEV_BASE_URL` and `OSP_DEV_API_URL`, strips trailing slashes, and throws if either
  is missing or if the storefront host is production's.
- `env.ts` exports `env`, `ownHosts` (hosts the error guard watches), `isOwnHost(url)`,
  `memberCredentials` (or `undefined`) and `runCartE2E`.

## Page objects

All in `tests/pom/`. Constructor takes `page`; locators are `readonly` fields; actions are `async`
methods. Copy comes from `storefront-data.ts`.

### `Header` (`header.ts`)

| Member | What it is |
| --- | --- |
| `root`, `nav`, `logo` | `<header>`, the main menu `<nav>`, the logo link |
| `navLink(name)` | A main menu link by exact text (STICKERS, BUSINESS CARD, …) |
| `accountIcon`, `openSignIn()`, `openRegister()` | Account icon and the two buttons in its menu |
| `cartIcon`, `cartCount`, `cartDropdown` | Cart icon, its number badge, the mini-cart dropdown |
| `searchIcon`, `searchInput`, `searchBox`, `search(query)` | Header search: open, type, results panel |
| `mobileMenuToggle` | The visible hamburger label (phones) |

### `AuthModal` (`auth-modal.ts`)

| Member | What it is |
| --- | --- |
| `root` | `.g-modal`, the sign-in / register dialog |
| `heading` | Sign-in title (`.g-modal-header h3`) |
| `title(text)` | Any title by text (register's title is in the body) |
| `tab(name)` | Member / Non-member tabs |
| `field(label)`, `input(label)` | A `.g-input` wrapper found by its label text, and its `<input>` |
| `button(name)` | A button by exact name |
| `signIn(email, password)` | Fill both fields and press Sign In |
| `formError`, `closeButton` | Form-level error (`.error_msg`) and the × button |

### `ProductConfigPage` (`product-config-page.ts`)

| Member | What it is |
| --- | --- |
| `open(path)` | Opens a product page and waits for the size inputs and the summary |
| `option(label)`, `choose(label)` | An option chip; `choose` clicks it and waits for the summary to change |
| `widthInput`, `heightInput`, `setSize(w, h?)` | Size in mm |
| `summary` | Order summary line, e.g. `Die Cut / Square / 30x30mm / Gloss / Normal / Qty : 100` |
| `totalPrice`, `priceValue()` | Total price element and its number |
| `moreQuantities`, `moreQuantity(qty)` | Rows of the "See More" quantity list ("qty $price n%off") |
| `quantityRule`, `message(text)` | "divisible by 100" note; any exact message (size errors) |
| `addToCartButton`, `artworkModal` | Add to Cart and the Upload Artwork dialog. **Add to Cart saves data** |

## Resilience: hydration, loading order, copy drift

- **Hydration.** The storefront is Nuxt 2. `window.$nuxt` appears before click handlers and async
  data are ready, so early clicks are silently ignored. `gotoStorefront()` waits for `load`, then
  `$nuxt`, then network idle (bounded at 15 s because third-party widgets can keep the network
  busy). Always open pages with it.
- **Loading order.** The configurator first renders another product's defaults
  (e.g. "Circle / 25x25mm / PVC"), then the page's own. `ProductConfigPage.open()` waits for the size
  inputs, which only exist once the page's configuration has loaded.
- **Waiting on change, not time.** `choose()` waits until the old summary text is gone. Price checks
  use `expect.poll`. There is no `waitForTimeout` anywhere.
- **Copy drift.** All copy lives in `storefront-data.ts`, so a wording change is a one-line fix.
  Titles use regexes on the stable part (`/Kiss-Cut Stickers/`), not the whole SEO title.
- **Prices.** Promotions change prices. Tests compare prices relative to each other or to the price
  the page lists, never fixed amounts.
- **Firewall.** Keep `PW_WORKERS` low on production. There's no WAF retry helper yet; Musticker's
  `navigation.ts` is the model if one is needed.

## Test data and cleanup

- Production: nothing is created; the write guard ensures it.
- Reserved data only: `qa-e2e-nobody@example.com` for negative sign-in; `@example.com` addresses and
  a `qa-e2e` prefix for anything a dev test creates.
- `OSP-CRT-002` uses a fresh browser context, so its guest cart belongs to that context only. There
  is no teardown that deletes carts or accounts yet; add one (Musticker's `global-teardown.ts` +
  ledger is the model) before writing tests that register accounts.

## Known defects in code

`knownIssues` in `tests/fixtures/known-issues.ts` lets the page guard tolerate a reported defect:

```ts
{
  match: /Access to XMLHttpRequest at '.*hologram_texture\.png'/, // console text or "<status> <url>"
  onPage: /\/stickers\/special\/hologram/,                         // optional: only on these pages
  note: 'CORS error loading the hologram texture',
  ticket: 'GLOP-0000'
}
```

Rules: one entry per defect, with a note and a ticket; as narrow as possible; removed when the fix
ships so a regression fails again. Never loosen an assertion instead. The list is empty today.

## Site notes

- No `data-testid` attributes. The few CSS hooks used (`.g-modal`, `.g-input`, `.error_msg`,
  `.cart_dropdown`, `.cart_number`, `.search_box`, `nav.nav_menu`, `label.for_menu--`,
  `ul.custom_quantity_modal`, `.up_artwork_modal`) are all inside page objects.
- Modal labels have no `for` attribute, so `getByLabel()` doesn't work there.
- On phones, two `label.for_menu--` elements toggle the same checkbox; the visible one is the menu icon.
- A failed sign-in calls `security/soft-login`, then `user/signin`, and shows
  "Your email address and password do not match."
- **Add to Cart** sends `POST /api/cart-items/create` immediately, before the artwork dialog. On
  2026-11-17 an exploratory click on production got a 500 and saved nothing.
- Search suggestions have two sections, Products and Uses; each shows "No matches found." when empty.

## Fixture reference

| Export | From | Purpose |
| --- | --- | --- |
| `test`, `expect` | `osp-test.ts` | Extended test with `pageGuard`; use instead of `@playwright/test` |
| `gotoStorefront(page, path)` | `osp-test.ts` | Navigate and wait for readiness; returns the response |
| `refuseProduction(reason?)` | `osp-test.ts` | `test.skip` on production |
| `GuardOptions` | `osp-test.ts` | `allowNotFoundPaths` |
| `env`, `ownHosts`, `isOwnHost` | `env.ts` | Active environment and watched hosts |
| `memberCredentials`, `runCartE2E` | `env.ts` | Opt-in data and flags |
| `resolveEnvironment` | `environments.ts` | Environment table |
| `knownIssues`, `productionWriteAllowlist` | `known-issues.ts` | Guard exceptions |
| `nav`, `publicPages`, `footerLinks`, `contactEmail`, `auth`, `search`, `cart`, `dieCut`, `notFound` | `storefront-data.ts` | Copy and test data |
