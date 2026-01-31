import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { verifyOtp } from '@/lib/auth';

interface OTPScreenProps {
  mobileNumber: string;
  onBack: () => void;
  onVerified: () => void;
}

export function OTPScreen({ mobileNumber, onBack, onVerified }: OTPScreenProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    setError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (verifyOtp(otp)) {
      setIsVerified(true);
      // Show success animation then proceed
      setTimeout(() => {
        onVerified();
      }, 1000);
    } else {
      setError('Invalid OTP. Please try again.');
      setOtp('');
    }

    setIsVerifying(false);
  };

  const handleResend = () => {
    setResendTimer(30);
    setOtp('');
    setError('');
    // Demo mode: Just reset timer, no actual SMS
  };

  const maskedMobile = mobileNumber.slice(0, 3) + '****' + mobileNumber.slice(-4);

  if (isVerified) {
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
            Verified!
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
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verify your number
          </h1>
          <p className="text-muted-foreground mb-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-foreground font-semibold mb-8">
            {maskedMobile}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-14 text-xl rounded-xl border-2"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
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

          {/* Demo hint */}
          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Demo Mode:</span> Use OTP{' '}
              <span className="font-mono font-bold text-primary">123456</span>
            </p>
          </div>

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-muted-foreground text-sm">
                Resend code in <span className="font-semibold text-foreground">{resendTimer}s</span>
              </p>
            ) : (
              <Button
                variant="ghost"
                onClick={handleResend}
                className="text-primary font-semibold"
              >
                Resend OTP
              </Button>
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
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary text-white shadow-button"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
      </motion.div>
    </div>
  );
}
