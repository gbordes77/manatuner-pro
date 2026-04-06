---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
lastStep: 11
workflowType: 'prd'
inputDocuments:
  - docs/index.md
  - docs/project-overview.md
  - docs/PRODUCT_STRATEGY.md
  - docs/FUTURE_IDEAS.md
  - PROJECT_CONTEXT.md
  - docs/technology-stack.md
  - docs/component-inventory.md
  - docs/development-guide.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 8
projectContext: brownfield
---

# Product Requirements Document - ManaTuner

**Author:** Guillaume
**Date:** 2026-01-07
**Version:** Draft 1.0
**Status:** Complete

---

## Executive Summary

ManaTuner is a specialized manabase analysis tool for Magic: The Gathering players, implementing Frank Karsten's peer-reviewed hypergeometric probability methodology. Unlike generic deckbuilders (Moxfield, Archidekt), the application focuses exclusively on mana optimization through mathematical rigor.

### Vision Statement

> Every competitive MTG player checks their manabase with ManaTuner before registering a deck.

### Core Value Proposition

Transform complex probability mathematics into actionable recommendations:

- **Optimal land counts** calculated for specific mana curves
- **Turn-by-turn casting probabilities** via hypergeometric distribution
- **Monte Carlo mulligan simulation** with archetype awareness
- **Statistical confidence** for manabase validation

### Target Users

| Persona           | Share | Primary Job-to-be-Done                   |
| ----------------- | ----- | ---------------------------------------- |
| Competitive Spike | 60%   | Verify manabase for tournament decks     |
| Brewer/Johnny     | 25%   | Validate unconventional manabase choices |
| Content Creator   | 15%   | Generate visual aids for deck techs      |

### Current State

- **Version:** 2.0.0 (Production)
- **Audit Score:** 85/100
- **Live URL:** https://manatuner.app
- **Architecture:** React 18 SPA, 100% client-side, privacy-first

### What Makes This Special

1. **Mathematical Rigor** - Based on peer-reviewed MTG statistics (Frank Karsten methodology)
2. **Privacy by Default** - Zero data transmission, 100% client-side processing
3. **Monte Carlo Simulation** - 10,000+ iterations for mulligan decisions
4. **Multi-Format Support** - Limited, Constructed, Commander analysis

## Project Classification

**Technical Type:** web_app (SPA/PWA)
**Domain:** scientific (computational probability analysis)
**Complexity:** medium
**Project Context:** Brownfield - extending existing production system

### Technology Stack

| Layer      | Technology                  | Version     |
| ---------- | --------------------------- | ----------- |
| Language   | TypeScript                  | 5.9         |
| Framework  | React                       | 18.2        |
| Build Tool | Vite                        | 7.3         |
| UI Library | MUI                         | 5.11        |
| State      | Redux Toolkit + React Query | -           |
| Testing    | Vitest + Playwright         | 4.0 / 1.53  |
| Deployment | Vercel                      | PWA-enabled |

### Existing Codebase Metrics

- **Source Files:** 109
- **React Components:** 34
- **Services:** 13
- **Custom Hooks:** 10
- **Pages:** 7

---

## Success Criteria

### North Star Metric

**Weekly Active Analyses (WAA)**: Number of unique deck analyses performed per week.

- Directly measures core value delivery
- Leading indicator of utility and engagement
- Not gameable (unlike page views)

### User Success

| Metric                           | Current | Target | Measurement    |
| -------------------------------- | ------- | ------ | -------------- |
| Time to First Analysis           | TBD     | < 30s  | Analytics      |
| Analysis Completion Rate         | TBD     | > 90%  | Event tracking |
| Tab Engagement (all tabs viewed) | TBD     | 60%    | Event tracking |
| Export Usage Rate                | TBD     | 15%    | Event tracking |

**User Success Moments:**

- "I understand why my deck mulligans too often"
- "I know exactly how many sources I need for my curve"
- "I can explain my manabase choices with confidence"

### Business Success

| Metric                   | 3-Month | 6-Month | 12-Month |
| ------------------------ | ------- | ------- | -------- |
| Monthly Unique Visitors  | 1,000   | 3,000   | 10,000   |
| Weekly Active Analyses   | 500     | 1,500   | 5,000    |
| 7-Day Return Rate        | 15%     | 25%     | 35%      |
| Content Creator Mentions | 3       | 10      | 25+      |
| Organic Search Traffic   | 30%     | 40%     | 50%      |

### Technical Success

| Metric                 | Target   | Priority |
| ---------------------- | -------- | -------- |
| Lighthouse Performance | > 90     | P0       |
| Bundle Size (gzipped)  | < 300KB  | P1       |
| Core Web Vitals (LCP)  | < 2.5s   | P1       |
| Error Rate             | < 0.1%   | P1       |
| Audit Score            | > 90/100 | P1       |

