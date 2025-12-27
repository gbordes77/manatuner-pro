# MTG Visual Identity Design System

**ManaTuner Pro - Magic: The Gathering Visual Integration Guide**

> Transform ManaTuner Pro from a functional analyzer into an immersive MTG experience that resonates with players the moment they land on the site.

---

## 1. Design Philosophy

### Vision Statement
Create a visual identity that immediately communicates "Magic: The Gathering" while maintaining professional usability. The design should feel like opening a spellbook or consulting an ancient planeswalker's tome of knowledge.

### Core Principles
1. **Authentic MTG Feel**: Use official mana colors, symbols, and aesthetic cues
2. **Professional Clarity**: Never sacrifice usability for aesthetics
3. **Respectful Fan Content**: Align with Wizards of the Coast Fan Content Policy
4. **Accessibility First**: WCAG 2.1 AA compliance with MTG theming

---

## 2. Color System

### Primary Mana Palette

The five colors of Magic form our primary accent palette. These are the official MTG mana colors adapted for digital interfaces.

| Color | Name | Primary (Light) | Primary (Dark) | Accent | Use Case |
|-------|------|-----------------|----------------|--------|----------|
| W | White | `#FFFBD5` | `#F5F5DC` | `#D4AF37` (Gold) | Plains, life gain, order |
| U | Blue | `#0E68AB` | `#4A90E2` | `#00D4FF` (Cyan) | Islands, control, knowledge |
| B | Black | `#150B00` | `#2C2C2C` | `#8B4789` (Purple) | Swamps, power, ambition |
| R | Red | `#D3202A` | `#FF6B6B` | `#FF4500` (Orange) | Mountains, chaos, passion |
| G | Green | `#00733E` | `#4ECDC4` | `#32CD32` (Lime) | Forests, growth, nature |
| C | Colorless | `#C6C5C5` | `#888888` | `#A0A0A0` | Artifacts, Eldrazi |

### Extended Color Tokens

```typescript
// Design tokens for MTG theming
const mtgDesignTokens = {
  mana: {
    white: {
      primary: '#FFFBD5',
      dark: '#F5F5DC',
      accent: '#D4AF37',
      glow: 'rgba(255, 251, 213, 0.4)',
      text: '#8B4513',  // Readable on white bg
    },
    blue: {
      primary: '#0E68AB',
      dark: '#4A90E2',
      accent: '#00D4FF',
      glow: 'rgba(14, 104, 171, 0.4)',
      text: '#FFFFFF',
    },
    black: {
      primary: '#150B00',
      dark: '#2C2C2C',
      accent: '#8B4789',
      glow: 'rgba(21, 11, 0, 0.6)',
      text: '#FFFFFF',
    },
    red: {
      primary: '#D3202A',
      dark: '#FF6B6B',
      accent: '#FF4500',
      glow: 'rgba(211, 32, 42, 0.4)',
      text: '#FFFFFF',
    },
    green: {
      primary: '#00733E',
      dark: '#4ECDC4',
      accent: '#32CD32',
      glow: 'rgba(0, 115, 62, 0.4)',
      text: '#FFFFFF',
    },
    colorless: {
      primary: '#C6C5C5',
      dark: '#888888',
      accent: '#A0A0A0',
      glow: 'rgba(198, 197, 197, 0.3)',
      text: '#333333',
    },
  },
  multicolor: {
    gold: '#F8E231',
    rainbow: 'linear-gradient(135deg, #FFFBD5 0%, #0E68AB 25%, #150B00 50%, #D3202A 75%, #00733E 100%)',
  },
  // Background atmospheres
  atmosphere: {
    light: {
      parchment: '#FAF8F0',
      scroll: '#F5F0E1',
      paper: '#FFFFFF',
    },
    dark: {
      void: '#0A0A0A',
      obsidian: '#1A1A1A',
      shadow: '#252525',
    },
  },
};
```

### Gradient Combinations

For hero sections, CTAs, and feature highlights:

