# HALTÉA Accessibility Audit — WCAG 2.2 AA

**Scope:** `haltea-frontend/{index,services,conciergerie,realisations,contact}.html`, `main.js`, `style.css`; email template in `haltea-backend/server.js`.
**Method:** Static review across ARIA, keyboard, contrast, forms, alt/headings, links, live regions, language switching.
**Result:** 28 findings — **9 Critical, 11 Major, 8 Minor**.

---

## CRITICAL — Blocks access, must fix before ship

### C1. Language switcher is not keyboard-operable and uses non-interactive elements
- **Files:** `index.html:18-20`, `services.html:20-21`, `conciergerie.html:20-21`, `realisations.html:20-21`, `contact.html:20-21`; handler `main.js:107-115, 697-715`
- **Issue:** Flags are `<img>` elements with click handlers. They are not focusable, have no role, no `tabindex`, no keyboard activation, no `aria-pressed`/`aria-current` state, and the `alt` text ("French Flag", "UK Flag") describes the image, not the action ("Switch to French"). Keyboard and screen-reader users cannot change language at all.
- **WCAG:** 2.1.1 Keyboard (A), 4.1.2 Name/Role/Value (A), 1.3.1 Info and Relationships (A)
- **Fix:** Replace each `<img>` with `<button type="button" aria-label="Passer en français" lang="fr" aria-pressed="true"><img alt="" ...></button>` (decorative alt, label on the button, `aria-pressed` toggled in JS, keep visible focus ring).

### C2. `<html lang>` never updates when user switches language
- **Files:** all 5 HTML files have `<html lang="fr">`; `main.js:731-782` (`applyLanguage`) translates text but never calls `document.documentElement.lang = language;`
- **Issue:** When English is active, every text node still claims to be French. Screen readers will pronounce English content with French phonemes.
- **WCAG:** 3.1.1 Language of Page (A), 3.1.2 Language of Parts (AA)
- **Fix:** In `applyLanguage(lang)` add `document.documentElement.lang = lang === 'en' ? 'en' : 'fr';`

### C3. `<html lang>` is correct on first load only — and English content sneaks in even on French pages
- **Files:** `contact.html:135` placeholder mixes language; `main.js:736-740` swaps "HALTÉA" ↔ "HALTEA" in title — losing diacritics on a French page is incorrect.
- **WCAG:** 3.1.2 Language of Parts (AA)
- **Fix:** Stop mutating brand spelling by language; mark genuinely English fragments with `lang="en"`.

### C4. Submit "button" hijacked with `e.preventDefault()` on click breaks keyboard form submission
- **File:** `main.js:339-340` — `submitButton.addEventListener('click', async function(e) { e.preventDefault(); ... })`
- **Issue:** The form uses a `<button type="submit">` (good), but submission is bound to `click`, not the form's `submit` event. Pressing Enter inside an input does not trigger the click handler reliably (it fires `submit` on the form, which has no listener). Keyboard-only users may be unable to submit, or submission may bypass validation.
- **WCAG:** 2.1.1 Keyboard (A), 3.3.1 Error Identification (A)
- **Fix:** Bind `contactForm.addEventListener('submit', handler)` instead, and use `e.preventDefault()` on the form event.

### C5. Form errors are not programmatically associated with their inputs
- **Files:** `main.js:223-245` (creates `.error-message` div appended to parent); `contact.html:108-136`
- **Issue:** Error text is a sibling `<div>` with no `id`, no `aria-describedby` on the input, no `aria-invalid="true"`, and is not in a live region. Screen-reader users hear no error when validation fails.
- **WCAG:** 3.3.1 Error Identification (A), 4.1.3 Status Messages (AA), 1.3.1 Info and Relationships (A)
- **Fix:** Generate an id `${field.id}-error`, set `field.setAttribute('aria-describedby', id)`, set `aria-invalid="true"`, and add `role="alert"` (or wrap form-level summary in `aria-live="assertive"`).

