import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const ONBOARDING_KEY = 'manatuner-onboarding-completed';

const steps: Step[] = [
  {
    target: 'textarea[placeholder*="Paste your decklist"]',
    content: 'Paste your MTG decklist here. Supports MTGA, Moxfield, and TappedOut formats.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: 'button[class*="MuiButton"][class*="contained"]',
    content: 'Click "Analyze Manabase" to run Frank Karsten\'s mathematical analysis on your deck.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="analysis-results"]',
    content: 'Your analysis results will appear here with 4 tabs: Dashboard, Castability, Analysis, and Manabase.',
    placement: 'left',
    isFixed: true,
  },
];

// Steps simplifiés pour avant l'analyse (seulement les 2 premiers)
const preAnalysisSteps: Step[] = [
  {
    target: 'textarea[placeholder*="Paste your decklist"]',
    content: 'Welcome to ManaTuner Pro! Paste your MTG decklist here.',
    disableBeacon: true,
    placement: 'bottom',
    title: '📝 Step 1: Your Deck',
  },
  {
    target: 'button[class*="MuiButton"][class*="contained"]',
    content: 'Click here to analyze your deck. You\'ll see the probability of casting each spell on curve, manabase health score, land breakdown by type, and personalized recommendations.',
    placement: 'bottom',
    title: '🔬 Step 2: Analyze',
  },
];

interface OnboardingProps {
  hasAnalysisResult?: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ hasAnalysisResult = false }) => {
  const theme = useTheme();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'onboarding
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      // Délai pour laisser le temps au DOM de se charger
      const timer = setTimeout(() => setRun(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
  };

  // Réinitialiser l'onboarding (pour le développement/debug)
  // Appeler window.resetOnboarding() dans la console
  useEffect(() => {
    (window as any).resetOnboarding = () => {
      localStorage.removeItem(ONBOARDING_KEY);
      setRun(true);
      console.log('🔄 Onboarding reset! Refresh the page to see it again.');
    };
  }, []);

  const currentSteps = hasAnalysisResult ? steps : preAnalysisSteps;

  return (
    <Joyride
      steps={currentSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: theme.palette.primary.main,
          textColor: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          arrowColor: theme.palette.background.paper,
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: theme.palette.text.secondary,
          marginRight: 10,
        },
        buttonSkip: {
          color: theme.palette.text.secondary,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: 1.6,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it!',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
};

export default Onboarding;
