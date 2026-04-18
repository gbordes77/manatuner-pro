import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import { ArticleCard } from '../components/library/ArticleCard'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import { SEO } from '../components/common/SEO'
import { articlesReferenceSeed } from '../data/articlesReferenceSeed'
import { useLibraryProgress } from '../hooks/useLibraryProgress'
import { CATEGORY_LABELS, TRACK_METADATA } from '../types/referenceArticle'
import { findAuthorsBySlug, slugifyAuthor } from '../utils/libraryHelpers'

export const AuthorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const progress = useLibraryProgress()

  const { articles, authorNames } = useMemo(
    () => findAuthorsBySlug(articlesReferenceSeed, slug ?? ''),
    [slug]
  )

  if (articles.length === 0) {
    return <Navigate to="/library" replace />
  }

  const displayName = authorNames.join(' / ')
  const canonicalPath = `/library/author/${slug}`

  const years = articles.map((a) => a.year).sort((x, y) => x - y)
  const firstYear = years[0]
  const lastYear = years[years.length - 1]
  const yearRange = firstYear === lastYear ? String(firstYear) : `${firstYear}–${lastYear}`

  const tracks = Array.from(
    new Set(articles.map((a) => a.curatorTrack).filter((t): t is NonNullable<typeof t> => !!t))
  )
  const categories = Array.from(new Set(articles.map((a) => a.category)))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Articles by ${displayName} on ManaTuner`,
    description: `${articles.length} curated article${articles.length > 1 ? 's' : ''} by ${displayName} in the ManaTuner Competitive MTG Library (${yearRange}).`,
    url: `https://www.manatuner.app${canonicalPath}`,
    about: {
      '@type': 'Person',
      name: displayName,
      sameAs: articles[0]?.primaryUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Article',
          headline: a.title,
          datePublished: `${a.year}-01-01`,
          url: `https://www.manatuner.app/library/${a.id}`,
        },
      })),
    },
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO
        title={`${displayName} — ${articles.length} article${articles.length > 1 ? 's' : ''} | ManaTuner Library`}
        description={`Every curated piece by ${displayName} in the ManaTuner Competitive MTG Library — ${articles.length} article${articles.length > 1 ? 's' : ''} from ${yearRange}, restored from archive.org where needed.`}
        path={canonicalPath}
        jsonLd={jsonLd}
      />

      <FloatingManaSymbols />

      <Breadcrumbs sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </MuiLink>
        <MuiLink component={RouterLink} to="/library" underline="hover" color="inherit">
          Library
        </MuiLink>
        <Typography color="text.primary">{displayName}</Typography>
      </Breadcrumbs>

      <Button
        component={RouterLink}
        to="/library"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 3, textTransform: 'none', position: 'relative', zIndex: 1 }}
      >
        Back to the Library
      </Button>

      <Box sx={{ textAlign: 'center', mb: 5, position: 'relative', zIndex: 1 }}>
        <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            fontFamily: '"Cinzel", serif',
            fontSize: { xs: '2rem', md: '2.8rem' },
            mb: 1,
          }}
        >
          {displayName}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 2 }}>
          {articles.length} article{articles.length > 1 ? 's' : ''} · {yearRange}
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
          {tracks.map((t) => {
            const meta = TRACK_METADATA[t]
            return (
              <Chip
                key={t}
                label={
                  <Box component="span">
                    <Box component="span" aria-hidden="true" sx={{ mr: 0.5 }}>
                      {meta.emoji}
                    </Box>
                    {meta.title}
                  </Box>
                }
                component={RouterLink}
                to={`/library#track-${t}`}
                clickable
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )
          })}
          {categories.map((c) => (
            <Chip
              key={c}
              label={CATEGORY_LABELS[c]}
              size="small"
              variant="outlined"
              component={RouterLink}
              to={`/library?cat=${c}`}
              clickable
            />
          ))}
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        {articles.map((a) => (
          <Grid item xs={12} sm={6} md={4} key={a.id}>
            <ArticleCard
              article={a}
              showCuratorNote={!!a.curatorNote}
              isRead={progress.isRead(a.id)}
              isBookmarked={progress.isBookmarked(a.id)}
              onToggleRead={progress.toggleRead}
              onToggleBookmark={progress.toggleBookmark}
            />
          </Grid>
        ))}
      </Grid>

      {/* Footer hint to explore other authors */}
      <Box
        sx={{
          mt: 6,
          p: 3,
          borderRadius: 3,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Looking for another author? Every card in the{' '}
          <MuiLink component={RouterLink} to="/library" underline="hover">
            Library
          </MuiLink>{' '}
          links to the author's full index — click the author name on any card.
        </Typography>
      </Box>

      {/* Anchor for slug-invariance: bots get the canonical slug even if the URL path arrived capitalized */}
      <Box sx={{ display: 'none' }} data-author-slug={slugifyAuthor(displayName)} />
    </Container>
  )
}

export default AuthorPage
