import { Favorite as FavoriteIcon, GitHub as GitHubIcon } from '@mui/icons-material'
import {
    Box,
    Container,
    Divider,
    Grid,
    Link,
    Typography
} from '@mui/material'
import React from 'react'

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 3,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Built with <FavoriteIcon sx={{ fontSize: 14, mx: 0.5, color: 'red' }} /> for the Magic: The Gathering community
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              © 2025 ManaTuner Pro. Open source under MIT License.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              This project is not affiliated with Wizards of the Coast. Magic: The Gathering is a trademark of Wizards of the Coast LLC.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Link
                href="https://github.com/gbordes77/manatuner-pro"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
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
              >
                Scryfall API
              </Link>

              <Divider orientation="vertical" flexItem />

              <Link
                href="/privacy"
                color="inherit"
              >
                Privacy
              </Link>
            </Box>


          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
