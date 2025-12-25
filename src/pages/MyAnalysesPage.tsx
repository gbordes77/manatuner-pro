import {
    DeleteForever as DeleteIcon,
    Download as DownloadIcon,
    Storage as StorageIcon
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { clearAllLocalData, exportAnalyses, getMyAnalyses } from '../lib/privacy'

const MyAnalysesPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<any[]>([])

  useEffect(() => {
    const localAnalyses = getMyAnalyses()
    setAnalyses(localAnalyses)
  }, [])

  const handleExport = () => {
    const data = exportAnalyses()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manatuner-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all your analyses? This cannot be undone.')) {
      clearAllLocalData()
      setAnalyses([])
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        📊 My Analyses
      </Typography>

      {/* Storage Info */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <StorageIcon sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Local Storage
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'white', mt: 1 }}>
            {analyses.length} analysis(es) saved in your browser
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Use Export to backup your data or transfer to another device
          </Typography>
        </CardContent>
      </Card>

      {/* Liste des analyses */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Your Analyses
          </Typography>

          {analyses.length === 0 ? (
            <Alert severity="info">
              No saved analyses. Start by analyzing a deck!
            </Alert>
          ) : (
            <Box>
              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Export All
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Information Privacy */}
      <Card sx={{ mt: 4, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔒 Privacy
          </Typography>
          <Typography variant="body2">
            ✅ Your data stays on your device<br/>
            ✅ Nothing is sent to any server<br/>
            ✅ Full control of your data
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default MyAnalysesPage
