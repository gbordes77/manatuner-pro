import {
  Analytics as AnalyticsIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteAllIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  OpenInNew as LoadIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AnimatedContainer } from '../components/common/AnimatedContainer'
import { FloatingManaSymbols } from '../components/common/FloatingManaSymbols'
import {
  AnalysisRecord,
  clearAllLocalData,
  exportAnalyses,
  getMyAnalyses,
  PrivacyStorage,
} from '../lib/privacy'
import { AppDispatch } from '../store'
import { setDeckList, setDeckName } from '../store/slices/analyzerSlice'

const MANA_COLORS_MAP: Record<string, string> = {
  W: '#F9FAF4',
  U: '#0E68AB',
  B: '#150B00',
  R: '#D3202A',
  G: '#00733E',
}

const HealthBadge: React.FC<{ consistency: number }> = ({ consistency }) => {
  const percent = Math.round(consistency * 100)
  const color =
    percent >= 85 ? 'success' : percent >= 70 ? 'primary' : percent >= 55 ? 'warning' : 'error'
  const label =
    percent >= 85 ? 'Excellent' : percent >= 70 ? 'Good' : percent >= 55 ? 'Average' : 'Needs Work'

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
        {percent}%
      </Typography>
      <Chip
        label={label}
        color={color as 'success' | 'primary' | 'warning' | 'error'}
        size="small"
      />
    </Box>
  )
}

const AnalysisCard: React.FC<{
  analysis: AnalysisRecord
  onLoad: () => void
  onDelete: () => void
}> = ({ analysis, onLoad, onDelete }) => {
  const colors: string[] = analysis.analysis?.colorDistribution
    ? Object.keys(analysis.analysis.colorDistribution).filter(
        (c) => analysis.analysis.colorDistribution[c] > 0
      )
    : []
  const totalCards = analysis.analysis?.totalCards || 0
  const totalLands = analysis.analysis?.totalLands || 0
  const avgCMC = analysis.analysis?.averageCMC?.toFixed(2) || '—'
  const consistency = analysis.consistency ?? analysis.analysis?.consistency ?? 0
  const date = analysis.date
    ? new Date(analysis.date).toLocaleDateString()
    : new Date(analysis.timestamp).toLocaleDateString()

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header: name + colors */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {analysis.deckName || 'Unnamed Deck'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date}
            </Typography>
          </Box>
          {/* Mana colors */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {colors.map((c) => (
              <Box
                key={c}
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: MANA_COLORS_MAP[c] || '#888',
                  border: c === 'W' ? '1px solid #ccc' : 'none',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Health Score */}
        {consistency > 0 && <HealthBadge consistency={consistency} />}

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              {totalCards}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cards
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              {totalLands}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lands
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              {avgCMC}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg CMC
            </Typography>
          </Box>
        </Box>

        {/* Land ratio bar */}
        {totalCards > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Land ratio: {((totalLands / totalCards) * 100).toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(totalLands / totalCards) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1, pt: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<LoadIcon />}
            onClick={onLoad}
            sx={{ flex: 1 }}
          >
            Load in Analyzer
          </Button>
          <Tooltip title="Delete this analysis">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  )
}

const MyAnalysesPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; all?: boolean }>({
    open: false,
  })

  useEffect(() => {
    setAnalyses(getMyAnalyses())
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

  const handleLoad = (analysis: AnalysisRecord) => {
    dispatch(setDeckName(analysis.deckName || ''))
    dispatch(setDeckList(analysis.deckList || ''))
    navigate('/analyzer')
  }

  const handleDelete = (id: string) => {
    PrivacyStorage.deleteAnalysis(id)
    setAnalyses(getMyAnalyses())
    setDeleteDialog({ open: false })
  }

  const handleClearAll = () => {
    clearAllLocalData()
    setAnalyses([])
    setDeleteDialog({ open: false })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <FloatingManaSymbols />

      {/* Header */}
      <AnimatedContainer animation="fadeInUp">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <HistoryIcon sx={{ fontSize: { xs: 40, md: 56 }, color: '#1976d2' }} />
            My Analyses
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Your saved deck analyses, stored locally in your browser
          </Typography>
        </Box>
      </AnimatedContainer>

      {/* Storage Info + Actions */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #9c27b0 100%)',
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StorageIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              {analyses.length} analysis{analyses.length !== 1 ? 'es' : ''} saved
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={analyses.length === 0}
              sx={{
                bgcolor: 'white',
                color: '#1976d2',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteAllIcon />}
              onClick={() => setDeleteDialog({ open: true, all: true })}
              disabled={analyses.length === 0}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Analyses Grid */}
      {analyses.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'transparent',
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AnalyticsIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No saved analyses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Analyze a deck and it will automatically appear here
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/analyzer')}
              startIcon={<AnalyticsIcon />}
            >
              Analyze a Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {analyses.map((analysis) => (
            <Grid item xs={12} sm={6} md={4} key={analysis.id}>
              <AnalysisCard
                analysis={analysis}
                onLoad={() => handleLoad(analysis)}
                onDelete={() => setDeleteDialog({ open: true, id: analysis.id })}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Privacy footer */}
      <Box sx={{ mt: 4, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Chip label="Data stays on your device" size="small" variant="outlined" />
        <Chip label="Nothing sent to servers" size="small" variant="outlined" />
        <Chip label="Full control of your data" size="small" variant="outlined" />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>
          {deleteDialog.all ? 'Clear all analyses?' : 'Delete this analysis?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog.all
              ? 'This will permanently delete all your saved analyses. This cannot be undone.'
              : 'This analysis will be permanently deleted.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteDialog.all ? handleClearAll() : deleteDialog.id && handleDelete(deleteDialog.id)
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyAnalysesPage
