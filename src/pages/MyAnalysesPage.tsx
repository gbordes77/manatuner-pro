import {
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  CompareArrows as CompareIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteAllIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  OpenInNew as LoadIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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

// ─── Delta Display Helper ───────────────────────────────────────────────────

const DeltaChip: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  if (Math.abs(value) < 0.1) return <Chip label="=" size="small" variant="outlined" />
  const positive = value > 0
  return (
    <Chip
      label={`${positive ? '+' : ''}${value.toFixed(1)}${suffix}`}
      size="small"
      sx={{
        fontWeight: 'bold',
        bgcolor: positive ? '#e8f5e9' : '#ffebee',
        color: positive ? '#2e7d32' : '#c62828',
      }}
    />
  )
}

// ─── Health Badge ───────────────────────────────────────────────────────────

const HealthBadge: React.FC<{ consistency: number; size?: 'small' | 'large' }> = ({
  consistency,
  size = 'large',
}) => {
  const percent = Math.round(consistency * 100)
  const color =
    percent >= 85 ? 'success' : percent >= 70 ? 'primary' : percent >= 55 ? 'warning' : 'error'
  const label =
    percent >= 85 ? 'Excellent' : percent >= 70 ? 'Good' : percent >= 55 ? 'Average' : 'Needs Work'

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant={size === 'large' ? 'h4' : 'h5'}
        fontWeight="bold"
        color={`${color}.main`}
      >
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

// ─── Compare View ───────────────────────────────────────────────────────────

const CompareView: React.FC<{
  a: AnalysisRecord
  b: AnalysisRecord
  onClose: () => void
}> = ({ a, b, onClose }) => {
  const getStats = (record: AnalysisRecord) => ({
    name: record.deckName || 'Unnamed Deck',
    consistency: record.consistency ?? record.analysis?.consistency ?? 0,
    totalCards: record.analysis?.totalCards || 0,
    totalLands: record.analysis?.totalLands || 0,
    avgCMC: record.analysis?.averageCMC || 0,
    landRatio: record.analysis?.landRatio || 0,
    colors: record.analysis?.colorDistribution
      ? Object.entries(record.analysis.colorDistribution)
          .filter(([, v]) => (v as number) > 0)
          .map(([k]) => k)
      : [],
    probabilities: record.analysis?.probabilities || null,
    cards: record.analysis?.cards || [],
  })

  const sa = getStats(a)
  const sb = getStats(b)

  // Find common spells for castability comparison
  type SpellInfo = { name: string; cmc: number; manaCost: string; isLand?: boolean }
  const spellsA = new Map<string, SpellInfo>(
    (sa.cards as SpellInfo[]).filter((c) => !c.isLand).map((c) => [c.name, c])
  )
  const spellsB = new Map<string, SpellInfo>(
    (sb.cards as SpellInfo[]).filter((c) => !c.isLand).map((c) => [c.name, c])
  )
  const commonSpells = [...spellsA.keys()].filter((name) => spellsB.has(name))

  const StatRow: React.FC<{
    label: string
    va: string
    vb: string
    delta?: number
    suffix?: string
  }> = ({ label, va, vb, delta, suffix = '' }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        px: 2,
        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
        borderRadius: 1,
      }}
    >
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ width: 80, textAlign: 'center' }}>
        {va}
      </Typography>
      <Box sx={{ width: 100, textAlign: 'center' }}>
        {delta !== undefined ? <DeltaChip value={delta} suffix={suffix} /> : null}
      </Box>
      <Typography variant="body2" sx={{ width: 80, textAlign: 'center' }}>
        {vb}
      </Typography>
    </Box>
  )

  const consistencyDelta = (sb.consistency - sa.consistency) * 100

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            {sa.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version A
          </Typography>
        </Box>
        <CompareIcon sx={{ mx: 2, color: 'text.secondary' }} />
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            {sb.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version B
          </Typography>
        </Box>
      </Box>

      {/* Health Score comparison */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Health Score
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <HealthBadge consistency={sa.consistency} />
          <Box>
            <DeltaChip value={consistencyDelta} suffix="%" />
          </Box>
          <HealthBadge consistency={sb.consistency} />
        </Box>
      </Paper>

      {/* Stats comparison */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', py: 1.5, px: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            Metric
          </Typography>
          <Typography variant="subtitle2" sx={{ width: 80, textAlign: 'center' }}>
            A
          </Typography>
          <Typography variant="subtitle2" sx={{ width: 100, textAlign: 'center' }}>
            Delta
          </Typography>
          <Typography variant="subtitle2" sx={{ width: 80, textAlign: 'center' }}>
            B
          </Typography>
        </Box>
        <StatRow
          label="Total Cards"
          va={String(sa.totalCards)}
          vb={String(sb.totalCards)}
          delta={sb.totalCards - sa.totalCards}
        />
        <StatRow
          label="Total Lands"
          va={String(sa.totalLands)}
          vb={String(sb.totalLands)}
          delta={sb.totalLands - sa.totalLands}
        />
        <StatRow
          label="Land Ratio"
          va={`${(sa.landRatio * 100).toFixed(1)}%`}
          vb={`${(sb.landRatio * 100).toFixed(1)}%`}
          delta={(sb.landRatio - sa.landRatio) * 100}
          suffix="%"
        />
        <StatRow
          label="Avg CMC"
          va={sa.avgCMC.toFixed(2)}
          vb={sb.avgCMC.toFixed(2)}
          delta={sb.avgCMC - sa.avgCMC}
        />
        <StatRow
          label="Consistency"
          va={`${(sa.consistency * 100).toFixed(1)}%`}
          vb={`${(sb.consistency * 100).toFixed(1)}%`}
          delta={consistencyDelta}
          suffix="%"
        />
      </Paper>

      {/* Turn probabilities comparison */}
      {sa.probabilities && sb.probabilities && (
        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ py: 1.5, px: 2, bgcolor: 'secondary.main', color: 'white' }}>
            <Typography variant="subtitle2">Color Probability by Turn (Any Color)</Typography>
          </Box>
          {(['turn1', 'turn2', 'turn3', 'turn4'] as const).map((turn) => {
            const pa = sa.probabilities?.[turn]?.anyColor ?? 0
            const pb = sb.probabilities?.[turn]?.anyColor ?? 0
            return (
              <StatRow
                key={turn}
                label={turn.replace('turn', 'Turn ')}
                va={`${(pa * 100).toFixed(1)}%`}
                vb={`${(pb * 100).toFixed(1)}%`}
                delta={(pb - pa) * 100}
                suffix="%"
              />
            )
          })}
        </Paper>
      )}

      {/* Common spells castability delta */}
      {commonSpells.length > 0 && (
        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ py: 1.5, px: 2, bgcolor: '#e65100', color: 'white' }}>
            <Typography variant="subtitle2">
              Castability Comparison ({commonSpells.length} common spells)
            </Typography>
          </Box>
          {commonSpells.slice(0, 15).map((name) => {
            const cardA = spellsA.get(name)
            const cardB = spellsB.get(name)
            const cmcA = cardA?.cmc ?? 0
            const cmcB = cardB?.cmc ?? 0
            return (
              <StatRow
                key={name}
                label={`${name} (${cmcA} CMC)`}
                va={cardA?.manaCost || '?'}
                vb={cardB?.manaCost || '?'}
                delta={cmcB - cmcA}
              />
            )
          })}
          <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              For detailed per-card probability deltas, load each version in the Analyzer and
              compare the Castability tab.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

// ─── Analysis Card ──────────────────────────────────────────────────────────

const AnalysisCard: React.FC<{
  analysis: AnalysisRecord
  onLoad: () => void
  onDelete: () => void
  compareMode: boolean
  selected: boolean
  onToggleSelect: () => void
}> = ({ analysis, onLoad, onDelete, compareMode, selected, onToggleSelect }) => {
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
      onClick={compareMode ? onToggleSelect : undefined}
      sx={{
        height: '100%',
        transition: 'all 0.2s',
        cursor: compareMode ? 'pointer' : 'default',
        border: selected ? '2px solid' : '2px solid transparent',
        borderColor: selected ? 'primary.main' : 'transparent',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compare checkbox */}
        {compareMode && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -1, mt: -1, mr: -1 }}>
            <Checkbox
              checked={selected}
              icon={<UncheckedIcon />}
              checkedIcon={<CheckIcon />}
              color="primary"
            />
          </Box>
        )}

        {/* Header: name + colors */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {analysis.deckName || 'Unnamed Deck'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date}
            </Typography>
          </Box>
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
        {consistency > 0 && <HealthBadge consistency={consistency} size="small" />}

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
        {!compareMode && (
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
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

const MyAnalysesPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; all?: boolean }>({
    open: false,
  })
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [compareDialog, setCompareDialog] = useState(false)

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const handleStartCompare = () => {
    setCompareMode(true)
    setSelectedIds([])
  }

  const handleCancelCompare = () => {
    setCompareMode(false)
    setSelectedIds([])
  }

  const selectedA = analyses.find((a) => a.id === selectedIds[0])
  const selectedB = analyses.find((a) => a.id === selectedIds[1])

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
              {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} saved
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!compareMode ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CompareIcon />}
                  onClick={handleStartCompare}
                  disabled={analyses.length < 2}
                  sx={{
                    bgcolor: 'white',
                    color: '#9c27b0',
                    fontWeight: 700,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    '&:disabled': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Compare
                </Button>
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
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CompareIcon />}
                  onClick={() => setCompareDialog(true)}
                  disabled={selectedIds.length !== 2}
                  sx={{
                    bgcolor: 'white',
                    color: '#9c27b0',
                    fontWeight: 700,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  Compare Selected ({selectedIds.length}/2)
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleCancelCompare}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>
        {compareMode && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Select 2 analyses to compare side by side
          </Typography>
        )}
      </Paper>

      {/* Feature Tips */}
      {analyses.length > 0 && !compareMode && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            What you can do here:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<LoadIcon sx={{ fontSize: 16 }} />}
              label="Load a deck back into Analyzer"
              size="small"
              variant="outlined"
              onClick={() => {}}
              sx={{ cursor: 'default' }}
            />
            <Chip
              icon={<CompareIcon sx={{ fontSize: 16 }} />}
              label="Compare 2 builds side by side"
              size="small"
              variant="outlined"
              color="secondary"
              onClick={analyses.length >= 2 ? handleStartCompare : undefined}
              sx={{ cursor: analyses.length >= 2 ? 'pointer' : 'default' }}
            />
            <Chip
              icon={<DownloadIcon sx={{ fontSize: 16 }} />}
              label="Export all as JSON backup"
              size="small"
              variant="outlined"
              onClick={handleExport}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={<DeleteIcon sx={{ fontSize: 16 }} />}
              label="Delete individually"
              size="small"
              variant="outlined"
              sx={{ cursor: 'default' }}
            />
          </Box>
        </Paper>
      )}

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
                compareMode={compareMode}
                selected={selectedIds.includes(analysis.id)}
                onToggleSelect={() => toggleSelect(analysis.id)}
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

      {/* Compare Dialog */}
      <Dialog
        open={compareDialog}
        onClose={() => setCompareDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareIcon />
            <Typography variant="h6">Manabase Comparison</Typography>
          </Box>
          <IconButton onClick={() => setCompareDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedA && selectedB && (
            <CompareView a={selectedA} b={selectedB} onClose={() => setCompareDialog(false)} />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default MyAnalysesPage
