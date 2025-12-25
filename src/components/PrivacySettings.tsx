import {
    Close as CloseIcon,
    DeleteForever as DeleteIcon,
    Download as DownloadIcon,
    Info as InfoIcon,
    Storage as StorageIcon,
    Upload as UploadIcon,
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
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import React, { useState } from "react";
import { PrivacyStorage } from "../lib/privacy";

export const PrivacySettings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

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
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={1}>
            <StorageIcon />
            <Typography variant="h6" component="h2" sx={{ color: "white" }}>
              💾 Your Data
            </Typography>
          </Box>

          {/* Status Info */}
          <Box
            sx={{
              p: 1.5,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: "white", textAlign: "center" }}>
              📱 All your analyses are stored locally in your browser
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            display="flex"
            gap={1}
            mt={2}
            flexDirection={isMobile ? "column" : "row"}
            justifyContent="center"
          >
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportData}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "white" },
              }}
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
            >
              Import
            </Button>

            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setShowInfoDialog(true)}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "white" },
              }}
            >
              Info
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
        maxWidth="sm"
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
          <List dense>
            <ListItem>
              <ListItemText primary="• Your analyses are stored in your browser" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Nothing is sent to any server" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Clearing browser data will delete your analyses" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" color="primary" gutterBottom>
            💡 Tips
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Backup regularly"
                secondary="Use Export to save your analyses as a JSON file"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Transfer between devices"
                secondary="Export from one device, Import on another"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Privacy:</strong> ManaTuner Pro does not collect any data.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInfoDialog(false)} variant="contained">
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
            This will permanently delete all your saved analyses.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action is irreversible! Consider exporting first.
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
