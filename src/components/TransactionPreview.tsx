import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Wallet, ChevronRight } from 'lucide-react';
import type { Transaction } from '@/lib/storage';

interface TransactionPreviewProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function TransactionPreview({ transactions, onViewAll }: TransactionPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-primary text-sm font-medium"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </motion.div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isSent = transaction.type === 'sent';
  const isWithdrawn = transaction.type === 'withdrawn';
  
  const Icon = isWithdrawn ? Wallet : isSent ? ArrowUpRight : ArrowDownLeft;
  const colorClass = isSent || isWithdrawn ? 'text-destructive' : 'text-success';
  const bgClass = isSent || isWithdrawn ? 'bg-destructive/10' : 'bg-success/10';
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {isWithdrawn ? `Withdrawn to ${transaction.upiId}` : 
           isSent ? `Sent to ${transaction.userId}` : 
           `Received from ${transaction.userId}`}
        </p>
        <p className="text-sm text-muted-foreground">{formatTime(transaction.timestamp)}</p>
      </div>
      <p className={`font-semibold ${colorClass}`}>
        {isSent || isWithdrawn ? '-' : '+'}₹{transaction.amount}
      </p>
    </div>
  );
}
