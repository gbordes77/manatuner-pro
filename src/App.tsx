import { Box, Container, Typography } from "@mui/material";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { BetaBanner } from "./components";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { NotificationProvider } from "./components/common/NotificationProvider";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";

// Only HomePage is loaded immediately (landing page)
import { HomePage } from "./pages/HomePage";

// MTG-themed loading messages
const MTG_LOADING_MESSAGES = [
  { main: "Tapping mana sources...", sub: "Calculating probabilities" },
  { main: "Shuffling up...", sub: "Preparing your analysis" },
  { main: "Reading the stack...", sub: "Processing deck data" },
  { main: "Resolving triggers...", sub: "Loading components" },
  { main: "Drawing seven...", sub: "Initializing analyzer" },
];

// Loading component for Suspense fallback with MTG flavor
const PageLoader = () => {
  const [messageIndex] = React.useState(() =>
    Math.floor(Math.random() * MTG_LOADING_MESSAGES.length)
  );
  const message = MTG_LOADING_MESSAGES[messageIndex];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 2,
        }}
      >
        {/* WUBRG mana symbols as loading indicator */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {['w', 'u', 'b', 'r', 'g'].map((color, index) => (
            <Box
              key={color}
              sx={{
                animation: `mana-pulse 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.15}s`,
              }}
            >
              <i
                className={`ms ms-${color} ms-cost`}
                style={{
                  fontSize: 28,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              />
            </Box>
          ))}
        </Box>
        <Typography variant="h6" color="text.secondary" fontFamily='"Cinzel", serif'>
          {message.main}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message.sub}
        </Typography>
      </Box>
    </Container>
  );
};

// Lazy-loaded pages - loaded only when navigating to them
const AnalyzerPage = React.lazy(() => import("./pages/AnalyzerPage"));
const GuidePage = React.lazy(() =>
  import("./pages/GuidePage").then((m) => ({ default: m.GuidePage }))
);
const MathematicsPage = React.lazy(() => import("./pages/MathematicsPage"));
const MyAnalysesPage = React.lazy(() => import("./pages/MyAnalysesPage"));
// PrivacyFirstPage removed - privacy info is now on HomePage
const LandGlossaryPage = React.lazy(() => import("./pages/LandGlossaryPage"));

const AboutPage = React.lazy(() =>
  import("./components/layout/StaticPages").then((m) => ({
    default: m.AboutPage,
  })),
);

const PrivacyPage = React.lazy(() =>
  import("./components/layout/StaticPages").then((m) => ({
    default: m.PrivacyPage,
  })),
);

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <BetaBanner />
          <Header />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/analyzer" element={<AnalyzerPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/mathematics" element={<MathematicsPage />} />
                <Route path="/mes-analyses" element={<MyAnalysesPage />} />
                {/* Privacy-First page removed - redirects to home */}
                <Route path="/land-glossary" element={<LandGlossaryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </Box>

          <Footer />
        </Box>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
