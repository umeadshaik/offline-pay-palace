import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Clock } from 'lucide-react';
import type { Transaction } from '@/lib/storage';

interface HistoryScreenProps {
  transactions: Transaction[];
  onBack: () => void;
}

export function HistoryScreen({ transactions, onBack }: HistoryScreenProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h1 className="text-white font-bold text-xl">Transactions</h1>
              <p className="text-white/70 text-sm">{transactions.length} transactions</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto">
          {transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl shadow-soft border border-border/50 p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">Your payment history will appear here</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {transactions.map((tx, index) => {
                const isSent = tx.type === 'sent';
                const isWithdrawn = tx.type === 'withdrawn';
                const Icon = isWithdrawn ? Wallet : isSent ? ArrowUpRight : ArrowDownLeft;
                const colorClass = isSent || isWithdrawn ? 'text-destructive' : 'text-success';
                const bgClass = isSent || isWithdrawn ? 'bg-destructive/10' : 'bg-success/10';

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl shadow-soft border border-border/50 p-4 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {isWithdrawn ? `Withdrawn to UPI` : 
                         isSent ? `Sent to ${tx.userId}` : 
                         `Received from ${tx.userId}`}
                      </p>
                      {isWithdrawn && tx.upiId && (
                        <p className="text-sm text-muted-foreground truncate">{tx.upiId}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(tx.timestamp)}</p>
                    </div>
                    <p className={`font-bold text-lg ${colorClass} flex-shrink-0`}>
                      {isSent || isWithdrawn ? '-' : '+'}₹{tx.amount}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
