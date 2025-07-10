import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Symboles de mana LÉGAUX - pas de copyright MTG
 * Utilise des cercles colorés simples avec lettres
 */

interface ManaSymbolProps {
  color: 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
  size?: 'small' | 'medium' | 'large';
}

const COLOR_CONFIGS = {
  W: { bg: '#FFFBD5', border: '#F0E68C', text: '#8B4513', name: 'White' },
  U: { bg: '#0E68AB', border: '#4A90E2', text: '#FFFFFF', name: 'Blue' },
  B: { bg: '#150B00', border: '#4A4A4A', text: '#FFFFFF', name: 'Black' },
  R: { bg: '#D3202A', border: '#FF6B6B', text: '#FFFFFF', name: 'Red' },
  G: { bg: '#00733E', border: '#4CAF50', text: '#FFFFFF', name: 'Green' },
  C: { bg: '#CCCCCC', border: '#999999', text: '#333333', name: 'Colorless' }
};

const SIZE_CONFIGS = {
  small: { width: 16, height: 16, fontSize: '10px' },
  medium: { width: 24, height: 24, fontSize: '14px' },
  large: { width: 32, height: 32, fontSize: '18px' }
};

export const ManaSymbol: React.FC<ManaSymbolProps> = ({ 
  color, 
  size = 'medium' 
}) => {
  const colorConfig = COLOR_CONFIGS[color];
  const sizeConfig = SIZE_CONFIGS[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeConfig.width,
        height: sizeConfig.height,
        borderRadius: '50%',
        backgroundColor: colorConfig.bg,
        border: `1px solid ${colorConfig.border}`,
        color: colorConfig.text,
        fontSize: sizeConfig.fontSize,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        margin: '0 1px',
        flexShrink: 0,
        cursor: 'help',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          boxShadow: `0 2px 8px ${colorConfig.border}40`
        }
      }}
      title={`${colorConfig.name} mana source`}
      role="img"
      aria-label={`${colorConfig.name} mana symbol`}
    >
      {color}
    </Box>
  );
};

interface ManaSequenceProps {
  sequence: Array<'W' | 'U' | 'B' | 'R' | 'G' | 'C'>;
  size?: 'small' | 'medium' | 'large';
}

export const ManaSequence: React.FC<ManaSequenceProps> = ({ 
  sequence, 
  size = 'medium' 
}) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      {sequence.map((color, index) => (
        <ManaSymbol key={`${color}-${index}`} color={color} size={size} />
      ))}
    </Box>
  );
};

interface ManaRequirementProps {
  requirements: Record<string, number>;
  size?: 'small' | 'medium' | 'large';
}

export const ManaRequirement: React.FC<ManaRequirementProps> = ({ 
  requirements, 
  size = 'medium' 
}) => {
  const sequence: Array<'W' | 'U' | 'B' | 'R' | 'G' | 'C'> = [];
  
  // Convertir les requirements en séquence de symboles
  Object.entries(requirements).forEach(([color, count]) => {
    if (count > 0 && ['W', 'U', 'B', 'R', 'G', 'C'].includes(color)) {
      for (let i = 0; i < count; i++) {
        sequence.push(color as 'W' | 'U' | 'B' | 'R' | 'G' | 'C');
      }
    }
  });

  if (sequence.length === 0) {
    return (
      <Typography variant="body2" component="span" color="text.secondary">
        No mana required
      </Typography>
    );
  }

  return <ManaSequence sequence={sequence} size={size} />;
};

/**
 * Composant pour afficher les sources disponibles
 */
interface ManaSourcesProps {
  sources: Record<string, number>;
  showCounts?: boolean;
}

export const ManaSources: React.FC<ManaSourcesProps> = ({ 
  sources, 
  showCounts = true 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {Object.entries(sources)
        .filter(([color, count]) => count > 0 && ['W', 'U', 'B', 'R', 'G', 'C'].includes(color))
        .map(([color, count]) => (
          <Box key={color} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ManaSymbol color={color as 'W' | 'U' | 'B' | 'R' | 'G' | 'C'} />
            {showCounts && (
              <Typography variant="body2" component="span">
                {count}
              </Typography>
            )}
          </Box>
        ))}
    </Box>
  );
};

export default {
  ManaSymbol,
  ManaSequence,
  ManaRequirement,
  ManaSources
}; 