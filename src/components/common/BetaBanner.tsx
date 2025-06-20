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
  Feedback as FeedbackIcon 
} from '@mui/icons-material';

export const BetaBanner: React.FC = () => {
  return (
    <Box sx={{ 
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      borderBottom: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
      py: 0.25,
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
            py: 0.25,
            px: 0.5,
            minHeight: 'auto',
            alignItems: 'center',
            '& .MuiAlert-message': {
              py: 0,
              px: 0,
              width: '100%'
            }
          }}
          icon={false}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} flexWrap="wrap">
            <Typography variant="body2" component="span" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
              🚧 <strong>Beta Version</strong> - We're testing ManaTuner Pro and would love your feedback!
            </Typography>
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
                height: '20px',
                fontSize: '0.7rem',
                '& .MuiChip-icon': {
                  fontSize: '0.7rem'
                },
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Help us improve!
            </Typography>
          </Box>
        </Alert>
      </Container>
    </Box>
  );
}; 