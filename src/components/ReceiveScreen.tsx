import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Share2, Download } from 'lucide-react';

interface ReceiveScreenProps {
  userId: string;
  onBack: () => void;
}

export function ReceiveScreen({ userId, onBack }: ReceiveScreenProps) {
  const qrData = JSON.stringify({ user_id: userId });

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
              <p className="text-white/70 text-sm">Show this QR to receive payment</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 pt-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                💡 This QR works <span className="font-semibold text-primary">offline</span>. 
                Share it with nearby users to receive payments instantly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
                <Download className="w-5 h-5" />
                Save QR
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl gradient-primary text-white font-medium shadow-button hover:opacity-90 transition-opacity">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
