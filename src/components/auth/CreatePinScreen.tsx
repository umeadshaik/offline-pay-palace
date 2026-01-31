import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { NumericKeypad } from './NumericKeypad';
import { validatePin } from '@/lib/auth';

interface CreatePinScreenProps {
  onBack: () => void;
  onPinCreated: (pin: string) => void;
}

type Step = 'create' | 'confirm' | 'success';

export function CreatePinScreen({ onBack, onPinCreated }: CreatePinScreenProps) {
  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handleKeyPress = (key: string) => {
    if (currentPin.length >= 4) return;
    
    const newPin = currentPin + key;
    setCurrentPin(newPin);
    setError('');

    // Auto-advance when 4 digits entered
    if (newPin.length === 4) {
      if (step === 'create') {
        // Validate PIN
        const validation = validatePin(newPin);
        if (!validation.valid) {
          setError(validation.message);
          setTimeout(() => setPin(''), 300);
          return;
        }
        // Move to confirm step
        setTimeout(() => setStep('confirm'), 300);
      } else if (step === 'confirm') {
        // Check if PINs match
        if (newPin === pin) {
          setStep('success');
          setTimeout(() => onPinCreated(pin), 1500);
        } else {
          setError('PINs do not match. Try again.');
          setTimeout(() => {
            setConfirmPin('');
            setStep('create');
            setPin('');
          }, 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    setCurrentPin(currentPin.slice(0, -1));
    setError('');
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setConfirmPin('');
    } else {
      onBack();
    }
  };

  if (step === 'success') {
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
            PIN Created!
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mt-2"
          >
            Setting up your wallet...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </motion.header>

      {/* Content */}
      <div className="flex-1 px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              {step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {step === 'create'
                ? 'Choose a 4-digit PIN to secure your wallet'
                : 'Enter the same PIN again to confirm'
              }
            </p>

            {/* PIN Dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    scale: currentPin.length > index ? [1, 1.3, 1] : 1,
                    backgroundColor: currentPin.length > index 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--muted))'
                  }}
                  transition={{ duration: 0.15 }}
                  className="w-4 h-4 rounded-full"
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm mb-4"
              >
                {error}
              </motion.p>
            )}

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-8">
              <div className={`w-8 h-1 rounded-full ${step === 'create' ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-1 rounded-full ${step === 'confirm' ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </motion.div>
        </AnimatePresence>
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
        />
      </motion.div>
    </div>
  );
}
