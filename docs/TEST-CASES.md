# Test cases

Every automated case, grouped by module. **Env**: `P` = runs on production (read-only);
`Dev` = refuses production and runs only on a dev server, with the precondition shown.

Totals: 55 cases (53 desktop, 2 mobile). Last full run 2026-11-17 on production: desktop 51 passed,
2 skipped by design; mobile 2 passed.

## NAV: Public pages

Spec `tests/e2e/navigation/public-pages.spec.ts`, suite **Public pages**, tags `@smoke @regression @production`.
Steps for each: open the path → check HTTP 200, the page title and the first H1.

| ID | Path | Expected H1 | Title contains | Env |
| --- | --- | --- | --- | --- |
| OSP-NAV-001 | `/` | Custom Stickers Made for You | Custom Stickers | P |
| OSP-NAV-002 | `/stickers` | Stickers | Stickers Australia | P |
| OSP-NAV-003 | `/stickers/die-cut` | Die Cut Stickers | Die Cut Stickers | P |
| OSP-NAV-004 | `/stickers/kiss-cut` | Kiss Cut Stickers | Kiss-Cut Stickers | P |
| OSP-NAV-005 | `/stickers/sheet` | Sticker Sheets | Sticker Sheets | P |
| OSP-NAV-006 | `/stickers/roll` | Roll Stickers | Roll Stickers | P |
| OSP-NAV-007 | `/stickers/vinyl/transparent` | Transparent Stickers | Transparent Stickers | P |
| OSP-NAV-008 | `/stickers/special/hologram` | Hologram Stickers | Holographic Stickers | P |
| OSP-NAV-009 | `/business-cards/standard-business-card` | Standard Business Cards | Business Cards | P |
| OSP-NAV-010 | `/badges/button-badge` | Button Badges | Button Badges | P |
| OSP-NAV-011 | `/magnets/custom-magnet` | Custom Magnets | Custom Magnets | P |
| OSP-NAV-012 | `/swing-tags` | Swing Tags | Swing Tags | P |
| OSP-NAV-013 | `/sample-pack` | Sticker Sample Pack | Sticker Samples | P |
| OSP-NAV-014 | `/vinyl-lettering-designer` | Vinyl Lettering Designer | Vinyl Lettering | P |
| OSP-NAV-015 | `/about` | Who We Are | About OzStickerPrinting | P |
| OSP-NAV-016 | `/user-guide/faq` | FAQ | Frequently Asked Questions | P |
| OSP-NAV-017 | `/user-guide/artwork-guide` | Artwork Guide | Artwork Guide | P |
| OSP-NAV-018 | `/blog` | Blogs | Blog | P |
| OSP-NAV-019 | `/sitemap` | Site Map | Sitemap | P |
| OSP-NAV-020 | `/terms-and-condition` | Terms and Conditions | Terms | P |
| OSP-NAV-021 | `/privacy-policy` | Privacy Policy | Privacy Policy | P |

## HDR: Header navigation

