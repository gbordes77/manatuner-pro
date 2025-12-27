import { Box, Typography, useTheme } from '@mui/material';
import React from 'react';

/**
 * Mana Symbols using Keyrune font (MIT Licensed)
 * https://andrewgioia.github.io/Keyrune/
 *
 * Now uses authentic MTG mana symbol styling via CSS font
 */

interface ManaSymbolProps {
  color: 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
  size?: 'small' | 'medium' | 'large' | number;
  glow?: boolean;
  animated?: boolean;
}

// Map from our color codes to Keyrune classes
const KEYRUNE_CLASSES: Record<string, string> = {
  W: 'ms-w',
  U: 'ms-u',
  B: 'ms-b',
  R: 'ms-r',
  G: 'ms-g',
  C: 'ms-c',
};

const COLOR_CONFIGS = {
  W: { name: 'White', glowColor: 'rgba(248, 246, 216, 0.6)' },
  U: { name: 'Blue', glowColor: 'rgba(14, 104, 171, 0.6)' },
  B: { name: 'Black', glowColor: 'rgba(90, 60, 90, 0.6)' },
  R: { name: 'Red', glowColor: 'rgba(211, 32, 42, 0.6)' },
  G: { name: 'Green', glowColor: 'rgba(0, 115, 62, 0.6)' },
  C: { name: 'Colorless', glowColor: 'rgba(200, 200, 200, 0.6)' }
};

const SIZE_CONFIGS: Record<string, number> = {
  small: 16,
  medium: 24,
  large: 32
};

export const ManaSymbol: React.FC<ManaSymbolProps> = ({
  color,
  size = 'medium',
  glow = false,
  animated = false,
}) => {
  const theme = useTheme();
  const colorConfig = COLOR_CONFIGS[color];
  const fontSize = typeof size === 'number' ? size : SIZE_CONFIGS[size];
  const keyruneClass = KEYRUNE_CLASSES[color];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.15)',
          '& i': {
            filter: `drop-shadow(0 0 8px ${colorConfig.glowColor}) !important`,
          },
        },
        ...(animated && {
          animation: 'mana-pulse 2s ease-in-out infinite',
        }),
      }}
      title={`${colorConfig.name} mana source`}
      role="img"
      aria-label={`${colorConfig.name} mana symbol`}
    >
      <i
        className={`ms ${keyruneClass} ms-cost`}
        style={{
          fontSize,
          filter: glow
            ? `drop-shadow(0 0 6px ${colorConfig.glowColor})`
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          transition: 'all 0.2s ease',
        }}
      />
    </Box>
  );
};

// Fallback component if Keyrune font fails to load
export const ManaSymbolFallback: React.FC<ManaSymbolProps> = ({
  color,
  size = 'medium'
}) => {
  const fontSize = typeof size === 'number' ? size : SIZE_CONFIGS[size];

  const FALLBACK_COLORS = {
    W: { bg: '#FFFBD5', border: '#F0E68C', text: '#8B4513' },
    U: { bg: '#0E68AB', border: '#4A90E2', text: '#FFFFFF' },
    B: { bg: '#150B00', border: '#4A4A4A', text: '#FFFFFF' },
    R: { bg: '#D3202A', border: '#FF6B6B', text: '#FFFFFF' },
    G: { bg: '#00733E', border: '#4CAF50', text: '#FFFFFF' },
    C: { bg: '#CCCCCC', border: '#999999', text: '#333333' }
  };

  const colorConfig = FALLBACK_COLORS[color];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: fontSize,
        height: fontSize,
        borderRadius: '50%',
        backgroundColor: colorConfig.bg,
        border: `1px solid ${colorConfig.border}`,
        color: colorConfig.text,
        fontSize: fontSize * 0.6,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        margin: '0 1px',
        flexShrink: 0,
      }}
      title={`${COLOR_CONFIGS[color].name} mana source`}
    >
      {color}
    </Box>
  );
};

