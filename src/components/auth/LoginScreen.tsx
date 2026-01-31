import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NumericKeypad } from './NumericKeypad';
import { getMaskedMobile, isLockedOut } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

interface LoginScreenProps {
  onSuccess: () => void;
  onForgotPin: () => void;
}

export function LoginScreen({ onSuccess, onForgotPin }: LoginScreenProps) {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const maskedMobile = getMaskedMobile();

  // Check for lockout
  useEffect(() => {
    const checkLockout = () => {
      const { locked, remainingMs } = isLockedOut();
      if (locked) {
        setLockoutRemaining(Math.ceil(remainingMs / 1000));
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && !isLoading && lockoutRemaining === 0) {
      handleLogin();
    }
  }, [pin]);

  const handleLogin = async () => {
    if (pin.length !== 4 || isLoading) return;

    setIsLoading(true);
    setError('');

    const result = await login(pin);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => onSuccess(), 1000);
    } else {
      setError(result.message);
      setPin('');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (key: string) => {
    if (pin.length >= 4 || isLoading || lockoutRemaining > 0) return;
    setPin(pin + key);
    setError('');
  };

  const handleBackspace = () => {
    if (isLoading || lockoutRemaining > 0) return;
    setPin(pin.slice(0, -1));
    setError('');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 rounded-full gradient-success flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-semibold text-foreground"
          >
            Welcome back!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const isLocked = lockoutRemaining > 0;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
          <span className="text-3xl">💸</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">OfflinePay</h1>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          {/* User info */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {maskedMobile}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-8">
            Enter your PIN
          </h2>

          {/* Lockout warning */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 mb-6 p-3 bg-destructive/10 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-destructive text-sm">
                  Account locked. Try again in {formatTime(lockoutRemaining)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PIN Dots */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  scale: pin.length > index ? [1, 1.3, 1] : 1,
                  backgroundColor: pin.length > index 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--muted))'
                }}
                transition={{ duration: 0.15 }}
                className="w-4 h-4 rounded-full"
              />
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-sm mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Forgot PIN */}
          <Button
            variant="ghost"
            onClick={onForgotPin}
            className="text-primary font-medium text-sm mb-4"
            disabled={isLoading}
          >
            Forgot PIN?
          </Button>
        </motion.div>
      </div>

      {/* Keypad */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pb-8"
      >
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          disabled={isLoading || isLocked}
        />
      </motion.div>
    </div>
  );
}