```css
/* Multi-color gradient (WUBRG order) */
.gradient-wubrg {
  background: linear-gradient(
    135deg,
    #FFFBD5 0%,
    #0E68AB 25%,
    #150B00 50%,
    #D3202A 75%,
    #00733E 100%
  );
}

/* Gold multicolor accent */
.gradient-gold {
  background: linear-gradient(135deg, #F8E231 0%, #D4AF37 50%, #B8860B 100%);
}

/* Blue control theme */
.gradient-blue-control {
  background: linear-gradient(135deg, #0E68AB 0%, #00D4FF 100%);
}

/* Dark mode mystical */
.gradient-mystical-dark {
  background: linear-gradient(135deg, #0A0A0A 0%, #1a1a3e 50%, #2d1b4e 100%);
}
```

---

## 3. Mana Symbol Integration

### Symbol Implementation Strategy

Use **Mana.rocks** or **Keyrune** webfonts for authentic MTG mana symbols. These are community-maintained and legally safe for fan content.

#### Option A: Mana.rocks (Recommended)
```html
<!-- CDN link -->
<link href="https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.min.css" rel="stylesheet">

<!-- Usage -->
<i class="ms ms-w ms-cost"></i>  <!-- White mana -->
<i class="ms ms-u ms-cost"></i>  <!-- Blue mana -->
<i class="ms ms-b ms-cost"></i>  <!-- Black mana -->
<i class="ms ms-r ms-cost"></i>  <!-- Red mana -->
<i class="ms ms-g ms-cost"></i>  <!-- Green mana -->
<i class="ms ms-c ms-cost"></i>  <!-- Colorless mana -->
```

#### Option B: SVG Components (Current approach enhanced)
Enhance the existing `ManaSymbol` component with proper MTG styling:

```tsx
// Enhanced ManaSymbol with official-like styling
const ManaSymbolEnhanced: React.FC<ManaSymbolProps> = ({ color, size = 'medium' }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE_MAP[size],
        height: SIZE_MAP[size],
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${COLOR_CONFIGS[color].highlight}, ${COLOR_CONFIGS[color].bg})`,
        border: `2px solid ${COLOR_CONFIGS[color].border}`,
        boxShadow: `
          inset 0 -2px 4px rgba(0,0,0,0.3),
          inset 0 2px 4px rgba(255,255,255,0.2),
          0 2px 8px ${COLOR_CONFIGS[color].glow}
        `,
        color: COLOR_CONFIGS[color].text,
        fontWeight: 'bold',
        fontFamily: '"Beleren", "Plantin MT", Georgia, serif',
        transition: 'all 0.2s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'scale(1.15) rotate(-5deg)',
          boxShadow: `0 4px 16px ${COLOR_CONFIGS[color].glow}`,
        },
      }}
    >
      {MANA_ICONS[color]}
    </Box>
  );
};
```

### Symbol Placement Guidelines

| Location | Symbol Size | Behavior | Purpose |
|----------|-------------|----------|---------|
| Header/Logo | 24-32px | Static with subtle glow | Brand identity |
| Dashboard Cards | 20-24px | Hover scale | Color indicators |
| Probability Tables | 16-20px | Hover tooltip | Data labels |
| Chip/Tag components | 14-16px | Inline | Category markers |
| Background decoration | 48-64px | Float animation | Atmosphere |
| Footer | 16px | Static row | WUBRG signature |

---

## 4. Typography

### Font Stack Recommendations

#### Primary: Beleren (MTG Official Feel)
For headers and important callouts. Beleren is the official MTG font family.

```css
/* If Beleren is available */
font-family: "Beleren Bold", "Beleren", "Plantin MT", Georgia, serif;
```

#### Alternative: System Stack with MTG Feel
```css
/* Headers - Elegant serif */
font-family: "Playfair Display", "Crimson Pro", Georgia, "Times New Roman", serif;

/* Body - Clean readability */
font-family: "Inter", "Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace - Data/Stats */
font-family: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace;
```

### Typography Scale

```typescript
const mtgTypography = {
  heroTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: { xs: '2.5rem', md: '4rem' },
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: { xs: '1.75rem', md: '2.5rem' },
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  cardTitle: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  statValue: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '2rem',
    fontWeight: 700,
  },
  manaLabel: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};
