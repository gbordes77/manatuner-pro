import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Lock as LockIcon,
  Public as PublicIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  DeleteForever as DeleteIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Verified as VerifiedIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { PrivacyStorage } from '../lib/privacy'

interface PrivacySettingsProps {
  onPrivacyModeChange?: (isPrivate: boolean) => void
  currentMode?: 'private' | 'public'
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  onPrivacyModeChange,
  currentMode = 'private'
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [privacyStorage] = useState(() => new PrivacyStorage())
  const [userCode, setUserCode] = useState('')
  const [isPrivate, setIsPrivate] = useState(currentMode === 'private')
  const [showUserCode, setShowUserCode] = useState(false)
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false)
  const [showDataDialog, setShowDataDialog] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [showSnackbar, setShowSnackbar] = useState(false)

  useEffect(() => {
    setUserCode(privacyStorage.getUserCode())
  }, [privacyStorage])

  const handlePrivacyToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrivateMode = event.target.checked
    setIsPrivate(newPrivateMode)
    onPrivacyModeChange?.(newPrivateMode)
  }

  const copyUserCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode)
      setSnackbarMessage('Code copié dans le presse-papiers !')
      setShowSnackbar(true)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = userCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setSnackbarMessage('Code copié !')
      setShowSnackbar(true)
    }
  }

  const exportData = () => {
    const data = privacyStorage.exportUserData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manatuner-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSnackbarMessage('Données exportées avec succès !')
    setShowSnackbar(true)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = e.target?.result as string
          if (privacyStorage.importUserData(data)) {
            setSnackbarMessage('Données importées avec succès !')
            setShowSnackbar(true)
          } else {
            setSnackbarMessage('Erreur lors de l\'importation')
            setShowSnackbar(true)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <>
      <Card 
        elevation={3}
        sx={{ 
          mb: 3,
          background: isPrivate 
            ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
            : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white'
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {isPrivate ? <LockIcon /> : <PublicIcon />}
            <Typography variant="h6" component="h2">
              🔐 Privacy Settings
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={handlePrivacyToggle}
                color="default"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'white',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1" fontWeight="bold">
                  {isPrivate ? "Private Mode Active" : "Public Mode"}
                </Typography>
                <Chip
                  label={isPrivate ? "SECURE" : "SHARED"}
                  size="small"
                  sx={{
                    backgroundColor: isPrivate ? '#10b981' : '#f59e0b',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            }
          />

          <Alert 
            severity={isPrivate ? "success" : "info"} 
            sx={{ 
              mt: 2, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            {isPrivate ? (
              <>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  ✅ Your decks are protected
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  🔒 Encrypted local storage only | ✅ No sensitive data sent to server | 🔐 Zero-Knowledge Architecture
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  🌍 Mode Public Activé
                </Typography>
                <Typography variant="body2">
                  Vos analyses contribuent aux statistiques communautaires et sont accessibles depuis n'importe quel appareil.
                </Typography>
              </>
            )}
          </Alert>

          {/* User Code Section */}
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} flexWrap="wrap" gap={1}>
              <Typography variant="body2" fontWeight="bold">
                🎫 Your Personal Code
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, flex: 1, textAlign: 'center' }}>
                💡 Note this code to retrieve your analyses on any device
              </Typography>
              <Tooltip title={showUserCode ? "Hide code" : "Show code"}>
                <IconButton
                  size="small"
                  onClick={() => setShowUserCode(!showUserCode)}
                  sx={{ color: 'white' }}
                >
                  {showUserCode ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography
                variant="h6"
                component="code"
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '4px 8px',
                  borderRadius: 1,
                  letterSpacing: 1
                }}
              >
                {showUserCode ? userCode : '•••••-••••-••'}
              </Typography>
              
              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={copyUserCode}
                  sx={{ color: 'white' }}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            

          </Box>

          {/* Action Buttons */}
          <Box 
            display="flex" 
            gap={1} 
            mt={3} 
            flexDirection={isMobile ? 'column' : 'row'}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setShowPrivacyDialog(true)}
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white' },
                px: 1.5,
                py: 0.5
              }}
              fullWidth={isMobile}
            >
              Learn More
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportData}
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white' },
                px: 1.5,
                py: 0.5
              }}
              fullWidth={isMobile}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={importData}
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: 'white' },
                px: 1.5,
                py: 0.5
              }}
              fullWidth={isMobile}
            >
              Import
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setShowDataDialog(true)}
              size="small"
              sx={{ 
                color: '#ff6b6b', 
                borderColor: '#ff6b6b',
                '&:hover': { borderColor: '#ff5252', backgroundColor: 'rgba(255,107,107,0.1)' },
                px: 1.5,
                py: 0.5
              }}
              fullWidth={isMobile}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Privacy Information Dialog */}
      <Dialog 
        open={showPrivacyDialog} 
        onClose={() => setShowPrivacyDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon color="primary" />
          Notre Engagement Privacy-First
          {isMobile && (
            <IconButton
              onClick={() => setShowPrivacyDialog(false)}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error" gutterBottom>
            ❌ Ce que nous NE faisons PAS :
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="• Nous ne stockons JAMAIS vos decks en clair" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Nous ne pouvons PAS lire vos decks privés" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Nous ne vendons AUCUNE donnée" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Nous n'utilisons PAS de cookies de tracking" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" color="primary" gutterBottom>
            ✅ Comment ça marche :
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="1. Mode Privé (par défaut)"
                secondary="Vos decks restent chiffrés sur votre appareil. Seuls les résultats mathématiques sont sauvegardés."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Chiffrement Client-Side"
                secondary="Si vous choisissez de sauvegarder en ligne, tout est chiffré avec une clé que VOUS seul possédez."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Partage Sécurisé"
                secondary="Les liens de partage ne contiennent que l'ID. Le destinataire voit les résultats, pas forcément le deck."
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Transparence Totale :</strong> Notre code est open source. 
              Vous pouvez vérifier exactement ce que nous faisons avec vos données sur GitHub.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrivacyDialog(false)} variant="contained">
            J'ai compris
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Management Dialog */}
      <Dialog 
        open={showDataDialog} 
        onClose={() => setShowDataDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle color="error">
          ⚠️ Supprimer toutes les données
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Cette action supprimera définitivement :
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="• Votre code personnel" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Toutes vos analyses sauvegardées" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Vos clés de chiffrement" />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cette action est irréversible !
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => {
              privacyStorage.resetUserData()
              setShowDataDialog(false)
            }}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}

export default PrivacySettings 