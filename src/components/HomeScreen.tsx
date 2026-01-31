import { motion } from 'framer-motion';
import { WalletCard } from './WalletCard';
import { ActionButtons } from './ActionButtons';
import { TransactionPreview } from './TransactionPreview';
import type { UserData } from '@/lib/storage';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMaskedMobile } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HomeScreenProps {
  userData: UserData;
  onNavigate: (tab: string) => void;
  mobileNumber?: string;
}

export function HomeScreen({ userData, onNavigate, mobileNumber }: HomeScreenProps) {
  const { logout } = useAuth();
  const recentTransactions = userData.transactions.slice(0, 3);
  const maskedMobile = getMaskedMobile();

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-white/20 transition-colors">
                    <User className="w-6 h-6 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{maskedMobile}</p>
                    <p className="text-xs text-muted-foreground">{userData.userId}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div>
                <p className="text-white font-semibold">OfflinePay</p>
                <p className="text-white/70 text-sm">{maskedMobile || userData.userId}</p>
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
