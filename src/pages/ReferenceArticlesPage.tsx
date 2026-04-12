import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import FeedbackIcon from '@mui/icons-material/Feedback'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { AnimatedContainer } from '../components/common/AnimatedContainer'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import { SEO } from '../components/common/SEO'
import { useTheme } from '../components/common/NotificationProvider'
import { ArticleCard } from '../components/library/ArticleCard'
import { TrackHeader } from '../components/library/TrackHeader'
import { articlesReferenceSeed } from '../data/articlesReferenceSeed'
import type { ArticleCategory, CuratorTrack } from '../types/referenceArticle'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  TRACK_METADATA,
  TRACK_ORDER,
} from '../types/referenceArticle'

type CategoryFilter = ArticleCategory | 'all'

export const ReferenceArticlesPage: React.FC = () => {
  const muiTheme = useMuiTheme()
  const { isDark } = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))
  const [filter, setFilter] = useState<CategoryFilter>('all')

  // Partition articles into tracked / non-tracked
  const trackedByTrack = useMemo(() => {
    const map: Record<CuratorTrack, typeof articlesReferenceSeed> = {
      'first-fnm': [],
      rcq: [],
      'pro-tour': [],
    }
    for (const article of articlesReferenceSeed) {
      if (article.curatorTrack) {
        map[article.curatorTrack].push(article)
      }
    }
    return map
  }, [])

  // Non-tracked articles (everything else)
  const nonTrackedArticles = useMemo(
    () => articlesReferenceSeed.filter((a) => !a.curatorTrack && !a.hideFromMainGrid),
    []
  )

  // Filter non-tracked by selected category
  const filteredNonTracked = useMemo(() => {
    if (filter === 'all') return nonTrackedArticles
    return nonTrackedArticles.filter(
      (a) => a.category === filter || a.secondaryCategories?.includes(filter)
    )
  }, [nonTrackedArticles, filter])

  // Group non-tracked by category for display
  const nonTrackedByCategory = useMemo(() => {
    const map = new Map<ArticleCategory, typeof articlesReferenceSeed>()
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

  // Total article count (all, not filtered)
  const totalCount = articlesReferenceSeed.length
  const liveCount = articlesReferenceSeed.filter((a) => a.linkStatus === 'live').length
  const archivedCount = articlesReferenceSeed.filter(
    (a) => a.linkStatus === 'archived' || a.linkStatus === 'mirror'
  ).length
  const lostCount = articlesReferenceSeed.filter((a) => a.linkStatus === 'lost').length

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO
        title="MTG Competitive Reading Library — 35+ Essential Articles | ManaTuner"
        description="The definitive reading list for competitive Magic: The Gathering players. Karsten, PVDDR, Reid Duke, Saito, Chapin, Fortier, Dagen — curated, categorized, and restored from link rot via archive.org."
        path="/library"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'MTG Competitive Reading Library',
          description:
            'Curated collection of 35+ essential competitive Magic: The Gathering articles on manabase math, mulligan theory, tournament mindset, and deckbuilding.',
          url: 'https://www.manatuner.app/library',
          publisher: {
            '@type': 'Organization',
            name: 'ManaTuner',
            url: 'https://www.manatuner.app',
          },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: totalCount,
            itemListElement: articlesReferenceSeed.slice(0, 10).map((a, i) => ({
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

      {/* Hero */}
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
            math to Saito's tournament mindset. Curated across 15 years of pro-level writing. Dead
            links restored via archive.org.
          </Typography>

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

      {/* Your Reading Path (3 tracks) */}
      <Box sx={{ mb: 6, position: 'relative', zIndex: 1 }}>
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
            Pick a Track — Start Where You Are
          </Typography>
        </Box>

        {/* Track jump nav */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}
        >
          {TRACK_ORDER.map((track) => {
            const meta = TRACK_METADATA[track]
            return (
              <Chip
                key={track}
                label={`${meta.emoji} ${meta.title}`}
                component="a"
                href={`#track-${track}`}
                clickable
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  height: 36,
                  px: 1,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            )
          })}
        </Stack>

        {/* Render each track */}
        {TRACK_ORDER.map((track, trackIdx) => {
          const articles = trackedByTrack[track]
          if (articles.length === 0) return null

          return (
            <Box key={track} sx={{ mb: 5 }}>
              <AnimatedContainer animation="fadeInUp" delay={trackIdx * 0.05}>
                <TrackHeader track={track} articleCount={articles.length} />
              </AnimatedContainer>

              <Grid container spacing={2.5}>
                {articles.map((article, articleIdx) => (
                  <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <AnimatedContainer
                      animation="fadeInUp"
                      delay={0.08 + articleIdx * 0.05}
                      sx={{ height: '100%' }}
                    >
                      <ArticleCard article={article} showCuratorNote />
                    </AnimatedContainer>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        })}
      </Box>

      {/* Browse by topic */}
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

        {/* Category filter chips */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            mb: 4,
            alignItems: 'center',
          }}
        >
          <FilterAltIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          <Chip
            label="All"
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            variant={filter === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
          {CATEGORY_ORDER.map((cat) => (
            <Chip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              onClick={() => setFilter(cat)}
              color={filter === cat ? 'primary' : 'default'}
              variant={filter === cat ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        {/* Result count */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 3, fontStyle: 'italic' }}
        >
          Showing {filteredNonTracked.length} of {nonTrackedArticles.length} articles
          {filter !== 'all' && ` in ${CATEGORY_LABELS[filter]}`}
        </Typography>

        {/* Grouped by category */}
        {nonTrackedByCategory.size === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">
              No articles in this category yet. Try another filter or check the featured tracks
              above.
            </Typography>
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
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Box>

      {/* Footer call-to-action */}
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
