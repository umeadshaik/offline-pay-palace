import { motion } from 'framer-motion';
import { WalletCard } from './WalletCard';
import { ActionButtons } from './ActionButtons';
import { TransactionPreview } from './TransactionPreview';
import type { UserData, Transaction } from '@/lib/storage';
import { User } from 'lucide-react';

interface HomeScreenProps {
  userData: UserData;
  onNavigate: (tab: string) => void;
}

export function HomeScreen({ userData, onNavigate }: HomeScreenProps) {
  const recentTransactions = userData.transactions.slice(0, 3);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gradient-header pt-12 pb-32 px-6"
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">OfflinePay</p>
                <p className="text-white/70 text-sm">{userData.userId}</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full glass text-white/90 text-xs font-medium">
              Offline Mode
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 -mt-24">
        <div className="max-w-md mx-auto space-y-6">
          <WalletCard balance={userData.balance} userId={userData.userId} />
          
          <ActionButtons onNavigate={onNavigate} />
          
          {recentTransactions.length > 0 && (
            <TransactionPreview 
              transactions={recentTransactions} 
              onViewAll={() => onNavigate('history')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
