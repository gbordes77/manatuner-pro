import { Link, Typography } from '@mui/material'
import React from 'react'

const Footer: React.FC = () => {
  return (
    <Typography variant="body2" color="text.secondary">
      © 2025-2026 ManaTuner. Inspired by the work of{' '}
      <Link
        href="https://github.com/WickedFridge/magic-project-manabase"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: 'inherit' }}
      >
        Charles Wickham
      </Link>{' '}
      and Frank Karsten's research.
    </Typography>
  )
}

export default Footer
