import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import CasinoIcon from '@mui/icons-material/Casino'
import ClearIcon from '@mui/icons-material/Clear'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FeedbackIcon from '@mui/icons-material/Feedback'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SchoolIcon from '@mui/icons-material/School'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { AnimatedContainer } from '../components/common/AnimatedContainer'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import { SEO } from '../components/common/SEO'
import { useTheme } from '../components/common/NotificationProvider'
import { ArticleCard } from '../components/library/ArticleCard'
import { TrackHeader } from '../components/library/TrackHeader'
import { articlesReferenceSeed } from '../data/articlesReferenceSeed'
import { useLibraryProgress } from '../hooks/useLibraryProgress'
import type {
  ArticleCategory,
  ArticleLanguage,
  ArticleLevel,
  ArticleMedium,
  CuratorTrack,
  ReferenceArticle,
} from '../types/referenceArticle'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  TRACK_METADATA,
  TRACK_ORDER,
} from '../types/referenceArticle'
import { articlesAsMarkdown } from '../utils/libraryHelpers'

type CategoryFilter = ArticleCategory | 'all'
type LevelFilter = ArticleLevel | 'all'
type LanguageFilter = ArticleLanguage | 'all'
type MediumFilter = ArticleMedium | 'all'

const LEVEL_LABEL: Record<ArticleLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const MEDIUM_LABEL: Record<ArticleMedium, string> = {
  article: 'Articles',
  'article-series': 'Series',
  video: 'Videos',
  'video-series': 'Video series',
  pdf: 'PDFs',
  spreadsheet: 'Spreadsheets',
  reference: 'References',
  podcast: 'Podcasts',
}

const LANGUAGE_LABEL: Record<ArticleLanguage, string> = {
  en: '🇬🇧 English',
  fr: '🇫🇷 Français',
  jp: '🇯🇵 日本語',
  multi: '🌐 Multi',
}

/**
 * Rank used to surface "What's new" — we don't have a precise publish
 * timestamp, only year, so we combine year with position-in-seed for
 * stable tiebreak. The most recently added articles (at the end of
 * `articlesReferenceSeed`) win ties.
 */
function articleFreshnessScore(article: ReferenceArticle, idx: number): number {
  return article.year * 10_000 + idx
}

function normalize(s: string): string {
  return s.toLowerCase()
}

