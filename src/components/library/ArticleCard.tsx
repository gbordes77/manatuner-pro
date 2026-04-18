import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArchiveIcon from '@mui/icons-material/Archive'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleFilledIcon from '@mui/icons-material/CheckCircle'
import DescriptionIcon from '@mui/icons-material/Description'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LinkIcon from '@mui/icons-material/Link'
import LockOutlineIcon from '@mui/icons-material/LockOutlined'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import MirrorIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutline'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import PublicIcon from '@mui/icons-material/Public'
import TableChartIcon from '@mui/icons-material/TableChart'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { memo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { ArticleMedium, LinkStatus, ReferenceArticle } from '../../types/referenceArticle'
import { CATEGORY_LABELS } from '../../types/referenceArticle'
import { slugifyAuthor, toBibTeX } from '../../utils/libraryHelpers'
import { useTheme } from '../common/NotificationProvider'

const LINK_STATUS_META: Record<
  LinkStatus,
  {
    icon: React.ElementType
    label: string
    color: 'success' | 'warning' | 'info' | 'error' | 'default'
    tooltip: string
    buttonLabel: string
  }
> = {
  live: {
    icon: CheckCircleIcon,
    label: 'Live',
    color: 'success',
    tooltip: 'Original link works — last checked 2026-04',
    buttonLabel: 'Read article',
  },
  archived: {
    icon: ArchiveIcon,
    label: 'Archived',
    color: 'warning',
    tooltip: 'Original page is offline — this loads the archive.org snapshot that preserves it.',
    buttonLabel: 'Read on Wayback',
  },
  mirror: {
    icon: MirrorIcon,
    label: 'Mirrored',
    color: 'info',
    tooltip: 'Original host is gone — this is a trusted community-hosted mirror.',
    buttonLabel: 'Read mirror',
  },
  paywall: {
    icon: LockOutlineIcon,
    label: 'Paywall',
    color: 'info',
    tooltip: 'Live article but requires a paid subscription to read in full.',
    buttonLabel: 'Read article',
  },
  lost: {
    icon: HelpOutlineIcon,
    label: 'Lost',
    color: 'error',
    tooltip: 'No working link has been found. Help us restore it.',
    buttonLabel: 'No link available',
  },
}

const MEDIUM_META: Record<ArticleMedium, { icon: React.ElementType; label: string }> = {
  article: { icon: DescriptionIcon, label: 'Article' },
  'article-series': { icon: DescriptionIcon, label: 'Series' },
  video: { icon: PlayCircleIcon, label: 'Video' },
  'video-series': { icon: PlaylistPlayIcon, label: 'Playlist' },
  pdf: { icon: PictureAsPdfIcon, label: 'PDF' },
  spreadsheet: { icon: TableChartIcon, label: 'Spreadsheet' },
  reference: { icon: PublicIcon, label: 'Reference' },
  podcast: { icon: PodcastsIcon, label: 'Podcast' },
}

const LANGUAGE_FLAG: Record<string, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  jp: '🇯🇵',
  multi: '🌐',
}

interface ArticleCardProps {
  article: ReferenceArticle
  /**
   * Show the curator note in the card. True only when rendered inside
   * a curator track; false in the main grid for density.
   */
  showCuratorNote?: boolean
  /** Compact variant for series sub-parts */
  compact?: boolean
  /** Marked as read in localStorage */
  isRead?: boolean
  /** Bookmarked in localStorage */
  isBookmarked?: boolean
  /** Toggle handlers (optional — cards are read-only if omitted) */
  onToggleRead?: (id: string) => void
  onToggleBookmark?: (id: string) => void
}

/**
 * Humanise reading time. For long-form audio/video we render hours
 * when the value is past 60 min so "90 min" → "1h 30". Short values
 * stay in plain minutes.
 */
function formatReadingTime(minutes: number, medium: ArticleMedium): string {
  const label =
    medium === 'podcast' || medium === 'video' || medium === 'video-series' ? 'listen' : 'read'
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m === 0 ? `${h}h ${label}` : `${h}h ${m}m ${label}`
  }
  return `${minutes} min ${label}`
}

