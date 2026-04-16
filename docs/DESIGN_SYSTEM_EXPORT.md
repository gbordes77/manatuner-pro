# ManaTuner — Design System Export

> Portable spec of the full UX/UI: colors, typography, spacing, radii, shadows, motion, components, accessibility rules. Copy-paste friendly. Framework-agnostic (tokens) + React/MUI reference implementation.

Version: 2.5.2 — Snapshot 2026-04-16
Source repo: ManaTuner v2
License of tokens: free to reuse within your own projects.

---

## 1. Brand DNA

- **Theme**: Magic: The Gathering — premium, parchment + deep ink, mana-color accents.
- **Feel**: Editorial + data-viz. Serif headings (Cinzel), humanist sans body (Inter).
- **Dual mode**: Light (parchment) + Dark (near-black, glassmorphism).
- **Tone**: Confident, technical-but-friendly, privacy-first.

---

## 2. Color Tokens

### 2.1 MTG Mana Palette (canonical)

| Token              | Hex       | Usage                  |
| ------------------ | --------- | ---------------------- |
| `--mtg-white`      | `#F8F6D8` | Plains — warm cream    |
| `--mtg-blue`       | `#0E68AB` | Island — deep blue     |
| `--mtg-black`      | `#150B00` | Swamp — near black     |
| `--mtg-red`        | `#D3202A` | Mountain — vibrant red |
| `--mtg-green`      | `#00733E` | Forest — rich green    |
| `--mtg-colorless`  | `#CBC5C0` | Wastes — grey          |
| `--mtg-multicolor` | `#E9B54C` | Gold — multicolor      |

### 2.2 Mana Color — Dark Mode Adjustments

```
--mtg-white-dm:      #F5F0D0
--mtg-blue-dm:       #4A9EE8
--mtg-black-dm:      #3D3D3D
--mtg-red-dm:        #FF5252
--mtg-green-dm:      #4CAF50
--mtg-colorless-dm:  #9E9E9E
--mtg-multicolor-dm: #FFD700
```

### 2.3 Mana Glow (hover/animation halos)

```
--glow-white: rgba(248, 246, 216, 0.6)
--glow-blue:  rgba(14, 104, 171, 0.6)
--glow-black: rgba(90, 60, 90, 0.6)
--glow-red:   rgba(211, 32, 42, 0.6)
--glow-green: rgba(0, 115, 62, 0.6)
```

### 2.4 Semantic Palette — Light

| Role               | Main                  | Light     | Dark      |
| ------------------ | --------------------- | --------- | --------- |
| primary            | `#1565C0`             | `#42A5F5` | `#0D47A1` |
| secondary          | `#7B1FA2`             | `#BA68C8` | `#4A148C` |
| error              | `#D3202A`             | —         | —         |
| warning            | `#E9B54C`             | —         | —         |
| info               | `#0E68AB`             | —         | —         |
| success            | `#00733E`             | —         | —         |
| background.default | `#F5F3EE` (parchment) | —         | —         |
| background.paper   | `#FFFFFF`             | —         | —         |
| text.primary       | `#1A1A1A`             | —         | —         |
| text.secondary     | `#555555`             | —         | —         |

### 2.5 Semantic Palette — Dark

| Role               | Main                          | Light     | Dark      |
| ------------------ | ----------------------------- | --------- | --------- |
| primary            | `#64B5F6`                     | `#90CAF9` | `#42A5F5` |
| secondary          | `#CE93D8`                     | `#E1BEE7` | `#BA68C8` |
| error              | `#FF6B6B`                     | —         | —         |
| warning            | `#FFD54F`                     | —         | —         |
| info               | `#4FC3F7`                     | —         | —         |
| success            | `#69F0AE`                     | —         | —         |
| background.default | `#0D0D0F` (near-black, Swamp) | —         | —         |
| background.paper   | `#1A1A1E`                     | —         | —         |
| text.primary       | `#F5F5F5`                     | —         | —         |
| text.secondary     | `#AAAAAA`                     | —         | —         |

### 2.6 Glass (backdrop-filter surfaces)

| Token           | Light                   | Dark                     |
| --------------- | ----------------------- | ------------------------ |
| glass.primary   | `rgba(255,255,255,0.8)` | `rgba(255,255,255,0.05)` |
| glass.secondary | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.02)` |
| glass.border    | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.1)`  |

### 2.7 Neutrals / Accents

```
--mtg-gold:   #DAA520
--mtg-silver: #C0C0C0
--mtg-bronze: #CD7F32
```

### 2.8 Reliability Scale (domain-specific, adaptable)

