import React from 'react'
import { Box, BoxProps } from '@mui/material'

// Types d'animations disponibles
type AnimationType = 'fadeInUp' | 'slideInLeft' | 'scaleIn' | 'stagger' | 'cardHover'

// Props du composant
interface AnimatedContainerProps extends Omit<BoxProps, 'animation'> {
  children: React.ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
}

// Composant principal avec animations CSS
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  sx,
  ...boxProps
}) => {
  // Styles d'animation CSS
  const getAnimationStyles = () => {
    const baseStyles = {
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      animationFillMode: 'both',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }

    const animationMap = {
      fadeInUp: {
        ...baseStyles,
        animationName: 'fadeInUp',
      },
      slideInLeft: {
        ...baseStyles,
        animationName: 'slideInLeft',
      },
      scaleIn: {
        ...baseStyles,
        animationName: 'scaleIn',
      },
      stagger: {
        ...baseStyles,
        animationName: 'fadeInUp',
      },
      cardHover: {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      },
    }

    return animationMap[animation] || animationMap.fadeInUp
  }

  return (
    <Box
      sx={{
        ...getAnimationStyles(),
        ...sx,
      }}
      {...boxProps}
    >
      {children}
    </Box>
  )
}

// Composant AnimatedList simplifié
interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className }) => {
  return (
    <Box className={className}>
      {children.map((child, index) => (
        <AnimatedContainer 
          key={index} 
          animation="fadeInUp" 
          delay={index * 0.1}
        >
          {child}
        </AnimatedContainer>
      ))}
    </Box>
  )
}

// Composant AnimatedButton simplifié
interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  sx?: any
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled,
  sx,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        '&:hover': !disabled ? {
          transform: 'scale(1.05)',
        } : {},
        '&:active': !disabled ? {
          transform: 'scale(0.95)',
        } : {},
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

// Hook pour animations en scroll (simplifié)
export const useScrollAnimation = () => {
  const scrollVariants = {
    hidden: {
      opacity: 0,
      transform: 'translateY(50px)',
    },
    visible: {
      opacity: 1,
      transform: 'translateY(0)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  }

  return { scrollVariants }
} 