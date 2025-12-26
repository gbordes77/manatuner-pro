import { Box, Fade } from "@mui/material";
import React from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const isActive = value === index;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`analyzer-tabpanel-${index}`}
      aria-labelledby={`analyzer-tab-${index}`}
      {...other}
    >
      <Fade in={isActive} timeout={300}>
        <Box
          sx={{
            p: 3,
            display: isActive ? "block" : "none",
          }}
        >
          {children}
        </Box>
      </Fade>
    </div>
  );
}
