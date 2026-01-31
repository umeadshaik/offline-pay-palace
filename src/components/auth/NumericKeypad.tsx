import { motion } from 'framer-motion';
import { Delete, Fingerprint } from 'lucide-react';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  showBiometric?: boolean;
  onBiometric?: () => void;
  disabled?: boolean;
}

export function NumericKeypad({ 
  onKeyPress, 
  onBackspace, 
  showBiometric = false,
  onBiometric,
  disabled = false 
}: NumericKeypadProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showBiometric ? 'bio' : '', '0', 'del']
  ];

  const handlePress = (key: string) => {
    if (disabled) return;
    
    if (key === 'del') {
      onBackspace();
    } else if (key === 'bio' && onBiometric) {
      onBiometric();
    } else if (key && key !== 'bio') {
      onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 px-8">
      {keys.flat().map((key, index) => {
        if (key === '') {
          return <div key={index} className="h-16" />;
        }

        return (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePress(key)}
            disabled={disabled}
            className={`
              h-16 rounded-2xl font-semibold text-xl
              flex items-center justify-center
              transition-colors duration-150
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'active:bg-muted'
              }
              ${key === 'del' || key === 'bio'
                ? 'bg-muted/50 text-muted-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
              }
            `}
          >
            {key === 'del' ? (
              <Delete className="w-6 h-6" />
            ) : key === 'bio' ? (
              <Fingerprint className="w-6 h-6" />
            ) : (
              key
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
