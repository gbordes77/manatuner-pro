import React from 'react'
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Grid
} from '@mui/material'
import { GitHub as GitHubIcon, Favorite as FavoriteIcon } from '@mui/icons-material'

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
              © 2024 ManaTuner Pro. Open source under MIT License.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Link 
                href="https://github.com/project-manabase" 
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
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Powered by Frank Karsten's manabase research
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
} 