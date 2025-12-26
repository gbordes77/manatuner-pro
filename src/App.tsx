import { Box, CircularProgress, Container, Typography } from "@mui/material";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { BetaBanner } from "./components";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { NotificationProvider } from "./components/common/NotificationProvider";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";

// Only HomePage is loaded immediately (landing page)
import { HomePage } from "./pages/HomePage";

// Loading component for Suspense fallback
const PageLoader = () => (
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
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Loading ManaTuner Pro...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Optimizing your Magic experience
      </Typography>
    </Box>
  </Container>
);

// Lazy-loaded pages - loaded only when navigating to them
const AnalyzerPage = React.lazy(() => import("./pages/AnalyzerPage"));
const GuidePage = React.lazy(() =>
  import("./pages/GuidePage").then((m) => ({ default: m.GuidePage }))
);
const MathematicsPage = React.lazy(() => import("./pages/MathematicsPage"));
const MyAnalysesPage = React.lazy(() => import("./pages/MyAnalysesPage"));
const PrivacyFirstPage = React.lazy(() => import("./pages/PrivacyFirstPage"));

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
                <Route path="/privacy-first" element={<PrivacyFirstPage />} />
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
