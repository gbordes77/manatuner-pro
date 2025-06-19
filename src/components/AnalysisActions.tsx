import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  useTheme,
  useMediaQuery,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
  Divider
} from '@mui/material'
import {
  Save as SaveIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  CloudOff as CloudOffIcon,
  Cloud as CloudIcon
} from '@mui/icons-material'
import { useAnalysisStorage } from '../hooks/useAnalysisStorage'
import { supabaseHelpers } from '../services/supabase'

interface AnalysisActionsProps {
  deckList: string
  analysisResult: any
  onLoadAnalysis?: (deckList: string, analysisResult: any) => void
}

export const AnalysisActions: React.FC<AnalysisActionsProps> = ({
  deckList,
  analysisResult,
  onLoadAnalysis
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const {
    savedAnalyses,
    isLoading,
    error,
    saveAnalysis,
    deleteAnalysis,
    shareAnalysis,
    clearError
  } = useAnalysisStorage()

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  
  // Form states
  const [analysisName, setAnalysisName] = useState('')
  const [analysisFormat, setAnalysisFormat] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Check if we have Supabase configured
  const isOnline = supabaseHelpers.isConfigured()

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setNotification({ open: true, message, severity })
  }

  const handleSave = async () => {
    if (!deckList || !analysisResult) {
      showNotification('No analysis to save', 'error')
      return
    }

    try {
      const saved = await saveAnalysis(deckList, analysisResult, analysisName || undefined, analysisFormat || undefined)
      
      if (saved) {
        showNotification(`Analysis saved successfully!`, 'success')
      } else {
        showNotification(`Analysis saved locally (offline mode)`, 'info')
      }
      
      setSaveDialogOpen(false)
      setAnalysisName('')
      setAnalysisFormat('')
    } catch (err) {
      showNotification('Failed to save analysis', 'error')
    }
  }

  const handleShare = async () => {
    if (!deckList || !analysisResult) {
      showNotification('No analysis to share', 'error')
      return
    }

    if (!isOnline) {
      showNotification('Sharing requires an internet connection', 'error')
      return
    }

    try {
      const shareId = await shareAnalysis(deckList, analysisResult, analysisName || 'Shared Analysis')
      
      if (shareId) {
        const url = `${window.location.origin}/shared/${shareId}`
        setShareUrl(url)
        setShareDialogOpen(true)
        
        // Copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url)
          showNotification('Share link copied to clipboard!', 'success')
        }
      }
    } catch (err) {
      showNotification('Failed to create share link', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysis(id)
      showNotification('Analysis deleted', 'success')
    } catch (err) {
      showNotification('Failed to delete analysis', 'error')
    }
  }

  const handleLoadAnalysis = (analysis: any) => {
    if (onLoadAnalysis) {
      onLoadAnalysis(analysis.deck_list, analysis.analysis_result)
      setHistoryDialogOpen(false)
      showNotification('Analysis loaded', 'success')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const speedDialActions = [
    {
      icon: <SaveIcon />,
      name: 'Save Analysis',
      onClick: () => setSaveDialogOpen(true),
      disabled: !deckList || !analysisResult
    },
    {
      icon: <ShareIcon />,
      name: isOnline ? 'Share Analysis' : 'Share (Offline)',
      onClick: handleShare,
      disabled: !deckList || !analysisResult || !isOnline
    },
    {
      icon: <HistoryIcon />,
      name: 'Load History',
      onClick: () => setHistoryDialogOpen(true)
    }
  ]

  return (
    <>
      {/* Mobile: Speed Dial */}
      {isMobile ? (
        <SpeedDial
          ariaLabel="Analysis actions"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          icon={<SpeedDialIcon />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
              sx={{ 
                '& .MuiSpeedDialAction-fab': { 
                  bgcolor: action.disabled ? 'grey.300' : 'primary.main',
                  '&:hover': {
                    bgcolor: action.disabled ? 'grey.300' : 'primary.dark'
                  }
                }
              }}
            />
          ))}
        </SpeedDial>
      ) : (
        /* Desktop: Button Group */
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={!deckList || !analysisResult}
            size="small"
          >
            Save
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            disabled={!deckList || !analysisResult || !isOnline}
            size="small"
          >
            Share
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setHistoryDialogOpen(true)}
            size="small"
          >
            History ({savedAnalyses.length})
          </Button>

          {/* Online/Offline indicator */}
          <Tooltip title={isOnline ? 'Online - Full features available' : 'Offline - Limited features'}>
            <Chip
              icon={isOnline ? <CloudIcon /> : <CloudOffIcon />}
              label={isOnline ? 'Online' : 'Offline'}
              size="small"
              color={isOnline ? 'success' : 'default'}
              variant="outlined"
            />
          </Tooltip>
        </Box>
      )}

      {/* Save Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Save Analysis
          {isMobile && (
            <IconButton
              onClick={() => setSaveDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Analysis Name (Optional)"
            fullWidth
            variant="outlined"
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
            placeholder="e.g., Aggro Red Deck"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Format (Optional)"
            fullWidth
            variant="outlined"
            value={analysisFormat}
            onChange={(e) => setAnalysisFormat(e.target.value)}
            placeholder="e.g., Standard, Modern, Legacy"
          />
          
          {!isOnline && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You're offline. Analysis will be saved locally on this device only.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Analysis History
          {isMobile && (
            <IconButton
              onClick={() => setHistoryDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {savedAnalyses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No saved analyses yet. Save your first analysis to see it here!
              </Typography>
            </Box>
          ) : (
            <List>
              {savedAnalyses.map((analysis, index) => (
                <React.Fragment key={analysis.id}>
                  <ListItem
                    button
                    onClick={() => handleLoadAnalysis(analysis)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemText
                      primary={analysis.name || `Analysis #${savedAnalyses.length - index}`}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {formatDate(analysis.created_at)}
                          </Typography>
                          {analysis.format && (
                            <Chip label={analysis.format} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(analysis.id)
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < savedAnalyses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Analysis</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Your analysis has been uploaded and can be shared with this link:
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={shareUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton
                  onClick={() => {
                    navigator.clipboard?.writeText(shareUrl)
                    showNotification('Link copied!', 'success')
                  }}
                >
                  <LinkIcon />
                </IconButton>
              )
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Error from storage hook */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={clearError} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AnalysisActions 