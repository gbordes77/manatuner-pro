import {
    Analytics as AnalyticsIcon,
    Close as CloseIcon,
    DarkMode as DarkModeIcon,
    Functions as FunctionsIcon,
    GitHub as GitHubIcon,
    MenuBook as GuideIcon,
    History as HistoryIcon,
    Home as HomeIcon,
    Info as InfoIcon,
    LightMode as LightModeIcon,
    Menu as MenuIcon
} from "@mui/icons-material";
import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme as useMuiTheme,
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../common/NotificationProvider";

// Mana symbol component using Keyrune font
const ManaSymbol: React.FC<{ color: 'w' | 'u' | 'b' | 'r' | 'g'; size?: number }> = ({ color, size = 18 }) => (
  <i
    className={`ms ms-${color} ms-cost`}
    style={{
      fontSize: size,
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
    }}
  />
);

// WUBRG mana bar component
const ManaBar: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      gap: 0.5,
      alignItems: 'center',
      opacity: 0.9,
      '& i': {
        transition: 'transform 0.2s ease, filter 0.2s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'scale(1.2)',
          filter: 'drop-shadow(0 0 6px currentColor) !important',
        },
      },
    }}
  >
    <ManaSymbol color="w" size={16} />
    <ManaSymbol color="u" size={16} />
    <ManaSymbol color="b" size={16} />
    <ManaSymbol color="r" size={16} />
    <ManaSymbol color="g" size={16} />
  </Box>
);

// Prefetch AnalyzerPage on hover for faster navigation
const prefetchAnalyzer = () => {
  import("../../pages/AnalyzerPage");
};

export const Header: React.FC = () => {
  const muiTheme = useMuiTheme();
  const { isDark, toggleTheme } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", path: "/", icon: HomeIcon },
    { label: "Analyzer", path: "/analyzer", icon: AnalyticsIcon },
    { label: "Guide", path: "/guide", icon: GuideIcon },
    { label: "Mathematics", path: "/mathematics", icon: FunctionsIcon },
    { label: "My Analyses", path: "/mes-analyses", icon: HistoryIcon },
    { label: "About", path: "/about", icon: InfoIcon },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(13,13,15,0.95) 0%, rgba(26,26,30,0.9) 100%)'
          : 'linear-gradient(180deg, rgba(21,101,192,1) 0%, rgba(13,71,161,1) 100%)',
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {/* Logo with WUBRG */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            {/* Mana symbols as logo accent */}
            <ManaBar />

            <Typography
              variant="h6"
              component="span"
              sx={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: 700,
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.05em',
                ml: 0.5,
              }}
            >
              ManaTuner
            </Typography>
            <Typography
              variant="caption"
              sx={{
                bgcolor: isDark ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.2)',
                color: isDark ? '#FFD700' : 'white',
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
              }}
            >
              PRO
            </Typography>
          </Box>
        </Box>

        {/* Navigation - Centré */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            {navItems.map((item) => {
              const isAnalyzer = item.path === "/analyzer";
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  variant={isAnalyzer ? "contained" : isActive ? "outlined" : "text"}
                  onMouseEnter={isAnalyzer ? prefetchAnalyzer : undefined}
                  startIcon={<item.icon />}
                  sx={{
                    borderColor: isActive ? "rgba(255,255,255,0.5)" : "transparent",
                    // Style CTA pour Analyzer - gold multicolor style
                    ...(isAnalyzer && {
                      background: 'linear-gradient(135deg, #E9B54C 0%, #FFD700 50%, #E9B54C 100%)',
                      color: "#1a1a2e",
                      fontWeight: "bold",
                      textTransform: "none",
                      px: 2.5,
                      boxShadow: "0 2px 12px rgba(233, 181, 76, 0.5)",
                      border: '1px solid rgba(255,255,255,0.3)',
                      "&:hover": {
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFD700 100%)',
                        boxShadow: "0 4px 20px rgba(255, 215, 0, 0.6)",
                        transform: "translateY(-1px)",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#1a1a2e",
                      },
                    }),
                    // Style pour Guide
                    ...(item.path === "/guide" && {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      },
                      fontWeight: "bold",
                      textTransform: "none",
                    }),
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Theme Toggle */}
        <Tooltip
          title={`Switch to ${isDark ? "light" : "dark"} theme`}
        >
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              ml: 1,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "rotate(180deg)",
              },
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {/* GitHub link */}
        <Tooltip title="View source code on GitHub">
          <IconButton
            color="inherit"
            component="a"
            href="https://github.com/gbordes77/manatuner-pro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source code on GitHub"
            sx={{ ml: 1 }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>

        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="end"
            sx={{ ml: 1 }}
            onClick={handleMobileMenuToggle}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: muiTheme.palette.background.paper,
          },
        }}
      >
        {/* Drawer Header with WUBRG */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            background: isDark
              ? 'linear-gradient(135deg, #1a1a1e 0%, #2d2d35 100%)'
              : 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
            color: "white",
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ManaBar />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h6" fontWeight="bold" fontFamily='"Cinzel", serif'>
              ManaTuner Pro
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleMobileMenuToggle}
              aria-label="Close navigation menu"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <List sx={{ pt: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isAnalyzer = item.path === "/analyzer";

            return (
              <ListItem key={item.path} disablePadding sx={{ px: isAnalyzer ? 1 : 0, py: isAnalyzer ? 0.5 : 0 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive}
                  sx={{
                    py: 1.5,
                    // Style CTA pour Analyzer dans le drawer
                    ...(isAnalyzer && {
                      background: 'linear-gradient(135deg, #E9B54C 0%, #FFD700 100%)',
                      borderRadius: 2,
                      my: 0.5,
                      "&:hover": {
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                      },
                    }),
                    "&.Mui-selected": {
                      backgroundColor: isAnalyzer ? undefined : muiTheme.palette.primary.main + "20",
                      borderRight: isAnalyzer ? "none" : `3px solid ${muiTheme.palette.primary.main}`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isAnalyzer
                        ? "#1a1a2e"
                        : isActive
                          ? muiTheme.palette.primary.main
                          : "inherit",
                      minWidth: 40,
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isAnalyzer || isActive ? "bold" : "normal",
                      color: isAnalyzer
                        ? "#1a1a2e"
                        : isActive
                          ? muiTheme.palette.primary.main
                          : "inherit",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 1 }} />

        {/* Theme Toggle in Drawer */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={toggleTheme} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={isDark ? "Light Mode" : "Dark Mode"}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component="a"
              href="https://github.com/gbordes77/manatuner-pro"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <GitHubIcon />
              </ListItemIcon>
              <ListItemText primary="GitHub" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};