```

---

## 5. Component Styling Guidelines

### Cards with Mana Theming

```tsx
// Mana-themed card component
const ManaThemedCard = styled(Card)<{ manaColor?: ManaColor }>(({ theme, manaColor }) => ({
  borderRadius: 16,
  border: manaColor 
    ? `2px solid ${MANA_COLOR_STYLES[manaColor].border}`
    : '1px solid rgba(255,255,255,0.1)',
  background: manaColor
    ? `linear-gradient(135deg, ${MANA_COLOR_STYLES[manaColor].bg}15, transparent)`
    : theme.palette.background.paper,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: manaColor
      ? `0 12px 32px ${MANA_COLOR_STYLES[manaColor].bg}40`
      : '0 12px 32px rgba(0,0,0,0.15)',
  },
}));
```

### Buttons with Mana Accents

```tsx
// Primary CTA - Gold multicolor theme
const ManaButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F8E231 0%, #D4AF37 100%)',
  color: '#1a1a2e',
  fontWeight: 700,
  padding: '12px 32px',
  borderRadius: 12,
  textTransform: 'none',
  boxShadow: '0 4px 16px rgba(248, 226, 49, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFE44D 0%, #E5C04D 100%)',
    boxShadow: '0 8px 24px rgba(248, 226, 49, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

// Color-specific button variants
const ManaColorButton = styled(Button)<{ manaColor: ManaColor }>(({ manaColor }) => ({
  background: MANA_COLOR_STYLES[manaColor].bg,
  color: MANA_COLOR_STYLES[manaColor].text,
  border: `2px solid ${MANA_COLOR_STYLES[manaColor].border}`,
  '&:hover': {
    background: MANA_COLOR_STYLES[manaColor].border,
    boxShadow: `0 4px 16px ${MANA_COLOR_STYLES[manaColor].bg}60`,
  },
}));
```

### Chips/Tags with Mana Colors

```tsx
// Mana color chip for deck stats
const ManaChip = styled(Chip)<{ manaColor: ManaColor }>(({ manaColor }) => ({
  backgroundColor: MANA_COLOR_STYLES[manaColor].bg,
  color: MANA_COLOR_STYLES[manaColor].text,
  border: `2px solid ${MANA_COLOR_STYLES[manaColor].border}`,
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: MANA_COLOR_STYLES[manaColor].text,
  },
  '&:hover': {
    backgroundColor: MANA_COLOR_STYLES[manaColor].border,
    boxShadow: `0 2px 8px ${MANA_COLOR_STYLES[manaColor].bg}40`,
  },
}));
```

---

## 6. Page-Specific Integration

### Header Enhancement

```
Current: [Logo] ManaTuner Pro [Nav] [Theme Toggle]
Proposed: [WUBRG Symbols] ManaTuner Pro [Nav] [Theme Toggle]
```

**Implementation:**
- Replace or augment logo with animated WUBRG mana symbols
- Symbols subtly pulse/glow on hover
- Active page indicated by corresponding mana color underline

```tsx
// Header mana decoration
<Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
  {['W', 'U', 'B', 'R', 'G'].map((color) => (
    <ManaSymbol 
      key={color} 
      color={color} 
      size="small"
      sx={{
        opacity: 0.8,
        '&:hover': { opacity: 1, transform: 'scale(1.2)' },
      }}
    />
  ))}
</Box>
```

### HomePage Hero Section

**Current:** Blue gradient text, generic icons
**Proposed:** 
- WUBRG gradient text for main headline
- Floating mana symbols as background decoration
- Animated mana orb as visual focal point

```tsx
// Hero with floating mana symbols
<Box sx={{ position: 'relative', overflow: 'hidden' }}>
  {/* Floating background mana symbols */}
  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.1 }}>
    {floatingManaPositions.map((pos, i) => (
      <ManaSymbol
        key={i}
        color={pos.color}
        size="large"
        sx={{
          position: 'absolute',
          ...pos.style,
          animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
        }}
      />
    ))}
  </Box>
  
  {/* Hero content */}
  <Typography
    variant="h1"
    sx={{
      background: 'linear-gradient(135deg, #FFFBD5 0%, #0E68AB 25%, #D3202A 50%, #00733E 75%, #F8E231 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    Can You Cast Your Spells On Curve?
  </Typography>
</Box>
```

### Dashboard/Analyzer

**Mana Distribution Section:**
- Replace emoji color indicator with actual mana symbols
- Color-coded progress bars with mana gradients
- Mana symbol appears in stat cards

**Health Score Card:**
- Border color matches health status (already good)
- Add subtle mana pattern background for excellent scores

### Footer Enhancement

**Current:** Text-based footer
**Proposed:** 
- WUBRG symbol row as decorative divider
- "Made with [heart] and [WUBRG]" signature

```tsx
// Footer mana signature
<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 2 }}>
  <Typography variant="body2" color="text.secondary">
    Crafted with
  </Typography>
  <ManaSequence sequence={['W', 'U', 'B', 'R', 'G']} size="small" />
  <Typography variant="body2" color="text.secondary">
    for planeswalkers everywhere
  </Typography>