| State     | Color            | Usage  |
| --------- | ---------------- | ------ |
| excellent | `#2E7D32` (bold) | 95%+   |
| good      | `#388E3C`        | 85–95% |
| marginal  | `#F57C00`        | 70–85% |
| poor      | `#D32F2F` (bold) | <70%   |

---

## 3. Typography

### 3.1 Font Stacks

```
--font-body:    "Inter", "Roboto", "Helvetica", "Arial", sans-serif
--font-heading: "Cinzel", "Playfair Display", serif
--font-mono:    "JetBrains Mono", "Fira Code", monospace
```

Load from Google Fonts (or self-host):

- Inter 400/500/600/700
- Cinzel 500/600/700
- JetBrains Mono 400/500 (optional, for `techTerm` badges)

### 3.2 Type Scale

| Level              | Font           | Size               | Weight | Line-height | Tracking |
| ------------------ | -------------- | ------------------ | ------ | ----------- | -------- |
| h1                 | Cinzel         | `3rem` / `48px`    | 700    | 1.2         | 0.02em   |
| h2                 | Cinzel         | `2.5rem` / `40px`  | 600    | 1.3         | 0.01em   |
| h3                 | Cinzel         | `2rem` / `32px`    | 600    | 1.4         | —        |
| h4                 | Cinzel         | `1.5rem` / `24px`  | 500    | 1.4         | —        |
| h5                 | Inter          | `1.25rem` / `20px` | 500    | 1.5         | —        |
| h6                 | Inter          | `1rem` / `16px`    | 500    | 1.6         | —        |
| body1              | Inter          | `1rem`             | 400    | 1.6         | —        |
| body2              | Inter          | `0.875rem`         | 400    | 1.5         | —        |
| caption (techTerm) | JetBrains Mono | `0.75rem`          | 400    | 1.4         | discrete |

### 3.3 Heading Treatment (signature)

`h1` uses a **gradient-clipped fill** on key landing pages:

