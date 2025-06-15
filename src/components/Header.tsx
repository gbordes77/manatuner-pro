import React from 'react';
import { Typography } from '@mui/material';

const Header: React.FC = () => {
  return (
    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
      🎯 ManaTuner Pro
    </Typography>
  );
};

export default Header; 