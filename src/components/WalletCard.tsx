import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface WalletCardProps {
  balance: number;
  userId: string;
}

export function WalletCard({ balance, userId }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl gradient-primary p-6 shadow-card"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Wallet Balance</p>
              <p className="text-white/50 text-xs">{userId}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center"
          >
            {showBalance ? (
              <Eye className="w-5 h-5 text-white/80" />
            ) : (
              <EyeOff className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>
        
        <div className="mb-4">
          <motion.p 
            key={balance}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white text-4xl font-bold tracking-tight"
          >
            {showBalance ? `₹${balance.toLocaleString('en-IN')}` : '₹ • • • • •'}
          </motion.p>
        </div>
        
        <div className="flex items-center gap-2 text-white/70">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full glass text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Offline Ready</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
