# ManaTuner Pro - Product Strategy 2025

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Active  
**Product Version:** 2.0.0

---

## Executive Summary

ManaTuner Pro is a specialized manabase analysis tool for Magic: The Gathering players. Unlike generic deckbuilders, we focus exclusively on mana optimization using Frank Karsten's mathematical methodology. Our competitive advantage lies in depth of analysis (hypergeometric calculations, Monte Carlo simulations, mulligan optimization) rather than breadth of features.

**Key Differentiators:**
1. Mathematical rigor based on peer-reviewed MTG statistics
2. 100% client-side processing (privacy by default)
3. Advanced mulligan simulation with archetype awareness
4. Multi-format support (Limited, Constructed, Commander)

**Current State:**
- Audit Score: 85/100 (production-ready with improvements needed)
- Live at: https://manatuner-pro.vercel.app
- Test Coverage: 86/88 passing

---

## 1. Positioning Statement

### What We Are

**ManaTuner Pro is the mathematical manabase optimizer for competitive MTG players.**

We transform Frank Karsten's research into actionable recommendations, helping players:
- Determine optimal land counts for specific mana curves
- Calculate turn-by-turn casting probabilities
- Simulate mulligan decisions before tournaments
- Validate manabase choices with statistical confidence

### What We Are NOT

- A deckbuilder (use Moxfield, Archidekt)
- A collection manager (use Deckbox, EchoMTG)
- A price tracker (use MTGGoldfish, TCGPlayer)
- A social platform (use Discord, Reddit)

### Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| **Frank Karsten Articles** | Authoritative theory | No interactive tool | We implement his math |
| **Basic Mana Calculators** | Simple, quick | No Monte Carlo, no mulligan | Deeper analysis |
| **Moxfield/Archidekt** | Full deckbuilding suite | Manabase is afterthought | Specialized depth |
| **MTGGoldfish** | Meta data, decklists | Generic land recommendations | Custom deck analysis |
| **Untapped.gg** | Gameplay data | Requires tracker install | Zero friction, web-only |

### Unique Value Proposition

> "Know exactly how many sources you need for your specific deck, validated by 10,000+ Monte Carlo simulations, before you shuffle up."

---

## 2. Target User Personas

### Primary: Competitive Spike (60% of users)

**Profile:**
- Plays FNM to Regional Championships
- Netdecks but wants to understand choices
- Spends $200-2000/year on Magic
- Uses multiple tools (Moxfield + Untapped + ManaTuner)

**Jobs to Be Done:**
1. "I copied a decklist but want to verify the manabase for my local meta"
2. "I'm choosing between Pathway and Shockland - show me the math"
3. "My deck mulligans too much - is it the lands or the curve?"

**Pain Points:**
- Generic "26 lands" advice doesn't account for curve
- Trial and error at tournaments is expensive
- Understanding Karsten's articles requires math background

**Success Metrics:**
- Time to first analysis < 30 seconds
- Understands recommendations without external research
- Returns within 7 days for another deck

---

### Secondary: Brewer/Johnny (25% of users)

**Profile:**
- Builds original decks weekly
- Tests in casual/online before paper
- Values understanding over copying
- Active in brewing communities

**Jobs to Be Done:**
1. "I'm building a 5-color deck - how greedy can I get?"
2. "This combo needs UUU on turn 4 - is 60 cards enough?"
3. "Compare my manabase to the stock list"

**Pain Points:**
- Novel decks have no reference data
- Iterating on manabase is tedious
- No way to validate unconventional choices

**Success Metrics:**
- Uses comparison features
- Saves multiple deck analyses
- Shares analysis with brewing community

---

### Tertiary: Content Creator (15% of users)

**Profile:**
- YouTube/Twitch streamer or article writer
- Needs visual aids for content
- Values export features
- Influences purchasing decisions

**Jobs to Be Done:**
1. "I need charts for my deck tech video"
2. "Explain WHY this manabase works to my audience"
3. "Compare pro lists to budget alternatives"

