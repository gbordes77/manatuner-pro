import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  severity?: 'info' | 'warning' | 'error' | 'success';
  helpText?: string;
  badgeText?: string;
  className?: string;
}

/**
 * 🎯 Progressive Disclosure Component - Version Corrigée
 * Remplace la version erronée avec @headlessui/react
 * Utilise Material-UI pour la compatibilité avec ManaTuner Pro
 */
export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  children,
  defaultExpanded = false,
  severity = 'info',
  helpText,
  badgeText,
  className
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const getSeverityColor = () => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Accordion 
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      className={`progressive-disclosure ${className || ''}`}
      sx={{
        '&:before': { display: 'none' },
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '8px !important',
        overflow: 'hidden'
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: severity === 'info' ? 'rgba(59, 130, 246, 0.05)' : 
                          severity === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
                          severity === 'error' ? 'rgba(239, 68, 68, 0.05)' :
                          'rgba(16, 185, 129, 0.05)',
          '&:hover': {
            backgroundColor: severity === 'info' ? 'rgba(59, 130, 246, 0.1)' : 
                            severity === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                            severity === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                            'rgba(16, 185, 129, 0.1)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <SettingsIcon 
            color={getSeverityColor()} 
            sx={{ fontSize: '1.2rem' }}
          />
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              color: severity === 'info' ? '#3b82f6' : 
                     severity === 'warning' ? '#d97706' :
                     severity === 'error' ? '#dc2626' :
                     '#059669'
            }}
          >
            {title}
          </Typography>
          
          {badgeText && (
            <Chip 
              label={badgeText}
              size="small"
              color={getSeverityColor()}
              variant="outlined"
              sx={{ ml: 'auto', mr: 2 }}
            />
          )}
          
          {helpText && (
            <Tooltip 
              title={helpText}
              placement="top"
              className="enhanced-tooltip"
            >
              <InfoIcon 
                sx={{ 
                  fontSize: '1rem', 
                  color: 'text.secondary',
                  ml: helpText && !badgeText ? 'auto' : 0,
                  mr: 2
                }}
              />
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>
      
      <AccordionDetails
        className={`progressive-disclosure-content ${expanded ? 'open' : ''}`}
        sx={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

/**
 * 🎯 Hook pour la gestion d'état des Progressive Disclosures multiples
 */
export const useProgressiveDisclosure = (initialStates: Record<string, boolean> = {}) => {
  const [states, setStates] = useState(initialStates);

  const toggle = (key: string) => {
    setStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const open = (key: string) => {
    setStates(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const close = (key: string) => {
    setStates(prev => ({
      ...prev,
      [key]: false
    }));
  };

  const openAll = () => {
    setStates(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {})
    );
  };

  const closeAll = () => {
    setStates(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {})
    );
  };

  return {
    states,
    toggle,
    open,
    close,
    openAll,
    closeAll,
    isOpen: (key: string) => !!states[key]
  };
}; 