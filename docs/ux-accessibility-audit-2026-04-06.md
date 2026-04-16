# ManaTuner -- Comprehensive UX and Accessibility Audit

**Date:** 2026-04-06  
**Auditor:** UX Designer (Claude Agent)  
**Version audited:** v2.2.0 (commit ea7d6a3)  
**Scope:** Full site -- Home, Analyzer, Guide, Mathematics, Land Glossary, plus source code review  
**Standards:** WCAG 2.1 AA, Material Design 3, MTG Player Personas (Leo through David)

---

## EXECUTIVE SUMMARY

ManaTuner is a well-crafted MTG manabase analyzer with strong visual identity, solid mathematical foundations, and a clear value proposition. The site demonstrates genuine care for users with features like onboarding tours, themed loading states, and privacy-first architecture. However, the audit reveals significant accessibility gaps (particularly around skip navigation, heading hierarchy, and ARIA labeling), inconsistencies in dark mode contrast, and several interaction patterns that create friction for both novice and expert users.

**Overall Score: 3.6 / 5**

| Category                    | Score   | Priority |
| --------------------------- | ------- | -------- |
| 1. Information Architecture | 3.5 / 5 | Medium   |
| 2. User Flow                | 3.8 / 5 | Medium   |
| 3. Accessibility (WCAG 2.1) | 2.5 / 5 | CRITICAL |
| 4. Responsive Design        | 4.0 / 5 | Low      |
| 5. Visual Hierarchy         | 4.0 / 5 | Low      |
| 6. Interaction Design       | 3.5 / 5 | Medium   |
| 7. Onboarding               | 3.8 / 5 | Medium   |
| 8. Dark/Light Mode          | 3.5 / 5 | Medium   |
| 9. Internationalization     | 2.0 / 5 | Low      |
| 10. Cognitive Load          | 3.5 / 5 | Medium   |

---

## 1. INFORMATION ARCHITECTURE (Score: 3.5 / 5)

### What Works Well

- **Clear navigation structure.** The header provides 6 well-labeled nav items (Home, Analyzer, My Analyses, Guide, Mathematics, About) with descriptive icons. The golden CTA on "Analyzer" correctly draws attention to the primary action.
- **Logical page hierarchy.** Home (value prop) -> Analyzer (tool) -> Guide (help) -> Mathematics (depth) is a sensible funnel.
- **Footer attribution is thorough.** Fan Content Policy, Frank Karsten credit, Scryfall API credit, and GitHub link are all present and properly attributed.

### Issues Found

**IA-1: Land Glossary is hidden from main navigation (Severity: Medium)**  
The Land Glossary page (`/land-glossary`) exists as a route but is NOT included in `navItems` in `Header.tsx`. Users can only reach it through the Home page footer links or by guessing the URL. This is a significant findability issue for a page that contains high-value educational content.

**IA-2: "My Analyses" route duplication creates confusion (Severity: Low)**  
Two routes point to the same page: `/my-analyses` and `/mes-analyses`. While internationalization-friendly, having a French alias without a full i18n strategy creates an inconsistent pattern. If a user bookmarks the French URL and shares it with an English-speaking friend, context is lost.

**IA-3: No breadcrumb or "you are here" indicator on subpages (Severity: Low)**  
While the Header shows active state on nav buttons, subpages like Land Glossary and About have no breadcrumb trail. The Land Glossary page has a "Back" button that uses `navigate(-1)`, which is unreliable (it could go back to a completely different site if the user arrived directly).

**IA-4: Privacy page is only in footer, not in navigation (Severity: Low)**  
For a privacy-first application, the Privacy page should be more discoverable, especially given that GDPR compliance typically requires prominent placement.

### Recommendations

1. Add Land Glossary to the main navigation, possibly as a dropdown under "Guide" or as its own nav item.
2. Replace `navigate(-1)` back buttons with explicit `navigate('/guide')` or a breadcrumb component.
3. Consider a secondary "Resources" dropdown grouping Guide, Mathematics, Land Glossary, and About.

---

## 2. USER FLOW (Score: 3.8 / 5)

### What Works Well

- **Home -> Analyzer flow is excellent.** Multiple CTAs ("Analyze My Deck", "Start Now - Free") with prefetch on hover for the Analyzer page. The 3-step "How It Works" section clearly communicates the process.
- **Sample deck loading is a strong feature.** The "Example" button in DeckInputSection eliminates the cold-start problem. Users can see results immediately.
- **Auto-minimize deck on mobile after analysis** shows thoughtful responsive design thinking.
- **Auto-save to localStorage** means no work is ever lost.

### Issues Found

**UF-1: Analyzer page header disappears completely after analysis (Severity: Medium)**  
When `analysisResult` exists, the entire header section (title, subtitle, feature tags) is hidden with a conditional render (`!analysisResult && ...`). This removes all context about what the page does. A first-time user who bookmarked the analyzer URL and returns after an analysis sees no page title or description.

