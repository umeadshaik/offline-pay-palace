import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone } from 'lucide-react';
import { validateMobileNumber } from '@/lib/auth';

interface MobileEntryScreenProps {
  onBack: () => void;
  onSubmit: (mobile: string) => void;
}

export function MobileEntryScreen({ onBack, onSubmit }: MobileEntryScreenProps) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
    setError('');
  };

  const handleSubmit = () => {
    const validation = validateMobileNumber(mobile);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    onSubmit('+91' + mobile);
  };

  const isValid = mobile.length === 10;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </motion.header>

      {/* Content */}
      <div className="flex-1 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Enter your mobile number
          </h1>
          <p className="text-muted-foreground mb-8">
            We'll send you a verification code
          </p>

          {/* Mobile Input */}
          <div className="space-y-4">
            <div className="flex gap-3">
              {/* Country Code */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                <span className="text-lg">🇮🇳</span>
                <span className="font-medium text-foreground">+91</span>
              </div>

              {/* Number Input */}
              <div className="flex-1 relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  value={mobile}
                  onChange={handleChange}
                  placeholder="Enter 10 digit number"
                  className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm"
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6"
      >
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary text-white shadow-button"
        >
          Send OTP
        </Button>

        <p className="text-center text-muted-foreground text-sm mt-4">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
