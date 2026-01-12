import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Wifi, AlertCircle, ChevronRight } from 'lucide-react';
import { processWithdrawal, getUserData } from '@/lib/storage';

interface WithdrawScreenProps {
  balance: number;
  savedUpiId: string;
  onBack: () => void;
  onWithdrawComplete: () => void;
}

export function WithdrawScreen({ balance, savedUpiId, onBack, onWithdrawComplete }: WithdrawScreenProps) {
  const [upiId, setUpiId] = useState(savedUpiId);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const sliderWidth = 280;
  const thumbWidth = 56;
  const maxDrag = sliderWidth - thumbWidth;
  
  const background = useTransform(
    x,
    [0, maxDrag],
    ['hsl(262, 83%, 58%)', 'hsl(142, 76%, 36%)']
  );
  
  const opacity = useTransform(x, [0, maxDrag * 0.8], [1, 0]);

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX > maxDrag * 0.85) {
      // Trigger withdrawal
      animate(x, maxDrag, { type: 'spring', stiffness: 300, damping: 30 });
      handleWithdraw();
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
    setIsSliding(false);
  };

  const handleWithdraw = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
      return;
    }
    
    if (amountNum > balance) {
      setError('Insufficient balance');
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
      return;
    }

    const result = processWithdrawal(amountNum, upiId);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onWithdrawComplete();
        onBack();
      }, 2500);
    } else {
      setError(result.message);
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  const isValidForm = amount && parseFloat(amount) > 0 && upiId.includes('@');

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
              <h1 className="text-white font-bold text-xl">Withdraw</h1>
              <p className="text-white/70 text-sm">Transfer to your UPI ID</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 pt-8">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {success ? (
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Withdrawal Initiated!</h2>
                <p className="text-muted-foreground">₹{amount} sent to {upiId}</p>
                <p className="text-sm text-primary mt-4">(Demo - No real transaction)</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Balance Card */}
                <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-6">
                  <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-foreground">₹{balance.toLocaleString('en-IN')}</p>
                </div>

                {/* Form */}
                <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setError('');
                      }}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 bg-secondary border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError('');
                        }}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-secondary border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {/* Internet Notice */}
                  <div className="flex items-center gap-2 text-muted-foreground bg-muted p-3 rounded-xl">
                    <Wifi className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Internet required for UPI withdrawal (simulated)</span>
                  </div>
                </div>

                {/* Swipe to Withdraw */}
                <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-6">
                  <p className="text-center text-sm text-muted-foreground mb-4">Slide to confirm withdrawal</p>
                  
                  <div 
                    ref={sliderRef}
                    className={`relative h-14 rounded-full overflow-hidden ${isValidForm ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
                  >
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      style={{ background }}
                    />
                    
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ opacity }}
                    >
                      <span className="text-white font-semibold ml-8">Slide to withdraw ₹{amount || '0'}</span>
                      <ChevronRight className="w-5 h-5 text-white ml-2" />
                    </motion.div>
                    
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: maxDrag }}
                      dragElastic={0}
                      onDragStart={() => setIsSliding(true)}
                      onDragEnd={handleDragEnd}
                      style={{ x }}
                      className="absolute left-1 top-1 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
                    >
                      <ChevronRight className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