**UF-2: "Edit Deck" chip is not obviously clickable (Severity: Medium)**  
The minimized deck bar shows an "Edit Deck" chip, but the entire Paper component is also clickable. The chip uses emoji ("pen" emoji) instead of a proper edit icon, which is inconsistent with the MUI icon language used everywhere else.

**UF-3: No way to directly re-analyze after editing (Severity: Low)**  
When the deck is minimized and the user clicks to expand, they see the deck editor but must scroll down and click "Analyze Manabase" again. There is no "Re-analyze" shortcut in the minimized bar.

**UF-4: Tab navigation in results lacks visual connection to content (Severity: Low)**  
The 6 analysis tabs (Dashboard, Castability, Mulligan, Analysis, Manabase, Blueprint) are scrollable but there is no indication of how many tabs exist or that scrolling reveals more. The "Blueprint NEW" badge helps, but first-time users may not discover tabs 4-6.

**UF-5: No dead-end recovery on empty results (Severity: Low)**  
The empty state on the results panel says 'Enter your deck and click "Analyze" to see results' but does not offer a direct link/button to load the sample deck. This is a missed opportunity.

### Recommendations

1. Keep a minimal page context bar visible even after analysis (e.g., "ManaTuner Analyzer" breadcrumb).
2. Add a "Re-analyze" button to the minimized deck bar.
3. Add a "Try with sample deck" button in the empty results state.
4. Add tab count indicator (e.g., "1/6") or dots for mobile tab scrolling.

---

## 3. ACCESSIBILITY -- WCAG 2.1 (Score: 2.5 / 5) -- CRITICAL

This is the most significant area needing improvement.

### What Works Well

- **`<html lang="en">`** is correctly set in `index.html`.
- **Viewport meta** allows user scaling: `maximum-scale=5.0, user-scalable=yes`.
- **`component="main"` on the content area** in App.tsx provides a proper landmark.
- **`component="footer"` on Footer.tsx** provides a proper footer landmark.
- **AppBar serves as header landmark** implicitly through MUI.
- **TabPanel has proper ARIA attributes:** `role="tabpanel"`, `id`, and `aria-labelledby`.
- **Tab elements have `aria-label` descriptions** (e.g., "Dashboard - Overview and health score").
- **Focus-visible styles** are defined in CSS (`outline: 2px solid #1976d2`).
- **`prefers-reduced-motion: reduce`** is handled in multiple CSS files, disabling animations.
- **`prefers-contrast: high`** has basic support.
- **`.sr-only` utility class** is defined (though rarely used).
- **Touch targets:** Buttons have `min-height: 44px; min-width: 44px` on mobile, meeting WCAG 2.5.5.
- **iOS zoom prevention:** Input font-size is set to 16px on mobile to prevent unwanted zoom.

### Critical Issues

**A11Y-1: NO SKIP NAVIGATION LINK (WCAG 2.4.1 -- Level A FAIL)**  
There is zero skip-navigation implementation across the entire codebase. A search for "skip" returned no results. Screen reader and keyboard users must tab through the entire header navigation (6+ items + theme toggle + GitHub link + potentially mobile menu) on every page load before reaching content.

**A11Y-2: Mana icon symbols have NO accessible text (WCAG 1.1.1 -- Level A FAIL)**  
The `ManaSymbol` component renders `<i className="ms ms-w ms-cost">` with no `aria-label`, `aria-hidden`, or `title` attribute. These decorative font icons appear in:

- Header (WUBRG bar) -- 5 instances
- HomePage hero -- 5 instances
- FloatingManaSymbols -- 7 instances per page (on every page)
- Feature cards
- Loading states

Screen readers will attempt to read these as text or icon fonts, producing gibberish. The ONLY exception is on the HomePage chips where `aria-label="Blue mana"` and `role="img"` are correctly applied to 3 chip icons. This inconsistency confirms awareness of the issue but incomplete implementation.

**A11Y-3: Heading hierarchy is broken across pages (WCAG 1.3.1 -- Level A FAIL)**

- **HomePage:** h1 "Can You Cast Your Spells On Curve?" is correct, but the next heading level jumps to h4 "Rigorous Mathematics" and then h4 "What You Get". There is no h2 or h3.
- **AnalyzerPage:** Uses h3/h4 for the page title via `variant="h3" component="h1"` which is correct for visual sizing, but subsequent headings do not follow logical order.
- **GuidePage:** h1 present, then jumps to h4 "The 5 Analysis Tabs", then h4 "Step-by-Step Guide". Missing h2/h3 levels.
- **MathematicsPage:** Same pattern -- h1, then h4.
- **LandGlossaryPage:** h1 present, then h5 within cards. Gap of 3 heading levels.