**Pain Points:**
- Creating mana visualizations manually is slow
- Hard to explain probability to viewers
- Need professional-looking exports

**Success Metrics:**
- Uses PNG/PDF export
- Links to ManaTuner in content
- Drives referral traffic

---

## 3. Public Roadmap

### v2.1 - Quality & Performance (Q1 2025)

**Theme:** Address critical audit findings, improve core experience

---

## Visual Identity Refresh (v2.1)

### Scope Definition

**In Scope:**
| Element | Description | Priority |
|---------|-------------|----------|
| Mana Icons | Official WUBRG + colorless symbols | P1 |
| Color Palette | MTG-inspired colors (not exact copies) | P2 |
| Subtle Theming | Card frame aesthetic, parchment textures | P3 |
| Iconography | Consistent visual language for UI elements | P3 |

**Out of Scope:**
| Element | Reason |
|---------|--------|
| Card Images | Copyright-protected, requires licensing |
| Set Symbols | Trademarked, not covered by fan content policy |
| Wizards Logos | Protected trademarks |
| Card Art | Artist copyright, licensing required |
| Planeswalker Symbols | Protected brand elements |

---

### Legal Considerations

#### Wizards of the Coast Fan Content Policy

**Summary:**
Wizards permits non-commercial fan content that uses certain MTG IP elements under specific conditions. ManaTuner Pro qualifies as fan content because:

1. **Non-Commercial:** App is free, no monetization
2. **Non-Official:** Clearly not affiliated with Wizards
3. **Transformative:** Educational/utility tool, not reproduction

**What We CAN Use:**
| Element | Permitted Use | Notes |
|---------|---------------|-------|
| Mana Symbols | Display in UI | Must not imply official status |
| Color Names (WUBRG) | Reference in text | Standard MTG terminology |
| Game Mechanics Terms | Educational context | Casting cost, mana curve, etc. |
| Color Pie Concepts | Analysis and visualization | Core to our utility |

**What We CANNOT Use:**
| Element | Reason |
|---------|--------|
| Card scans/images | Requires separate license |
| Set symbols | Trademarked |
| "Magic: The Gathering" in app name | Trademark infringement |
| Official Wizards artwork | Copyright protected |
| DCI/WPN branding | Organized play trademarks |

**Required Attribution:**
```
ManaTuner Pro is unofficial Fan Content permitted under the Fan Content Policy.
Not approved/endorsed by Wizards. Portions of the materials used are property
of Wizards of the Coast. (c) Wizards of the Coast LLC.
```

**Placement:** Footer of every page, About/Legal page

---

### Implementation Phases

#### Phase 1: Mana Icons Integration (Week 1-2)

**Objective:** Replace text-based mana symbols with official iconography

**Deliverables:**
| Task | Effort | Owner |
|------|--------|-------|
| Source SVG mana icons (Keyrune or Mana font) | 2h | Dev |
| Create ManaIcon component | 2h | Dev |
| Integrate in DeckAnalyzer cost displays | 3h | Dev |
| Add icons to color source summaries | 2h | Dev |
| Implement icon size variants (sm/md/lg) | 1h | Dev |
| Add accessibility alt text | 1h | Dev |

**Technical Approach:**
- Use Keyrune font (MIT licensed, community standard)
- SVG sprites for optimal performance
- CSS custom properties for theming
- Lazy load icon font after critical CSS

**Success Criteria:**
- All mana costs display with icons
- Icon font < 15KB gzipped
- Lighthouse score maintained
- Screen reader accessible

---

#### Phase 2: Color Palette Refresh (Week 3)

**Objective:** MTG-inspired color system that feels thematic without copying

**Color Strategy:**
| Color | Current | Proposed | Inspiration |
|-------|---------|----------|-------------|
| Primary | MUI Blue | Deep Sea Blue | Blue mana |
| Secondary | MUI Purple | Forest Green | Green mana |
| Error | MUI Red | Mountain Red | Red mana |
| Warning | MUI Orange | Plains Gold | White mana |
| Info | MUI Light Blue | Swamp Purple | Black mana |
| Background | #121212 | Aged Parchment tint | Card texture |

