import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FloatingManaSymbols } from "../components/common/FloatingManaSymbols";

const PrivacyFirstPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const features = [
    {
      icon: "🏠",
      title: "100% Local",
      description: "Your decks never leave your browser",
    },
    {
      icon: "💾",
      title: "Auto-Save",
      description: "Analyses saved automatically on your device",
    },
    {
      icon: "🌍",
      title: "Open Source",
      description: "100% verifiable code on GitHub",
    },
    {
      icon: "🚫",
      title: "No Tracking",
      description: "No Google Analytics, no spy cookies",
    },
  ];

  const comparisonData = [
    {
      feature: "Your decks visible by the site",
      manatuner: { text: "❌ No", color: "error" },
      others: { text: "✅ Yes", color: "success" },
    },
    {
      feature: "100% Local storage",
      manatuner: { text: "✅ Yes", color: "success" },
      others: { text: "❌ No", color: "error" },
    },
    {
      feature: "Advertising tracking",
      manatuner: { text: "❌ None", color: "error" },
      others: { text: "✅ Google Analytics", color: "success" },
    },
    {
      feature: "Open Source",
      manatuner: { text: "✅ 100%", color: "success" },
      others: { text: "❌ Proprietary", color: "error" },
    },
    {
      feature: "GDPR Compliant",
      manatuner: { text: "✅ By design", color: "success" },
      others: { text: "⚠️ Variable", color: "warning" },
    },
    {
      feature: "Required account",
      manatuner: { text: "❌ No", color: "error" },
      others: { text: "✅ Often", color: "success" },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {/* Floating mana symbols background */}
      <FloatingManaSymbols />

      {/* Hero Section */}
      <Card
        sx={{
          bgcolor: "#2563eb",
          color: "white",
          textAlign: "center",
          py: 8,
          px: 4,
          mb: 5,
          borderRadius: 4,
        }}
      >
        <Typography
          variant={isMobile ? "h3" : "h2"}
          component="h1"
          gutterBottom
          sx={{
            background: "linear-gradient(45deg, #00d4ff, #0099ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          🔒 ManatunerPro
        </Typography>
        <Typography variant="h5" gutterBottom>
          The ONLY manabase analyzer that truly respects your privacy
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          ✨ Your decks stay on YOUR device ✨
        </Typography>
      </Card>

      {/* Privacy Promise */}
      <Card sx={{ mb: 4, bgcolor: "#2563eb", color: "white" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "#00d4ff",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            🛡️ Our Privacy-First Promise
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ my: 3, fontWeight: "bold" }}
          >
            "We CANNOT see your decks - everything stays in your browser"
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}
          >
            Unlike other sites, your decklists are NEVER sent to any server.
            Everything is processed locally in your browser and saved to your
            device's local storage. No account needed, no data transmitted.
          </Typography>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                bgcolor: "#dbeafe",
                color: "#1e3a8a",
                textAlign: "center",
                p: 3,
                height: "100%",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography variant="h2" sx={{ mb: 2 }}>
                {feature.icon}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "#1e3a8a" }}>{feature.description}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How it works */}
      <Card sx={{ mb: 4, bgcolor: "#2563eb", color: "white" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "#00d4ff" }}>
            🎫 How does it work?
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1. Paste your deck
            </Typography>
            <Typography variant="body1">
              Copy your decklist from Moxfield, Archidekt, MTGA, or any other source.
              All major formats are supported.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              2. Instant analysis
            </Typography>
            <Typography variant="body1">
              Your deck is analyzed locally using advanced probability mathematics.
              Nothing is sent to any server.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              3. Auto-saved locally
            </Typography>
            <Typography variant="body1">
              Your analyses are automatically saved to your browser's local storage.
              Access them anytime from "My Analyses".
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              4. Export & share
            </Typography>
            <Typography variant="body1">
              Export your data anytime. Import it on another device if needed.
              You control your data.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#2563eb" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Feature
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  ManatunerPro
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Other Sites
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.feature}</TableCell>
                  <TableCell sx={{ color: `${row.manatuner.color}.main` }}>
                    {row.manatuner.text}
                  </TableCell>
                  <TableCell sx={{ color: `${row.others.color}.main` }}>
                    {row.others.text}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* What we store / don't store */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#2563eb", color: "white", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#4CAF50" }}>
                ✅ What stays on YOUR device
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Your complete decklists" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Analysis results" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Analysis history" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="All your data!" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#2563eb", color: "white", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#f44336" }}>
                ❌ What we DON'T have access to
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Your decklists (never sent)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Your IP address" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Your personal data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Your browsing habits" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CTA */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          py: 6,
          px: 4,
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to analyze your decks with complete privacy?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/analyzer")}
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            py: 2,
            px: 4,
            fontSize: "1.2rem",
            fontWeight: "bold",
            mt: 2,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.3)",
              transform: "scale(1.05)",
            },
          }}
        >
          Try ManatunerPro
        </Button>
        <Typography variant="body1" sx={{ mt: 2 }}>
          No registration - No tracking - 100% local
        </Typography>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="body2" gutterBottom>
          An open source project created with love for the MTG community
        </Typography>
        <Typography variant="body2">
          <a
            href="https://github.com/gbordes77/manatuner-pro"
            style={{ color: "#00d4ff", textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View code on GitHub
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyFirstPage;