Spec `tests/e2e/navigation/header.spec.ts`, suite **Header navigation**, tags `@smoke @regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-HDR-001 | Home → click **STICKERS** | URL `/stickers`; H1 "Stickers" | P |
| OSP-HDR-002 | Home → click **BUSINESS CARD** | URL `/business-cards`; H1 contains "Business Card" | P |
| OSP-HDR-003 | Home → click **BADGES & MAGNETS** | URL `/badges-and-magnets`; H1 contains "Badges" | P |
| OSP-HDR-004 | Home → click **GET SAMPLES** | URL `/sample-pack`; H1 "Sticker Sample Pack" | P |
| OSP-HDR-005 | Open `/about` → click the logo | URL `/` | P |
| OSP-HDR-006 | Home as guest → check cart badge → click cart icon | Badge "0"; dropdown visible with "There are no items in the cart." | P |

## FTR: Footer

Spec `tests/e2e/navigation/footer.spec.ts`, suite **Footer**, tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-FTR-001 | Home → for Die Cut Stickers, Standard Business Card, About Us, FAQ, Artwork Guide, Terms of Service, Privacy Policy: read `href`, request it | Each `href` is the expected path and returns 200 | P |
| OSP-FTR-002 | Home → find the contact email link | `href` is `mailto:info@ozstickerprinting.com` | P |
| OSP-FTR-003 | Home → click footer **FAQ** | URL `/user-guide/faq`; H1 "FAQ" | P |

## SRCH: Search

Spec `tests/e2e/search/header-search.spec.ts`, suite **Header search**, tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-SRCH-001 `@smoke` | Home → search icon → type "hologram" | Products section shows a "Hologram Stickers" link | P |
| OSP-SRCH-002 | Same → click the suggestion | URL `/stickers/special/hologram`; H1 contains "Hologram" | P |
| OSP-SRCH-003 | Home → search icon → type "zzqqxx-no-such-product" | "No matches found." twice (Products, Uses); no result links | P |

## AUTH: Sign-in & registration

Specs `tests/e2e/auth/sign-in.spec.ts` (suites **Sign in modal**, **Register modal**, tags
`@auth @regression @production`) and `tests/e2e/auth/member-sign-in.spec.ts` (suite **Member sign in**,
tags `@auth @regression`).

Common start for 001–007: Home → account icon → **Sign in to Account** → modal "Sign In to your account".

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-AUTH-001 `@smoke` | Look at the modal | Member tab selected; Email Address and Password (masked) fields; Sign In, Login with Facebook, Login with Google buttons | P |
| OSP-AUTH-002 | Click **Sign In** with both fields empty | "Email address is required. Please try again." and "Password is required. Please try again." | P |
| OSP-AUTH-003 | Email `not-an-email` → **Sign In** | "Please enter a valid email." | P |
| OSP-AUTH-004 | Email `qa-e2e-nobody@example.com`, password `WrongPass123!` → **Sign In** | `soft-login` returns `status: FAIL`; "Your email address and password do not match."; modal stays open | P |
| OSP-AUTH-005 | Type a password → click the eye icon | Password input type becomes `text` | P |
| OSP-AUTH-006 | Click **Non-member** | Email Address, Order Number, "Check Your Order"; no password field | P |
| OSP-AUTH-007 | Click × | Modal closes | P |
| OSP-AUTH-008 | Account icon → **Register** → submit empty | "New Member Registration"; required errors for First Name, Last Name, Email Address, Password | P |
| OSP-AUTH-009 | Sign in with the `.env` QA member | Modal closes; account menu no longer offers "Sign in to Account" | Dev + `OSP_MEMBER_EMAIL`/`PASSWORD` |

## CFG: Product configuration & pricing

Spec `tests/e2e/configuration/die-cut-configurator.spec.ts`, suite **Die cut configurator**, tags
`@regression @production`. Start for each: open `/stickers/die-cut`. These tests never click Add to Cart.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-CFG-001 `@smoke` | Look at the defaults | H1 "Die Cut Stickers"; summary "Die Cut / Square / 30x30mm / Gloss / Normal / Qty : 100"; width and height 30; price > $0; Add to Cart enabled | P |
| OSP-CFG-002 | Choose finish **Matte** | Summary contains "/ Matte /" | P |
| OSP-CFG-003 | Note price → choose quantity **200** | Summary "Qty : 200"; price higher than before | P |
| OSP-CFG-004 | Click **See More** → pick **1000** | List has 300, 400, 500, 1000, 5000, 10000, "Custom Quantity" last; summary "Qty : 1000"; total equals the price shown in the 1000 row | P |
| OSP-CFG-005 | Width 50 → Tab | Summary contains "Rectangle / 50x30mm" | P |
| OSP-CFG-006 | Width 5 → Tab | "* Width or height must not be below 30x30mm for Die Cut." | P |
| OSP-CFG-007 | Width 2000 → Tab | "* For special sizes, request a quote from the button below."; Add to Cart hidden | P |
| OSP-CFG-008 | Choose material **Kraft Paper** | Summary still starts "Die Cut /"; price > $0; Add to Cart enabled | P |

## CRT: Cart

Spec `tests/e2e/cart/cart.spec.ts`, suites **Cart page** (`@regression @production`) and
**Add to cart** (`@destructive @regression`).

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-CRT-001 | Open `/cart` as guest | H1 "Cart (0)" | P |
| OSP-CRT-002 | Open die cut page → **Add to Cart** → "Skip & upload artwork later" → open `/cart` | Upload Artwork dialog appears; cart badge "1"; cart H1 "Cart (n)"; the configured item is listed | Dev + `RUN_CART_E2E=true` |

## UX: Errors

Spec `tests/e2e/ux/error-pages.spec.ts`, suite **Error pages**, tags `@regression @production`.

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-UX-001 | Open `/qa-e2e-this-page-does-not-exist` | HTTP 404; title "Page Not Found"; H1 "Page not Found" | P |

## MOB: Mobile layout

Spec `tests/e2e/ux/mobile.spec.ts`, suite **Mobile layout**, tags `@mobile @smoke @production`.
Project `chromium-mobile` (Pixel 7).

| ID | Steps | Expected result | Env |
| --- | --- | --- | --- |
| OSP-MOB-001 | Open home | Page width ≤ viewport (no horizontal scroll) | P |
| OSP-MOB-002 | Tap the menu icon → tap **STICKERS** | Menu shows STICKERS; URL `/stickers` | P |

## Planned

Not automated yet. Each will get the next ID in its module.

- Other configurators: kiss cut, sheet, roll, transparent, hologram, business cards, badges, magnets, swing tags.
- Sample pack ordering, vinyl lettering designer.
- Cart editing and removal, artwork upload, guest checkout up to payment (dev only).
- Member account pages and guest order lookup with a real order (dev only).
- Accessibility (axe) checks like Musticker's `MS-UX` cases.