### Measurable Outcomes

**Q1 2025 - Foundation:**

- Audit score > 90/100
- Zero critical bugs in production
- All KPI dashboards operational

**Q2 2025 - Growth:**

- 500 WAA by end of quarter
- 25% of users perform 2+ analyses
- 3 content creator partnerships
- User satisfaction > 4.2/5

---

## Product Scope

### MVP - Current State (v2.0.0)

**Core Capabilities (Already Implemented):**

- Deck text input with multi-format parsing
- Frank Karsten hypergeometric calculations
- Turn-by-turn castability probabilities
- Monte Carlo mulligan simulation (10K iterations)
- Mana source breakdown visualization
- PDF/PNG export (Blueprint)
- LocalStorage persistence
- PWA offline support

### Growth Features (v2.2)

**User Requested Features:**

| Feature                            | Request Frequency | Effort |
| ---------------------------------- | ----------------- | ------ |
| Mana Dork/Rock integration         | High              | 6h     |
| Import from Moxfield/Archidekt URL | High              | 4h     |
| Deck comparison mode               | Medium            | 8h     |
| Sideboard manabase analysis        | Medium            | 4h     |

### Vision (v2.5 - v3.0)

**Unique Differentiators (v2.5):**

| Feature                    | Competitive Moat                       |
| -------------------------- | -------------------------------------- |
| Matchup-aware mulligan     | Unique - archetype-specific thresholds |
| Opening hand practice mode | Unique - spaced repetition training    |
| Historical hand tracking   | Medium - track improvement over time   |
| Archetype detection AI     | High - auto-categorize decks           |

**Strategic Initiatives (v3.0+):**

- Community benchmarks (anonymized aggregate data)
- Tournament integration (post-event analysis)
- Public API for developers
- React Native mobile app

---

## User Journeys

### Journey 1: Alex Chen - The Competitive Spike

Alex is a 28-year-old software developer who plays Modern at his local game store every Friday Night Magic. He recently qualified for a Regional Championship and wants to ensure his Rakdos Scam deck has the optimal manabase for the meta.

After copying a decklist from a pro tour top 8, Alex notices his deck mulligans more than expected in testing. "Should I cut a land? Add one?" he wonders. A friend mentions ManaTuner in their Discord server.

Alex visits manatuner.app on his lunch break. He pastes his 60-card decklist into the analyzer. Within seconds, he sees a "Mana Health Score" of 72% - lower than he expected. The Dashboard tab shows his black mana requirements are stressed: he needs B on turn 1 for Thoughtseize but only has 14 black sources.

The breakthrough comes in the Castability tab. Alex sees that his probability of casting Thoughtseize on turn 1 is only 68% - well below Frank Karsten's recommended 90%+ threshold. The recommendation panel suggests: "Add 2 black sources (consider Blackcleave Cliffs replacing basic Mountain)."

At the Regional Championship, Alex's deck runs smoothly. He takes 3rd place and credits the manabase optimization to his Discord friends: "ManaTuner showed me exactly why I was mulliganing. The math doesn't lie."

**Requirements Revealed:**

- Deck text parsing (multiple formats)
- Health score calculation
- Per-color source analysis
- Turn-by-turn castability probabilities
- Actionable recommendations

### Journey 2: Maya Rodriguez - The Creative Brewer

Maya is a 35-year-old high school teacher who brews original Commander decks as her creative outlet. She's building a 5-color "Secret Lair" theme deck and has no idea how greedy her manabase can be.

Her current draft has every card she loves but only 32 lands - she's read that's the "standard" for Commander. But with 5 colors and multiple WWUU and BBBG costs, she's worried.

Maya imports her Moxfield decklist URL into ManaTuner (v2.2 feature). The analyzer immediately shows red flags: her probability of casting Omnath, Locus of Creation on turn 4 is only 41%. The Monte Carlo simulation shows she'll be stuck unable to cast spells 30% of games.

Through the Manabase Breakdown, Maya realizes she has no dual lands that produce both blue and black - a critical gap. The tool suggests specific land additions based on her color requirements, not generic "add more lands" advice.

Maya rebuilds her manabase using the recommendations. She goes from 32 to 37 lands, adds 4 specific dual lands, and cuts some janky enchantments. Her playgroup notices the deck is suddenly "scary consistent."

**Requirements Revealed:**

- External decklist import (Moxfield, Archidekt)
- Commander format support (40-card minimum lands)
- Color gap analysis
- Monte Carlo game simulation
- Specific land recommendations

### Journey 3: StreamerKyle - The Content Creator

Kyle runs a 25K subscriber YouTube channel focused on budget Modern decks. He's preparing a video comparing the manabases of the budget vs. optimal versions of Mono-Green Tron.

