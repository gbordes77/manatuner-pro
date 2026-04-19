import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArchiveIcon from '@mui/icons-material/Archive'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleFilledIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import { ArticleCard } from '../components/library/ArticleCard'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import { SEO } from '../components/common/SEO'
import { useTheme } from '../components/common/NotificationProvider'
import { articlesReferenceSeed } from '../data/articlesReferenceSeed'
import { useLibraryProgress } from '../hooks/useLibraryProgress'
import { CATEGORY_LABELS, TRACK_METADATA, type ReferenceArticle } from '../types/referenceArticle'
import { slugifyAuthor, toBibTeX } from '../utils/libraryHelpers'

const LANGUAGE_LABEL: Record<string, string> = {
  en: '🇬🇧 English',
  fr: '🇫🇷 Français',
  jp: '🇯🇵 日本語',
  multi: '🌐 Multi-language',
}

function findRelated(article: ReferenceArticle, limit = 3): ReferenceArticle[] {
  return articlesReferenceSeed
    .filter((a) => a.id !== article.id)
    .map((a) => {
      let score = 0
      if (a.category === article.category) score += 3
      if (a.author === article.author) score += 4
      if (a.curatorTrack && a.curatorTrack === article.curatorTrack) score += 2
      if (a.secondaryCategories?.includes(article.category)) score += 1
      if (a.level === article.level) score += 1
      return { a, score }
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a)
}

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { isDark } = useTheme()
  const progress = useLibraryProgress()
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedBib, setCopiedBib] = useState(false)

  const article = useMemo(() => articlesReferenceSeed.find((a) => a.id === slug), [slug])

  const related = useMemo(() => (article ? findRelated(article) : []), [article])

  if (!article) {
    return <Navigate to="/library" replace />
  }

  const isRead = progress.isRead(article.id)
  const isBookmarked = progress.isBookmarked(article.id)
  const track = article.curatorTrack ? TRACK_METADATA[article.curatorTrack] : null
  const isDisabled = article.linkStatus === 'lost'
  const canonicalPath = `/library/${article.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.manatuner.app${canonicalPath}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 1500)
    } catch {
      // clipboard blocked — user can copy URL from the address bar
    }
  }

  const handleCopyBibTeX = async () => {
    try {
      await navigator.clipboard.writeText(toBibTeX(article))
      setCopiedBib(true)
      setTimeout(() => setCopiedBib(false), 1800)
    } catch {
      // silently no-op
    }
  }

  const descriptionForSeo =
    article.description.length > 155 ? article.description.slice(0, 152) + '…' : article.description

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    alternativeHeadline: article.subtitle,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      url: `https://www.manatuner.app/library/author/${slugifyAuthor(article.author)}`,
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisher,
    },
    datePublished: `${article.year}-01-01`,
    url: `https://www.manatuner.app${canonicalPath}`,
    sameAs: article.primaryUrl,
    inLanguage: article.language,
    isAccessibleForFree: article.linkStatus !== 'paywall',
    about: CATEGORY_LABELS[article.category],
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, position: 'relative' }}>
      <SEO
        title={`${article.title} — ${article.author} | ManaTuner Library`}
        description={descriptionForSeo}
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
        <Typography
          color="text.primary"
          sx={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {article.title}
        </Typography>
      </Breadcrumbs>

      <Button
        component={RouterLink}
        to="/library"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2, textTransform: 'none', position: 'relative', zIndex: 1 }}
      >
        Back to the Library
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'background.paper',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Track ribbon */}
        {track && (
          <Chip
            icon={<MenuBookIcon sx={{ fontSize: 14 }} />}
            label={
              <Box component="span">
                <Box component="span" aria-hidden="true" sx={{ mr: 0.5 }}>
                  {track.emoji}
                </Box>
                {track.title}
              </Box>
            }
            size="small"
            component={RouterLink}
            to={`/library#track-${track.id}`}
            clickable
            sx={{ mb: 2, fontWeight: 600 }}
          />
        )}

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            fontFamily: '"Cinzel", serif',
            lineHeight: 1.15,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            mb: 1,
          }}
        >
          {article.title}
        </Typography>

        {article.subtitle && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontStyle: 'italic', fontWeight: 400, mb: 2 }}
          >
            {article.subtitle}
          </Typography>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 3 }}>
          <MuiLink
            component={RouterLink}
            to={`/library/author/${slugifyAuthor(article.author)}`}
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            {article.author}
          </MuiLink>
          <Typography color="text.secondary">·</Typography>
          <Typography color="text.secondary">{article.publisher}</Typography>
          <Typography color="text.secondary">·</Typography>
          <Typography color="text.secondary">{article.year}</Typography>
          <Typography color="text.secondary">·</Typography>
          <Typography color="text.secondary">{LANGUAGE_LABEL[article.language]}</Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 3 }}>
          <Chip
            size="small"
            label={CATEGORY_LABELS[article.category]}
            color="primary"
            variant="filled"
            component={RouterLink}
            to={`/library?cat=${article.category}`}
            clickable
          />
          {/* Secondary categories + level + medium: only shown to
              intermediate/advanced readers. Leo (beginner) gets the
              primary Category only — extra chips felt like a thesis
              page and drove the -0.12 Library V3 regression in the
              2026-04-19 persona audit. */}
          {article.level !== 'beginner' && (
            <>
              {article.secondaryCategories?.map((c) => (
                <Chip
                  key={c}
                  size="small"
                  label={CATEGORY_LABELS[c]}
                  variant="outlined"
                  component={RouterLink}
                  to={`/library?cat=${c}`}
                  clickable
                />
              ))}
              <Chip size="small" label={article.level} variant="outlined" />
              <Chip size="small" label={article.medium} variant="outlined" />
            </>
          )}
        </Stack>

        <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
          {article.description}
        </Typography>

        {article.curatorNote && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              backgroundColor: isDark ? 'rgba(25,118,210,0.06)' : 'rgba(25,118,210,0.04)',
              borderRadius: '0 8px 8px 0',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.5 }}
            >
              Curator's Note
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, mt: 0.5 }}>
              {article.curatorNote}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
          {isDisabled ? (
            <Button disabled variant="outlined" fullWidth>
              No working link available
            </Button>
          ) : (
            <Button
              component="a"
              href={article.primaryUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => {
                if (!isRead) progress.toggleRead(article.id)
              }}
              variant="contained"
              size="large"
              startIcon={article.linkStatus === 'archived' ? <ArchiveIcon /> : <OpenInNewIcon />}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
            >
              {article.linkStatus === 'archived'
                ? 'Read on Wayback Machine'
                : article.linkStatus === 'mirror'
                  ? 'Read on mirror'
                  : 'Read the article'}
            </Button>
          )}

          <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark'} arrow>
            <IconButton
              onClick={() => progress.toggleBookmark(article.id)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              aria-pressed={isBookmarked}
              sx={{
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'divider',
                color: isBookmarked ? 'warning.main' : 'text.secondary',
              }}
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isRead ? 'Mark as unread' : 'Mark as read'} arrow>
            <IconButton
              onClick={() => progress.toggleRead(article.id)}
              aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
              aria-pressed={isRead}
              sx={{
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'divider',
                color: isRead ? 'success.main' : 'text.secondary',
              }}
            >
              {isRead ? <CheckCircleFilledIcon /> : <CheckCircleIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        {article.originalUrl && article.linkStatus !== 'live' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Original URL (likely dead):{' '}
            <MuiLink
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              sx={{ color: 'inherit', textDecorationStyle: 'dotted' }}
            >
              {article.originalUrl}
            </MuiLink>
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="overline" sx={{ letterSpacing: 1.5, color: 'text.secondary' }}>
          Share this piece
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyLink}
            sx={{ textTransform: 'none' }}
          >
            {copiedLink ? 'Link copied!' : 'Copy link to this page'}
          </Button>
          {/* BibTeX citation: advanced-only surface. Beginners don't cite —
              it intimidates them (2026-04-19 Leo audit). Natsuki/David/
              Karim recognize it as a signal of academic rigor and want
              it visible. Copy-link stays universal (useful for everyone). */}
          {article.level !== 'beginner' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyBibTeX}
              sx={{ textTransform: 'none' }}
            >
              {copiedBib ? 'BibTeX copied!' : 'Copy BibTeX citation'}
            </Button>
          )}
        </Stack>
      </Paper>

      {related.length > 0 && (
        <Box sx={{ mt: 5, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 700, fontFamily: '"Cinzel", serif', mb: 2 }}
          >
            Related reading
          </Typography>
          <Grid container spacing={2.5}>
            {related.map((r) => (
              <Grid item xs={12} sm={6} md={4} key={r.id}>
                <ArticleCard
                  article={r}
                  isRead={progress.isRead(r.id)}
                  isBookmarked={progress.isBookmarked(r.id)}
                  onToggleRead={progress.toggleRead}
                  onToggleBookmark={progress.toggleBookmark}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  )
}

export default ArticleDetailPage