```css
h1 {
  background: linear-gradient(135deg, var(--mtg-blue), var(--mtg-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Spacing, Radii, Shadows, Motion

### 4.1 Spacing Scale

```
--spacing-xs: 0.25rem  /* 4px  */
--spacing-sm: 0.5rem   /* 8px  */
--spacing-md: 1rem     /* 16px */
--spacing-lg: 1.5rem   /* 24px */
--spacing-xl: 2rem     /* 32px */
--spacing-2xl: 3rem    /* 48px */
```

### 4.2 Border Radius

```
--radius-sm:   4px   /* inputs, micro */
--radius-md:   8px   /* chips, small cards */
--radius-lg:   12px  /* buttons, textfields, default shape */
--radius-xl:   16px  /* cards */
--radius-full: 9999px /* pills, mana symbols */
```

Global MUI `shape.borderRadius = 12`.

### 4.3 Shadow Scale

```
--shadow-sm: 0 2px 4px  rgba(0,0,0,0.10)
--shadow-md: 0 4px 8px  rgba(0,0,0,0.12)
--shadow-lg: 0 8px 16px rgba(0,0,0,0.15)
--shadow-xl: 0 12px 24px rgba(0,0,0,0.18)
/* Hover elevation for cards */
--shadow-hover: 0 12px 32px rgba(0,0,0,0.15)  /* light */
--shadow-hover-dark: 0 12px 32px rgba(0,0,0,0.40)
```

### 4.4 Motion

```
--transition-fast:   0.15s ease-out
--transition-normal: 0.25s ease-out
--transition-slow:   0.35s ease-out
--ease-signature:    cubic-bezier(0.4, 0, 0.2, 1)  /* MUI-like */
```

**Signature hover**: `translateY(-2px)` (buttons) or `-4px` (cards) + shadow bump, `300ms` cubic-bezier.

### 4.5 Gradients

```
--bg-parchment:  linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
--bg-violet:     linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--bg-card:       linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)
--bg-brand-h1:   linear-gradient(135deg, var(--mtg-blue), var(--mtg-green))
--bg-btn-primary: linear-gradient(135deg, var(--mtg-blue), #0A4F85)
```

---

## 5. Component Specs

### 5.1 Button

- `border-radius: 12px`
- `padding: 10px 24px`
- `font-weight: 600`
- `text-transform: none` (never uppercase)
- Hover: `translateY(-2px)` + `shadow-lg`
- Min touch target: `44x44px` (mobile)
- Focus-visible: `outline: 2px solid #3b82f6; outline-offset: 2px`

### 5.2 Card

- `border-radius: 16px`
- Light: solid `background.paper` + `shadow-md`
- Dark: `background: rgba(255,255,255,0.03)` + `backdrop-filter: blur(10px)` + `1px solid rgba(255,255,255,0.08)`
- Hover: `translateY(-4px)` + `shadow-hover` + border brightens
- Transition: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### 5.3 TextField

- `border-radius: 12px`
- Hover ring: `box-shadow: 0 0 0 4px rgba(25,118,210,0.10)`
- Focus ring: `box-shadow: 0 0 0 4px rgba(25,118,210,0.20)`
- Mobile font-size: `16px` (prevents iOS zoom)

### 5.4 Chip

- `border-radius: 8px`, `font-weight: 500`
- Pill variant: `border-radius: 9999px`, `text-transform: uppercase`, `letter-spacing: 0.5px`, `font-size: 0.8rem`
- State gradients (excellent/good/average/poor) — use mana colors.

### 5.5 AppBar

- `backdrop-filter: blur(10px)`
- Dark: `background: rgba(13,13,15,0.9)` + `border-bottom: 1px solid rgba(255,255,255,0.08)`

### 5.6 Mana Symbol (signature element)

- Size: `28px × 28px` (desktop), `24px` (tablet), `20px` (mobile)
- `border-radius: 50%`, `border: 2px solid`, `font-weight: 700`
- Hover: `scale(1.10)` + shadow bump
- Per-color: linear-gradient fill + colored border (see §2.1/§2.7)

Example (blue):

```css
.mana-symbol.blue {
  background: linear-gradient(135deg, #e6f3ff, #cce7ff);
  color: var(--mtg-blue-dark);
  border-color: var(--mtg-blue);
}
```

### 5.7 Progress Bar

- Track: `#e2e8f0` + inset shadow
- Fill: gradient `--mtg-blue → --mtg-blue-light`
- Shimmer overlay: 2s infinite `translateX(-100% → 100%)` white gradient

### 5.8 Tabs

- Inactive: `color: #64748b`
- Hover: `color: var(--mtg-blue)`, `background: rgba(74,144,226,0.10)`
- Active: white background, 2px blue underline, subtle shadow

### 5.9 Status Indicator (inline pill)

```css
.status-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}
.status-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
```

### 5.10 Validation Blocks

```css
.validation-error {
  border-left: 4px solid #ef4444;
  background: rgba(239, 68, 68, 0.05);
  padding: 12px;
  border-radius: 4px;
}
.validation-success {
  border-left: 4px solid #10b981;
  background: rgba(16, 185, 129, 0.05);
  padding: 12px;
  border-radius: 4px;
}
```

### 5.11 Skeleton / Shimmer Loader

```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 5.12 Tooltip

- Background: `rgba(0,0,0,0.9)`, white text
- `padding: 8–12px 12–16px`, `border-radius: 8px`
- `max-width: 300px`, `font-size: 0.875rem`

### 5.13 Scrollbar (WebKit)

```css
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

---

## 6. Animations

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.6);
  }
}
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

Utility classes: `.animate-fadeIn`, `.animate-slideIn`, `.animate-slideInLeft`, `.animate-slideInRight`, `.animate-pulse`, `.animate-glow`.

---

## 7. Responsive Breakpoints

```
xs: < 480px    /* phone portrait         */
sm: < 600px    /* phone landscape / MUI  */
md: < 768px    /* tablet portrait        */
lg: < 1024px   /* tablet landscape       */
xl: ≥ 1280px   /* desktop                */
```

Global rules:

- Below `600px`: button padding `8px 12px`, container padding `8px`.
- Below `768px`: h1 → `2rem`, h2 → `1.5rem`, mana-symbol → `24px`.
- Below `480px`: enforce `max-width: 100vw !important` on `*`, mana-symbol → `20px`.

iOS input anti-zoom: any `input` / `textarea` inside `.MuiOutlinedInput-root` at `@media (max-width: 768px)` → `font-size: 16px !important`.

---

## 8. Accessibility (WCAG 2.2 AA)

- Contrast ≥ 4.5:1 body text, ≥ 3:1 large text. Secondary text in light mode enforced at `#52525b` (not `#71717a`).
- **Focus visible** on every interactive element:
  ```css
  *:focus-visible {
    outline: 2px solid var(--mtg-blue);
    outline-offset: 2px;
  }
  ```
- **Touch targets** ≥ 44×44 px.
- **`prefers-reduced-motion`**: disable all animations / transitions:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **`prefers-contrast: high`**: mana symbols get 3px borders, cards get 2px black border.
- **`.sr-only`** pattern for screen-reader-only text.
- Text on gradient backgrounds: force `#fff` + `text-shadow: 0 1px 2px rgba(0,0,0,.3)`.