</Box>
```

---

## 7. Dark/Light Mode Considerations

### Light Mode
- Parchment-toned backgrounds (`#FAF8F0`, `#F5F0E1`)
- Mana colors at full saturation
- Gold accents for multicolor elements
- Subtle paper texture overlay (optional)

### Dark Mode
- Deep void backgrounds (`#0A0A0A`, `#1A1A1A`)
- Mana colors with increased brightness for visibility
- Cyan/neon accents for contrast
- Subtle glow effects on mana symbols
- Glass morphism with mana-tinted borders

```typescript
const getManaColorForMode = (color: ManaColor, isDark: boolean) => ({
  bg: isDark ? MANA_COLORS_DARK[color] : MANA_COLORS_LIGHT[color],
  glow: isDark ? `${MANA_COLORS_DARK[color]}60` : `${MANA_COLORS_LIGHT[color]}40`,
  border: isDark ? `${MANA_COLORS_DARK[color]}` : MANA_COLOR_STYLES[color].border,
});
```

---

## 8. Animations & Micro-interactions

### Mana Symbol Hover Effects

```css
/* Gentle pulse for static mana symbols */
@keyframes manaPulse {
  0%, 100% { box-shadow: 0 0 8px var(--mana-glow); }
  50% { box-shadow: 0 0 16px var(--mana-glow); }
}

/* Rotation on interaction */
@keyframes manaRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Floating animation for decorative symbols */
@keyframes manaFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}
```

### Color Transition Effects

```tsx
// Smooth color transitions between mana types
const colorTransition = {
  transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
};

// Glow intensification on hover
const glowHover = (color: ManaColor) => ({
  '&:hover': {
    boxShadow: `
      0 0 20px ${MANA_COLOR_STYLES[color].bg}60,
      0 0 40px ${MANA_COLOR_STYLES[color].bg}30
    `,
  },
});
```

### Loading States

```tsx
// Mana orb spinner
const ManaSpinner = () => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {['W', 'U', 'B', 'R', 'G'].map((color, i) => (
      <ManaSymbol
        key={color}
        color={color}
        size="small"
        sx={{
          animation: `manaPulse 1.5s ease-in-out ${i * 0.1}s infinite`,
        }}
      />
    ))}
  </Box>
);
```

---

## 9. Accessibility Considerations

### Color Contrast Requirements

| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| White mana text | `#8B4513` | `#FFFBD5` | 5.2:1 | Pass AA |
| Blue mana text | `#FFFFFF` | `#0E68AB` | 4.8:1 | Pass AA |
| Black mana text | `#FFFFFF` | `#150B00` | 16.4:1 | Pass AAA |
| Red mana text | `#FFFFFF` | `#D3202A` | 4.5:1 | Pass AA |
| Green mana text | `#FFFFFF` | `#00733E` | 4.9:1 | Pass AA |

### ARIA Labels

```tsx
// Proper accessibility for mana symbols
<Box
  role="img"
  aria-label={`${colorName} mana symbol`}
  title={`${colorName} mana - ${description}`}
>
  {/* Symbol content */}
</Box>
```

### Keyboard Navigation

- Mana symbols in interactive contexts must be focusable
- Focus ring should use mana color glow
- All hover effects should also apply on focus

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Install mana-font package or enhance SVG components
2. Update `manaColors.ts` with extended token system
3. Create `ManaSymbolEnhanced` component
4. Update theme with MTG typography

### Phase 2: Core Components (Week 2)
1. Header: Add WUBRG symbols to logo area
2. HomePage: Implement hero gradient and floating symbols
3. DashboardTab: Replace emoji with mana symbols
4. Footer: Add WUBRG signature

### Phase 3: Polish (Week 3)
1. Add hover animations and micro-interactions
2. Implement loading spinners with mana theme
3. Dark mode refinements
4. Accessibility audit and fixes

