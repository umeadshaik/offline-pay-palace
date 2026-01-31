import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Wifi, WifiOff } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isReturningUser: boolean;
}

export function WelcomeScreen({ onGetStarted, onLogin, isReturningUser }: WelcomeScreenProps) {
  const features = [
    { icon: WifiOff, text: 'Works offline' },
    { icon: Shield, text: 'Secure PIN protection' },
    { icon: Wallet, text: 'Instant payments' },
  ];

  return (
    <div className="min-h-screen gradient-primary flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <span className="text-5xl">💸</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-3"
          >
            OfflinePay
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg mb-8"
          >
            Send money anywhere, anytime.
            <br />
            No internet required.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/70 text-xs">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-6 pb-12 space-y-4"
      >
        <Button
          onClick={onGetStarted}
          className="w-full h-14 text-lg font-semibold bg-white text-primary hover:bg-white/90 rounded-2xl shadow-button"
        >
          Get Started
        </Button>

        {isReturningUser && (
          <Button
            onClick={onLogin}
            variant="ghost"
            className="w-full h-12 text-white/90 hover:text-white hover:bg-white/10 rounded-xl"
          >
            Already have an account? Login
          </Button>
        )}
      </motion.div>
    </div>
  );
}
