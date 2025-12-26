import {
    Analytics as AnalyticsIcon,
    DarkMode as DarkModeIcon,
    Functions as FunctionsIcon,
    GitHub as GitHubIcon,
    MenuBook as GuideIcon,
    History as HistoryIcon,
    LightMode as LightModeIcon,
    Lock as LockIcon,
    Menu as MenuIcon
} from "@mui/icons-material";
import {
    AppBar,
    Box,
    Button,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme as useMuiTheme
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../common/NotificationProvider";

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
    { label: "Privacy-First", path: "/privacy-first", icon: LockIcon },
    { label: "About", path: "/about", icon: InfoIcon },
  ];

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo */}
        <Box display="flex" alignItems="center">
          <AnalyticsIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
            }}
          >
            ManaTuner Pro
          </Typography>
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
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                variant={location.pathname === item.path ? "outlined" : "text"}
                startIcon={
                  item.path === "/guide" ? (
                    <GuideIcon />
                  ) : item.path === "/mathematics" ? (
                    <FunctionsIcon />
                  ) : item.path === "/mes-analyses" ? (
                    <HistoryIcon />
                  ) : item.path === "/privacy-first" ? (
                    <LockIcon />
                  ) : undefined
                }
                sx={{
                  borderColor:
                    location.pathname === item.path
                      ? "rgba(255,255,255,0.5)"
                      : "transparent",
                  // Style spécial pour le bouton Guide
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
            ))}
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
            href="https://github.com/project-manabase"
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
        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            backgroundColor: muiTheme.palette.primary.main,
            color: muiTheme.palette.primary.contrastText,
          }}
        >
          <Box display="flex" alignItems="center">
            <AnalyticsIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              ManaTuner Pro
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={handleMobileMenuToggle}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <List sx={{ pt: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive}
                  sx={{
                    py: 1.5,
                    "&.Mui-selected": {
                      backgroundColor: muiTheme.palette.primary.main + "20",
                      borderRight: `3px solid ${muiTheme.palette.primary.main}`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
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
                      fontWeight: isActive ? "bold" : "normal",
                      color: isActive
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
              href="https://github.com/project-manabase"
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
