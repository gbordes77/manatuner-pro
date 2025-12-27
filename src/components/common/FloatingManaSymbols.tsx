import { Box, useTheme } from '@mui/material';
import React from 'react';

// Mana symbol component using Mana Font
const ManaSymbol: React.FC<{ color: 'w' | 'u' | 'b' | 'r' | 'g' | 'c'; size?: number }> = ({
  color,
  size = 24,
}) => (
  <i
    className={`ms ms-${color} ms-cost`}
    style={{
      fontSize: size,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    }}
  />
);

// Floating mana symbols background decoration
export const FloatingManaSymbols: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: isDark ? 0.15 : 0.08,
        zIndex: 0,
      }}
    >
      {/* Scattered mana symbols */}
      {[
        { color: 'w', top: '10%', left: '5%', size: 40, delay: 0 },
        { color: 'u', top: '20%', right: '8%', size: 35, delay: 0.5 },
        { color: 'b', bottom: '30%', left: '10%', size: 30, delay: 1 },
        { color: 'r', top: '40%', right: '5%', size: 38, delay: 1.5 },
        { color: 'g', bottom: '20%', right: '12%', size: 32, delay: 2 },
        { color: 'w', bottom: '10%', left: '20%', size: 28, delay: 2.5 },
        { color: 'u', top: '60%', left: '3%', size: 34, delay: 3 },
      ].map((symbol, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: symbol.top,
            left: symbol.left,
            right: symbol.right,
            bottom: symbol.bottom,
            animation: `float ${4 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${symbol.delay}s`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
            },
          }}
        >
          <ManaSymbol color={symbol.color as 'w' | 'u' | 'b' | 'r' | 'g'} size={symbol.size} />
        </Box>
      ))}
    </Box>
  );
};

export default FloatingManaSymbols;