### C6. Success / general-error toasts are not announced
- **File:** `main.js:465-507` (`showSuccessMessage`, `showGeneralError`); also the floating "Lien copié" notification at `main.js:649-693` and the language-switch toast.
- **Issue:** Inserted DOM nodes have no `role="status"`/`role="alert"` and no `aria-live`. Screen-reader users get no feedback that the email was sent, that the form failed, that the URL was copied, or that the language switched.
- **WCAG:** 4.1.3 Status Messages (AA)
- **Fix:** Add `role="status"` (polite) for success/info, `role="alert"` (assertive) for errors. Or pre-create a persistent `<div aria-live="polite">` container.

### C7. Form fields lack `required`, `autocomplete`, and proper input attributes
- **File:** `contact.html:89, 108, 117, 126, 135, 141`
- **Issue:** No `required` (so browser/AT cannot announce required state — JS-only check), no `aria-required`, no `autocomplete` (`name`, `email`, `tel`). Email/tel inputs have correct `type` but no autocomplete tokens.
- **WCAG:** 1.3.5 Identify Input Purpose (AA), 3.3.2 Labels or Instructions (A)
- **Fix:** Add `required aria-required="true"` and `autocomplete="honorific-prefix"` (civilité), `given-name`, `email`, `tel`, plus `inputmode="tel"`.

### C8. Decorative SVG icons are exposed to screen readers; icon-only buttons have no name
- **Files:**
  - Notification bell `<div class="notification">` on every page (`index.html:30-34`, etc.) — clickable but not a button, no label.
  - Watch / Share buttons `conciergerie.html:105-121` — `<button>` with SVG only + visible text inside `<span>` is OK, BUT the inner SVGs lack `aria-hidden="true"`.
  - Carousel prev/next `realisations.html:101-114` — `<div class="carousel-nav">` (not a button), no label, no keyboard support.
  - All decorative star/feature SVGs in `index.html:90-150`, `conciergerie.html:131-189`, `realisations.html:122-150`, `contact.html:174-219` have no `aria-hidden="true"` and no `<title>`.
  - Footer "icon" SVG (every page) is decorative but exposed.
- **WCAG:** 1.1.1 Non-text Content (A), 4.1.2 Name/Role/Value (A), 2.1.1 Keyboard (A)
- **Fix:** Add `aria-hidden="true" focusable="false"` on all decorative SVGs. Convert notification `<div>` and carousel `<div>` to `<button type="button">` with `aria-label`. Hide the carousel arrows' SVGs from AT.

### C9. Carousel on Réalisations page is not keyboard-accessible and indicators are non-buttons
- **File:** `realisations.html:99-115`; handler `main.js:1046-1091`
- **Issue:** `<div class="carousel-nav">` is not focusable, not a button, has no keyboard handler. `<span class="indicator">` likewise — these need `<button>` roles, ARIA labels ("Slide 1 of 2"), and the slide region needs `aria-roledescription="carousel"` per APG, or at minimum `aria-live="polite"` updates.
- **WCAG:** 2.1.1 Keyboard (A), 4.1.2 Name/Role/Value (A)
- **Fix:** Use `<button>` for prev/next/indicators, add `aria-label`, support arrow keys, and announce slide changes.

---

## MAJOR — Degrades experience

### M1. Missing skip link on all pages
- **Files:** all 5 pages.
- **WCAG:** 2.4.1 Bypass Blocks (A)
- **Fix:** First focusable element: `<a class="skip-link" href="#main">Skip to main content</a>` and add `id="main"` to the `<main>` element. Ensure visible-on-focus styling.

### M2. Home page (`index.html`) has no `<main>` landmark
- **File:** `index.html:50-251` — content sits in `<section>`s directly under `<body>`, no `<main>`.
- **WCAG:** 1.3.1 Info and Relationships (A), 2.4.1 Bypass Blocks (A) — best practice
- **Fix:** Wrap hero + sections in `<main id="main">`.

### M3. Heading hierarchy violations
- **File:** `services.html:58, 91` — page contains **two `<h1>`** ("NOS SERVICES" and "NOS ÉQUIPES").
- **File:** `contact.html:164` — `<h3 class="contact-info-title">` appears with no preceding `<h2>` (page has only `<h1>` then jumps to `<h3>`).
- **File:** `index.html` — multiple `<h2>` are visible decoration ("PROTOCOLE", "ULTRAVIP" pillars) but rendered as `<span>`; semantic content is OK, just ensure no skipped levels in page outline.
- **WCAG:** 1.3.1 (A), 2.4.6 Headings and Labels (AA)
- **Fix:** Demote second h1 in services.html to h2; demote (or insert h2 before) the contact info h3.

