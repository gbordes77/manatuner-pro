import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  History as HistoryIcon,
  Code as CodeIcon
} from '@mui/icons-material'
import { PrivacyStorage, UserCodeGenerator } from '../lib/privacy'

interface SavedAnalysis {
  shareId: string
  name: string
  createdAt: string
  isPrivate: boolean
}

const MyAnalysesPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [privacyStorage] = useState(() => new PrivacyStorage())
  const [userCode, setUserCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const currentUserCode = privacyStorage.getUserCode()
    setUserCode(currentUserCode)
    loadAnalyses()
  }, [privacyStorage])

  const loadAnalyses = async () => {
    setIsLoading(true)
    try {
      const userAnalyses = await privacyStorage.getUserAnalyses()
      setAnalyses(userAnalyses)
    } catch (err) {
      setError('Erreur lors du chargement des analyses')
    } finally {
      setIsLoading(false)
    }
  }

  const shareAnalysis = async (shareId: string) => {
    const url = `${window.location.origin}/analysis/${shareId}`
    try {
      await navigator.clipboard.writeText(url)
      alert('Lien copié !')
    } catch {
      prompt('Copiez ce lien :', url)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          📊 Mes Analyses
        </Typography>
      </Box>

      {/* User Code Display */}
      <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CodeIcon />
            <Typography variant="h6">Votre Code Personnel</Typography>
          </Box>
          
          <Typography
            variant="h5"
            component="code"
            sx={{
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: 2,
              letterSpacing: 2,
              fontWeight: 'bold'
            }}
          >
            {userCode}
          </Typography>
        </CardContent>
      </Card>

      {/* Analyses List */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Vos Analyses ({analyses.length})</Typography>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : analyses.length === 0 ? (
            <Alert severity="info">
              Aucune analyse sauvegardée. Commencez par analyser un deck !
            </Alert>
          ) : (
            <List>
              {analyses.map((analysis) => (
                <ListItem key={analysis.shareId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {analysis.name}
                        </Typography>
                        <Chip
                          icon={analysis.isPrivate ? <LockIcon /> : <PublicIcon />}
                          label={analysis.isPrivate ? "Privé" : "Public"}
                          size="small"
                          color={analysis.isPrivate ? "primary" : "secondary"}
                        />
                      </Box>
                    }
                    secondary={`ID: ${analysis.shareId}`}
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title="Partager">
                      <IconButton onClick={() => shareAnalysis(analysis.shareId)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default MyAnalysesPage 