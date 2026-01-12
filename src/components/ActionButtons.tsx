import { motion } from 'framer-motion';
import { QrCode, ScanLine, History, Wallet } from 'lucide-react';

interface ActionButtonsProps {
  onNavigate: (tab: string) => void;
}

const actions = [
  { id: 'receive', icon: QrCode, label: 'Receive', color: 'bg-primary/10 text-primary' },
  { id: 'scan', icon: ScanLine, label: 'Scan & Pay', color: 'bg-accent/10 text-accent' },
  { id: 'history', icon: History, label: 'Transactions', color: 'bg-success/10 text-success' },
  { id: 'withdraw', icon: Wallet, label: 'Withdraw', color: 'bg-destructive/10 text-destructive' },
];

export function ActionButtons({ onNavigate }: ActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="grid grid-cols-4 gap-3"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(action.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card shadow-soft border border-border/50 hover:shadow-card transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