const ArticleCardComponent: React.FC<ArticleCardProps> = ({
  article,
  showCuratorNote = false,
  compact = false,
  isRead = false,
  isBookmarked = false,
  onToggleRead,
  onToggleBookmark,
}) => {
  const { isDark } = useTheme()
  const [copied, setCopied] = useState(false)
  const [bibCopied, setBibCopied] = useState(false)

  const statusMeta = LINK_STATUS_META[article.linkStatus]
  const StatusIcon = statusMeta.icon
  const mediumMeta = MEDIUM_META[article.medium]
  const MediumIcon = mediumMeta.icon

  const isDisabled = article.linkStatus === 'lost'
  const flag = LANGUAGE_FLAG[article.language] ?? ''
  const detailPath = `/library/${article.id}`
  const authorPath = `/library/author/${slugifyAuthor(article.author)}`

  const handleCopyLink = async () => {
    try {
      // Canonical per-article URL — crawler-indexable, Discord-rich-preview,
      // and re-shareable. Falls back to fragment anchor for older bookmarks.
      const url = `${window.location.origin}${detailPath}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked — silently no-op; users can still copy URL manually
    }
  }

  const handleCopyBibTeX = async () => {
    try {
      await navigator.clipboard.writeText(toBibTeX(article))
      setBibCopied(true)
      setTimeout(() => setBibCopied(false), 1800)
    } catch {
      // silently no-op
    }
  }

  return (
    <Card
      id={`article-${article.id}`}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isRead
          ? isDark
            ? 'rgba(76,175,80,0.35)'
            : 'rgba(76,175,80,0.45)'
          : isDark
            ? 'rgba(255,255,255,0.08)'
            : 'divider',
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'background.paper',
        scrollMarginTop: 80, // deep-link anchors land below any sticky header
        opacity: isRead ? 0.82 : 1, // subtle dim to signal "done"
        transition: 'all 0.25s ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-3px)',
          borderColor: isDisabled ? undefined : isDark ? 'rgba(255,255,255,0.2)' : 'primary.main',
          boxShadow: isDisabled
            ? undefined
            : isDark
              ? '0 12px 32px rgba(0,0,0,0.5)'
              : '0 12px 32px rgba(0,0,0,0.12)',
          opacity: 1,
        },
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent
        sx={{
          p: compact ? 2 : 2.5,
          pb: `${compact ? 16 : 20}px !important`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top row: status icon + medium + language + link-status chip */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}
        >
          <Tooltip title={statusMeta.tooltip} arrow>
            <StatusIcon
              fontSize="small"
              color={statusMeta.color === 'default' ? 'action' : statusMeta.color}
              sx={{ flexShrink: 0 }}
            />
          </Tooltip>

          <Chip
            size="small"
            icon={<MediumIcon sx={{ fontSize: 14 }} />}
            label={mediumMeta.label}
            variant="outlined"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              '& .MuiChip-icon': { ml: 0.75, mr: -0.5 },
            }}
          />

          {flag && (
            <Tooltip title={`Language: ${article.language.toUpperCase()}`} arrow>
              <Typography
                component="span"
                aria-hidden="true"
                sx={{ fontSize: '0.9rem', flexShrink: 0, lineHeight: 1 }}
              >
                {flag}
              </Typography>
            </Tooltip>
          )}
          <Box component="span" sx={{ position: 'absolute', left: -9999 }}>
            Language: {article.language.toUpperCase()}
          </Box>

          {typeof article.readingTimeMin === 'number' && article.readingTimeMin > 0 && (
            <Tooltip
              title={
                article.medium === 'podcast' ||
                article.medium === 'video' ||
                article.medium === 'video-series'
                  ? 'Approximate runtime'
                  : 'Estimated reading time'
              }
              arrow
            >
              <Chip
                size="small"
                icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
                label={formatReadingTime(article.readingTimeMin, article.medium)}
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  '& .MuiChip-icon': { ml: 0.5, mr: -0.25 },
                }}
              />
            </Tooltip>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {article.linkStatus !== 'live' && (
            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color === 'default' ? undefined : statusMeta.color}
              variant="outlined"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }}
            />
          )}
        </Stack>

        {/* Title — links to the per-article detail page for SEO + deep linking */}
        <Typography
          variant={compact ? 'subtitle1' : 'h6'}
          component="h3"
          sx={{
            fontWeight: 700,
            lineHeight: 1.25,
            mb: 0.25,
            fontSize: compact ? '0.95rem' : '1.05rem',
            fontFamily: '"Cinzel", serif',
          }}
        >
          <Link
            component={RouterLink}
            to={detailPath}
            underline="hover"
            sx={{
              color: 'inherit',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {article.title}
          </Link>
        </Typography>

        {/* Subtitle (series part) */}
        {article.subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              fontSize: '0.82rem',
              mb: 0.5,
            }}
          >
            {article.subtitle}
          </Typography>
        )}

        {/* Author · Publisher · Year. Author links to /library/author/:slug */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1.25,
            fontSize: '0.75rem',
          }}
        >
          <Link
            component={RouterLink}
            to={authorPath}
            underline="hover"
            sx={{
              color: 'inherit',
              fontWeight: 600,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {article.author}
          </Link>{' '}
          · {article.publisher} · {article.year}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.5,
            mb: 'auto',
            fontSize: compact ? '0.82rem' : '0.88rem',
          }}
        >
          {article.description}
        </Typography>

        {/* Curator note (only in track mode) */}
        {showCuratorNote && article.curatorNote && (
          <Box
            sx={{
              mt: 2,
              pl: 1.5,
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              position: 'relative',
            }}
          >
            <FormatQuoteIcon
              sx={{
                position: 'absolute',
                left: -10,
                top: -6,
                fontSize: 16,
                color: 'primary.main',
                backgroundColor: isDark ? '#0D0D0F' : 'background.paper',
                borderRadius: '50%',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                color: isDark ? 'rgba(255,255,255,0.85)' : 'text.primary',
              }}
            >
              {article.curatorNote}
            </Typography>
          </Box>
        )}

        {/* Category chip */}
        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            size="small"
            label={CATEGORY_LABELS[article.category]}
            variant="filled"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              backgroundColor: isDark ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.08)',
              color: isDark ? '#90caf9' : 'primary.dark',
              border: 'none',
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          {/* Personal actions: bookmark + copy-link + read toggle */}
          {onToggleBookmark && (
            <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'} arrow>
              <IconButton
                size="small"
                onClick={() => onToggleBookmark(article.id)}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                aria-pressed={isBookmarked}
                sx={{ p: 0.25, color: isBookmarked ? 'warning.main' : 'text.secondary' }}
              >
                {isBookmarked ? (
                  <BookmarkIcon sx={{ fontSize: 16 }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={copied ? 'Link copied!' : 'Copy shareable link'} arrow>
            <IconButton
              size="small"
              onClick={handleCopyLink}
              aria-label="Copy link to this article"
              sx={{ p: 0.25, color: copied ? 'success.main' : 'text.secondary' }}
            >
              <LinkIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={bibCopied ? 'BibTeX copied!' : 'Copy BibTeX citation'} arrow>
            <IconButton
              size="small"
              onClick={handleCopyBibTeX}
              aria-label="Copy BibTeX citation for this article"
              sx={{ p: 0.25, color: bibCopied ? 'success.main' : 'text.secondary' }}
            >
              <MenuBookIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {onToggleRead && (
            <Tooltip title={isRead ? 'Mark as unread' : 'Mark as read'} arrow>
              <IconButton
                size="small"
                onClick={() => onToggleRead(article.id)}
                aria-label={isRead ? 'Mark article as unread' : 'Mark article as read'}
                aria-pressed={isRead}
                sx={{ p: 0.25, color: isRead ? 'success.main' : 'text.secondary' }}
              >
                {isRead ? (
                  <CheckCircleFilledIcon sx={{ fontSize: 18 }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>

      {/* Action: read article */}
      <Box sx={{ p: 2, pt: 0 }}>
        {isDisabled ? (
          <Button
            disabled
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<HelpOutlineIcon />}
          >
            Help us restore this article
          </Button>
        ) : (
          <Button
            component="a"
            href={article.primaryUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => {
              // Auto-mark as read when the user actually opens the article
              // (one-way — they can always toggle it off later)
              if (onToggleRead && !isRead) onToggleRead(article.id)
            }}
            fullWidth
            variant={article.linkStatus === 'live' ? 'contained' : 'outlined'}
            size="small"
            startIcon={
              article.linkStatus === 'archived' ? (
                <ArchiveIcon />
              ) : article.linkStatus === 'mirror' ? (
                <MirrorIcon />
              ) : (
                <OpenInNewIcon />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {statusMeta.buttonLabel}
          </Button>
        )}

        {/* Secondary link to the original when we're serving a non-original URL */}
        {article.originalUrl && !isDisabled && article.linkStatus !== 'live' && (
          <Box sx={{ mt: 0.75, textAlign: 'center' }}>
            <Link
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                textDecorationStyle: 'dotted',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Try original link ↗
            </Link>
          </Box>
        )}
      </Box>
    </Card>
  )
}

export const ArticleCard = memo(ArticleCardComponent)
ArticleCard.displayName = 'ArticleCard'