**A11Y-4: Color alone conveys information (WCAG 1.4.1 -- Level A FAIL)**  
Multiple components use color as the sole indicator of meaning:

- Health Score percentages (green/yellow/red) in the Guide page without text labels explaining severity
- Reliability indicators in CSS (`.reliability-excellent` through `.reliability-poor`) rely on color alone
- The ranking system in Land Glossary uses gold/silver/bronze colors without redundant text indicators

**A11Y-5: Logo/brand is not a link and has no text alternative (Severity: High)**  
In `Header.tsx`, the logo area uses `onClick={() => navigate('/')}` on a Box with no `role="link"`, no `tabIndex`, and no `aria-label`. Keyboard users cannot navigate to it. The ManaBar symbols within it are purely decorative but not marked as such.

### Major Issues

**A11Y-6: Floating decorative elements are not hidden from assistive technology (Severity: Medium)**  
`FloatingManaSymbols` renders 7 animated mana icon elements across the page. While `pointerEvents: 'none'` prevents mouse interaction, there is no `aria-hidden="true"` on the container, meaning screen readers will traverse these meaningless elements.

**A11Y-7: Theme toggle notification uses French text (Severity: Medium)**  
In `NotificationProvider.tsx` line 79: `showNotification('Theme ${!isDark ? 'sombre' : 'clair'} active')`. The notification language switches to French while the entire UI is English. This is confusing for all users and particularly problematic for screen readers that may switch language pronunciation.

**A11Y-8: Onboarding tour targets may not be keyboard accessible (Severity: Medium)**  
The react-joyride onboarding targets elements by CSS selectors (`textarea[placeholder*="Paste your decklist"]`, `button[class*="MuiButton"]`). While react-joyride itself handles keyboard, the beacon-less first step may be disorienting for screen reader users who suddenly have a tooltip overlay.

**A11Y-9: AnimatedButton component uses Box instead of button (Severity: Medium)**  
`AnimatedButton` in `AnimatedContainer.tsx` renders a clickable `<Box>` with `onClick` but no `role="button"`, no `tabIndex`, and no keyboard event handler. This is an interactive element that is completely invisible to keyboard and assistive technology users.

**A11Y-10: Card image tooltips are hover-only (Severity: Medium)**  
`CardImageTooltip` uses `onMouseEnter`/`onMouseLeave` handlers on a `<span>`. There is no `onFocus`/`onBlur` handler, making card preview images completely inaccessible to keyboard users.

### Minor Issues

**A11Y-11: Table in Mathematics page lacks proper caption (Severity: Low)**  
The Karsten Table has no `<caption>` element or `aria-label` on the TableContainer.

**A11Y-12: Accordion elements lack explicit aria-controls (Severity: Low)**  
MUI Accordions handle this internally, but custom IDs would improve debugging and testing.

**A11Y-13: Print styles hide ALL buttons (Severity: Low)**  
The print CSS hides all `button` elements, which means print previews of results lose important context labels.

### Recommendations (Priority Order)

