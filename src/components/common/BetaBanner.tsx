import {
    Feedback as FeedbackIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Chip,
    Container,
    Link,
    Typography
} from '@mui/material';
import React from 'react';

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
              🚧 <strong>Beta Version</strong> - Help us improve ManaTuner Pro!
            </Typography>
            <Chip
              icon={<FeedbackIcon />}
              label="Give Feedback"
              variant="outlined"
              size="small"
              clickable
              component={Link}
              href="https://tally.so/r/A7KRkN"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                borderColor: 'primary.main',
                height: '22px',
                fontSize: '0.75rem',
                fontWeight: 600,
                '& .MuiChip-icon': {
                  fontSize: '0.85rem'
                },
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                }
              }}
            />
          </Box>
        </Alert>
      </Container>
    </Box>
  );
};
