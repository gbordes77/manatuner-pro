import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
  Security as SecurityIcon,
  Devices as DevicesIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import { supabaseHelpers } from '../services/supabase'

interface CloudSyncSettingsProps {
  onSyncModeChange?: (enabled: boolean) => void
}

export const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({
  onSyncModeChange
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    const configured = supabaseHelpers.isConfigured()
    setIsSupabaseConfigured(configured)
    
    // Check user preference from localStorage
    const userPreference = localStorage.getItem('manatuner_cloud_sync_enabled')
    if (userPreference === 'true' && configured) {
      setCloudSyncEnabled(true)
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      setIsConnected(user !== null)
    } catch {
      setIsConnected(false)
    }
  }

  const handleSyncToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked
    
    if (enabled && !cloudSyncEnabled) {
      // Show consent dialog before enabling
      setShowConsentDialog(true)
    } else {
      // Disable cloud sync
      setCloudSyncEnabled(false)
      localStorage.setItem('manatuner_cloud_sync_enabled', 'false')
      onSyncModeChange?.(false)
    }
  }

  const handleConsentAccept = () => {
    setCloudSyncEnabled(true)
    localStorage.setItem('manatuner_cloud_sync_enabled', 'true')
    setShowConsentDialog(false)
    onSyncModeChange?.(true)
    checkConnection()
  }

  const handleConsentDecline = () => {
    setShowConsentDialog(false)
  }

  if (!isSupabaseConfigured) {
    return (
      <Card sx={{ mb: 3, bgcolor: 'grey.100' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CloudOffIcon color="disabled" />
            <Typography variant="h6" color="text.secondary">
              🔒 Privacy-First Mode Only
            </Typography>
          </Box>
          <Alert severity="info">
            Cloud sync is not configured. Your data stays 100% local and private.
            This is the most secure option!
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card 
        sx={{ 
          mb: 3,
          border: cloudSyncEnabled ? '2px solid' : '1px solid',
          borderColor: cloudSyncEnabled ? 'primary.main' : 'divider'
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {cloudSyncEnabled ? <CloudIcon color="primary" /> : <CloudOffIcon />}
            <Typography variant="h6">
              ☁️ Optional Cloud Sync
            </Typography>
            <Chip
              label={cloudSyncEnabled ? "ENABLED" : "DISABLED"}
              color={cloudSyncEnabled ? "primary" : "default"}
              size="small"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={cloudSyncEnabled}
                onChange={handleSyncToggle}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  Enable Multi-Device Sync
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sync your analyses across devices (optional)
                </Typography>
              </Box>
            }
          />

          {cloudSyncEnabled && (
            <Box sx={{ mt: 2 }}>
              <Alert 
                severity={isConnected ? "success" : "warning"}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  {isConnected ? (
                    <>
                      <CheckIcon sx={{ fontSize: 16, mr: 1 }} />
                      Connected to cloud sync
                    </>
                  ) : (
                    <>
                      <WarningIcon sx={{ fontSize: 16, mr: 1 }} />
                      Cloud sync enabled but not connected
                    </>
                  )}
                </Typography>
              </Alert>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>What this enables:</strong>
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <DevicesIcon sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Access your analyses from any device"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <SyncIcon sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Automatic backup of your analyses"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight="bold">
              Your privacy is still protected
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Even with cloud sync, your deck details are encrypted and we follow zero-knowledge principles.
          </Typography>
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <Dialog 
        open={showConsentDialog} 
        onClose={handleConsentDecline}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudIcon color="primary" />
          Enable Cloud Sync?
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              This is completely optional!
            </Typography>
            <Typography variant="body2">
              You can continue using ManaTuner Pro in 100% privacy-first mode without cloud sync.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom>
            🔒 What we'll store in the cloud:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Analysis results and statistics" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Your personal code for device sync" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Timestamps and metadata" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            🚫 What we'll NEVER store:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Your complete decklists in readable form" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Personal information or IP addresses" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Browsing habits or tracking data" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConsentDecline} color="inherit">
            Keep Privacy-First Only
          </Button>
          <Button 
            onClick={handleConsentAccept} 
            variant="contained"
            startIcon={<CloudIcon />}
          >
            Enable Cloud Sync
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CloudSyncSettings 