import {
    Close as CloseIcon,
    ContentCopy as CopyIcon,
    DeleteForever as DeleteIcon,
    Download as DownloadIcon,
    Info as InfoIcon,
    Lock as LockIcon,
    Public as PublicIcon,
    Security as SecurityIcon,
    Shield as ShieldIcon,
    Upload as UploadIcon,
    Verified as VerifiedIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Snackbar,
    Switch,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PrivacyStorage } from "../lib/privacy";

interface PrivacySettingsProps {
  onPrivacyModeChange?: (isPrivate: boolean) => void;
  currentMode?: "private" | "public";
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  onPrivacyModeChange,
  currentMode = "private",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [userCode, setUserCode] = useState("");
  const [isPrivate, setIsPrivate] = useState(currentMode === "private");
  const [showUserCode, setShowUserCode] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    setUserCode(PrivacyStorage.getUserCode());
  }, []);

  const handlePrivacyToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrivateMode = event.target.checked;
    setIsPrivate(newPrivateMode);
    onPrivacyModeChange?.(newPrivateMode);
  };

  const copyUserCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setSnackbarMessage("Code copied to clipboard!");
      setShowSnackbar(true);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = userCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setSnackbarMessage("Code copied!");
      setShowSnackbar(true);
    }
  };

  const exportData = () => {
    const data = PrivacyStorage.exportAnalyses();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manatuner-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbarMessage("Data exported successfully!");
    setShowSnackbar(true);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          try {
            PrivacyStorage.importAnalyses(data);
            setSnackbarMessage("Data imported successfully!");
            setShowSnackbar(true);
          } catch {
            setSnackbarMessage("Error during import");
            setShowSnackbar(true);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <>
      <Card
        elevation={3}
        sx={{
          mb: 3,
          background: isPrivate
            ? "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
            : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          color: "white",
          "& .MuiTypography-root": { color: "white" },
          "& .MuiListItemText-primary": { color: "white" },
          "& .MuiAlert-message": { color: "white" },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {isPrivate ? <LockIcon /> : <PublicIcon />}
            <Typography variant="h6" component="h2" sx={{ color: "white" }}>
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
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "white",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {isPrivate ? "Private Mode Active" : "Public Mode"}
                </Typography>
                <Chip
                  label={isPrivate ? "SECURE" : "SHARED"}
                  size="small"
                  sx={{
                    backgroundColor: isPrivate ? "#10b981" : "#f59e0b",
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>
            }
          />

          <Alert
            severity={isPrivate ? "success" : "info"}
            sx={{
              mt: 2,
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
              "& .MuiAlert-icon": { color: "white" },
            }}
          >
            {isPrivate ? (
              <>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: "white" }}
                >
                  ✅ Your decks are protected
                </Typography>
                <List dense sx={{ mt: 1 }}>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <ShieldIcon sx={{ color: "white", fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Encrypted local storage only"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: "white" },
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <VerifiedIcon sx={{ color: "white", fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="No sensitive data sent to server"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: "white" },
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <SecurityIcon sx={{ color: "white", fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Zero-Knowledge Architecture"
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { color: "white" },
                      }}
                    />
                  </ListItem>
                </List>
              </>
            ) : (
              <>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  🌍 Public Mode Enabled
                </Typography>
                <Typography variant="body2">
                  Your analyses contribute to community statistics and are
                  accessible from any device.
                </Typography>
              </>
            )}
          </Alert>

          {/* User Code Section */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: "white" }}
              >
                🎫 Your Personal Code
              </Typography>
              <Tooltip title={showUserCode ? "Hide code" : "Show code"}>
                <IconButton
                  size="small"
                  onClick={() => setShowUserCode(!showUserCode)}
                  sx={{ color: "white" }}
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
                  fontFamily: "monospace",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "4px 8px",
                  borderRadius: 1,
                  letterSpacing: 1,
                  color: "white",
                }}
              >
                {showUserCode ? userCode : "•••••-••••-••"}
              </Typography>

              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={copyUserCode}
                  sx={{ color: "white" }}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: "white", mt: 1, display: "block" }}
            >
              💡 Note this code to retrieve your analyses on any device
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            display="flex"
            gap={1}
            mt={3}
            flexDirection={isMobile ? "column" : "row"}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setShowPrivacyDialog(true)}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "white" },
              }}
              fullWidth={isMobile}
            >
              Learn More
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportData}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "white" },
              }}
              fullWidth={isMobile}
            >
              Export
            </Button>

            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={importData}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "white" },
              }}
              fullWidth={isMobile}
            >
              Import
            </Button>

            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setShowDataDialog(true)}
              sx={{
                color: "#ff6b6b",
                borderColor: "#ff6b6b",
                "&:hover": {
                  borderColor: "#ff5252",
                  backgroundColor: "rgba(255,107,107,0.1)",
                },
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldIcon color="primary" />
          Our Privacy-First Commitment
          {isMobile && (
            <IconButton
              onClick={() => setShowPrivacyDialog(false)}
              sx={{ ml: "auto" }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error" gutterBottom>
            ❌ What we DO NOT do:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="• We NEVER store your decks in plain text" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• We CANNOT read your private decks" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• We sell NO data whatsoever" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• We DO NOT use tracking cookies" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" color="primary" gutterBottom>
            ✅ How it works:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="1. Private Mode (default)"
                secondary="Your decks remain encrypted on your device. Only mathematical results are saved."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Client-Side Encryption"
                secondary="If you choose to save online, everything is encrypted with a key that only YOU possess."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Secure Sharing"
                secondary="Share links contain only the ID. The recipient sees the results, not necessarily the deck."
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Full Transparency:</strong> Our code is open source. You
              can verify exactly what we do with your data on GitHub.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPrivacyDialog(false)}
            variant="contained"
          >
            I understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Management Dialog */}
      <Dialog
        open={showDataDialog}
        onClose={() => setShowDataDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle color="error">⚠️ Delete all data</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This action will permanently delete:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="• Your personal code" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All your saved analyses" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Your encryption keys" />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action is irreversible!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              PrivacyStorage.clearAllLocalData();
              setShowDataDialog(false);
              setSnackbarMessage("All data has been deleted");
              setShowSnackbar(true);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default PrivacySettings;
