import GitHubIcon from '@mui/icons-material/GitHub'
import { Box, Container, Divider, Grid, Link, Typography, useTheme } from '@mui/material'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

// WUBRG signature row
const WUBRGSignature: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        '& i': {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.3)',
            filter: 'drop-shadow(0 0 6px currentColor) !important',
          },
        },
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
        Crafted with
      </Typography>
      <Typography component="span" sx={{ color: '#e91e63', mx: 0.5, fontSize: '1rem' }}>
        ❤️
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
        for the MTG community
      </Typography>
    </Box>
  )
}

export const Footer: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDark ? 'rgba(13, 13, 15, 0.95)' : 'background.paper',
        py: 3,
        mt: 'auto',
        borderTop: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            {/* WUBRG signature */}
            <WUBRGSignature />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              © 2025-2026 ManaTuner. Open source under MIT License.
            </Typography>

            {/* Fan Content Policy attribution */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 1,
                display: 'block',
                opacity: 0.8,
                lineHeight: 1.4,
              }}
            >
              ManaTuner is unofficial Fan Content permitted under the{' '}
              <Link
                href="https://company.wizards.com/en/legal/fancontentpolicy"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ textDecoration: 'underline' }}
              >
                Fan Content Policy
              </Link>
              . Not approved/endorsed by Wizards. Portions of the materials used are property of
              Wizards of the Coast. ©Wizards of the Coast LLC.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Site navigation */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexWrap: 'wrap',
                mb: 1.5,
              }}
            >
              {[
                { label: 'Analyzer', path: '/analyzer' },
                { label: 'Guide', path: '/guide' },
                { label: 'Mathematics', path: '/mathematics' },
                { label: 'Land Glossary', path: '/land-glossary' },
                { label: 'About', path: '/about' },
                { label: 'Privacy', path: '/privacy' },
              ].map((item) => (
                <Link
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{
                    transition: 'color 0.2s ease',
                    '&:hover': { color: theme.palette.primary.main },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>

            {/* External links */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="https://github.com/gbordes77/manatuner"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'color 0.2s ease',
                  '&:hover': { color: theme.palette.primary.main },
                }}
              >
                <GitHubIcon fontSize="small" />
                GitHub
              </Link>

              <Divider orientation="vertical" flexItem />

              <Link
                href="https://scryfall.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  transition: 'color 0.2s ease',
                  '&:hover': { color: theme.palette.mana.blue },
                }}
              >
                Scryfall API
              </Link>

              <Divider orientation="vertical" flexItem />

              <Link
                href="https://andrewgioia.github.io/Keyrune/"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  transition: 'color 0.2s ease',
                  '&:hover': { color: theme.palette.mana.multicolor },
                }}
              >
                Keyrune Icons
              </Link>
            </Box>

            {/* Mathematical credit */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1.5, display: 'block', textAlign: { xs: 'left', md: 'right' } }}
            >
              Probability mathematics based on{' '}
              <Link
                href="https://www.channelfireball.com/articles/how-many-lands-do-you-need-to-consistently-hit-your-land-drops/"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ textDecoration: 'underline' }}
              >
                Frank Karsten's research
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
