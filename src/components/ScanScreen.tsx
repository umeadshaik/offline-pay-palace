import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Smartphone } from 'lucide-react';
import { initiatePayment, getUserData, type PaymentQRData } from '@/lib/storage';

interface ScanScreenProps {
  onBack: () => void;
  onPaymentComplete: () => void;
}

type ScanState = 'scanning' | 'amount' | 'showPaymentQR' | 'success' | 'error';

export function ScanScreen({ onBack, onPaymentComplete }: ScanScreenProps) {
  const [state, setState] = useState<ScanState>('scanning');
  const [scannedUser, setScannedUser] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [paymentQRData, setPaymentQRData] = useState<PaymentQRData | null>(null);

  // Handle scanning receiver's identity QR
  const handleScan = useCallback((result: { rawValue: string }[]) => {
    if (result && result[0]) {
      try {
        const data = JSON.parse(result[0].rawValue);
        if (data.user_id) {
          setScannedUser(data.user_id);
          setState('amount');
        }
      } catch {
        // Invalid QR, ignore
      }
    }
  }, []);

  // Handle payment initiation - generates Payment QR for receiver
  const handlePayment = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const userData = getUserData();
    if (amountNum > userData.balance) {
      setError('Insufficient balance');
      return;
    }

    // Initiate payment - deducts sender balance and creates payment QR
    const result = initiatePayment(scannedUser, amountNum);
    
    if (result.success && result.paymentQR) {
      setPaymentQRData(result.paymentQR);
      setState('showPaymentQR');
      onPaymentComplete(); // Refresh sender's balance in UI
    } else {
      setError(result.message);
      setState('error');
    }
  };

  // Handle completion after receiver has scanned
  const handleDone = () => {
    onBack();
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gradient-header pt-12 pb-8 px-6"
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-xl">Scan & Pay</h1>
              <p className="text-white/70 text-sm">
                {state === 'showPaymentQR' 
                  ? 'Show QR to complete payment' 
                  : 'Scan QR to send money offline'}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 pt-8">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Scan receiver's QR */}
            {state === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Scanner
                    onScan={handleScan}
                    allowMultiple={false}
                    scanDelay={500}
                    styles={{
                      container: { width: '100%', height: '100%' },
                      video: { objectFit: 'cover' }
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-white/50 rounded-2xl" />
                    <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-foreground font-medium">Step 1: Scan receiver's QR</p>
                  <p className="text-muted-foreground text-sm mt-1">Position their identity QR in frame</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Enter amount */}
            {state === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Step 2: Enter amount for</p>
                  <p className="text-xl font-bold text-foreground">{scannedUser}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError('');
                      }}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-center bg-secondary border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!amount}
                  className="w-full py-4 rounded-xl gradient-primary text-white font-semibold shadow-button disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Generate Payment QR
                </button>
              </motion.div>
            )}

            {/* Step 3: Show Payment QR for receiver to scan */}
            {state === 'showPaymentQR' && paymentQRData && (
              <motion.div
                key="showPaymentQR"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 p-6"
              >
                {/* Success indicator */}
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full gradient-success flex items-center justify-center mx-auto mb-3"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground">₹{paymentQRData.amount} Deducted</h2>
                  <p className="text-muted-foreground text-sm">Your balance has been updated</p>
                </div>

                {/* Payment QR */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-20" />
                  <div className="relative bg-white p-4 rounded-2xl shadow-soft">
                    <QRCodeSVG
                      value={JSON.stringify(paymentQRData)}
                      size={200}
                      level="H"
                      includeMargin
                      className="w-full h-auto"
                      bgColor="#ffffff"
                      fgColor="#1a1a2e"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Step 3: Show this to receiver</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Ask <span className="font-medium">{paymentQRData.to}</span> to scan this Payment QR 
                        using their "Scan Payment QR" button to receive ₹{paymentQRData.amount}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction details */}
                <div className="bg-secondary/50 rounded-xl p-3 mb-4 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-foreground">{paymentQRData.tx_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-mono text-foreground">{paymentQRData.to}</span>
                  </div>
                </div>

                <button
                  onClick={handleDone}
                  className="w-full py-4 rounded-xl border-2 border-border bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}

            {state === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 p-8 text-center"
              >
                <div className="w-24 h-24 rounded-full gradient-danger flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button
                  onClick={() => setState('scanning')}
                  className="px-6 py-3 rounded-xl border border-border bg-secondary text-foreground font-medium"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