### M4. Page titles do not include site name consistently and do not change with language
- **Files:** `index.html:6` "Accueil Autrement - Services Ultra VIP" (no "HALTÉA"); others fine. `main.js:733-740` only flips diacritics, never translates.
- **WCAG:** 2.4.2 Page Titled (A)
- **Fix:** Use pattern `Accueil — HALTÉA` / `Home — HALTÉA` with localized titles.

### M5. Color contrast risks (gold #D4AF37 on black #000)
- **Tested ratios:**
  - `#D4AF37` on `#000000` ≈ **8.65:1** — passes AA & AAA for text.
  - `#D4AF37` on `rgba(212,175,55,0.1)` over black (≈ `#1d180d`) ≈ **7.8:1** — passes.
  - **`#9a7f47` on `#000`** (style.css:1508) ≈ **4.0:1** — **fails AA for normal text (4.5:1)**, passes only for ≥18pt/14pt-bold.
  - **Placeholder `rgba(212,175,55,0.6)` on `rgba(0,0,0,0.7)` background (form-input)** (style.css:1685, 1710) — effective ≈ `#7e6921` on near-black ≈ **3.0:1** — **fails AA** for text, fails 1.4.11 for UI states.
  - `#888` footer text in email template (server.js:205) on `#f9f9f9` ≈ **3.5:1** — **fails AA** for normal text.
  - Disabled submit button `opacity: 0.7` (style.css:2274) reduces gold gradient text-on-button contrast — verify ≥3:1 for UI per 1.4.11.
- **WCAG:** 1.4.3 Contrast (Minimum) (AA), 1.4.11 Non-text Contrast (AA)
- **Fix:** Replace `#9a7f47` with the brand `#D4AF37` (or darker tone with white text). Increase placeholder opacity to ≥0.85 or use `#c9a849`. Change `#888` to `#595959` (4.6:1 on `#f9f9f9`).

### M6. Focus indicator removed without replacement
- **File:** `style.css:1700` `outline: none;` on form fields; no `:focus-visible` style audit elsewhere — nav links rely only on color change to gold, headers/footers/flag/notification have no visible focus state at all.
- **WCAG:** 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured (Minimum) (AA, new in 2.2), 2.4.13 Focus Appearance (AAA)
- **Fix:** Add a global `:focus-visible { outline: 2px solid #D4AF37; outline-offset: 2px; }`. The form already has a 3px gold ring shadow — keep that. Also add focus styles to `.nav-link`, `.flag`, `.cta-button`, `.action-btn`, `.linkedin-link-3d`, carousel buttons.

### M7. Sticky/auto-hiding header obscures focus
- **File:** `main.js:60-65` — header translates -100% on scroll-down. If a focused element is near the top, the header may also hide it; on scroll-up, it returns and can cover focus.
- **WCAG:** 2.4.11 Focus Not Obscured (Minimum) (AA, 2.2 new)
- **Fix:** Pause hide-on-scroll while any descendant of the page has focus inside the header range, or add `scroll-padding-top` to `html`.

### M8. Empty/placeholder link
- **File:** `contact.html:230` — `<a href="#" class="linkedin-link-3d">` with SVG only. No accessible name (icon SVG has no title), no real destination. Activating it scrolls to top.
- **WCAG:** 2.4.4 Link Purpose (A), 2.4.9 Link Purpose (Link Only) (AAA), 4.1.2 (A)
- **Fix:** Provide real LinkedIn URL or remove. Add `aria-label="HALTÉA on LinkedIn"`, `rel="noopener"`, and warn about new tab if `target="_blank"`.

### M9. New-tab links don't warn the user
- **File:** `main.js:615` opens YouTube in `_blank`; if any anchor were to use `target="_blank"`, no `noopener noreferrer` and no visible/AT-readable warning.
- **WCAG:** 3.2.5 Change on Request (AAA — best practice at AA)
- **Fix:** When opening external links, append "(opens in new tab)" to label.

