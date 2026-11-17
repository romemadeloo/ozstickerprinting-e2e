# Running the suite

- [Setup](#setup)
- [Commands](#commands)
- [Environments](#environments)
- [Environment variables](#environment-variables)
- [Browsers and projects](#browsers-and-projects)
- [Tags](#tags)
- [Signing in](#signing-in)
- [Reports](#reports)
- [CI](#ci)
- [Troubleshooting](#troubleshooting)

## Setup

```bash
npm install
npx playwright install chromium          # add firefox webkit if you run those projects
cp .env.example .env                     # PowerShell: Copy-Item .env.example .env
npm run typecheck
npm run test:e2e:list
```

Requirements: Node.js 22+ and Git. Playwright is pinned at `@playwright/test` 1.59.1; after
upgrading it, run `npx playwright install` again so the browser builds match.

## Commands

| Command | What it does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit`: compiles every `.ts` file, no browser |
| `npm run test:e2e` | Every test for the target in `.env` |
| `npm run test:e2e:list` | Lists the tests without running them. The count should change only by what you added or removed |
| `npm run test:e2e:headed` | Same as `test:e2e` with a visible browser |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:smoke` | `--grep @smoke` |
| `npm run test:regression` | `--grep @regression` |
| `npm run test:auth` | `--grep @auth` |
| `npm run test:mobile` | `E2E_BROWSER_PROJECT=chromium-mobile`, `--grep @mobile` |
| `npm run test:prod:smoke` | `E2E_ENVIRONMENT=production`, `@smoke`, never `@destructive` |
| `npm run test:prod:full` | `E2E_ENVIRONMENT=production`, everything except `@destructive` |
| `npm run test:destructive` | `RUN_CART_E2E=true`, `@destructive`, no retries. Refused on production |
| `npm run report` | Opens the last HTML report |

Useful one-offs:

```bash
npx playwright test -g "OSP-CFG-004"                                   # one case
npx playwright test tests/e2e/search                                   # one folder
npx playwright test -g "OSP-SRCH" --repeat-each=5 --retries=0          # flakiness check
npx playwright test -g "OSP-AUTH-004" --debug                          # Playwright Inspector
npx playwright codegen https://www.ozstickerprinting.com               # record locators
```

## Environments

`E2E_ENVIRONMENT` picks the target. `tests/fixtures/environments.ts` is the only place hosts are
written; `tests/fixtures/env.ts` resolves the active one and exposes `env.baseUrl`,
`env.apiBaseUrl` and `env.isProduction`.

| Value | Storefront | API | Notes |
| --- | --- | --- | --- |
| `production` (default) | `https://www.ozstickerprinting.com` | `https://api.ozstickerprinting.com/index.php` | Read-only. Write guard on. `@destructive` refused |
| `dev` | `OSP_DEV_BASE_URL` | `OSP_DEV_API_URL` | Needs both URLs. Refuses a production host |

There is no `qa` alias or dev-1…dev-N list yet (Musticker has them) because no OzStickerPrinting
dev server is registered. When servers are assigned, add them to `environments.ts` by name.

## Environment variables

Set in `.env` (gitignored; template in `.env.example`) or on the command line, which wins.

| Variable | Default | Meaning |
| --- | --- | --- |
| `E2E_ENVIRONMENT` | `production` | `production` or `dev` |
| `OSP_DEV_BASE_URL` | empty | Dev storefront origin, e.g. `https://<dev-host>` (no trailing slash needed) |
| `OSP_DEV_API_URL` | empty | Dev API base, e.g. `https://<dev-api-host>/index.php` |
| `E2E_BROWSER_PROJECT` | `chromium-desktop` | See [Browsers and projects](#browsers-and-projects) |
| `PW_WORKERS` | `2` | Parallel browsers. Positive integer. Keep it at 1–3 on production |
| `RUN_CART_E2E` | `false` | `true` allows `OSP-CRT-002` (add to cart) on a dev server |
| `OSP_MEMBER_EMAIL` | empty | Dev QA member for `OSP-AUTH-009` |
| `OSP_MEMBER_PASSWORD` | empty | Its password |
| `HEADED` | `false` | `true` shows the browser |
| `CI` | set by CI | 2 retries, `forbidOnly`, JUnit report |

Per-command override, PowerShell:

```powershell
$env:PW_WORKERS = '1'; npx playwright test --grep @smoke
```

Git Bash / macOS / Linux:

```bash
PW_WORKERS=1 npx playwright test --grep @smoke
```

## Browsers and projects

| `E2E_BROWSER_PROJECT` | Device | Runs |
| --- | --- | --- |
| `chromium-desktop` (default) | Desktop Chrome, 1440×900 | Everything except `@mobile` |
| `firefox-desktop` | Desktop Firefox, 1440×900 | Everything except `@mobile` |
| `webkit-desktop` | Desktop Safari, 1440×900 | Everything except `@mobile` |
| `all-desktop` | The three above | Everything except `@mobile` |
| `chromium-mobile` | Pixel 7 | Only `@mobile` |

Locale `en-AU`, time zone `Australia/Sydney`. Install extra browsers with
`npx playwright install firefox webkit`.

Other settings (`playwright.config.ts`): test timeout 60 s, `expect` timeout 10 s, `fullyParallel`,
retries 1 locally and 2 in CI, trace on first retry, screenshot and video only on failure.

## Tags

| Tag | Meaning | Selected by |
| --- | --- | --- |
| `@smoke` | Fast, high-value health check | `test:smoke`, `test:prod:smoke`, CI on every PR |
| `@regression` | Full regression run | `test:regression` |
| `@production` | Safe on production (reads only) | Documentation; production runs exclude `@destructive` |
| `@auth` | Sign-in and registration | `test:auth` |
| `@mobile` | Phone layout | `chromium-mobile` project only |
| `@destructive` | Saves data | `test:destructive`; excluded from every production script and from CI |

Inventory today: 53 desktop tests, of which 30 are `@smoke` and 51 are `@production`.

## Signing in

- The sign-in and register specs on production only test **validation and error paths**: empty
  fields, malformed email, and an unknown `@example.com` account. None of them creates or signs in
  to a real account.
- `OSP-AUTH-009` signs in for real. It refuses production and needs `OSP_MEMBER_EMAIL` /
  `OSP_MEMBER_PASSWORD` for a QA member that exists on the dev server.
- There is no saved-session (`asMember`) fixture yet. Add one in `tests/fixtures/` when signed-in
  account specs are written; keep session files in the gitignored `.auth/` folder.

## Reports

| Output | Where | Open with |
| --- | --- | --- |
| HTML report | `playwright-report/` | `npm run report` |
| Screenshot, video, error context (failed tests) | `test-results/<test>/` | The HTML report, or the files directly |
| Trace (first retry) | `test-results/<test>/trace.zip` | `npx playwright show-trace <path>` |
| JUnit (CI) | `test-results/junit.xml` | CI test viewers |
| Blocked production writes | Test annotation `blocked-production-write` | The HTML report, test details |

## CI

Workflow: `.github/workflows/playwright.yml` (GitHub Actions, `ubuntu-latest`, Node 22, Chromium).

| Trigger | Runs |
| --- | --- |
| Pull request | `@smoke` on production, never `@destructive` |
| **Actions → Playwright E2E → Run workflow** | Pick `environment` (`production` / `dev`) and `suite` (`smoke` / `full` / `mobile`) |

Steps: `npm ci` → install Chromium → `npm run typecheck` → tests → upload `playwright-report/` and
`test-results/` as the `playwright-report` artifact (14 days).

Repository settings for `dev` runs and the member test (**Settings → Secrets and variables → Actions**):

| Name | Kind | Purpose |
| --- | --- | --- |
| `OSP_DEV_BASE_URL` | Variable | Dev storefront |
| `OSP_DEV_API_URL` | Variable | Dev API |
| `OSP_MEMBER_EMAIL` | Secret | QA member on the dev server |
| `OSP_MEMBER_PASSWORD` | Secret | Its password |

CI never sets `RUN_CART_E2E`, so `@destructive` tests skip there. With `CI` set, a pass on retry
still counts as passed; look for "flaky" in the report.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `This spec tried to write to production` + `POST /index.php/api/...` | A save-type call on production | Real write: tag `@destructive` and gate it. Read-only lookup sent as POST: add it to `productionWriteAllowlist` with a note (see [ARCHITECTURE.md](ARCHITECTURE.md#production-write-guard)) |
| `Console errors or failing OzStickerPrinting requests` | Page error or a 400+ response from a site host | New defect: report it. Known and reported: add to `knownIssues` with note and ticket |
| Click does nothing, then a timeout | Clicked before Nuxt finished loading | Use `gotoStorefront()` |
| `strict mode violation … resolved to 2 elements` | Locator matches several elements | Narrow by role/name, `.filter({ visible: true })`, or a container |
| Every test takes about a minute | Request routes not removed before the page closes | Keep `page.unrouteAll({ behavior: 'ignoreErrors' })` in the guard |
| Configurator summary shows the wrong product | Read before the page's own options loaded | Use `ProductConfigPage.open()`, which waits for the size inputs |
| Title/heading test fails after a site update | Wording changed | Confirm on the site, update `storefront-data.ts` |
| Price assertion fails during a sale | Fixed amounts | Compare prices with each other or with the listed row price, never fixed numbers |
| 403s or blocked pages | Firewall rate limit | `PW_WORKERS=1` |
| `Executable doesn't exist … ms-playwright` | Browsers missing for this Playwright version | `npx playwright install chromium` |
