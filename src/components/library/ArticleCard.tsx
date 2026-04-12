import ArchiveIcon from '@mui/icons-material/Archive'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import DescriptionIcon from '@mui/icons-material/Description'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LockOutlineIcon from '@mui/icons-material/LockOutlined'
import MirrorIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutline'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PublicIcon from '@mui/icons-material/Public'
import TableChartIcon from '@mui/icons-material/TableChart'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { memo } from 'react'
import type { ArticleMedium, LinkStatus, ReferenceArticle } from '../../types/referenceArticle'
import { CATEGORY_LABELS } from '../../types/referenceArticle'
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
}

const ArticleCardComponent: React.FC<ArticleCardProps> = ({
  article,
  showCuratorNote = false,
  compact = false,
}) => {
  const { isDark } = useTheme()

  const statusMeta = LINK_STATUS_META[article.linkStatus]
  const StatusIcon = statusMeta.icon
  const mediumMeta = MEDIUM_META[article.medium]
  const MediumIcon = mediumMeta.icon

  const isDisabled = article.linkStatus === 'lost'
  const flag = LANGUAGE_FLAG[article.language] ?? ''

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'background.paper',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-3px)',
          borderColor: isDisabled ? undefined : isDark ? 'rgba(255,255,255,0.2)' : 'primary.main',
          boxShadow: isDisabled
            ? undefined
            : isDark
              ? '0 12px 32px rgba(0,0,0,0.5)'
              : '0 12px 32px rgba(0,0,0,0.12)',
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
                sx={{ fontSize: '0.9rem', flexShrink: 0, lineHeight: 1 }}
                aria-label={`Language: ${article.language}`}
              >
                {flag}
              </Typography>
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

        {/* Title */}
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
          {article.title}
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

        {/* Author · Publisher · Year */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1.25,
            fontSize: '0.75rem',
          }}
        >
          {article.author} · {article.publisher} · {article.year}
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
        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
