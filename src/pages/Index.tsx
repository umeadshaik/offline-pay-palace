import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { HomeScreen } from '@/components/HomeScreen';
import { ReceiveScreen } from '@/components/ReceiveScreen';
import { ScanScreen } from '@/components/ScanScreen';
import { HistoryScreen } from '@/components/HistoryScreen';
import { WithdrawScreen } from '@/components/WithdrawScreen';
import { getUserData, type UserData } from '@/lib/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  const refreshUserData = () => {
    const data = getUserData();
    setUserData(data);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    setActiveTab('home');
  };

  if (!userData) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-3xl">💸</span>
          </div>
          <h1 className="text-white text-2xl font-bold">OfflinePay</h1>
          <p className="text-white/70 mt-2">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeScreen userData={userData} onNavigate={handleNavigate} />
          </motion.div>
        )}

        {activeTab === 'receive' && (
          <motion.div
            key="receive"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ReceiveScreen userId={userData.userId} onBack={handleBack} />
          </motion.div>
        )}

        {activeTab === 'scan' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ScanScreen 
              onBack={handleBack} 
              onPaymentComplete={refreshUserData} 
            />
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <HistoryScreen 
              transactions={userData.transactions} 
              onBack={handleBack} 
            />
          </motion.div>
        )}

        {activeTab === 'withdraw' && (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <WithdrawScreen 
              balance={userData.balance}
              savedUpiId={userData.upiId}
              onBack={handleBack}
              onWithdrawComplete={refreshUserData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        refreshUserData();
      }} />
    </div>
  );
};

export default Index;