He needs professional-looking charts and clear explanations he can screenshot or export for his video. Just showing "26 lands" vs "24 lands" doesn't tell the story he wants.

Kyle analyzes both decklists in ManaTuner, switching between them in tabs. The Blueprint export gives him a beautiful full-page analysis he can screenshot. The probability curves visualize exactly why the optimal version runs fewer lands but more tutors.

For his video, he exports both analyses as PNGs. The visual comparison shows his audience in one glance why "1 Expedition Map = 1 land" in terms of consistency. His video gets 3x normal engagement, with comments specifically praising the "awesome mana charts."

Kyle starts linking ManaTuner in all his deck tech descriptions. His audience brings consistent traffic.

**Requirements Revealed:**

- Multi-deck comparison (v2.2)
- High-quality image/PDF export
- Visual probability curves
- Professional chart aesthetics
- Shareable analysis links

### Journey 4: Error Recovery - Connection Failure

Alex is analyzing a deck on his phone during a tournament when the venue WiFi drops. The page shows a loading spinner that never completes.

With PWA offline support, the app detects the network failure and switches to cached mode. Alex's previous analyses are available from localStorage. He can even run new analyses since all calculations happen client-side - only Scryfall card images are unavailable.

When connection returns, the app seamlessly resumes with a subtle toast: "Back online." No data was lost, no analysis was interrupted.

**Requirements Revealed:**

- PWA offline support
- Graceful network failure handling
- LocalStorage persistence
- Client-side calculations (no server dependency)
- Reconnection detection

### Journey Requirements Summary

| Journey           | Primary Capabilities                                    |
| ----------------- | ------------------------------------------------------- |
| Competitive Spike | Analysis speed, recommendations, probability thresholds |
| Creative Brewer   | Import, Commander support, color gap analysis           |
| Content Creator   | Export quality, visual charts, comparison mode          |
| Error Recovery    | PWA, offline support, data persistence                  |

---

## Functional Requirements

### Core Analysis Engine

| ID     | Requirement                                          | Priority | Status      |
| ------ | ---------------------------------------------------- | -------- | ----------- |
| FR-001 | Parse deck text in MTGA, Moxfield, Archidekt formats | P0       | Implemented |
| FR-002 | Calculate hypergeometric probability per card        | P0       | Implemented |
| FR-003 | Compute turn-by-turn castability (T1-T7)             | P0       | Implemented |
| FR-004 | Run Monte Carlo simulation (10K+ iterations)         | P0       | Implemented |
| FR-005 | Generate mana health score (0-100)                   | P0       | Implemented |
| FR-006 | Produce actionable recommendations                   | P0       | Implemented |

### User Interface

| ID     | Requirement                      | Priority | Status      |
| ------ | -------------------------------- | -------- | ----------- |
| FR-007 | Responsive layout (mobile-first) | P0       | Implemented |
| FR-008 | Tab-based results navigation     | P1       | Implemented |
| FR-009 | Real-time analysis as user types | P2       | Implemented |
| FR-010 | Dark/Light theme toggle          | P2       | Implemented |
| FR-011 | Mobile navigation menu           | P0       | Implemented |

### Data & Export

| ID     | Requirement                        | Priority | Status       |
| ------ | ---------------------------------- | -------- | ------------ |
| FR-012 | Export analysis as PNG             | P1       | Implemented  |
| FR-013 | Export analysis as PDF             | P1       | Implemented  |
| FR-014 | Save analyses to localStorage      | P1       | Implemented  |
| FR-015 | Import from Moxfield/Archidekt URL | P1       | Planned v2.2 |

### External Integrations

| ID     | Requirement                           | Priority | Status      |
| ------ | ------------------------------------- | -------- | ----------- |
| FR-017 | Fetch card data from Scryfall API     | P0       | Implemented |
| FR-018 | Cache Scryfall responses (1 week TTL) | P1       | Implemented |
| FR-019 | Display card images on hover          | P2       | Implemented |
| FR-020 | Fallback for Scryfall failures        | P1       | Implemented |

### Future Features (v2.2+)

| ID     | Requirement                | Priority | Version |
| ------ | -------------------------- | -------- | ------- |
| FR-021 | Mana Dork/Rock integration | P1       | v2.2    |
| FR-022 | Deck comparison mode       | P1       | v2.2    |
| FR-023 | Sideboard analysis         | P2       | v2.2    |
| FR-024 | Matchup-aware mulligan     | P1       | v2.5    |
| FR-025 | Opening hand practice mode | P1       | v2.5    |

---

## Non-Functional Requirements

### Performance

| ID      | Requirement                  | Target  | Priority |
| ------- | ---------------------------- | ------- | -------- |
| NFR-001 | Initial page load (LCP)      | < 2.5s  | P0       |
| NFR-002 | Time to Interactive (TTI)    | < 3.5s  | P0       |
| NFR-003 | Analysis completion time     | < 500ms | P0       |
| NFR-004 | Bundle size (gzipped)        | < 400KB | P1       |
| NFR-005 | Lighthouse Performance score | > 85    | P0       |