---

## 9. Implementation Kits

### 9.1 Pure CSS Variables (framework-agnostic)

Drop this into a global stylesheet and you have the whole design system:

```css
:root {
  /* Mana */
  --mtg-white: #f8f6d8;
  --mtg-blue: #0e68ab;
  --mtg-black: #150b00;
  --mtg-red: #d3202a;
  --mtg-green: #00733e;
  --mtg-colorless: #cbc5c0;
  --mtg-multicolor: #e9b54c;
  --mtg-gold: #daa520;
  --mtg-silver: #c0c0c0;
  --mtg-bronze: #cd7f32;

  /* Semantic — light */
  --color-primary: #1565c0;
  --color-secondary: #7b1fa2;
  --color-bg: #f5f3ee;
  --color-paper: #ffffff;
  --color-text: #1a1a1a;
  --color-text-secondary: #555555;

  /* Typography */
  --font-body: 'Inter', 'Roboto', system-ui, sans-serif;
  --font-heading: 'Cinzel', 'Playfair Display', serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.18);

  /* Motion */
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.25s ease-out;
  --transition-slow: 0.35s ease-out;
  --ease-signature: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme='dark'] {
  --color-primary: #64b5f6;
  --color-secondary: #ce93d8;
  --color-bg: #0d0d0f;
  --color-paper: #1a1a1e;
  --color-text: #f5f5f5;
  --color-text-secondary: #aaaaaa;
}
```

### 9.2 Tailwind `tailwind.config.js`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        mtg: {
          white: '#F8F6D8',
          blue: '#0E68AB',
          black: '#150B00',
          red: '#D3202A',
          green: '#00733E',
          colorless: '#CBC5C0',
          multicolor: '#E9B54C',
          gold: '#DAA520',
        },
        brand: {
          DEFAULT: '#1565C0',
          light: '#42A5F5',
          dark: '#0D47A1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        heading: ['Cinzel', 'Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,.10)',
        md: '0 4px 8px rgba(0,0,0,.12)',
        lg: '0 8px 16px rgba(0,0,0,.15)',
        xl: '0 12px 24px rgba(0,0,0,.18)',
        hover: '0 12px 32px rgba(0,0,0,.15)',
      },
      transitionTimingFunction: { signature: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideInUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .5s ease-out',
        slideInUp: 'slideInUp .6s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
}
```

### 9.3 MUI `createTheme` (drop-in)

See the full working reference in §Appendix A below. Covers light + dark with mana palette augmentation, glass surfaces, and component overrides.

---

## 10. Page-Level Patterns

### 10.1 Hero Section

- Centered `h1` with gradient fill (blue → green).
- Subtitle in `body1` `text.secondary`.
- Two CTAs: primary (gradient) + secondary (outline).
- Spacing: `--spacing-2xl` vertical padding.

### 10.2 Dashboard Cards

- 3-column grid desktop, 1-column mobile.
- Glass on dark, solid paper on light.
- Hover: rise 4px, border brightens.

### 10.3 Data Tables / Lists

- Row hover: `background: rgba(74,144,226,0.05)`.
- Mana-column cells use `.mana-symbol` inline.
- Reliability column uses `.reliability-*` classes.

### 10.4 Form Pages

- Textfield `16px` font mobile.
- Inline validation blocks (§5.10).
- Sticky submit bar on mobile.

### 10.5 Print

```css
@media print {
  body {
    background: white !important;
  }
  button,
  .MuiFab-root {
    display: none !important;
  }
  .mana-symbol {
    border: 1px solid #000 !important;
    background: white !important;
    color: black !important;
  }
}
```

---

## 11. Do / Don't

**Do**

- Use Cinzel for h1–h4 only. Everything else Inter.
- Use mana colors as accent, not as backgrounds for long text.
- Animate with `cubic-bezier(0.4, 0, 0.2, 1)` at `300ms` — default.
- Always ship `prefers-reduced-motion` + `focus-visible`.
- Keep radius hierarchy: micro 4 / controls 12 / cards 16 / pills 9999.

**Don't**

- Don't uppercase button labels (`text-transform: none`).
- Don't use pure black `#000` — use `#150B00` (Swamp) or `#0D0D0F` (bg dark).
- Don't mix Sentry / tracking pixels — the brand claims privacy-first.
- Don't remove focus rings for "cleanliness".

---

## 12. Asset Checklist (to replicate on a new project)

