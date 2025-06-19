import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Button
} from '@mui/material'
import {
  Code as CodeIcon
} from '@mui/icons-material'
import { getUserCode, getMyAnalyses, exportAnalyses, clearAllLocalData } from '../lib/privacy'
import CloudSyncSettings from '../components/CloudSyncSettings'

const MyAnalysesPage: React.FC = () => {
  const [userCode] = useState(() => getUserCode())
  const [analyses, setAnalyses] = useState<any[]>([])

  useEffect(() => {
    const localAnalyses = getMyAnalyses()
    setAnalyses(localAnalyses)
  }, [])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        📊 My Analyses
      </Typography>

      {/* Cloud Sync Settings */}
      <CloudSyncSettings 
        onSyncModeChange={(enabled) => {
          console.log('Cloud sync mode changed:', enabled)
          // You can add additional logic here if needed
        }}
      />

      {/* Code Personnel */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CodeIcon sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Your Personal Code
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ color: 'white', fontFamily: 'monospace', mt: 1 }}>
            {userCode}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Note this code to retrieve your analyses on any device
          </Typography>
        </CardContent>
      </Card>

      {/* Liste des analyses */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Your Analyses ({analyses.length})
          </Typography>

          {analyses.length === 0 ? (
            <Alert severity="info">
              No saved analyses. Start by analyzing a deck!
            </Alert>
          ) : (
            <Box>
              <Typography variant="body1" color="text.secondary">
                {analyses.length} analysis(es) found in local storage.
              </Typography>
              
              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={exportAnalyses}
                  size="small"
                >
                  📤 Export
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearAllLocalData}
                  size="small"
                >
                  🗑️ Clear All Data
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Information Privacy-First */}
      <Card sx={{ mt: 4, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔐 Privacy-First Architecture
          </Typography>
          <Typography variant="body2">
            ✅ Your data stays on your device<br/>
            ✅ No transmission to servers<br/>
            ✅ Full control of your information<br/>
            ✅ Personal code to retrieve your analyses
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default MyAnalysesPage 