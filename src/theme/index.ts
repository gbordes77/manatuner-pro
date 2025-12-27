import { createTheme, ThemeOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    mana: {
      white: string
      blue: string
      black: string
      red: string
      green: string
      colorless: string
      multicolor: string
      // Glow variants for effects
      whiteGlow: string
      blueGlow: string
      blackGlow: string
      redGlow: string
      greenGlow: string
    }
    glass: {
      primary: string
      secondary: string
      border: string
    }
  }

  interface PaletteOptions {
    mana?: {
      white?: string
      blue?: string
      black?: string
      red?: string
      green?: string
      colorless?: string
      multicolor?: string
      whiteGlow?: string
      blueGlow?: string
      blackGlow?: string
      redGlow?: string
      greenGlow?: string
    }
    glass?: {
      primary?: string
      secondary?: string
      border?: string
    }
  }
}

// Couleurs MTG authentiques basées sur les mana symbols officiels
const manaColors = {
  // Core colors
  white: '#F8F6D8',      // Plains - warm white/cream
  blue: '#0E68AB',       // Island - deep blue
  black: '#150B00',      // Swamp - near black
  red: '#D3202A',        // Mountain - vibrant red
  green: '#00733E',      // Forest - rich green
  colorless: '#CBC5C0',  // Wastes - grey
  multicolor: '#E9B54C', // Gold - multicolor spells
  // Glow effects for hover/animations
  whiteGlow: 'rgba(248, 246, 216, 0.6)',
  blueGlow: 'rgba(14, 104, 171, 0.6)',
  blackGlow: 'rgba(90, 60, 90, 0.6)',
  redGlow: 'rgba(211, 32, 42, 0.6)',
  greenGlow: 'rgba(0, 115, 62, 0.6)',
}

// Configuration de base partagée avec typographie MTG
const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cinzel", "Playfair Display", serif',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: '"Cinzel", "Playfair Display", serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0.01em',
    },
    h3: {
      fontFamily: '"Cinzel", "Playfair Display", serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Cinzel", "Playfair Display", serif',
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
}

// Thème clair avec accents MTG
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',  // Slightly deeper blue
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#7B1FA2',  // Purple for multicolor feel
      light: '#BA68C8',
      dark: '#4A148C',
    },
    error: {
      main: manaColors.red,
    },
    warning: {
      main: manaColors.multicolor,
    },
    info: {
      main: manaColors.blue,
    },
    success: {
      main: manaColors.green,
    },
    background: {
      default: '#F5F3EE',  // Parchment-like background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#555555',
    },
    mana: manaColors,
    glass: {
      primary: 'rgba(255, 255, 255, 0.8)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
  },
})

// Thème sombre premium MTG
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
    },
    secondary: {
      main: '#CE93D8',
      light: '#E1BEE7',
      dark: '#BA68C8',
    },
    error: {
      main: '#FF6B6B',
    },
    warning: {
      main: '#FFD54F',
    },
    info: {
      main: '#4FC3F7',
    },
    success: {
      main: '#69F0AE',
    },
    background: {
      default: '#0D0D0F',  // Near black like Swamp
      paper: '#1A1A1E',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#AAAAAA',
    },
    mana: {
      ...manaColors,
      // Adjusted for dark mode visibility
      white: '#F5F0D0',
      blue: '#4A9EE8',
      black: '#3D3D3D',
      red: '#FF5252',
      green: '#4CAF50',
      colorless: '#9E9E9E',
      multicolor: '#FFD700',
      whiteGlow: 'rgba(245, 240, 208, 0.5)',
      blueGlow: 'rgba(74, 158, 232, 0.5)',
      blackGlow: 'rgba(120, 80, 120, 0.5)',
      redGlow: 'rgba(255, 82, 82, 0.5)',
      greenGlow: 'rgba(76, 175, 80, 0.5)',
    },
    glass: {
      primary: 'rgba(255, 255, 255, 0.05)',
      secondary: 'rgba(255, 255, 255, 0.02)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13, 13, 15, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
})

// Thème par défaut (sera remplacé par le contexte)
export const theme = lightTheme