1. **IMMEDIATE:** Add skip navigation link: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` before the Header in App.tsx.
2. **IMMEDIATE:** Add `aria-hidden="true"` to all decorative ManaSymbol instances and FloatingManaSymbols container.
3. **IMMEDIATE:** Fix the logo to be a proper `<a>` link with `aria-label="ManaTuner home"`.
4. **HIGH:** Establish proper heading hierarchy on all pages (h1 -> h2 -> h3, no skipping).
5. **HIGH:** Add text alternatives alongside color indicators (e.g., "Excellent" badge next to green score).
6. **MEDIUM:** Add `onFocus`/`onBlur` to CardImageTooltip.
7. **MEDIUM:** Fix the French notification text in theme toggle.

---

## 4. RESPONSIVE DESIGN (Score: 4.0 / 5)

### What Works Well

- **Comprehensive mobile handling.** The codebase uses `useMediaQuery` extensively with 3 breakpoint tiers: `isSmallMobile` (375px), `isMobile` (sm breakpoint), and desktop.
- **iOS-specific fixes are present:** Input font-size 16px prevents zoom, `-webkit-text-size-adjust: 100%` is set.
- **Tables are horizontally scrollable** with `-webkit-overflow-scrolling: touch`.
- **Flexible grid layouts.** All pages use MUI Grid with xs/sm/md/lg breakpoints.
- **Touch targets meet 44x44px minimum** on mobile.
- **Mobile drawer navigation** with close button, theme toggle, and full nav items.
- **Tab scrolling** with `variant="scrollable"` and `allowScrollButtonsMobile` in the Analyzer.

### Issues Found

**RD-1: `max-width: 100vw !important` on all elements at 480px is overly aggressive (Severity: Medium)**  
In `index.css` line 121-125: `* { max-width: 100vw !important; }` at 480px breakpoint. This uses `!important` on the universal selector, which can cause unexpected clipping of absolutely positioned elements, tooltips, and drawers.

**RD-2: Container padding is very tight on mobile (Severity: Low)**  
At 600px breakpoint, Container padding is reduced to 8px. Combined with Paper margin of 4px, content sits very close to screen edges. The Analyzer page compounds this with `px: 0.5` (4px) on `isSmallMobile`.

**RD-3: MUI Container max-width override may break layouts (Severity: Low)**  
In `index.css`: `.MuiContainer-root { width: 100% !important; max-width: 100% !important; }` effectively disables MUI's built-in max-width containment, potentially causing readability issues on very wide screens where line lengths become excessive.

**RD-4: Land Glossary cards use `translateX(8px)` hover which causes horizontal overflow on mobile (Severity: Low)**  
The hover effect on Land Glossary cards shifts them 8px right, which on a tight mobile layout could cause momentary horizontal scroll.

### Recommendations

1. Remove the `* { max-width: 100vw !important; }` rule and fix overflow at the source.
2. Increase mobile padding to at least 12px for better breathing room.
3. Restore Container max-width constraints and fix specific overflow issues instead.

---

## 5. VISUAL HIERARCHY (Score: 4.0 / 5)

### What Works Well

- **Strong typographic system.** Cinzel serif for headings creates an MTG-appropriate premium feel. Inter/Roboto for body text is highly legible. The font pairing is well-chosen.
- **WUBRG color palette is authentic and distinctive.** The custom mana color palette in the theme (`manaColors`) uses accurate MTG color representations.
- **Golden CTA buttons** for the primary "Analyze" action create a strong visual anchor point.
- **Gradient headings** on page titles create visual interest without sacrificing readability.
- **Consistent spacing system.** MUI's spacing system (multiples of 8px) is used consistently.
- **Feature cards use icon + title + description pattern** consistently across pages.

### Issues Found

**VH-1: Overuse of gradients dilutes visual emphasis (Severity: Low)**  
The blue-to-purple gradient appears on: page titles (all pages), CTA banners (all pages), header (light mode), nav bar backgrounds, footer banners on Guide/Mathematics, and Building Tips on Land Glossary. When everything is gradient, nothing stands out.

**VH-2: "NEW" badges use different colors inconsistently (Severity: Low)**  
The "NEW" badge on Export Blueprint in the Analyzer tabs uses `#00D9FF` (cyan), while the "NEW" badge on the HomePage Export Blueprint feature card uses `theme.palette.mana.multicolor` (gold). Same feature, different visual treatment.

**VH-3: Section labeling pattern is inconsistent (Severity: Low)**  
Some sections use the "OVERLINE + H4" pattern (Guide, Mathematics pages), while others use just H4 (HomePage "What You Get"). The overline pattern is more effective and should be standardized.

### Recommendations

1. Reserve gradient backgrounds for at most 2 key CTAs per page.
2. Standardize badge colors across the application.
3. Adopt the "overline label + heading" pattern consistently for all sections.

---

## 6. INTERACTION DESIGN (Score: 3.5 / 5)

### What Works Well

- **Loading state is excellent.** The MTG-themed loading messages ("Tapping mana sources...", "Shuffling up...") with WUBRG animated mana symbols create delight.
- **Analysis loading feedback** includes a LinearProgress bar and contextual text ("Calculating hypergeometric probabilities...").
- **Snackbar notifications** provide feedback for clear/error/success states.
- **Error boundary** catches and displays runtime errors gracefully.
- **Hover effects are polished.** Consistent translateY(-Npx) lift patterns, shadow escalation, and mana symbol glow on hover.
- **Prefetching the Analyzer page on hover** is a great performance optimization.

### Issues Found

**ID-1: No confirmation dialog before clearing deck (Severity: High)**  
The "Clear" button in DeckInputSection immediately dispatches `clearAnalyzer()` and shows a snackbar. If a user accidentally clicks Clear on a pasted deck that took effort to assemble, there is no undo mechanism. The snackbar says "Interface cleared!" but offers no "Undo" action.

**ID-2: Disabled "Analyze" button provides no feedback on why it is disabled (Severity: Medium)**  
The Analyze button is disabled when `!deckList.trim() || isAnalyzing`. There is no helper text or tooltip explaining "Paste a decklist first" when hovering over the disabled button.

**ID-3: Error message on analysis failure is generic (Severity: Medium)**  
On line 148 of AnalyzerPage: `"Failed to analyze deck. Please check the format and try again."` This does not tell the user WHAT was wrong with the format. Common issues (missing card names, invalid quantities, unrecognized set codes) are not surfaced.

