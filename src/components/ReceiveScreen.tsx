import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft, Share2, Download, QrCode, Camera, CheckCircle, XCircle } from 'lucide-react';
import { receivePayment, type PaymentQRData } from '@/lib/storage';

interface ReceiveScreenProps {
  userId: string;
  onBack: () => void;
  onPaymentReceived: () => void;
}

type ReceiveState = 'showQR' | 'scanPayment' | 'success' | 'error';

export function ReceiveScreen({ userId, onBack, onPaymentReceived }: ReceiveScreenProps) {
  const [state, setState] = useState<ReceiveState>('showQR');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [fromUser, setFromUser] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const qrData = JSON.stringify({ user_id: userId });

  // Handle scanning sender's Payment QR
  const handlePaymentScan = useCallback((result: { rawValue: string }[]) => {
    if (result && result[0]) {
      try {
        const data: PaymentQRData = JSON.parse(result[0].rawValue);
        
        // Validate it's a payment QR
        if (data.type === 'PAYMENT') {
          const receiveResult = receivePayment(data);
          
          if (receiveResult.success) {
            setReceivedAmount(receiveResult.amount || 0);
            setFromUser(receiveResult.fromUser || '');
            setState('success');
            onPaymentReceived(); // Refresh balance in parent
          } else {
            setError(receiveResult.message);
            setState('error');
          }
        }
      } catch {
        // Invalid QR, ignore
      }
    }
  }, [onPaymentReceived]);

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
              <h1 className="text-white font-bold text-xl">Receive Money</h1>
              <p className="text-white/70 text-sm">
                {state === 'scanPayment' 
                  ? 'Scan payment QR to receive' 
                  : 'Show your QR to receive payment'}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 pt-8">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {/* Show Identity QR */}
            {state === 'showQR' && (
              <motion.div
                key="showQR"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 p-8"
              >
                {/* QR Code Container */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-20" />
                  <div className="relative bg-white p-6 rounded-2xl shadow-soft">
                    <QRCodeSVG
                      value={qrData}
                      size={240}
                      level="H"
                      includeMargin
                      className="w-full h-auto"
                      bgColor="#ffffff"
                      fgColor="#1a1a2e"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Your unique ID</p>
                  <p className="text-xl font-bold text-foreground">{userId}</p>
                </div>

                {/* Info Badge */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <p className="text-sm text-center text-foreground">
                    💡 <span className="font-semibold">Step 1:</span> Show this QR to the sender. 
                    <span className="font-semibold text-primary"> Works offline!</span>
                  </p>
                </div>

                {/* Scan Payment QR Button */}
                <button 
                  onClick={() => setState('scanPayment')}
                  className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl gradient-primary text-white font-semibold shadow-button hover:opacity-90 transition-opacity mb-4"
                >
                  <Camera className="w-5 h-5" />
                  Scan Payment QR
                </button>

                <p className="text-xs text-muted-foreground text-center mb-4">
                  After sender shows you their Payment QR, tap above to complete receiving money
                </p>

                {/* Secondary Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
                    <Download className="w-5 h-5" />
                    Save QR
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </motion.div>
            )}

            {/* Scan Payment QR */}
            {state === 'scanPayment' && (
              <motion.div
                key="scanPayment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Scanner
                    onScan={handlePaymentScan}
                    allowMultiple={false}
                    scanDelay={500}
                    styles={{
                      container: { width: '100%', height: '100%' },
                      video: { objectFit: 'cover' }
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-white/50 rounded-2xl" />
                    <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-success rounded-tl-lg" />
                    <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-success rounded-tr-lg" />
                    <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-success rounded-bl-lg" />
                    <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-success rounded-br-lg" />
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-foreground font-medium">Scan sender's Payment QR</p>
                  <p className="text-muted-foreground text-sm mt-1">Position the payment QR in frame to receive money</p>
                  <button
                    onClick={() => setState('showQR')}
                    className="mt-4 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    ← Back to my QR
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {state === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-3xl shadow-card border border-border/50 p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full gradient-success flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Received!</h2>
                <p className="text-3xl font-bold text-success mb-2">₹{receivedAmount}</p>
                <p className="text-muted-foreground">From {fromUser}</p>
                
                <button
                  onClick={onBack}
                  className="mt-6 w-full py-4 rounded-xl gradient-primary text-white font-semibold shadow-button"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* Error State */}
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Cannot Receive</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button
                  onClick={() => setState('scanPayment')}
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
