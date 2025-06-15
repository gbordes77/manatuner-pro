import React from 'react'
import { Tooltip, Box, CircularProgress, Typography } from '@mui/material'
import { useCardImage } from '../hooks/useCardImage'

interface CardImageTooltipProps {
  cardName: string
  children: React.ReactElement
}

export const CardImageTooltip: React.FC<CardImageTooltipProps> = ({ cardName, children }) => {
  const { imageUrl, loading, error, startFetch, cancelFetch } = useCardImage(cardName)

  const handleMouseEnter = () => {
    startFetch()
  }

  const handleMouseLeave = () => {
    cancelFetch()
  }

  const tooltipContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 2,
          minWidth: 200,
          minHeight: 100
        }}>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography variant="caption">Loading card image...</Typography>
        </Box>
      )
    }

    if (error || !imageUrl) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 2,
          minWidth: 200
        }}>
          <Typography variant="caption" color="text.secondary">
            🃏 Image not available
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {cardName}
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ 
        maxWidth: 300,
        '& img': {
          width: '100%',
          height: 'auto',
          borderRadius: 2,
          boxShadow: 2
        }
      }}>
        <img 
          src={imageUrl} 
          alt={cardName}
          loading="lazy"
          style={{ display: 'block' }}
        />
      </Box>
    )
  }

  return (
    <Tooltip
      title={tooltipContent()}
      placement="right"
      arrow
      enterDelay={300}
      leaveDelay={100}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 4,
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: 320,
            p: 0
          }
        },
        arrow: {
          sx: {
            color: 'background.paper',
            '&::before': {
              border: '1px solid',
              borderColor: 'divider'
            }
          }
        }
      }}
    >
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
    </Tooltip>
  )
} 