**ID-4: Deck name is optional but has no auto-generation visible to user (Severity: Low)**  
The code generates a deck name from colors ("3C White/Blue/Red") during auto-save, but this generated name is not shown to the user in the UI. The user sees an empty "Deck Name" field even after analysis.

**ID-5: "Example" button label is ambiguous (Severity: Low)**  
The button says "Example" with no icon and is styled as small/outlined. A new user might not understand this loads a sample deck. "Load Sample Deck" would be clearer.

### Recommendations

1. Add a confirmation dialog or undo mechanism for the Clear action.
2. Add a tooltip on the disabled Analyze button: "Paste a decklist to enable analysis."
3. Parse and display specific validation errors (e.g., "Line 3: 'Litning Bolt' not found -- did you mean 'Lightning Bolt'?").
4. Auto-populate the deck name field with the generated name after analysis.
5. Rename "Example" to "Load Sample Deck" with a descriptive icon.

---

## 7. ONBOARDING (Score: 3.8 / 5)

### What Works Well

- **react-joyride tour** launches automatically for first-time visitors, targeting the textarea and analyze button with clear, MTG-flavored instructions.
- **The tour is skippable** with a "Skip tour" button.
- **Completion state persists** in localStorage so returning users are not re-shown the tour.
- **Pre-analysis and post-analysis steps are differentiated** -- the tour adapts based on whether results exist.
- **Homepage value proposition is immediate.** "Can You Cast Your Spells On Curve?" is a direct, persona-relevant question.
- **"How It Works" 3-step section** (Paste, Get Probabilities, Know Your Mulligans) is clear and concise.
- **Guide page Quick Start banner** ("Paste your decklist -> Click Analyze -> Get your Health Score") reduces cognitive overhead.

### Issues Found

**ON-1: Onboarding tour only triggers on the Analyzer page (Severity: Medium)**  
The `<Onboarding>` component is rendered inside `AnalyzerPage`, not at the app level. Users who land on the Home page first never see the tour until they navigate to the Analyzer. A brief "welcome" step on the Home page would set expectations.

**ON-2: Tour step 3 targets a non-existent element before analysis (Severity: Low)**  
The third step targets `[data-testid="analysis-results"]`, which only exists after running an analysis. The `preAnalysisSteps` array correctly excludes this step, but the full `steps` array would fail if triggered at the wrong time.

**ON-3: No re-trigger mechanism in the UI (Severity: Low)**  
Tour reset requires calling `window.resetOnboarding()` in the console. A "Replay tutorial" option in the header dropdown or Guide page would be user-friendly.

**ON-4: Killer feature callout on Home could be more prominent (Severity: Low)**  
"The only mana calculator that factors in your mana rocks and dorks" is the core differentiator but appears as regular body text (Typography body1) in green. A bordered callout or highlighted card would make this more scannable.

### Recommendations

1. Add a brief 1-step welcome toast or tooltip on the Home page for first-time visitors.
2. Add a "Replay tutorial" link in the Guide page or as a help icon in the header.
3. Elevate the differentiator statement into a distinct visual component (bordered callout, contrasting background).

---

## 8. DARK / LIGHT MODE (Score: 3.5 / 5)

### What Works Well

- **Theme toggle is well-placed** in the header with a rotation animation and descriptive tooltip.
- **Theme toggle is available in mobile drawer** for easy mobile access.
- **Dark theme uses appropriate MTG-inspired colors.** Background `#0D0D0F` (near-Swamp black) and paper `#1A1A1E` create an immersive feel.
- **Mana colors are adjusted for dark mode.** Each mana color has a lighter variant for visibility (e.g., blue changes from `#0E68AB` to `#4A9EE8`).
- **Glass morphism effects** in dark mode (backdrop-filter, semi-transparent backgrounds) create depth.
- **Persistence via localStorage** means theme preference survives across sessions.

### Issues Found

**DM-1: Hard-coded light-mode colors in multiple components (Severity: High)**  
Several components use hard-coded hex colors that do not adapt to theme:

- AnalyzerPage line 250: `bgcolor: '#e3f2fd'` (light blue) on Chip -- does not change in dark mode.
- AnalyzerPage line 258: `bgcolor: '#f3e5f5'` (light purple) on Chip -- same issue.
- AnalyzerPage line 265: `bgcolor: '#fff3e0'` (light orange) on Chip -- same issue.
- GuidePage: Quick Start banner uses `background: '#e8f5e9'` and `border: '#4caf50'` -- hard-coded light colors.
- MathematicsPage: Multiple `bgcolor` and `border` values are hard-coded light colors.
- LandGlossaryPage: Ranking factors and Building Tips use hard-coded light colors.

These create a jarring light-colored elements on dark backgrounds experience in dark mode.

