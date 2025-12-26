import {
    Analytics as AnalyticsIcon,
    DeleteForever as DeleteIcon,
    Download as DownloadIcon,
    History as HistoryIcon,
    Storage as StorageIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Paper,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedContainer } from '../components/common/AnimatedContainer';
import { clearAllLocalData, exportAnalyses, getMyAnalyses } from '../lib/privacy';

const MyAnalysesPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const localAnalyses = getMyAnalyses();
    setAnalyses(localAnalyses);
  }, []);

  const handleExport = () => {
    const data = exportAnalyses();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manatuner-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all your analyses? This cannot be undone.')) {
      clearAllLocalData();
      setAnalyses([]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <HistoryIcon sx={{ fontSize: { xs: 40, md: 56 }, color: "#1976d2" }} />
            My Analyses
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Your saved deck analyses, stored locally in your browser
          </Typography>
        </Box>
      </AnimatedContainer>

      {/* Storage Info Card */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)",
          color: "white",
          boxShadow: "0 16px 48px rgba(25, 118, 210, 0.3)",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StorageIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Local Storage
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {analyses.length} analysis(es) saved in your browser
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Your data never leaves your device. Use Export to backup or transfer to another device.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={analyses.length === 0}
                sx={{
                  bgcolor: "white",
                  color: "#1976d2",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                  "&:disabled": { bgcolor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.5)" },
                }}
              >
                Export All
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
                disabled={analyses.length === 0}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  "&:disabled": { borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.3)" },
                }}
              >
                Clear All
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Analyses List */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          📈 Your Analyses
        </Typography>

        {analyses.length === 0 ? (
          <Card
            sx={{
              borderRadius: 3,
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "transparent",
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "#e3f2fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <AnalyticsIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                No saved analyses yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by analyzing a deck to see it saved here automatically
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/analyzer')}
                startIcon={<AnalyticsIcon />}
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                  boxShadow: "0 8px 24px rgba(25, 118, 210, 0.3)",
                }}
              >
                Analyze a Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              You have <strong>{analyses.length}</strong> saved analysis(es).
              Use the Export button above to backup your data.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Privacy Info - Compact */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
          border: "2px solid #4caf50",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#2e7d32", mb: 2 }}>
          🔒 Your Privacy
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip label="✓ Data stays on your device" sx={{ bgcolor: "white", fontWeight: 600 }} />
          <Chip label="✓ Nothing sent to servers" sx={{ bgcolor: "white", fontWeight: 600 }} />
          <Chip label="✓ Full control of your data" sx={{ bgcolor: "white", fontWeight: 600 }} />
        </Box>
      </Paper>
    </Container>
  );
};

export default MyAnalysesPage;