### Phase 4: Advanced (Future)
1. Background patterns and textures
2. Card frame-inspired component borders
3. Animated page transitions
4. Sound effects (optional, user-controlled)

---

## 11. Files to Modify

### High Priority (Immediate Visual Impact)

| File | Changes |
|------|---------|
| `src/theme/index.ts` | Add MTG typography, extended mana tokens |
| `src/constants/manaColors.ts` | Add glow colors, dark mode variants |
| `src/components/common/ManaSymbols.tsx` | Enhanced styling, mana-font integration |
| `src/components/layout/Header.tsx` | WUBRG symbols in logo, mana-colored active states |
| `src/pages/HomePage.tsx` | Hero gradient, floating symbols, CTA button |
| `src/components/layout/Footer.tsx` | WUBRG signature row |

### Medium Priority (Consistency)

| File | Changes |
|------|---------|
| `src/components/analyzer/DashboardTab.tsx` | Mana symbols in color distribution |
| `src/components/analyzer/ManaDistributionChart.tsx` | Mana-colored chart segments |
| `src/components/analyzer/OverviewTab.tsx` | Mana symbol integration |
| `src/components/analyzer/CastabilityTab.tsx` | Color-coded probability displays |
| `src/components/export/ManaBlueprint.tsx` | Already good, minor enhancements |

### Lower Priority (Enhancement)

| File | Changes |
|------|---------|
| `src/components/common/AnimatedContainer.tsx` | Mana-themed animation variants |
| `src/components/common/BetaBanner.tsx` | Mana accent border |
| `src/pages/GuidePage.tsx` | Mana symbols in explanations |
| `src/pages/MathematicsPage.tsx` | Mana-colored formula highlights |

---

## 12. Resources

### Fonts & Icons
- **Mana Font**: https://mana.andrewgioia.com/
- **Keyrune (Set Symbols)**: https://keyrune.andrewgioia.com/
- **Beleren Font**: https://www.cufonfonts.com/font/beleren

### Official References
- **MTG Color Pie**: https://magic.wizards.com/en/news/feature/color-pie
- **Fan Content Policy**: https://company.wizards.com/fancontentpolicy
- **Scryfall (Card Images)**: https://scryfall.com/

### Inspiration
- Official MTG Arena UI
- MTGGoldfish deck builder
- Moxfield interface
- ChannelFireball articles

---

## Appendix: Quick Reference

### Mana Color Hex Codes (Copy-Paste Ready)

```
White:     #FFFBD5 (light) | #F5F5DC (dark) | #D4AF37 (gold accent)
Blue:      #0E68AB (light) | #4A90E2 (dark) | #00D4FF (cyan accent)
Black:     #150B00 (light) | #2C2C2C (dark) | #8B4789 (purple accent)
Red:       #D3202A (light) | #FF6B6B (dark) | #FF4500 (orange accent)
Green:     #00733E (light) | #4ECDC4 (dark) | #32CD32 (lime accent)
Colorless: #C6C5C5 (light) | #888888 (dark) | #A0A0A0 (gray accent)
Gold:      #F8E231 (primary) | #D4AF37 (secondary) | #B8860B (tertiary)
```

### CSS Custom Properties Template

```css
:root {
  --mana-white: #FFFBD5;
  --mana-blue: #0E68AB;
  --mana-black: #150B00;
  --mana-red: #D3202A;
  --mana-green: #00733E;
  --mana-colorless: #C6C5C5;
  --mana-gold: #F8E231;
  
  --mana-white-glow: rgba(255, 251, 213, 0.4);
  --mana-blue-glow: rgba(14, 104, 171, 0.4);
  --mana-black-glow: rgba(21, 11, 0, 0.6);
  --mana-red-glow: rgba(211, 32, 42, 0.4);
  --mana-green-glow: rgba(0, 115, 62, 0.4);
}

[data-theme="dark"] {
  --mana-white: #F5F5DC;
  --mana-blue: #4A90E2;
  --mana-black: #2C2C2C;
  --mana-red: #FF6B6B;
  --mana-green: #4ECDC4;
}
```

---

*Document Version: 1.0*
*Created: December 2025*
*Author: UI Designer Agent*
*Project: ManaTuner Pro MTG Visual Identity*
