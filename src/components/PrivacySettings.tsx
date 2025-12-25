import {
    Close as CloseIcon,
    ContentCopy as CopyIcon,
    DeleteForever as DeleteIcon,
    Download as DownloadIcon,
    Info as InfoIcon,
    Storage as StorageIcon,
    Upload as UploadIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PrivacyStorage } from "../lib/privacy";

export const PrivacySettings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [userCode, setUserCode] = useState("");
  const [showUserCode, setShowUserCode] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    setUserCode(PrivacyStorage.getUserCode());
  }, []);

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
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          color: "white",
          "& .MuiTypography-root": { color: "white !important" },
        }}
      >
        <CardContent>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
            <StorageIcon />
            <Typography variant="h6" component="h2" sx={{ color: "white" }}>
              💾 Your Data
            </Typography>
          </Box>

          {/* Status Info */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="body2" sx={{ color: "white", textAlign: "center" }}>
                📱 All your analyses are stored locally in your browser
              </Typography>
            </Box>
          </Box>

          {/* User Code Section */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  🎫 Your Code:
                </Typography>
                <Typography
                  variant="body2"
                  component="code"
                  sx={{
                    fontFamily: "monospace",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    padding: "2px 6px",
                    borderRadius: 1,
                    letterSpacing: 1,
                    color: "white",
                    fontSize: "0.85rem",
                  }}
                >
                  {showUserCode ? userCode : "•••••-••••-••"}
                </Typography>
                <Tooltip title={showUserCode ? "Hide" : "Show"}>
                  <IconButton
                    size="small"
                    onClick={() => setShowUserCode(!showUserCode)}
                    sx={{ color: "white", p: 0.5 }}
                  >
                    {showUserCode ? (
                      <VisibilityOffIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy">
                  <IconButton
                    size="small"
                    onClick={copyUserCode}
                    sx={{ color: "white", p: 0.5 }}
                  >
                    <CopyIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}
              >
                Use this code to identify your backups
              </Typography>
            </Box>
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
              onClick={() => setShowInfoDialog(true)}
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

      {/* Information Dialog */}
      <Dialog
        open={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StorageIcon color="primary" />
          How Your Data is Stored
          {isMobile && (
            <IconButton
              onClick={() => setShowInfoDialog(false)}
              sx={{ ml: "auto" }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="primary" gutterBottom>
            ✅ Local Storage
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="• Your analyses are stored in your browser's localStorage" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Data stays on your device - nothing is sent to any server" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Use Export/Import to backup or transfer your data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Clearing browser data will delete your analyses" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" color="primary" gutterBottom>
            💡 Tips
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Backup regularly"
                secondary="Use the Export button to save your analyses as a JSON file"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Transfer between devices"
                secondary="Export from one device and Import on another"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Your code is unique"
                secondary="Save it to identify your backups later"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Privacy:</strong> ManaTuner Pro does not collect any personal data.
              Everything stays in your browser.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowInfoDialog(false)}
            variant="contained"
          >
            Got it
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
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action is irreversible! Consider exporting your data first.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              PrivacyStorage.clearAllLocalData();
              setUserCode(PrivacyStorage.getUserCode());
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
