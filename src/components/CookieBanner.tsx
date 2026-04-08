import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('coparmex_cookie_consent');
    if (!consent) {
      // Small delay so it animates in nicely after initial load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('coparmex_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="glass-morphism rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />
              
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
              </div>
              
              <div className="flex-1 text-center md:text-left z-10">
                <h3 className="text-white font-bold mb-1">Aviso de Privacidad y Cookies</h3>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                  Utilizamos cookies para garantizar que obtengas la mejor experiencia en nuestro sitio y procesar tus pagos de manera segura. <strong>Las transacciones serán efectuadas mediante la pasarela de Openpay.</strong> Al continuar navegando, aceptas nuestra política de privacidad.
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto z-10 flex-col md:flex-row">
                <button
                  onClick={() => {
                    navigate('/legal/privacidad');
                  }}
                  className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                  Leer Aviso Completo
                </button>
                <button
                  onClick={handleAccept}
                  className="w-full md:w-auto premium-button premium-gradient-orange px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-orange-500/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  Aceptar y Continuar
                </button>
              </div>
              
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
