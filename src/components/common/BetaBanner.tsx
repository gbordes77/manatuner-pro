import React from 'react';
import { 
  Alert, 
  Box, 
  Typography, 
  Chip,
  Link,
  Container
} from '@mui/material';
import { 
  Science as ScienceIcon,
  Feedback as FeedbackIcon 
} from '@mui/icons-material';

export const BetaBanner: React.FC = () => {
  return (
    <Box sx={{ 
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      borderBottom: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
      py: 1.5,
      position: 'sticky',
      top: 0,
      zIndex: 1100
    }}>
      <Container maxWidth="lg">
        <Alert 
          severity="info" 
          sx={{ 
            bgcolor: 'transparent',
            border: 'none',
            '& .MuiAlert-icon': {
              color: 'primary.main'
            }
          }}
          icon={<ScienceIcon />}
        >
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
                🚧 <strong>Beta Version</strong> - We're testing ManaTuner Pro and would love your feedback!
              </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              <Chip 
                icon={<FeedbackIcon />}
                label="Join our Discord"
                variant="outlined"
                size="small"
                clickable
                component={Link}
                href="https://discord.gg/manatuner-pro"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Help us improve!
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Container>
    </Box>
  );
}; 