interface ManaSequenceProps {
  sequence: Array<'W' | 'U' | 'B' | 'R' | 'G' | 'C'>;
  size?: 'small' | 'medium' | 'large' | number;
  glow?: boolean;
}

export const ManaSequence: React.FC<ManaSequenceProps> = ({
  sequence,
  size = 'medium',
  glow = false,
}) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      {sequence.map((color, index) => (
        <ManaSymbol key={`${color}-${index}`} color={color} size={size} glow={glow} />
      ))}
    </Box>
  );
};

// WUBRG bar component for easy use
interface WUBRGBarProps {
  size?: 'small' | 'medium' | 'large' | number;
  glow?: boolean;
  animated?: boolean;
}

export const WUBRGBar: React.FC<WUBRGBarProps> = ({
  size = 'medium',
  glow = false,
  animated = false,
}) => {
  const colors: Array<'W' | 'U' | 'B' | 'R' | 'G'> = ['W', 'U', 'B', 'R', 'G'];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        '& > span': {
          transition: 'all 0.2s ease',
        },
        '&:hover > span': {
          transform: 'scale(1.1)',
        },
      }}
    >
      {colors.map((color, index) => (
        <ManaSymbol
          key={color}
          color={color}
          size={size}
          glow={glow}
          animated={animated}
        />
      ))}
    </Box>
  );
};

interface ManaRequirementProps {
  requirements: Record<string, number>;
  size?: 'small' | 'medium' | 'large' | number;
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
  size?: 'small' | 'medium' | 'large' | number;
}

export const ManaSources: React.FC<ManaSourcesProps> = ({
  sources,
  showCounts = true,
  size = 'medium',
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {Object.entries(sources)
        .filter(([color, count]) => count > 0 && ['W', 'U', 'B', 'R', 'G', 'C'].includes(color))
        .map(([color, count]) => (
          <Box key={color} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ManaSymbol color={color as 'W' | 'U' | 'B' | 'R' | 'G' | 'C'} size={size} />
            {showCounts && (
              <Typography variant="body2" component="span" fontWeight={600}>
                {count}
              </Typography>
            )}
          </Box>
        ))}
    </Box>
  );
};

/**
 * Inline mana cost display (for spell costs)
 */
interface ManaCostProps {
  cost: string; // e.g., "2WU", "3BB", "WUBRG"
  size?: 'small' | 'medium' | 'large' | number;
}

export const ManaCost: React.FC<ManaCostProps> = ({ cost, size = 'small' }) => {
  const symbols: Array<{ type: 'generic' | 'color'; value: string | number }> = [];

  // Parse mana cost string
  let i = 0;
  while (i < cost.length) {
    const char = cost[i];
    if (/[0-9]/.test(char)) {
      // Collect all digits for generic mana
      let num = '';
      while (i < cost.length && /[0-9]/.test(cost[i])) {
        num += cost[i];
        i++;
      }
      symbols.push({ type: 'generic', value: parseInt(num) });
    } else if (['W', 'U', 'B', 'R', 'G', 'C'].includes(char.toUpperCase())) {
      symbols.push({ type: 'color', value: char.toUpperCase() });
      i++;
    } else {
      i++;
    }
  }

  const fontSize = typeof size === 'number' ? size : SIZE_CONFIGS[size];

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      {symbols.map((symbol, index) => (
        symbol.type === 'generic' ? (
          <Box
            key={index}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: fontSize,
              height: fontSize,
              borderRadius: '50%',
              bgcolor: '#CAC5C0',
              color: '#333',
              fontSize: fontSize * 0.6,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              border: '1px solid #999',
            }}
          >
            {symbol.value}
          </Box>
        ) : (
          <ManaSymbol
            key={index}
            color={symbol.value as 'W' | 'U' | 'B' | 'R' | 'G' | 'C'}
            size={size}
          />
        )
      ))}
    </Box>
  );
};

export default {
  ManaSymbol,
  ManaSymbolFallback,
  ManaSequence,
  ManaRequirement,
  ManaSources,
  ManaCost,
  WUBRGBar,
};