**DM-2: contrast-fixes.css targets elements by inline style selectors (Severity: Medium)**  
The CSS file uses selectors like `[style*="linear-gradient"]` and `[style*="667eea"]` to fix contrast. This is fragile -- any change to the gradient values breaks the fix. The root cause (hard-coded colors on gradient backgrounds) should be fixed in components instead.

**DM-3: Theme toggle notification language mismatch (Severity: Medium)**  
As noted in A11Y-7, the notification says "Theme sombre active" / "Theme clair active" in French while the rest of the UI is in English.

**DM-4: ux-improvements.css overrides body2 color globally (Severity: Medium)**  
Line 12: `.MuiTypography-body2 { color: #52525b !important; }` This overrides MUI's theme-aware text coloring for ALL body2 text, forcing a mid-gray that may not have sufficient contrast on dark backgrounds. The `!important` flag means theme changes cannot override it.

**DM-5: Default theme is light but system preference is ignored (Severity: Low)**  
In `NotificationProvider.tsx`: if no saved preference exists, the theme defaults to light (`return false`). The system `prefers-color-scheme` media query is not consulted, which goes against user expectations on modern OS.

### Recommendations

1. Replace all hard-coded color values with theme-aware alternatives using `theme.palette` or `isDark` conditionals.
2. Remove contrast-fixes.css and fix contrast issues at the component level.
3. Fix the French notification text to English.
4. Remove the `!important` override on `.MuiTypography-body2`.
5. Detect `prefers-color-scheme` as the fallback when no saved preference exists.

---

## 9. INTERNATIONALIZATION (Score: 2.0 / 5)

### What Works Well

- **`lang="en"` is correctly set** on the HTML element.
- **The `/mes-analyses` route alias** shows awareness of multilingual users.

### Issues Found

**I18N-1: No i18n framework is implemented (Severity: Medium)**  
All strings are hard-coded in English throughout components. There is no react-intl, i18next, or any translation infrastructure.

**I18N-2: Mixed French and English in codebase (Severity: Medium)**

- Theme toggle notification: French text ("Theme sombre/clair active")
- Code comments are mixed: some in French ("Conteneurs responsive", "Boutons mobiles", "Thème par défaut"), others in English
- CSS comments: French ("Empêcher le débordement horizontal global")
- This is a developer experience issue but also indicates incomplete language separation

**I18N-3: No text truncation handling for dynamic content (Severity: Low)**  
Card names in the Analyzer (e.g., "Light-Paws, Emperor's Voice (NEO) 25") can be very long. There is no `text-overflow: ellipsis` or truncation strategy for these in narrow containers. The global `word-break: break-word` helps but can create awkward mid-word breaks.

**I18N-4: Date formatting is locale-dependent (Severity: Low)**  
In AnalyzerPage line 620: `new Date().toLocaleDateString()` -- this will produce different formats depending on the user's locale, but the surrounding UI text is always English.

### Recommendations

1. If multi-language support is planned, implement i18next early. If not, at least extract all user-facing strings to a constants file.
2. Fix the French notification string to English immediately.
3. Standardize code comments to one language (English preferred for open-source).

---

## 10. COGNITIVE LOAD (Score: 3.5 / 5)

### What Works Well

- **Progressive disclosure is well-applied.** The Guide page uses Accordions for step-by-step instructions. Mathematics page uses Accordions for deep-dive formulas.
- **The 3-step "How It Works" pattern** (Paste, Analyze, Read) reduces the analyzer to 3 manageable chunks.
- **Feature tags/chips** (Castability, Monte Carlo, Karsten Math) provide quick scanning without paragraphs.
- **Health Score as a single number** is an excellent complexity reducer -- it converts multi-dimensional analysis into one actionable metric.
- **Tab-based results** prevent information overload by segmenting analysis into 6 focused views.

### Issues Found

**CL-1: Home page has 7 distinct sections before the footer (Severity: Medium)**  
The Home page stacks: Hero + WUBRG, Math Foundations (4 cards), Features (4 cards), How It Works (3 steps), Guide Banner, Privacy row, Final CTA. This is a lot of scrolling for a tool whose primary value is "paste deck, get results." Leo (casual persona) would likely bounce before reaching "How It Works."

**CL-2: Analyzer results have 6 tabs which may overwhelm beginners (Severity: Medium)**  
Dashboard, Castability, Mulligan, Analysis, Manabase, Blueprint. For Leo (casual user), distinguishing between "Castability" and "Analysis" is unclear. The naming requires MTG-specific vocabulary knowledge.

**CL-3: Mathematics page formulas are rendered as plain text (Severity: Low)**  
The hypergeometric formula `P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)` is rendered in monospace Typography. For David (the theorist persona), proper mathematical notation (KaTeX or MathJax) would convey rigor. For Leo, the formula is intimidating regardless.

