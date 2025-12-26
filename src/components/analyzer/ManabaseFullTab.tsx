import { Terrain as TerrainIcon, ViewList as ViewListIcon } from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { AnalysisResult } from "../../services/deckAnalyzer";
import { DeckListTab } from "./DeckListTab";
import { ManabaseTab } from "./ManabaseTab";

interface ManabaseFullTabProps {
  deckList: string;
  analysisResult: AnalysisResult;
  isMobile: boolean;
  isSmallMobile: boolean;
}

export const ManabaseFullTab: React.FC<ManabaseFullTabProps> = ({
  deckList,
  analysisResult,
  isMobile,
  isSmallMobile,
}) => {
  const [subTab, setSubTab] = useState(0);

  return (
    <Box>
      {/* Sub-navigation */}
      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        variant="fullWidth"
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
            fontSize: isMobile ? "0.8rem" : "0.9rem",
          },
        }}
      >
        <Tab icon={<TerrainIcon />} iconPosition="start" label="Lands Analysis" />
        <Tab icon={<ViewListIcon />} iconPosition="start" label="Full Deck List" />
      </Tabs>

      {/* Manabase Analysis */}
      {subTab === 0 && (
        <ManabaseTab
          deckList={deckList}
          analysisResult={analysisResult}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />
      )}

      {/* Full Deck List */}
      {subTab === 1 && (
        <DeckListTab deckList={deckList} />
      )}
    </Box>
  );
};