export const ReferenceArticlesPage: React.FC = () => {
  const muiTheme = useMuiTheme()
  const { isDark } = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))
  const [searchParams, setSearchParams] = useSearchParams()
  const progress = useLibraryProgress()

  // ---------------------- URL-backed filter state ----------------------
  const filter = (searchParams.get('cat') ?? 'all') as CategoryFilter
  const levelFilter = (searchParams.get('level') ?? 'all') as LevelFilter
  const langFilter = (searchParams.get('lang') ?? 'all') as LanguageFilter
  const mediumFilter = (searchParams.get('medium') ?? 'all') as MediumFilter
  const queryFromUrl = searchParams.get('q') ?? ''

  // Local debounced search state — we only push to the URL after 250ms
  // so every keystroke doesn't thrash history
  const [searchInput, setSearchInput] = useState(queryFromUrl)

  // Feedback state for the "Copy as Markdown" action (Karim ask — paste into
  // Discord / Slack / FNM group-chat without leaving the tool).
  const [markdownCopied, setMarkdownCopied] = useState<null | {
    count: number
    error?: boolean
  }>(null)
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (searchInput.trim()) next.set('q', searchInput.trim())
          else next.delete('q')
          return next
        },
        { replace: true }
      )
    }, 250)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const query = normalize(queryFromUrl)

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (!value || value === 'all') next.delete(key)
          else next.set(key, value)
          return next
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  const clearAllFilters = useCallback(() => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const anyFilterActive =
    filter !== 'all' ||
    levelFilter !== 'all' ||
    langFilter !== 'all' ||
    mediumFilter !== 'all' ||
    query !== ''

  // -------------------- Full-text matcher (cheap) ----------------------
  const matchesSearch = useCallback(
    (a: ReferenceArticle): boolean => {
      if (!query) return true
      return (
        normalize(a.title).includes(query) ||
        normalize(a.author).includes(query) ||
        normalize(a.publisher).includes(query) ||
        normalize(a.description).includes(query) ||
        (a.subtitle ? normalize(a.subtitle).includes(query) : false)
      )
    },
    [query]
  )

  const matchesSecondary = useCallback(
    (a: ReferenceArticle): boolean => {
      if (levelFilter !== 'all' && a.level !== levelFilter) return false
      if (langFilter !== 'all' && a.language !== langFilter) return false
      if (mediumFilter !== 'all' && a.medium !== mediumFilter) return false
      return true
    },
    [levelFilter, langFilter, mediumFilter]
  )

  // ---------------------- Partition articles ----------------------
  const trackedByTrack = useMemo(() => {
    const map: Record<CuratorTrack, ReferenceArticle[]> = {
      'first-fnm': [],
      rcq: [],
      'pro-tour': [],
      commander: [],
      limited: [],
    }
    for (const article of articlesReferenceSeed) {
      if (article.curatorTrack) {
        map[article.curatorTrack].push(article)
      }
    }
    return map
  }, [])

  const nonTrackedArticles = useMemo(
    () => articlesReferenceSeed.filter((a) => !a.curatorTrack && !a.hideFromMainGrid),
    []
  )

  // Filter non-tracked by selected category + search + secondary filters
  const filteredNonTracked = useMemo(() => {
    return nonTrackedArticles.filter((a) => {
      if (!matchesSearch(a)) return false
      if (!matchesSecondary(a)) return false
      if (filter === 'all') return true
      return a.category === filter || a.secondaryCategories?.includes(filter)
    })
  }, [nonTrackedArticles, filter, matchesSearch, matchesSecondary])

  // Group non-tracked by category for display
  const nonTrackedByCategory = useMemo(() => {
    const map = new Map<ArticleCategory, ReferenceArticle[]>()
    for (const category of CATEGORY_ORDER) {
      const inCat = filteredNonTracked.filter(
        (a) => a.category === category || a.secondaryCategories?.includes(category)
      )
      if (inCat.length > 0) {
        map.set(category, inCat)
      }
    }
    return map
  }, [filteredNonTracked])

  // Also filter tracked (for search + level/lang/medium — NOT category which
  // is only for non-tracked bottom grid). When search is active we surface
  // matching tracked items at the top of their track.
  const filteredTrackedByTrack = useMemo(() => {
    const map: Record<CuratorTrack, ReferenceArticle[]> = {
      'first-fnm': [],
      rcq: [],
      'pro-tour': [],
      commander: [],
      limited: [],
    }
    for (const track of TRACK_ORDER) {
      map[track] = trackedByTrack[track].filter((a) => matchesSearch(a) && matchesSecondary(a))
    }
    return map
  }, [trackedByTrack, matchesSearch, matchesSecondary])

  // Top-level counts (for hero stats + result count)
  const totalCount = articlesReferenceSeed.length
  const liveCount = articlesReferenceSeed.filter((a) => a.linkStatus === 'live').length
  const archivedCount = articlesReferenceSeed.filter(
    (a) => a.linkStatus === 'archived' || a.linkStatus === 'mirror'
  ).length
  const lostCount = articlesReferenceSeed.filter((a) => a.linkStatus === 'lost').length

  const totalVisible = useMemo(() => {
    let n = filteredNonTracked.length
    for (const track of TRACK_ORDER) n += filteredTrackedByTrack[track].length
    return n
  }, [filteredNonTracked.length, filteredTrackedByTrack])

  // ----- Copy-as-Markdown handler (Karim ask) -----
  // Flatten the current visible set (tracked + non-tracked, deduped by id)
  // and emit a Discord-friendly Markdown block. When no filter is active we
  // export the entire library so the button is useful in any state.
  const copyCurrentAsMarkdown = useCallback(async () => {
    const byId = new Map<string, ReferenceArticle>()
    for (const track of TRACK_ORDER) {
      for (const a of filteredTrackedByTrack[track]) byId.set(a.id, a)
    }
    for (const a of filteredNonTracked) byId.set(a.id, a)
    const all = Array.from(byId.values())

    const descriptors: string[] = []
    if (query) descriptors.push(`matching "${queryFromUrl}"`)
    if (filter !== 'all') descriptors.push(`in ${CATEGORY_LABELS[filter]}`)
    if (levelFilter !== 'all') descriptors.push(`at ${levelFilter}`)
    if (langFilter !== 'all') descriptors.push(`(${langFilter.toUpperCase()})`)
    if (mediumFilter !== 'all') descriptors.push(`as ${mediumFilter}`)

    const heading = anyFilterActive
      ? `ManaTuner Library — ${descriptors.join(' · ')}`
      : 'ManaTuner Library — Competitive MTG Reading List'

    const markdown = articlesAsMarkdown(all, {
      heading,
      groupBy: all.length > 8 ? 'category' : 'none',
      categoryLabels: CATEGORY_LABELS as unknown as Record<string, string>,
    })

    try {
      await navigator.clipboard.writeText(markdown)
      setMarkdownCopied({ count: all.length })
    } catch {
      setMarkdownCopied({ count: all.length, error: true })
    }
  }, [
    filteredNonTracked,
    filteredTrackedByTrack,
    filter,
    levelFilter,
    langFilter,
    mediumFilter,
    query,
    queryFromUrl,
    anyFilterActive,
  ])

  // -------- "What's new" + "Random pick" quick actions --------
  const fiveMostRecent = useMemo(() => {
    return [...articlesReferenceSeed]
      .map((a, idx) => ({ a, score: articleFreshnessScore(a, idx) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 5)
      .map((x) => x.a)
  }, [])

  const randomPick = useCallback(() => {
    const live = articlesReferenceSeed.filter((a) => a.linkStatus !== 'lost')
    if (live.length === 0) return
    const pick = live[Math.floor(Math.random() * live.length)]
    window.open(pick.primaryUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const scrollToRecent = useCallback(() => {
    const el = document.getElementById('whats-new')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO
        title="MTG Competitive Reading Library — 40+ Essential Articles | ManaTuner"
        description="The definitive reading list for competitive Magic: The Gathering players. Karsten, PVDDR, Reid Duke, Saito, Chapin, Fortier, Dagen — plus Commander and Limited canon. Curated, categorized, and restored from link rot via archive.org."
        path="/library"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'MTG Competitive Reading Library',
          description:
            'Curated collection of 40+ essential competitive Magic: The Gathering articles on manabase math, mulligan theory, tournament mindset, deckbuilding, Commander, and Limited.',
          url: 'https://www.manatuner.app/library',
          publisher: {
            '@type': 'Organization',
            name: 'ManaTuner',
            url: 'https://www.manatuner.app',
          },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: totalCount,
            itemListElement: articlesReferenceSeed.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Article',
                headline: a.title,
                author: { '@type': 'Person', name: a.author },
                publisher: { '@type': 'Organization', name: a.publisher },
                datePublished: `${a.year}-01-01`,
                url: a.primaryUrl,
              },
            })),
          },
        }}
      />

      <FloatingManaSymbols />

      {/* Sticky progress chip — Sarah ask: "I want my running N/48 count
          visible from any scroll position, not just the hero". Sits just
          under the site header; hidden when no progress yet to keep the
          hero clean for new visitors.
          NOTE on wording: we say "opened" not "read". The hook tracks a
          click on the article-open button (or a manual toggle), neither
          of which proves the user actually read the piece. "Opened" is
          honest about what we measure. The internal API stays
          `readCount` / `isRead` to avoid a storage migration. */}
      {progress.readCount > 0 && (
        <Box
          aria-label={`You have opened ${progress.readCount} of ${totalCount} articles in the Library`}
          sx={{
            position: 'sticky',
            top: 72, // clears the site header
            zIndex: 5,
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
            pointerEvents: 'none', // chip's own pointerEvents re-enables it
          }}
        >
          <Chip
            icon={<AutoStoriesIcon sx={{ fontSize: 16 }} />}
            label={`${progress.readCount}/${totalCount} opened${
              progress.bookmarkCount > 0 ? ` · 🔖 ${progress.bookmarkCount} saved` : ''
            }`}
            color="primary"
            variant="filled"
            sx={{
              pointerEvents: 'auto',
              fontWeight: 700,
              fontSize: '0.82rem',
              boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(6px)',
              backgroundColor: isDark ? 'rgba(25,118,210,0.85)' : 'rgba(25,118,210,0.92)',
              color: 'white',
            }}
          />
        </Box>
      )}

      {/* ============================ HERO ============================ */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: 'center', mb: 5, pt: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AutoStoriesIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.9 }} />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontFamily: '"Cinzel", serif',
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.1,
              mb: 1.5,
            }}
          >
            The Competitive MTG Library
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.55,
              mb: 3,
            }}
          >
            Every essential article a serious Magic player should read — from Karsten's manabase
            math to Saito's tournament mindset. Curated across 15+ years of pro-level writing. Dead
            links restored via archive.org.
          </Typography>

          {/* Search bar — primary surface */}
          <Box sx={{ maxWidth: 560, mx: 'auto', mb: 2 }}>
            <TextField
              fullWidth
              size="medium"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, author, topic…"
              inputProps={{ 'aria-label': 'Search articles' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => setSearchInput('')}
                      sx={{ minWidth: 'auto', color: 'text.secondary' }}
                      aria-label="Clear search"
                    >
                      <ClearIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ) : undefined,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'background.paper',
                },
              }}
            />
          </Box>

          {/* Quick actions */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mb: 2, gap: 1 }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<CasinoIcon />}
              onClick={randomPick}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Surprise me
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<NewReleasesIcon />}
              onClick={scrollToRecent}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              What's new
            </Button>
          </Stack>

          {/* Stats */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            <Chip
              label={`${totalCount} articles`}
              color="primary"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            <Chip label={`${liveCount} live`} color="success" variant="outlined" />
            <Chip label={`${archivedCount} archived`} color="warning" variant="outlined" />
            {lostCount > 0 && (
              <Chip label={`${lostCount} lost — help us find`} color="error" variant="outlined" />
            )}
          </Stack>
        </Box>
      </AnimatedContainer>

      {/* =============== Section TOC — "what's on this page" ===============
          Tester feedback (2026-04-19): on first scroll, users land on
          "What's new" or the Reading Tracks and assume that's the whole
          page — they miss "Browse by Topic" entirely. Especially true on
          mobile where everything stacks vertically. This chip-row makes
          the page structure visible at first glance without hiding any
          content. Hidden during active search to reduce noise. */}
      {!query && !anyFilterActive && (
        <Box
          role="navigation"
          aria-label="Library page sections"
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* TOC redesign (2026-04-19): tester Aimdeh read the previous chip
              row as "just more tags", not navigation. This variant uses a
              card-tile shape (emoji on top, label underneath) so the eye
              reads it as page navigation — distinct from the article-card
              meta chips (article/archived/lost, reading time, medium) which
              are small inline text badges. Desktop: grid of 3 equal tiles
              ("What's new" dropped 2026-04-19 — the section sits directly
              below the TOC so the shortcut is a no-op doublon). Mobile:
              horizontal scroll-snap preserved (Sarah's lunchtime scan on
              phone). */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 880,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(140px, 1fr))', sm: 'repeat(3, 1fr)' },
              gap: { xs: 1, sm: 1.5 },
              ...(isMobile && {
                overflowX: 'auto',
                gridAutoFlow: 'column',
                gridAutoColumns: 'minmax(140px, 1fr)',
                gridTemplateColumns: 'unset',
                pb: 1,
                px: 1,
                scrollSnapType: 'x mandatory',
                '& > *': { scrollSnapAlign: 'start' },
              }),
            }}
          >
            {[
              { id: 'track-first-fnm', emoji: '🎓', label: 'Start Here' },
              { id: 'reading-tracks', emoji: '📚', label: 'Reading Paths' },
              { id: 'browse-by-topic', emoji: '🔍', label: 'Browse by Topic' },
            ].map((section) => (
              <Box
                key={section.id}
                component="a"
                href={`#${section.id}`}
                aria-label={`Jump to ${section.label}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 1.5,
                  minHeight: 76,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  backgroundColor: isDark ? 'rgba(14,104,171,0.10)' : 'rgba(14,104,171,0.05)',
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isDark
                    ? '0 1px 0 rgba(255,255,255,0.03) inset, 0 2px 6px rgba(0,0,0,0.3)'
                    : '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(14,104,171,0.12)',
                  transition: 'all 0.2s ease',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  '&:hover, &:focus-visible': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 14px rgba(14,104,171,0.35)',
                    outline: 'none',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${muiTheme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Box component="span" aria-hidden="true" sx={{ fontSize: '1.6rem', lineHeight: 1 }}>
                  {section.emoji}
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {section.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ============== Global search-result banner (when active) ============== */}
      {(query || anyFilterActive) && (
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            backgroundColor: isDark ? 'rgba(25,118,210,0.08)' : 'rgba(25,118,210,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <SearchIcon sx={{ color: 'primary.main' }} aria-hidden="true" />
          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
            {totalVisible} {totalVisible === 1 ? 'article matches' : 'articles match'}
            {query && (
              <>
                {' '}
                "
                <Box component="span" sx={{ color: 'primary.main' }}>
                  {queryFromUrl}
                </Box>
                "
              </>
            )}
            {anyFilterActive && !query && ' your filters'}
          </Typography>
          <Button
            size="small"
            onClick={clearAllFilters}
            startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontSize: '0.78rem' }}
          >
            Clear
          </Button>
        </Box>
      )}

      {/* ============ "What's new" (hidden during search to reduce noise) ============ */}
      {!query && !anyFilterActive && (
        <Box id="whats-new" sx={{ mb: 6, position: 'relative', zIndex: 1, scrollMarginTop: 80 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.8rem',
              }}
            >
              Recently Added
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                fontFamily: '"Cinzel", serif',
                mt: 0.5,
                fontSize: { xs: '1.4rem', md: '1.75rem' },
              }}
            >
              What's new in the Library
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {fiveMostRecent.map((article, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={idx < 3 ? 4 : 6} key={`recent-${article.id}`}>
                <AnimatedContainer
                  animation="fadeInUp"
                  delay={Math.min(idx, 4) * 0.05}
                  sx={{ height: '100%' }}
                >
                  <ArticleCard
                    article={article}
                    isRead={progress.isRead(article.id)}
                    isBookmarked={progress.isBookmarked(article.id)}
                    onToggleRead={progress.toggleRead}
                    onToggleBookmark={progress.toggleBookmark}
                  />
                </AnimatedContainer>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ========== "Start Here" elevated beginner CTA (Léo ask) ==========
          The 5 tracks below are peer-leveled Commander / Pro Tour / RCQ,
          and that flat treatment is intimidating for brand-new players who
          don't know where to start. This elevated card promotes the First
          FNM track as the default on-ramp, positioned ABOVE the track row
          so a beginner reads "Start Here" first and the peer tracks second.
          Hidden during search to avoid getting in the way of matches. */}
      {!query && !anyFilterActive && trackedByTrack['first-fnm'].length > 0 && (
        <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: '#0E68AB',
              background: isDark
                ? 'linear-gradient(135deg, rgba(14,104,171,0.15) 0%, rgba(14,104,171,0.03) 100%)'
                : 'linear-gradient(135deg, rgba(14,104,171,0.08) 0%, rgba(14,104,171,0.02) 100%)',
              p: { xs: 2.5, md: 3.5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 2, md: 4 }}
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <SchoolIcon sx={{ fontSize: 28, color: '#0E68AB' }} />
                  <Chip
                    size="small"
                    label="New to competitive MTG?"
                    color="primary"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </Stack>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontFamily: '"Cinzel", serif',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    lineHeight: 1.15,
                    mb: 1,
                  }}
                >
                  Start Here — Your First FNM
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.55, maxWidth: 560 }}
                >
                  Five short, welcoming reads that cover everything you need before your first
                  Friday Night Magic — mana bases, mulligans, and how to play your deck instead of
                  fighting it. Skip ahead to RCQ, Pro Tour, Commander, or Limited once these feel
                  natural.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  <Button
                    component="a"
                    href="#track-first-fnm"
                    variant="contained"
                    size="medium"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      backgroundColor: '#0E68AB',
                      '&:hover': { backgroundColor: '#08527F' },
                    }}
                  >
                    Start the path →
                  </Button>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ alignSelf: 'center', fontStyle: 'italic' }}
                  >
                    {trackedByTrack['first-fnm'].length} reads ·{' '}
                    {trackedByTrack['first-fnm'].reduce(
                      (acc, a) => acc + (a.readingTimeMin ?? 0),
                      0
                    )}{' '}
                    min total
                  </Typography>
                </Stack>
              </Box>

              {/* Preview: first 2 articles from the First FNM track */}
              <Box
                sx={{
                  flex: 1.1,
                  minWidth: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {trackedByTrack['first-fnm'].slice(0, 2).map((article) => (
                  <Box
                    key={article.id}
                    component={RouterLink}
                    to={`/library/${article.id}`}
                    sx={{
                      display: 'block',
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(14,104,171,0.2)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'all 0.2s ease',
                      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                      '&:hover': {
                        borderColor: '#0E68AB',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#0E68AB',
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                      }}
                    >
                      {article.author}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.25,
                        mt: 0.25,
                        fontSize: '0.88rem',
                      }}
                    >
                      {article.title}
                    </Typography>
                    {typeof article.readingTimeMin === 'number' && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {article.readingTimeMin} min read
                        {progress.isRead(article.id) ? ' · ✅ opened' : ''}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 1.5,
              fontStyle: 'italic',
            }}
          >
            Or jump straight to one of the four peer tracks below.
          </Typography>
        </Box>
      )}

      {/* ================== Reading tracks (5 tracks) ================== */}
      <Box id="reading-tracks" sx={{ mb: 6, position: 'relative', zIndex: 1, scrollMarginTop: 80 }}>
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            // Hide section title entirely when search/filter leaves zero tracks visible
            display: TRACK_ORDER.some((t) => filteredTrackedByTrack[t].length > 0)
              ? 'block'
              : 'none',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: '0.8rem',
            }}
          >
            Your Reading Path
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              fontFamily: '"Cinzel", serif',
              mt: 0.5,
              fontSize: { xs: '1.4rem', md: '1.75rem' },
            }}
          >
            {query || anyFilterActive
              ? 'Matches in Reading Tracks'
              : 'All Reading Tracks — Pick Your Level'}
          </Typography>
        </Box>

        {/* Track jump nav — hide when searching (less useful, takes space) */}
        {!query && !anyFilterActive && (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            role="navigation"
            aria-label="Reading tracks"
            sx={{
              mb: 4,
              flexWrap: 'wrap',
              gap: 1,
              ...(isMobile && {
                overflowX: 'auto',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                pb: 1,
                scrollSnapType: 'x mandatory',
                '& > *': { scrollSnapAlign: 'start' },
              }),
            }}
          >
            {TRACK_ORDER.map((track) => {
              const meta = TRACK_METADATA[track]
              const trackArticles = trackedByTrack[track]
              const readInTrack = trackArticles.filter((a) => progress.isRead(a.id)).length
              return (
                <Chip
                  key={track}
                  label={
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Box component="span" aria-hidden="true" sx={{ mr: 0.5 }}>
                        {meta.emoji}
                      </Box>
                      {meta.title}
                      {readInTrack > 0 && (
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            fontSize: '0.65rem',
                            opacity: 0.7,
                            fontWeight: 500,
                          }}
                        >
                          ({readInTrack}/{trackArticles.length})
                        </Box>
                      )}
                    </Box>
                  }
                  component="a"
                  href={`#track-${track}`}
                  clickable
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    height: 36,
                    px: 1,
                    textDecoration: 'none',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                />
              )
            })}
          </Stack>
        )}

        {/* Render each track — hide entirely when search/filter active and track has zero matches */}
        {TRACK_ORDER.map((track, trackIdx) => {
          const allArticlesInTrack = trackedByTrack[track]
          const filteredArticles = filteredTrackedByTrack[track]
          if (allArticlesInTrack.length === 0) return null

          // When user is actively searching/filtering, skip tracks with no matches
          // — avoids a wall of empty headers that hides real results
          if ((query || anyFilterActive) && filteredArticles.length === 0) return null

          const readCount = allArticlesInTrack.filter((a) => progress.isRead(a.id)).length

          return (
            <Box key={track} sx={{ mb: 5 }}>
              <AnimatedContainer animation="fadeInUp" delay={Math.min(trackIdx, 4) * 0.05}>
                <TrackHeader
                  track={track}
                  articleCount={allArticlesInTrack.length}
                  readCount={readCount}
                />
              </AnimatedContainer>

              <Grid container spacing={2.5}>
                {filteredArticles.map((article, articleIdx) => (
                  <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <AnimatedContainer
                      animation="fadeInUp"
                      delay={0.08 + Math.min(articleIdx, 5) * 0.05}
                      sx={{ height: '100%' }}
                    >
                      <ArticleCard
                        article={article}
                        showCuratorNote
                        isRead={progress.isRead(article.id)}
                        isBookmarked={progress.isBookmarked(article.id)}
                        onToggleRead={progress.toggleRead}
                        onToggleBookmark={progress.toggleBookmark}
                      />
                    </AnimatedContainer>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        })}
      </Box>

      {/* ================== Browse by topic ================== */}
      <Box id="browse-by-topic" sx={{ position: 'relative', zIndex: 1, scrollMarginTop: 80 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: '0.8rem',
            }}
          >
            The Full Library
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              fontFamily: '"Cinzel", serif',
              mt: 0.5,
              fontSize: { xs: '1.4rem', md: '1.75rem' },
            }}
          >
            Browse By Topic
          </Typography>
        </Box>

        {/* Filter toolbar — redesigned 2026-04-19 after tester Aimdeh said
            the previous chip rows were only "un peu mieux" than the original.
            Root cause was visual-language ambiguity: outlined chips for
            filters read the same as non-clickable meta badges on article
            cards (article / archived / lost). Fix:
              1. Elevate the panel to a Paper (shadow) so it reads as "a
                 control surface", not a tinted background region.
              2. Keep Chips for the primary Category filter (10+ values,
                 needs to wrap naturally, and one selected state is already
                 clear because it flips to filled/primary).
              3. Swap the 3 secondary filters (Level / Language / Format) to
                 MUI ToggleButtonGroup segmented controls. A segmented control
                 always has one selected option, reads as a physical button
                 bar, and is unmistakeable for a tag. That's the visual-
                 language shift the tester's eye was missing. */}
        <Paper
          elevation={isDark ? 3 : 2}
          sx={{
            p: { xs: 2, sm: 2.75 },
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: isDark ? 'rgba(14,104,171,0.45)' : 'rgba(14,104,171,0.22)',
            backgroundColor: isDark ? 'rgba(14,104,171,0.09)' : '#ffffff',
            backgroundImage: 'none',
          }}
        >
          {/* Primary filter: category (stays as chips — 10 values, flex-wrap
              required, already unambiguous with filled selected state).
              Sized up 2026-04-19 (Aimdeh: "les filtres de section pourraient
              être aggrandis aussi") so the primary row visually out-weighs
              the secondary segmented controls below — height 40 + 0.92rem
              vs secondary ~36 + 0.82rem reasserts "category first, refine
              after". Border thickened to 1.5 px on outlined state so
              unselected chips still read as controls. */}
          <Box
            role="toolbar"
            aria-label="Filter articles by category"
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mb: 2.5,
              alignItems: 'center',
            }}
          >
            <FilterAltIcon sx={{ color: 'primary.main', fontSize: 20 }} aria-hidden="true" />
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.78rem',
                mr: 0.75,
              }}
            >
              Category
            </Typography>
            <Chip
              label="All"
              onClick={() => updateParam('cat', null)}
              color={filter === 'all' ? 'primary' : 'default'}
              variant={filter === 'all' ? 'filled' : 'outlined'}
              aria-pressed={filter === 'all'}
              sx={{
                fontWeight: filter === 'all' ? 700 : 600,
                fontSize: '0.92rem',
                height: 40,
                px: 0.5,
                borderWidth: filter === 'all' ? 1 : 1.5,
              }}
            />
            {CATEGORY_ORDER.map((cat) => (
              <Chip
                key={cat}
                label={CATEGORY_LABELS[cat]}
                onClick={() => updateParam('cat', cat)}
                color={filter === cat ? 'primary' : 'default'}
                variant={filter === cat ? 'filled' : 'outlined'}
                aria-pressed={filter === cat}
                sx={{
                  fontWeight: filter === cat ? 700 : 600,
                  fontSize: '0.92rem',
                  height: 40,
                  px: 0.5,
                  borderWidth: filter === cat ? 1 : 1.5,
                }}
              />
            ))}
          </Box>

          {/* Secondary filters: segmented controls. Each row is a
              ToggleButtonGroup with exclusive + required-selection semantics
              ("Any" is always a valid selected state, not an absence). The
              physical-button-bar look is the key move: no confusion with
              article-card meta badges. */}
          <Box
            role="toolbar"
            aria-label="Advanced filters"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            {/* Level */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                justifyContent: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontSize: '0.7rem',
                  minWidth: 72,
                }}
              >
                Level
              </Typography>
              <ToggleButtonGroup
                value={levelFilter}
                exclusive
                onChange={(_, v: LevelFilter | null) => {
                  if (v === null) return
                  updateParam('level', v === 'all' ? null : v)
                }}
                size="small"
                aria-label="Filter by level"
                sx={{
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    px: 1.75,
                    py: 0.6,
                    borderColor: isDark ? 'rgba(14,104,171,0.5)' : 'rgba(14,104,171,0.35)',
                    color: 'text.primary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: 'primary.dark' },
                    },
                  },
                }}
              >
                <ToggleButton value="all" aria-pressed={levelFilter === 'all'}>
                  Any
                </ToggleButton>
                <ToggleButton value="beginner" aria-pressed={levelFilter === 'beginner'}>
                  {LEVEL_LABEL.beginner}
                </ToggleButton>
                <ToggleButton value="intermediate" aria-pressed={levelFilter === 'intermediate'}>
                  {LEVEL_LABEL.intermediate}
                </ToggleButton>
                <ToggleButton value="advanced" aria-pressed={levelFilter === 'advanced'}>
                  {LEVEL_LABEL.advanced}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Language */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                justifyContent: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontSize: '0.7rem',
                  minWidth: 72,
                }}
              >
                Language
              </Typography>
              <ToggleButtonGroup
                value={langFilter}
                exclusive
                onChange={(_, v: LanguageFilter | null) => {
                  if (v === null) return
                  updateParam('lang', v === 'all' ? null : v)
                }}
                size="small"
                aria-label="Filter by language"
                sx={{
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    px: 1.75,
                    py: 0.6,
                    borderColor: isDark ? 'rgba(14,104,171,0.5)' : 'rgba(14,104,171,0.35)',
                    color: 'text.primary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: 'primary.dark' },
                    },
                  },
                }}
              >
                <ToggleButton value="all" aria-pressed={langFilter === 'all'}>
                  Any
                </ToggleButton>
                <ToggleButton value="en" aria-pressed={langFilter === 'en'}>
                  {LANGUAGE_LABEL.en}
                </ToggleButton>
                <ToggleButton value="fr" aria-pressed={langFilter === 'fr'}>
                  {LANGUAGE_LABEL.fr}
                </ToggleButton>
                <ToggleButton value="jp" aria-pressed={langFilter === 'jp'}>
                  {LANGUAGE_LABEL.jp}
                </ToggleButton>
                <ToggleButton value="multi" aria-pressed={langFilter === 'multi'}>
                  {LANGUAGE_LABEL.multi}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Format */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                justifyContent: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontSize: '0.7rem',
                  minWidth: 72,
                }}
              >
                Format
              </Typography>
              <ToggleButtonGroup
                value={mediumFilter}
                exclusive
                onChange={(_, v: MediumFilter | null) => {
                  if (v === null) return
                  updateParam('medium', v === 'all' ? null : v)
                }}
                size="small"
                aria-label="Filter by format"
                sx={{
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    px: 1.75,
                    py: 0.6,
                    borderColor: isDark ? 'rgba(14,104,171,0.5)' : 'rgba(14,104,171,0.35)',
                    color: 'text.primary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: 'primary.dark' },
                    },
                  },
                }}
              >
                <ToggleButton value="all" aria-pressed={mediumFilter === 'all'}>
                  Any
                </ToggleButton>
                <ToggleButton value="article" aria-pressed={mediumFilter === 'article'}>
                  {MEDIUM_LABEL.article}
                </ToggleButton>
                <ToggleButton
                  value="article-series"
                  aria-pressed={mediumFilter === 'article-series'}
                >
                  {MEDIUM_LABEL['article-series']}
                </ToggleButton>
                <ToggleButton value="video" aria-pressed={mediumFilter === 'video'}>
                  {MEDIUM_LABEL.video}
                </ToggleButton>
                <ToggleButton value="podcast" aria-pressed={mediumFilter === 'podcast'}>
                  {MEDIUM_LABEL.podcast}
                </ToggleButton>
                <ToggleButton value="pdf" aria-pressed={mediumFilter === 'pdf'}>
                  {MEDIUM_LABEL.pdf}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Actions row: Clear filters + Copy as Markdown.
                Karim ask: paste the current filtered view into Discord /
                Slack / a pod chat without leaving the tool. Works on the
                full library when no filter is active. */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                flexWrap: 'wrap',
                mt: 0.5,
                pt: 1,
                borderTop: '1px dashed',
                borderColor: isDark ? 'rgba(14,104,171,0.3)' : 'rgba(14,104,171,0.15)',
              }}
            >
              {anyFilterActive && (
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={copyCurrentAsMarkdown}
                startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
                aria-label={
                  anyFilterActive
                    ? 'Copy filtered articles as Markdown'
                    : 'Copy full library as Markdown'
                }
                sx={{
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                Copy as Markdown
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Result count */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 3, fontStyle: 'italic' }}
        >
          {query || anyFilterActive
            ? `Showing ${totalVisible} of ${totalCount} articles`
            : `Showing ${filteredNonTracked.length} of ${nonTrackedArticles.length} articles outside the reading tracks above`}
          {filter !== 'all' && ` · ${CATEGORY_LABELS[filter]}`}
          {query && ` · matching "${query}"`}
        </Typography>

        {/* Grouped by category */}
        {nonTrackedByCategory.size === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">
              No articles match these filters. Try clearing one, or check the tracked articles above
              — your search may match those.
            </Typography>
            {anyFilterActive && (
              <Button
                variant="outlined"
                onClick={clearAllFilters}
                startIcon={<RestartAltIcon />}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                Clear all filters
              </Button>
            )}
          </Box>
        ) : (
          Array.from(nonTrackedByCategory.entries()).map(([category, articles]) => (
            <Box key={category} sx={{ mb: 5 }}>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Cinzel", serif',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
                  fontSize: { xs: '1.15rem', md: '1.35rem' },
                }}
              >
                {CATEGORY_LABELS[category]}{' '}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: '0.75rem' }}
                >
                  ({articles.length})
                </Typography>
              </Typography>
              <Grid container spacing={2.5}>
                {articles.map((article) => (
                  <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <ArticleCard
                      article={article}
                      isRead={progress.isRead(article.id)}
                      isBookmarked={progress.isBookmarked(article.id)}
                      onToggleRead={progress.toggleRead}
                      onToggleBookmark={progress.toggleBookmark}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Box>

      {/* ============= My Progress (shown if user has any) ============= */}
      {progress.readCount + progress.bookmarkCount > 0 && (
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 3,
            textAlign: 'center',
            border: '1px solid',
            borderColor: isDark ? 'rgba(76,175,80,0.25)' : 'rgba(76,175,80,0.35)',
            backgroundColor: isDark ? 'rgba(76,175,80,0.05)' : 'rgba(76,175,80,0.04)',
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', mb: 1 }}>
            Your Library Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {progress.readCount} article{progress.readCount === 1 ? '' : 's'} opened ·{' '}
            {progress.bookmarkCount} bookmarked. Stored on this device only —{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              nothing leaves your browser
            </Box>
            .
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              if (
                window.confirm(
                  'Reset your Library progress? This clears your opened + bookmarked state on this device.'
                )
              ) {
                progress.reset()
              }
            }}
            startIcon={<RestartAltIcon />}
            sx={{ textTransform: 'none' }}
          >
            Reset progress
          </Button>
        </Box>
      )}

      {/* ================== Footer call-to-action ================== */}
      <Box
        sx={{
          mt: 8,
          mb: 4,
          p: 3,
          borderRadius: 3,
          textAlign: 'center',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'background.paper',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Cinzel", serif' }}>
          Missing an article?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 560, mx: 'auto', mb: 2 }}
        >
          Know a canonical piece we should add? Have a dead link we could restore? Use the feedback
          form — this library grows with the community.
        </Typography>
        <Button
          component="a"
          href="https://tally.so/r/A7KRkN"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          startIcon={<FeedbackIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }}
        >
          Give Feedback
        </Button>
      </Box>

      <Snackbar
        open={markdownCopied !== null}
        autoHideDuration={3000}
        onClose={() => setMarkdownCopied(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={markdownCopied?.error ? 'error' : 'success'}
          onClose={() => setMarkdownCopied(null)}
          variant="filled"
        >
          {markdownCopied?.error
            ? 'Clipboard blocked by your browser. Try again with the page focused.'
            : `Copied ${markdownCopied?.count ?? 0} article${
                markdownCopied?.count === 1 ? '' : 's'
              } as Markdown — paste into Discord or Slack.`}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default ReferenceArticlesPage