**Deliverables:**
| Task | Effort |
|------|--------|
| Define custom MUI theme palette | 2h |
| Create color tokens (CSS variables) | 1h |
| Update component overrides | 3h |
| Dark mode variant refinement | 2h |
| Color contrast audit (WCAG AA) | 1h |

**Constraints:**
- Maintain WCAG AA contrast ratios
- Support both light and dark modes
- Do not use exact WotC brand colors

---

#### Phase 3: Component Styling (Week 4-5)

**Objective:** Subtle MTG theming in UI components

**Target Components:**
| Component | Enhancement | Effort |
|-----------|-------------|--------|
| Cards/Panels | Subtle border glow by color | 2h |
| Buttons | Mana-colored variants | 2h |
| Charts | Color-coded by mana type | 3h |
| Headers | Parchment texture option | 2h |
| Icons | Consistent style guide | 2h |
| Data tables | Row highlighting by color | 1h |

**Design Principles:**
- Subtle enhancement, not overwhelming
- Function over form (usability first)
- Consistent with existing MUI patterns
- Optional intensity setting for users

---

#### Phase 4: Animations & Polish (Week 6)

**Objective:** Microinteractions that enhance MTG feel

**Animations:**
| Animation | Context | Complexity |
|-----------|---------|------------|
| Mana icon shimmer | On hover/focus | Low |
| Color transitions | Theme switching | Low |
| Card flip effect | Result reveal | Medium |
| Particle effects | Celebration states | High (optional) |

**Performance Constraints:**
- CSS-only animations preferred
- No animations on reduced-motion preference
- Max 60fps, no jank
- Total animation JS < 5KB

---

### Success Metrics

#### User Engagement

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Time on Site | TBD | +15% | Analytics |
| Pages per Session | TBD | +10% | Analytics |
| Tab Exploration Rate | TBD | +20% | Event tracking |
| Return Visits (7-day) | TBD | +10% | Analytics |

#### Social Sharing

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Screenshot Shares | 0 | 5/week | Social monitoring |
| Reddit Post Mentions | TBD | +25% | Manual tracking |
| Content Creator References | TBD | +2/quarter | Partnership tracking |

#### Community Feedback

| Metric | Target | Method |
|--------|--------|--------|
| Visual Design Rating | > 4.0/5 | Survey |
| "Feels like MTG" Sentiment | > 70% agree | Survey |
| Accessibility Score | Maintained | Lighthouse |
| Performance Score | Maintained | Lighthouse |

---

### Risk Assessment

#### Legal Risk: LOW

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Fan Content Policy violation | Very Low | High | Strict scope, legal review |
| Trademark confusion | Low | Medium | Clear "unofficial" branding |
| Cease and desist | Very Low | High | Document compliance, quick removal capability |

**Mitigations:**
- Use only explicitly permitted elements
- Add required attribution to footer
- Maintain removal capability (< 1 hour)
- Document all IP usage decisions

#### UX Risk: MEDIUM

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Aesthetics over usability | Medium | High | User testing, A/B tests |
| Accessibility regression | Medium | Medium | WCAG audit after each phase |
| Visual clutter | Medium | Medium | Minimalist approach, user feedback |
| Inconsistent styling | Low | Low | Design system documentation |

**Mitigations:**
- Usability testing after Phase 2
- Accessibility audit at each phase gate
- User preference for reduced theming
- Component library documentation

#### Performance Risk: LOW

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Icon font bloat | Medium | Medium | Subset fonts, lazy load |
| Animation jank | Low | Low | CSS-only, performance budget |
| Image assets increase | Low | Medium | SVG optimization, sprites |
| Bundle size regression | Low | Medium | Size budget enforcement |

**Performance Budgets:**
| Asset | Max Size | Current | Headroom |
|-------|----------|---------|----------|
| Icon Font | 15KB | 0 | 15KB |
| Theme CSS | 10KB | ~5KB | 5KB |
| Animation JS | 5KB | 0 | 5KB |
| Total Impact | 30KB | - | - |

