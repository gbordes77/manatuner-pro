import React from 'react'
import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { Box } from '@mui/material'

// Animations prédéfinies
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: {
      duration: 0.3,
    },
  },
}

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const cardHover: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
  },
}

// Props du composant
interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  animation?: 'fadeInUp' | 'slideInLeft' | 'scaleIn' | 'stagger' | 'cardHover'
  delay?: number
  duration?: number
  sx?: any
}

// Composant principal
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration,
  sx,
  ...motionProps
}) => {
  // Sélection de l'animation
  const getVariants = (): Variants => {
    const baseVariants = {
      fadeInUp,
      slideInLeft,
      scaleIn,
      stagger: staggerContainer,
      cardHover,
    }[animation]

    // Personnalisation du délai et de la durée
    if (delay || duration) {
      const variants = { ...baseVariants }
      if (variants.animate && typeof variants.animate === 'object') {
        variants.animate = {
          ...variants.animate,
          transition: {
            ...variants.animate.transition,
            ...(delay && { delay }),
            ...(duration && { duration }),
          },
        }
      }
      return variants
    }

    return baseVariants
  }

  return (
    <motion.div
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={animation === 'cardHover' ? 'hover' : undefined}
      whileTap={animation === 'cardHover' ? 'tap' : undefined}
      style={sx}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

// Hook pour animations en scroll
export const useScrollAnimation = () => {
  const scrollVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  return { scrollVariants }
}

// Composant pour listes animées
interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={fadeInUp}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Composant pour boutons avec effet de press
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
      component={motion.div}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
} 