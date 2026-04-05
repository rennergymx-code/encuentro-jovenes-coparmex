import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function AdminModal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }: AdminModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        /* Full-screen overlay — flex centers the card perfectly */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          {/* Modal card — stops click propagation so it doesn't close itself */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`w-full ${maxWidth} glass-morphism border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 max-h-[90vh] flex flex-col`}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-white/10 bg-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-7 bg-branding-orange rounded-full" />
                <h2 className="text-lg font-black uppercase tracking-tighter">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="px-8 py-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
