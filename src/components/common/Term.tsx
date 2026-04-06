import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Tooltip, Typography } from '@mui/material'
import React from 'react'

import { GLOSSARY } from '../../data/glossary'

interface TermProps {
  /** Key in GLOSSARY — e.g. "castability", "monte-carlo" */
  id: string
  /** Override the displayed text (defaults to children) */
  children: React.ReactNode
  /** Show the small help icon after the text */
  icon?: boolean
}

/**
 * Inline glossary tooltip — wraps a technical term with a hover explanation.
 * Falls back to rendering children as-is if the term is not in the glossary.
 */
export const Term: React.FC<TermProps> = ({ id, children, icon = false }) => {
  const entry = GLOSSARY[id]
  if (!entry) return <>{children}</>

  return (
    <Tooltip
      title={
        <>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {children}
          </Typography>
          <Typography variant="caption">{entry.short}</Typography>
        </>
      }
      arrow
      enterDelay={200}
      leaveDelay={100}
      enterTouchDelay={50}
      componentsProps={{
        tooltip: {
          sx: {
            maxWidth: 280,
            p: 1.5,
            fontSize: '0.8rem',
          },
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          textDecoration: 'underline dotted',
          textDecorationColor: 'text.disabled',
          textUnderlineOffset: '3px',
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.3,
        }}
      >
        {children}
        {icon && (
          <HelpOutlineIcon sx={{ fontSize: '0.85em', opacity: 0.5, verticalAlign: 'middle' }} />
        )}
      </Typography>
    </Tooltip>
  )
}
