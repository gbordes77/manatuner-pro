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
        📊 Mes Analyses
      </Typography>

      {/* Code Personnel */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CodeIcon sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Votre Code Personnel
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ color: 'white', fontFamily: 'monospace', mt: 1 }}>
            {userCode}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Notez ce code pour retrouver vos analyses sur n'importe quel appareil
          </Typography>
        </CardContent>
      </Card>

      {/* Liste des analyses */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Vos Analyses ({analyses.length})
          </Typography>

          {analyses.length === 0 ? (
            <Alert severity="info">
              Aucune analyse sauvegardée. Commencez par analyser un deck !
            </Alert>
          ) : (
            <Box>
              <Typography variant="body1" color="text.secondary">
                {analyses.length} analyse(s) trouvée(s) dans le stockage local.
              </Typography>
              
              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={exportAnalyses}
                  size="small"
                >
                  📤 Exporter
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearAllLocalData}
                  size="small"
                >
                  🗑️ Effacer toutes les données
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
            ✅ Vos données restent sur votre appareil<br/>
            ✅ Aucune transmission vers des serveurs<br/>
            ✅ Contrôle total de vos informations<br/>
            ✅ Code personnel pour retrouver vos analyses
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default MyAnalysesPage 