- [ ] Load fonts: Inter, Cinzel, JetBrains Mono (optional).
- [ ] Load [mana-font](https://github.com/andrewgioia/mana) if you need official MTG symbols (`ms-w`, `ms-u`, `ms-rg`, etc.). Not required — fallbacks in §5.6 work.
- [ ] Add `:root` tokens from §9.1 (or Tailwind config §9.2, or MUI Appendix A).
- [ ] Port component specs §5.
- [ ] Port animations §6.
- [ ] Port a11y rules §8.
- [ ] Dual-mode toggle (light/dark) via `data-theme` attribute or MUI `ThemeProvider`.

---

## Appendix A — Full MUI Theme (drop-in `theme.ts`)

```ts
import { createTheme, ThemeOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    mana: {
      white: string
      blue: string
      black: string
      red: string
      green: string
      colorless: string
      multicolor: string
      whiteGlow: string
      blueGlow: string
      blackGlow: string
      redGlow: string
      greenGlow: string
    }
    glass: { primary: string; secondary: string; border: string }
  }
  interface PaletteOptions {
    mana?: Partial<Palette['mana']>
    glass?: Partial<Palette['glass']>
  }
}

const manaColors = {
  white: '#F8F6D8',
  blue: '#0E68AB',
  black: '#150B00',
  red: '#D3202A',
  green: '#00733E',
  colorless: '#CBC5C0',
  multicolor: '#E9B54C',
  whiteGlow: 'rgba(248,246,216,0.6)',
  blueGlow: 'rgba(14,104,171,0.6)',
  blackGlow: 'rgba(90,60,90,0.6)',
  redGlow: 'rgba(211,32,42,0.6)',
  greenGlow: 'rgba(0,115,62,0.6)',
}

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
    h1: {
      fontFamily: '"Cinzel","Playfair Display",serif',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: '"Cinzel","Playfair Display",serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0.01em',
    },
    h3: {
      fontFamily: '"Cinzel","Playfair Display",serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Cinzel","Playfair Display",serif',
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
    h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
        },
        contained: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': { boxShadow: '0 0 0 4px rgba(25,118,210,0.10)' },
            '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(25,118,210,0.20)' },
          },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
    MuiAppBar: { styleOverrides: { root: { borderRadius: 0, backdropFilter: 'blur(10px)' } } },
  },
}

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#1565C0', light: '#42A5F5', dark: '#0D47A1' },
    secondary: { main: '#7B1FA2', light: '#BA68C8', dark: '#4A148C' },
    error: { main: manaColors.red },
    warning: { main: manaColors.multicolor },
    info: { main: manaColors.blue },
    success: { main: manaColors.green },
    background: { default: '#F5F3EE', paper: '#FFFFFF' },
    text: { primary: '#1A1A1A', secondary: '#555555' },
    mana: manaColors,
    glass: {
      primary: 'rgba(255,255,255,0.8)',
      secondary: 'rgba(255,255,255,0.6)',
      border: 'rgba(255,255,255,0.2)',
    },
  },
})

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#64B5F6', light: '#90CAF9', dark: '#42A5F5' },
    secondary: { main: '#CE93D8', light: '#E1BEE7', dark: '#BA68C8' },
    error: { main: '#FF6B6B' },
    warning: { main: '#FFD54F' },
    info: { main: '#4FC3F7' },
    success: { main: '#69F0AE' },
    background: { default: '#0D0D0F', paper: '#1A1A1E' },
    text: { primary: '#F5F5F5', secondary: '#AAAAAA' },
    mana: {
      ...manaColors,
      white: '#F5F0D0',
      blue: '#4A9EE8',
      black: '#3D3D3D',
      red: '#FF5252',
      green: '#4CAF50',
      colorless: '#9E9E9E',
      multicolor: '#FFD700',
      whiteGlow: 'rgba(245,240,208,0.5)',
      blueGlow: 'rgba(74,158,232,0.5)',
      blackGlow: 'rgba(120,80,120,0.5)',
      redGlow: 'rgba(255,82,82,0.5)',
      greenGlow: 'rgba(76,175,80,0.5)',
    },
    glass: {
      primary: 'rgba(255,255,255,0.05)',
      secondary: 'rgba(255,255,255,0.02)',
      border: 'rgba(255,255,255,0.10)',
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.40)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13,13,15,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
})
```

---

## Appendix B — Global CSS Baseline (copy-paste)

```css
/* Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}
html {
  scroll-behavior: smooth;
}
body {
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

/* Headings */
h1,
h2,
h3,
h4 {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.3;
}
h1 {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--mtg-blue), var(--mtg-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Focus */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* A11y */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

**End of export.** Everything above is self-contained: grab §9.1 for the tokens, §5 for the components, Appendix A if you're on MUI, Appendix B for baseline CSS. You can reconstruct the entire ManaTuner look from this document alone.
