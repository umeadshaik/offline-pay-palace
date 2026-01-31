import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from './WelcomeScreen';
import { MobileEntryScreen } from './MobileEntryScreen';
import { OTPScreen } from './OTPScreen';
import { CreatePinScreen } from './CreatePinScreen';
import { LoginScreen } from './LoginScreen';
import { isReturningUser, resetAccount } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

type AuthScreen = 'welcome' | 'mobile' | 'otp' | 'createPin' | 'login';

interface AuthFlowProps {
  onAuthenticated: () => void;
}

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const { signup } = useAuth();
  const returning = isReturningUser();
  
  // Start at login if returning user, otherwise welcome
  const [screen, setScreen] = useState<AuthScreen>(returning ? 'login' : 'welcome');
  const [mobileNumber, setMobileNumber] = useState('');
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for back

  const navigate = (to: AuthScreen, back = false) => {
    setDirection(back ? -1 : 1);
    setScreen(to);
  };

  const handleMobileSubmit = (mobile: string) => {
    setMobileNumber(mobile);
    navigate('otp');
  };

  const handleOtpVerified = () => {
    navigate('createPin');
  };

  const handlePinCreated = async (pin: string) => {
    await signup(mobileNumber, pin);
    onAuthenticated();
  };

  const handleForgotPin = () => {
    // Reset and start fresh
    resetAccount();
    navigate('welcome');
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={screen}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {screen === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => navigate('mobile')}
            onLogin={() => navigate('login')}
            isReturningUser={returning}
          />
        )}

        {screen === 'mobile' && (
          <MobileEntryScreen
            onBack={() => navigate('welcome', true)}
            onSubmit={handleMobileSubmit}
          />
        )}

        {screen === 'otp' && (
          <OTPScreen
            mobileNumber={mobileNumber}
            onBack={() => navigate('mobile', true)}
            onVerified={handleOtpVerified}
          />
        )}

        {screen === 'createPin' && (
          <CreatePinScreen
            onBack={() => navigate('otp', true)}
            onPinCreated={handlePinCreated}
          />
        )}

        {screen === 'login' && (
          <LoginScreen
            onSuccess={onAuthenticated}
            onForgotPin={handleForgotPin}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