---

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12 | Use Keyrune font | MIT licensed, community standard, well-maintained |
| 2025-12 | 4-phase rollout | Incremental validation, reversible changes |
| 2025-12 | No card images | Outside Fan Content Policy safe zone |
| 2025-12 | Subtle theming only | Usability priority over aesthetics |
| 2025-12 | Performance budget 30KB | Maintain Lighthouse scores |

---

**Priority P0 - Critical (Week 1-2):**
| Item | Effort | Impact | Status |
|------|--------|--------|--------|
| Fix mobile navigation (menu doesn't work) | 2h | Blocker | Planned |
| Lazy load 6 main pages | 1h | -40% bundle | Planned |
| Remove unused deps (framer-motion, next-pwa) | 30min | -40KB | Planned |
| Correct privacy claims on website | 2h | Legal/Trust | Planned |

**Priority P1 - High (Week 3-4):**
| Item | Effort | Impact | Status |
|------|--------|--------|--------|
| Reduce tabs from 7 to 4 (UX clarity) | 2h | Major UX | Planned |
| Implement actual localStorage encryption | 4h | Security | Planned |
| Add Vite manual chunking | 30min | +50% cache | Planned |
| Use existing useDeckAnalysis hook | 1h | Code quality | Planned |

**Success Criteria:**
- Mobile navigation functional
- Lighthouse Performance > 85
- Bundle size < 400KB gzipped
- Privacy claims match implementation

**Release Target:** February 2025

---

### v2.2 - User-Requested Features (Q2 2025)

**Theme:** Address feedback from competitive players

**Features:**
| Feature | User Request Frequency | Effort | Priority |
|---------|------------------------|--------|----------|
| Mana Dork/Rock integration | High | 6h | P1 |
| Deck comparison mode | Medium | 8h | P1 |
| Sideboard manabase analysis | Medium | 4h | P2 |
| Import from Moxfield/Archidekt URL | High | 4h | P1 |
| Keyboard shortcuts for power users | Low | 2h | P3 |

**Mana Acceleration System (P1):**
```
Sources Effectives = Lands + (Dorks x 0.7) + (Rocks x 0.85)
```
- Phase 1: Top 30 mana producers hardcoded
- Phase 2: Auto-detection via Scryfall oracle text
- Phase 3: Format-specific coefficients

**Success Criteria:**
- 3 new features shipped based on user feedback
- User satisfaction survey > 4/5
- Feature adoption > 30% within 30 days

**Release Target:** May 2025

---

### v2.5 - Major Enhancements (Q3 2025)

**Theme:** Differentiate with unique analytical capabilities

**Features:**
| Feature | Competitive Moat | Effort | Priority |
|---------|------------------|--------|----------|
| Matchup-aware mulligan | Unique | 20h | P1 |
| Opening hand practice mode | Unique | 16h | P1 |
| Historical hand tracking | Medium | 12h | P2 |
| Archetype detection AI | High | 24h | P2 |

**Matchup-Aware Mulligan:**
- "Keep 1-landers vs Control, mull vs Aggro"
- Archetype-specific keep/mull thresholds
- Sample hands categorized by matchup viability

**Opening Hand Practice:**
- Simulate opening hands for YOUR deck
- Practice keep/mull decisions
- Track improvement over time
- Spaced repetition for muscle memory

**Success Criteria:**
- 2 unique features not available elsewhere
- User retention +20% vs v2.2
- Content creator adoption (5+ YouTube mentions)

**Release Target:** September 2025

---

### v3.0 - Vision (Q4 2025+)

**Theme:** Become the definitive manabase authority

**Strategic Initiatives:**
1. **Community Benchmarks:** Aggregate anonymized analysis data to show "average manabase health" by format
2. **Tournament Integration:** Partner with tournament organizers for post-event manabase analysis
3. **API for Developers:** Allow other tools to integrate ManaTuner analysis
4. **Mobile App:** React Native wrapper for offline tournament use

**Long-term Vision:**
> Every competitive MTG player checks their manabase with ManaTuner before registering a deck.

---

## 4. Feature Prioritization Matrix

### Impact vs Effort Framework

```
                    HIGH IMPACT
                        |
    QUICK WINS          |         BIG BETS
    (Do First)          |         (Plan Carefully)
                        |
  - Mobile nav fix      |    - Matchup mulligan
  - Lazy loading        |    - Opening hand practice
  - Tab consolidation   |    - API for developers
                        |
  ----------------------+----------------------- HIGH EFFORT
                        |
    FILL-INS            |         MONEY PITS
    (If Time Permits)   |         (Avoid)
                        |
  - Keyboard shortcuts  |    - Full i18n FR/EN
  - Dark mode tweaks    |    - Social features
  - Tooltip polish      |    - User accounts
                        |
                    LOW IMPACT
```

### Prioritization Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| User Value | 40% | Does it solve a real pain point? |
| Competitive Moat | 25% | Does it differentiate us? |
| Technical Complexity | 20% | Feasibility and risk |
| Strategic Fit | 15% | Aligns with positioning? |

### Current Priority Stack (Ordered)

1. **Mobile navigation fix** - Blocker, affects 40%+ of traffic
2. **Performance optimization** - Affects SEO and retention
3. **Privacy claim corrections** - Legal/trust risk
4. **Tab UX consolidation** - High friction reducer
5. **Mana Dork integration** - Most requested feature
6. **Deck URL import** - Reduces friction to first analysis
7. **Matchup mulligan** - Unique differentiator
8. **Opening hand practice** - Unique, high engagement potential

---

## 5. Success Metrics & KPIs

### North Star Metric

> **Weekly Active Analyses (WAA):** Number of unique deck analyses performed per week

**Why this metric:**
- Directly measures core value delivery
- Leading indicator of utility and engagement
- Not gameable (unlike page views)

---

### Metric Framework

#### Acquisition Metrics
| Metric | Current | 3-Month Goal | 6-Month Goal | 12-Month Goal |
|--------|---------|--------------|--------------|---------------|
| Monthly Unique Visitors | TBD | 1,000 | 3,000 | 10,000 |
| Organic Search Traffic | TBD | 30% | 40% | 50% |
| Referral from Content Creators | TBD | 5% | 10% | 15% |

#### Engagement Metrics
| Metric | Current | 3-Month Goal | 6-Month Goal | 12-Month Goal |
|--------|---------|--------------|--------------|---------------|
| Analyses per Session | TBD | 1.5 | 2.0 | 2.5 |
| Time to First Analysis | TBD | < 60s | < 45s | < 30s |
| Tab Engagement (all tabs viewed) | TBD | 40% | 50% | 60% |
| Export Usage Rate | TBD | 5% | 10% | 15% |

#### Retention Metrics
| Metric | Current | 3-Month Goal | 6-Month Goal | 12-Month Goal |
|--------|---------|--------------|--------------|---------------|
| 7-Day Return Rate | TBD | 15% | 25% | 35% |
| 30-Day Return Rate | TBD | 8% | 15% | 25% |
| Saved Analyses per User | TBD | 1.0 | 2.0 | 3.5 |

#### Technical Health Metrics
| Metric | Current | 3-Month Goal | 6-Month Goal | 12-Month Goal |
|--------|---------|--------------|--------------|---------------|
| Lighthouse Performance | ~75 | 85 | 90 | 95 |
| Bundle Size (gzipped) | 338KB | 280KB | 250KB | 200KB |
| Core Web Vitals (LCP) | ~2.5s | < 2.0s | < 1.5s | < 1.0s |
| Error Rate | TBD | < 1% | < 0.5% | < 0.1% |

---

### OKRs by Quarter

#### Q1 2025 - Foundation

**Objective 1:** Achieve production-grade quality
- KR1: Audit score from 85 to 92/100
- KR2: Zero critical bugs in production
- KR3: Mobile navigation fully functional

**Objective 2:** Establish baseline metrics
- KR1: Analytics implemented (privacy-respecting)
- KR2: All KPI dashboards operational
- KR3: First 500 unique visitors tracked

#### Q2 2025 - Growth

**Objective 1:** Grow weekly active analyses
- KR1: 500 WAA by end of quarter
- KR2: 25% of users perform 2+ analyses
- KR3: 3 content creator partnerships

**Objective 2:** Ship user-requested features
- KR1: Mana Dork integration launched
- KR2: Deck URL import launched
- KR3: User satisfaction > 4.2/5

#### Q3 2025 - Differentiation

**Objective 1:** Launch unique features
- KR1: Matchup mulligan beta with 100 testers
- KR2: Opening hand practice mode launched
- KR3: No direct competitor matches features

**Objective 2:** Build community presence
- KR1: Reddit r/spikes mention in sidebar
- KR2: 10+ YouTube videos referencing tool
- KR3: Discord community of 200+ members

#### Q4 2025 - Scale

**Objective 1:** Become category leader
- KR1: 5,000 WAA
- KR2: "MTG manabase calculator" #1 Google result
- KR3: API beta with 3 partner integrations

---

## 6. Go-to-Market Strategy

### Launch Channels (Priority Order)

#### 1. Reddit (Primary - Free)

**Target Subreddits:**
| Subreddit | Subscribers | Strategy |
|-----------|-------------|----------|
| r/spikes | 180K | Deep analysis posts, tool as resource |
| r/MagicArena | 500K | "Improve your manabase" guides |
| r/EDH | 400K | Commander-specific features |
| r/ModernMagic | 80K | Format-specific examples |
| r/PioneerMTG | 30K | Pioneer manabase challenges |

**Content Strategy:**
- Share educational content first (value before promotion)
- Respond to "how many lands?" questions with tool link
- Post major feature releases as announcements
- Never spam - quality over quantity

**Cadence:** 2-3 valuable posts per month

#### 2. YouTube (Secondary - Free/Effort)

**Partnership Strategy:**
- Identify 20 MTG content creators (10K-100K subs)
- Offer early access to features
- Provide custom graphics for videos
- No payment - value exchange only

**Target Creators:**
- Deck tech focused (Aspiringspike, Covertgoblue)
- Educational (Tolarian Community College)
- Competitive (Reid Duke, PVDDR channels)

**Own Content (Future):**
- Short-form: "Manabase Math in 60 Seconds" series
- Long-form: "Deep Dive: Modern Manabase Optimization"

#### 3. Twitter/X (Tertiary - Awareness)

**Strategy:**
- Share interesting analysis results
- Engage with MTG pros and content creators
- Post during major tournaments (manabase failures)
- Meme potential: "Should have used ManaTuner"

**Cadence:** 3-5 posts per week during active periods

#### 4. SEO (Long-term - Compounding)

**Target Keywords:**
| Keyword | Monthly Volume | Difficulty | Priority |
|---------|----------------|------------|----------|
| mtg manabase calculator | 1,000 | Low | P1 |
| how many lands mtg | 2,500 | Medium | P1 |
| frank karsten lands | 500 | Low | P1 |
| mtg mana curve calculator | 800 | Low | P2 |
| mtg mulligan simulator | 400 | Low | P2 |

**Content Strategy:**
- Blog posts explaining methodology
- Mathematics page optimized for "frank karsten"
- Guide page optimized for "how many lands"
- Landing pages for each format

---

### Community Building Strategy

#### Phase 1: Seed (Q1-Q2 2025)

- Create Discord server
- Invite power users from Reddit
- Gather feature feedback directly
- Build relationships with content creators

**Goal:** 100 Discord members, 10 active contributors

#### Phase 2: Grow (Q3-Q4 2025)

- Feature request voting system
- User-submitted deck analyses showcase
- Monthly "Manabase of the Month" highlight
- Beta tester program for new features

**Goal:** 500 Discord members, 50 regular contributors

#### Phase 3: Scale (2026+)

- Community-driven content (guides, templates)
- Ambassador program for local game stores
- Tournament result integration
- API access for community developers

---

### Content Strategy

#### Educational Content (70%)

| Topic | Format | Frequency |
|-------|--------|-----------|
| Manabase fundamentals | Blog post | Monthly |
| Format-specific guides | Blog post | Quarterly |
| Card spotlight (lands) | Social | Weekly |
| Math explanations | Video | Quarterly |

#### Tool Updates (20%)

| Topic | Format | Frequency |
|-------|--------|-----------|
| Feature announcements | Blog + Social | Per release |
| Changelog summaries | Newsletter | Monthly |
| Roadmap updates | Blog | Quarterly |

#### Community Spotlight (10%)

| Topic | Format | Frequency |
|-------|--------|-----------|
| User success stories | Social | Monthly |
| Content creator features | Blog | Quarterly |
| Tournament manabase analysis | Blog | Per major event |

---

## 7. Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scryfall API changes/limits | Medium | High | Cache aggressively, fallback data |
| Performance at scale | Low | Medium | Edge caching, optimize calculations |
| Browser compatibility issues | Low | Low | Test matrix, progressive enhancement |

### Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Moxfield adds advanced manabase | Medium | High | Differentiate on depth, not breadth |
| WotC builds official tool | Low | Critical | Pivot to education/community |
| MTG popularity decline | Low | Medium | Core audience (competitive) is stable |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Single maintainer burnout | Medium | High | Document everything, community contributions |
| Hosting costs increase | Low | Low | Static hosting is cheap, Vercel free tier |
| Security vulnerability | Low | High | Regular audits, minimal attack surface |

---

## 8. Resource Requirements

### Current State

- **Team:** Solo developer
- **Infrastructure:** Vercel free tier (sufficient for 100K+ visits/month)
- **External Services:** Scryfall API (free), Supabase (optional, free tier)
- **Budget:** $0/month operational cost

### Q1-Q2 2025 Needs

| Resource | Purpose | Cost |
|----------|---------|------|
| Analytics (Plausible) | Privacy-respecting metrics | $9/month |
| Uptime monitoring | Alert on outages | Free (UptimeRobot) |
| Domain/SSL | Already covered | $15/year |

**Total: ~$120/year**

### Q3-Q4 2025 Needs (If Growth)

| Resource | Purpose | Cost |
|----------|---------|------|
| Vercel Pro | Higher limits, analytics | $20/month |
| CDN (if needed) | Global performance | $0-50/month |
| Content creation | Video editing, graphics | Time investment |

**Total: ~$840/year maximum**

---

## Appendix A: Audit Score Breakdown

| Category | Current Score | Target (v2.1) | Notes |
|----------|---------------|---------------|-------|
| UI/Design | 7.5/10 | 8.0/10 | Minor polish needed |
| UX/Ergonomie | 6.2/10 | 8.0/10 | Tab consolidation critical |
| Performance | 6.0/10 | 8.5/10 | Lazy loading + chunking |
| Code Quality | 6.5/10 | 8.0/10 | Use existing hooks |
| **Weighted Average** | **6.5/10** | **8.1/10** | +1.6 improvement |

---

## Appendix B: Security Remediation Plan

Based on Security Audit (December 2025):

| Finding | Severity | Status | Target |
|---------|----------|--------|--------|
| localStorage not encrypted | Critical | Open | v2.1 |
| Privacy claims inaccurate | Critical | Open | v2.1 |
| Scryfall data transmission not disclosed | High | Open | v2.1 |
| Firebase Analytics in codebase | Medium | Open | v2.1 |
| Unused Sentry dependency | Low | Open | v2.1 |

---

## Appendix C: Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12 | Focus on competitive players (Spikes) | Highest willingness to engage deeply with tools |
| 2025-12 | No user accounts for v2.x | Adds complexity, privacy concerns, low value |
| 2025-12 | Reddit-first GTM | Highest concentration of target users, free |
| 2025-12 | No i18n in 2025 | Low ROI, MTG terms are English anyway |
| 2025-12 | No mobile app in 2025 | PWA sufficient, development cost too high |

---

*Document maintained by Product Management*  
*Next review: March 2025*