**CL-4: Guide page math section duplicates Mathematics page (Severity: Low)**  
The Guide page includes its own "The Math Behind ManaTuner" section with 6 math foundation cards, while the Mathematics page covers the same content in more depth. This creates redundancy and potential for content drift.

### Recommendations

1. Consider a shorter Home page that leads with the CTA and moves educational content to the Guide.
2. Add brief tab descriptions that appear on hover or as subtitles (already partially done via aria-labels -- make these visible).
3. Implement KaTeX for mathematical notation on the Mathematics page.
4. Remove the math section from the Guide page and replace with a link to Mathematics.

---

## PERSONA EVALUATION

### Leo -- "Le Curieux" (Casual, 6 months) -- Score: 3.5 / 5

**Positive:** The Home page value proposition is clear in plain English. The "Analyze My Deck" CTA is prominent and gold-colored. The onboarding tour guides him to paste and analyze. The sample deck lets him see results without having a deck ready.

**Friction:** Leo does not know what "Castability," "Hypergeometric," or "Bellman Equation" mean. The Home page bombards him with "Karsten Tables," "P(X>=k)," and "E[V7]" before he even reaches the tool. The 6 analysis tabs are labeled with terms he has never encountered. He needs a "what does this mean?" tooltip on every metric, which does not exist.

**Recommendation:** Add a "Beginner Mode" toggle that replaces jargon labels with plain English (e.g., "Castability" -> "Can I play this card on time?", "Mulligan" -> "Should I keep or reshuffle?").

### Sarah -- "La Reguliere" (FNM weekly) -- Score: 4.0 / 5

**Positive:** Sarah understands all the terminology. The Castability tab directly answers her question "can I curve out?" The Mulligan simulator with archetype selection (Aggro/Midrange/Control/Combo) matches her decision framework. The export feature lets her share analysis on Discord.

**Friction:** She wants to compare two deck versions side-by-side (e.g., 24 vs 25 lands). There is no comparison mode. She also wants to see how her deck performs against the meta, which ManaTuner does not address (it analyzes in isolation). The "My Analyses" page could show trend data over time.

**Recommendation:** Add a "Compare" mode that shows two analyses side-by-side. Show delta indicators when a user modifies their deck and re-analyzes.

### Karim -- "Le Tacticien" (RCQ grinder) -- Score: 3.8 / 5

**Positive:** Karim appreciates the mathematical rigor. Frank Karsten citations build trust. The Blueprint export (PNG/PDF/JSON) is exactly what he needs for tournament prep documentation. The detailed Manabase tab breakdown (basics, duals, fetches, utility) matches his analytical approach.

**Friction:** He wants to configure Monte Carlo simulation parameters (number of iterations, mulligan rules). He wants to export raw data (CSV, not just JSON). He wants API access to automate batch analysis of multiple decks.

**Recommendation:** Expose simulation parameters as advanced settings. Add CSV export. Consider a public API for power users.

### Natsuki -- "La Grinder" (Pro Tour qualifier) -- Score: 3.3 / 5

**Positive:** Natsuki values the Bellman equation mulligan threshold -- this is genuinely unique in the MTG tool space. The mathematical methodology page builds credibility.

**Friction:** Natsuki thinks in EV (Expected Value) and equity terms. The current analysis does not show EV calculations or equity curves. She wants to model specific game states (e.g., "what is the probability of having UU available on turn 2 given I play a tapped land on turn 1?"). She also wants the tool to factor in specific game plans (e.g., "I need to cast Arclight Phoenix from my graveyard on turn 3, how many enablers do I need?").

**Recommendation:** Add conditional probability modeling. Allow users to specify constraints ("if I play land X on turn 1, what are my turn 2 probabilities?").

### David -- "L'Architecte" (Pro Tour veteran) -- Score: 3.5 / 5

**Positive:** David appreciates the open-source codebase (GitHub link prominent). The mathematical documentation satisfies his need to verify methodology. The Karsten 2022 citations are current.

**Friction:** David would check the source code and notice the `!important` CSS overrides, the mixed French/English comments, and the hard-coded color values. He would want to see unit test coverage for the probability calculations. He wants to verify edge cases (what happens with companion decks? with Karn wish boards?). The mathematical formulas rendered as plain text rather than LaTeX would concern him.

**Recommendation:** Add a methodology page with links to the actual test suite. Render formulas in KaTeX. Document edge case handling explicitly.

### Persona Scores Summary

| Persona            | v2.1.0 Score | Current Audit Score | Delta     |
| ------------------ | ------------ | ------------------- | --------- |
| Leo (Casual)       | 4.2          | 3.5                 | -0.7      |
| Sarah (Regular)    | 4.2          | 4.0                 | -0.2      |
| Karim (Grinder)    | 4.1          | 3.8                 | -0.3      |
| Natsuki (Pro Tour) | 3.8          | 3.3                 | -0.5      |
| David (Architect)  | 4.1          | 3.5                 | -0.6      |
| **Average**        | **4.08**     | **3.62**            | **-0.46** |

