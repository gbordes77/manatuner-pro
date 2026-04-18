import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import CasinoIcon from '@mui/icons-material/Casino'
import ClearIcon from '@mui/icons-material/Clear'
import FeedbackIcon from '@mui/icons-material/Feedback'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
            {progress.readCount + progress.bookmarkCount > 0 && (
              <Chip
                label={`📚 ${progress.readCount} read · 🔖 ${progress.bookmarkCount} saved`}
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: 'primary.main', color: 'primary.main' }}
              />
            )}
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

      {/* ================== Reading tracks (5 tracks) ================== */}
      <Box sx={{ mb: 6, position: 'relative', zIndex: 1 }}>
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
              : 'Pick a Track — Start Where You Are'}
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
      <Box sx={{ position: 'relative', zIndex: 1 }}>
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

        {/* Primary filter: category */}
        <Box
          role="toolbar"
          aria-label="Filter articles by category"
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            mb: 2,
            alignItems: 'center',
          }}
        >
          <FilterAltIcon sx={{ color: 'text.secondary', fontSize: 18 }} aria-hidden="true" />
          <Chip
            label="All"
            onClick={() => updateParam('cat', null)}
            color={filter === 'all' ? 'primary' : 'default'}
            variant={filter === 'all' ? 'filled' : 'outlined'}
            aria-pressed={filter === 'all'}
            sx={{ fontWeight: 600 }}
          />
          {CATEGORY_ORDER.map((cat) => (
            <Chip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              onClick={() => updateParam('cat', cat)}
              color={filter === cat ? 'primary' : 'default'}
              variant={filter === cat ? 'filled' : 'outlined'}
              aria-pressed={filter === cat}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        {/* Secondary filters: level, language, medium (compact row) */}
        <Box
          role="toolbar"
          aria-label="Advanced filters"
          sx={{
            display: 'flex',
            gap: 0.75,
            flexWrap: 'wrap',
            justifyContent: 'center',
            mb: 3,
            alignItems: 'center',
            fontSize: '0.78rem',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5, fontWeight: 600 }}>
            Level:
          </Typography>
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
            <Chip
              key={lvl}
              size="small"
              label={lvl === 'all' ? 'Any' : LEVEL_LABEL[lvl]}
              onClick={() => updateParam('level', lvl === 'all' ? null : lvl)}
              variant={levelFilter === lvl ? 'filled' : 'outlined'}
              color={levelFilter === lvl ? 'primary' : 'default'}
              aria-pressed={levelFilter === lvl}
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          ))}

          <Box sx={{ width: 12 }} />

          <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5, fontWeight: 600 }}>
            Language:
          </Typography>
          {(['all', 'en', 'fr', 'jp', 'multi'] as const).map((lg) => (
            <Chip
              key={lg}
              size="small"
              label={lg === 'all' ? 'Any' : LANGUAGE_LABEL[lg]}
              onClick={() => updateParam('lang', lg === 'all' ? null : lg)}
              variant={langFilter === lg ? 'filled' : 'outlined'}
              color={langFilter === lg ? 'primary' : 'default'}
              aria-pressed={langFilter === lg}
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          ))}

          <Box sx={{ width: 12 }} />

          <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5, fontWeight: 600 }}>
            Format:
          </Typography>
          {(['all', 'article', 'article-series', 'video', 'podcast', 'pdf'] as const).map((md) => (
            <Chip
              key={md}
              size="small"
              label={md === 'all' ? 'Any' : MEDIUM_LABEL[md]}
              onClick={() => updateParam('medium', md === 'all' ? null : md)}
              variant={mediumFilter === md ? 'filled' : 'outlined'}
              color={mediumFilter === md ? 'primary' : 'default'}
              aria-pressed={mediumFilter === md}
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          ))}

          {anyFilterActive && (
            <>
              <Box sx={{ width: 12 }} />
              <Button
                size="small"
                onClick={clearAllFilters}
                startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.72rem',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                Clear filters
              </Button>
            </>
          )}
        </Box>

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
            {progress.readCount} article{progress.readCount === 1 ? '' : 's'} read ·{' '}
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
                  'Reset your reading progress? This clears read + bookmark state on this device.'
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
    </Container>
  )
}

export default ReferenceArticlesPage
