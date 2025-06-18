import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip
} from '@mui/material'
import {
  Menu as MenuIcon,
  Analytics as AnalyticsIcon,
  GitHub as GitHubIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useTheme } from '../common/NotificationProvider'

export const Header: React.FC = () => {
  const muiTheme = useMuiTheme()
  const { isDark, toggleTheme } = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  const location = useLocation()

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Analyzer', path: '/analyzer' },
    { label: 'About', path: '/about' }
  ]

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo */}
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            ManaTuner Pro
          </Typography>
        </Box>

        {/* Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                variant={location.pathname === item.path ? 'outlined' : 'text'}
                sx={{
                  borderColor: location.pathname === item.path ? 'rgba(255,255,255,0.5)' : 'transparent'
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Theme Toggle */}
        <Tooltip title={`Basculer vers le thème ${isDark ? 'clair' : 'sombre'}`}>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{ 
              ml: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
              }
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {/* GitHub link */}
        <IconButton
          color="inherit"
          component="a"
          href="https://github.com/project-manabase"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ ml: 1 }}
        >
          <GitHubIcon />
        </IconButton>

        {/* Mobile menu */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="end"
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  )
} 