### Reliability

| ID      | Requirement                      | Target        | Priority |
| ------- | -------------------------------- | ------------- | -------- |
| NFR-006 | Uptime                           | 99.5%         | P0       |
| NFR-007 | Error rate                       | < 0.1%        | P1       |
| NFR-008 | Offline functionality            | Full analysis | P1       |
| NFR-009 | Data persistence across sessions | 100%          | P0       |

### Security

| ID      | Requirement              | Target | Priority |
| ------- | ------------------------ | ------ | -------- |
| NFR-010 | No user data transmitted | 100%   | P0       |
| NFR-011 | CSP headers configured   | Strict | P0       |
| NFR-012 | HTTPS enforcement        | 100%   | P0       |
| NFR-013 | No third-party tracking  | Zero   | P0       |

### Accessibility

| ID      | Requirement           | Target   | Priority |
| ------- | --------------------- | -------- | -------- |
| NFR-015 | WCAG 2.1 compliance   | Level AA | P1       |
| NFR-016 | Screen reader support | Full     | P1       |
| NFR-017 | Keyboard navigation   | Complete | P1       |
| NFR-018 | Color contrast ratio  | ≥ 4.5:1  | P1       |

### Browser Support

| Browser       | Minimum Version | Priority |
| ------------- | --------------- | -------- |
| Chrome        | 90+             | P0       |
| Firefox       | 90+             | P0       |
| Safari        | 14+             | P0       |
| Edge          | 90+             | P0       |
| Mobile Chrome | Latest          | P0       |
| Mobile Safari | Latest          | P0       |

---

## Technical Constraints

### Architecture Decisions

| Constraint          | Rationale                                       |
| ------------------- | ----------------------------------------------- |
| 100% client-side    | Privacy-first, no server costs, offline support |
| No user accounts    | Reduces complexity, privacy concerns, low value |
| Scryfall dependency | Official MTG data source, excellent API         |
| LocalStorage only   | No backend required, GDPR compliant             |

### External Dependencies

| Dependency   | Purpose           | Risk Level                |
| ------------ | ----------------- | ------------------------- |
| Scryfall API | Card data, images | Medium (could rate limit) |
| Vercel       | Hosting, CDN      | Low (mature platform)     |
| Google Fonts | Typography        | Low (cached aggressively) |

### Performance Budgets

| Asset Type         | Budget |
| ------------------ | ------ |
| JavaScript (total) | 350KB  |
| CSS                | 50KB   |
| Images             | 100KB  |
| Fonts              | 50KB   |

---

## Risk Assessment

### Technical Risks

| Risk                  | Probability | Impact | Mitigation                           |
| --------------------- | ----------- | ------ | ------------------------------------ |
| Scryfall API changes  | Medium      | High   | Cache aggressively, fallback data    |
| Browser compatibility | Low         | Medium | Test matrix, progressive enhancement |

### Market Risks

| Risk                   | Probability | Impact   | Mitigation                       |
| ---------------------- | ----------- | -------- | -------------------------------- |
| Moxfield adds manabase | Medium      | High     | Differentiate on depth           |
| WotC official tool     | Low         | Critical | Pivot to education/community     |
| MTG popularity decline | Low         | Medium   | Core competitive audience stable |

### Operational Risks

| Risk                    | Probability | Impact | Mitigation                      |
| ----------------------- | ----------- | ------ | ------------------------------- |
| Solo maintainer burnout | Medium      | High   | Document everything, community  |
| Security vulnerability  | Low         | High   | Regular audits, minimal surface |

---

## Appendix A: Glossary

| Term           | Definition                                                |
| -------------- | --------------------------------------------------------- |
| Manabase       | The collection of lands and mana sources in a deck        |
| Hypergeometric | Probability distribution for sampling without replacement |
| Frank Karsten  | MTG Hall of Famer, author of definitive manabase math     |
| WUBRG          | White, Blue, Black, Red, Green (MTG color order)          |
| CMC            | Converted Mana Cost (now Mana Value)                      |
| Castability    | Probability of having required mana on a given turn       |
| Monte Carlo    | Simulation technique using random sampling                |
| Mulligan       | Decision to redraw opening hand with fewer cards          |

## Appendix B: Reference Links

- [Frank Karsten's Land Article](https://www.channelfireball.com/articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/)
- [Scryfall API Documentation](https://scryfall.com/docs/api)
- [Live Application](https://manatuner.app)
- [GitHub Repository](https://github.com/gbordes77/manatuner)

---

_Document generated by BMAD PRD Workflow on 2026-01-07_
_Workflow Version: 1.0 | Steps Completed: 11/11_
