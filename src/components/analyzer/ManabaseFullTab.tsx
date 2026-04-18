import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import TerrainIcon from '@mui/icons-material/Terrain'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Box, Button, Tab, Tabs } from '@mui/material'
import React, { memo, useState } from 'react'
import { AnalysisResult } from '../../services/deckAnalyzer'
import { buildShareUrl } from '../../utils/urlCodec'
import { DeckListTab } from './DeckListTab'
import { ManabaseTab } from './ManabaseTab'

interface ManabaseFullTabProps {
  deckList: string
  analysisResult: AnalysisResult
  isMobile: boolean
  isSmallMobile: boolean
  /** Optional deck name threaded from AnalyzerPage — included in the share URL. */
  deckName?: string
}

export const ManabaseFullTab: React.FC<ManabaseFullTabProps> = memo(
  ({ deckList, analysisResult, isMobile, isSmallMobile, deckName }) => {
    const [subTab, setSubTab] = useState(0)
    const [copied, setCopied] = useState(false)

    // Sarah persona ask: a direct "Copy link" control inside the Manabase
    // tab so she can paste the analysis URL straight into Discord / SMS
    // without hunting for the top-level Share chip. Pins `tab=3` so the
    // recipient lands on the Manabase view (not Castability default).
    const handleCopyLink = () => {
      if (!deckList.trim()) return
      const url = buildShareUrl({ deckList, deckName, tab: 3 })
      if (!url) return
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }

    return (
      <Box>
        {/* Top row: subtab + copy-link button (Sarah ask — shareable manabase) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={subTab}
            onChange={(_, v) => setSubTab(v)}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              flex: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
              },
            }}
          >
            <Tab icon={<TerrainIcon />} iconPosition="start" label="Lands Analysis" />
            <Tab icon={<ViewListIcon />} iconPosition="start" label="Full Deck List" />
          </Tabs>
          <Button
            variant="outlined"
            size="small"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopyLink}
            sx={{
              ml: 1,
              mb: 1,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: copied ? 'success.main' : undefined,
              borderColor: copied ? 'success.main' : undefined,
            }}
            aria-label="Copy shareable link to this manabase analysis"
          >
            {copied ? 'Copied!' : isSmallMobile ? 'Copy' : 'Copy link'}
          </Button>
        </Box>

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
        {subTab === 1 && <DeckListTab deckList={deckList} />}
      </Box>
    )
  }
)
