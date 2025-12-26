import { Link, Typography } from '@mui/material';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <Typography variant="body2" color="text.secondary">
      © 2025 ManaTuner Pro. Inspired by the work of{' '}
      <Link
        href="https://github.com/WickedFridge/magic-project-manabase"
        target="_blank"
        rel="noopener"
        sx={{ color: 'inherit' }}
      >
        Charles Wickham
      </Link>
      {' '}and Frank Karsten's research.
    </Typography>
  );
};

export default Footer;