Note: The previous v2.1.0 scores appear to have been more generous or evaluated different criteria. This audit applies stricter standards, particularly around accessibility (which was likely underweighted previously) and dark mode quality.

---

## PRIORITIZED RECOMMENDATIONS

### P0 -- Critical (Fix Immediately)

| #   | Issue                                                                       | Category | Effort  |
| --- | --------------------------------------------------------------------------- | -------- | ------- |
| 1   | Add skip navigation link                                                    | A11Y     | 30 min  |
| 2   | Add `aria-hidden="true"` to decorative mana symbols and FloatingManaSymbols | A11Y     | 1 hour  |
| 3   | Make logo area a proper `<a>` link with aria-label                          | A11Y     | 30 min  |
| 4   | Fix heading hierarchy across all pages (h1 -> h2 -> h3)                     | A11Y     | 2 hours |
| 5   | Add text alternatives alongside color-only indicators                       | A11Y     | 2 hours |

### P1 -- High (This Sprint)

| #   | Issue                                                                                    | Category    | Effort  |
| --- | ---------------------------------------------------------------------------------------- | ----------- | ------- |
| 6   | Add confirmation dialog for Clear action                                                 | Interaction | 1 hour  |
| 7   | Replace hard-coded colors with theme-aware values in Analyzer, Guide, Math, LandGlossary | Dark Mode   | 4 hours |
| 8   | Fix French notification text to English                                                  | i18n        | 5 min   |
| 9   | Remove `.MuiTypography-body2 { color: #52525b !important; }` override                    | Dark Mode   | 15 min  |
| 10  | Add Land Glossary to main navigation                                                     | IA          | 30 min  |

### P2 -- Medium (Next Sprint)

| #   | Issue                                                  | Category    | Effort  |
| --- | ------------------------------------------------------ | ----------- | ------- |
| 11  | Add disabled-state tooltip on Analyze button           | Interaction | 30 min  |
| 12  | Add "Load Sample Deck" button in empty results state   | User Flow   | 30 min  |
| 13  | Detect system `prefers-color-scheme` as default        | Dark Mode   | 30 min  |
| 14  | Add `onFocus`/`onBlur` to CardImageTooltip             | A11Y        | 30 min  |
| 15  | Add "Replay tutorial" option to UI                     | Onboarding  | 1 hour  |
| 16  | Specific validation error messages on analysis failure | Interaction | 3 hours |
| 17  | Replace `navigate(-1)` with explicit routes            | IA          | 30 min  |

### P3 -- Low (Backlog)

| #   | Issue                                                          | Category       | Effort  |
| --- | -------------------------------------------------------------- | -------------- | ------- |
| 18  | Remove aggressive `* { max-width: 100vw !important }` CSS rule | Responsive     | 2 hours |
| 19  | Implement KaTeX for mathematical formulas                      | Cognitive Load | 3 hours |
| 20  | Add tab count indicator for mobile scrollable tabs             | User Flow      | 1 hour  |
| 21  | Shorten Home page, move educational content to Guide           | Cognitive Load | 4 hours |
| 22  | Standardize "NEW" badge colors                                 | Visual         | 15 min  |
| 23  | Extract all user-facing strings to constants file              | i18n           | 4 hours |
| 24  | Add table captions for accessibility                           | A11Y           | 30 min  |

---

## FILES REVIEWED

### Pages

- `/src/pages/HomePage.tsx`
- `/src/pages/AnalyzerPage.tsx`
- `/src/pages/GuidePage.tsx`
- `/src/pages/MathematicsPage.tsx`
- `/src/pages/LandGlossaryPage.tsx`

### Components

- `/src/components/layout/Header.tsx`
- `/src/components/layout/Footer.tsx`
- `/src/components/Onboarding.tsx`
- `/src/components/analyzer/DeckInputSection.tsx`
- `/src/components/analyzer/TabPanel.tsx`
- `/src/components/common/AnimatedContainer.tsx`
- `/src/components/common/BetaBanner.tsx`
- `/src/components/common/ErrorBoundary.tsx`
- `/src/components/common/FloatingManaSymbols.tsx`
- `/src/components/common/NotificationProvider.tsx`
- `/src/components/CardImageTooltip.tsx`

### Configuration and Styles

- `/index.html`
- `/src/App.tsx`
- `/src/main.tsx`
- `/src/theme/index.ts`
- `/src/index.css`
- `/src/styles/index.css`
- `/src/styles/contrast-fixes.css`
- `/src/styles/ux-improvements.css`

---

_End of audit._