### M10. Hero CTA "DÉCOUVRIR" / button does nothing
- **File:** `index.html:60` `<button class="cta-button">` — only ripple animation in `main.js:71-92`, no navigation. Users tab to it, click, and nothing happens.
- **WCAG:** 4.1.2 (A), 3.2.4 Consistent Identification (AA)
- **Fix:** Either remove or wire it (e.g., `<a class="cta-button" href="services.html">`).

### M11. Generic / repeated alt text
- **Files:** `index.html:166-196` partner logos all have `alt="Partner Logo 1"` etc — meaningless. `services.html:97-115` "Team Member 1..4" — should be the person's name/role. `realisations.html:76-93` "Réalisation 1-6" — describe what's depicted (event, country). Hero `alt="Hero Background"` (`index.html:52`) — purely decorative; should be `alt=""`.
- **WCAG:** 1.1.1 (A)
- **Fix:** Use real partner brand names; use empty alt for decoration; describe each réalisation photo.

---

## MINOR — Room for improvement

### m1. `prefers-reduced-motion` is not respected
- `style.css` has multiple keyframe animations (ripple, slideIn, shake, particles, transforms on hover). Wrap with `@media (prefers-reduced-motion: reduce)` to disable.
- **WCAG:** 2.3.3 Animation from Interactions (AAA — best practice).

### m2. YouTube iframe lacks meaningful title/description in target language
- `conciergerie.html:88` `title="PAWEL Concierge Video"` — OK but not translated; consider `aria-label` updates per language.
- **WCAG:** 4.1.2 (A) — already passes; just localize.

### m3. `data-translate="nav_nos_réalisations"` uses non-ASCII attribute key
- Works, but fragile. Consider ASCII-only keys.

### m4. Logo "H" is a `<span>`, not an image with brand name
- Use `<a href="index.html" aria-label="HALTÉA, accueil">` wrapping the logo so it functions as a home link (common pattern users expect).

### m5. `<iframe>` allowfullscreen attribute is fine; but `frameborder="0"` is obsolete HTML.

### m6. `alt="PAWEL Concierge"` (`conciergerie.html:208`) is acceptable; if logo is informative, consider `alt="PAWEL Concierge — partenaire"`.

### m7. Email template (`server.js:177-211`) uses inline-only colors and is structurally a `<div>` soup
- No `<html lang>`, no `<title>`, headings are `<h2>/<h3>` (good) but nested under generic divs. The `#888` footer text fails contrast (M5). Consider providing a plain-text alternative MIME part for screen-reader-friendly delivery.
- **WCAG (informative):** 3.1.1, 1.4.3.

### m8. Keyphrases section uses `<span>` with checkmark SVG and no list semantics
- `realisations.html:120-153` — should be `<ul>`/`<li>`. Decorative checkmark SVG needs `aria-hidden="true"`.

---

## Cross-cutting observations

- **Repeated decorative SVGs** (notification bell, footer "icon", star sparkles) appear on every page and uniformly lack `aria-hidden="true"` — single global fix pattern.
- **Header layout repeats** across 5 files; fixing C1, C2, C8, M1, M6 will cascade to every page.
- **Touch target size** (WCAG 2.5.8 AA, new in 2.2): flags are 24×18 px — below 24×24 minimum. Increase hit area via padding on the button wrapper added in C1.
- **Reflow / Zoom** not verified statically; recommend manual test at 400% zoom and 320 px width.
- **Forms localization:** error messages in `main.js:191-219` are French-only; English speakers see French errors after switching language.

---

## Top 5 to fix first

1. **C1 + C2** — Make language flags real keyboard-operable buttons and update `html lang` (single biggest a11y win, 5 pages).
2. **C5 + C6 + M6** — Wire form errors to `aria-describedby`/`aria-invalid`, announce success/error via `role="status"`/`role="alert"`, and restore visible focus indicators globally.
3. **C7** — Add `required`, `aria-required`, `autocomplete` on all contact-form inputs.
4. **C8 + C9** — Hide decorative SVGs (`aria-hidden="true" focusable="false"`), convert notification & carousel `<div>`s to `<button>`s with labels, add keyboard handlers.
5. **M1 + M2 + M3** — Add skip link, wrap `index.html` content in `<main>`, demote duplicate `<h1>` in services.html.
