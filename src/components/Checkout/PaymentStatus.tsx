import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Loader2, CreditCard, ArrowRight, Home } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import TicketCarnet from './TicketCarnet';
import { toast } from 'sonner';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [processing, setProcessing] = useState(true);

  const transactionId = searchParams.get('id');

  useEffect(() => {
    if (!transactionId) {
      setStatus('error');
      setError('No se encontró el ID de transacción.');
      setProcessing(false);
      return;
    }

    verifyPayment();
  }, [transactionId]);

  const verifyPayment = async () => {
    try {
      // 1. Recuperar el estado del checkout guardado antes de la redirección
      const savedState = sessionStorage.getItem('checkout_state');
      if (!savedState) {
        throw new Error("No se pudo recuperar la información de tu compra. Por favor contacta a soporte.");
      }

      const checkoutState = JSON.parse(savedState);

      // 2. Llamar a la Edge Function de verificación
      const { data, error: funcError } = await supabase.functions.invoke('verify-payment', {
        body: { 
          transaction_id: transactionId,
          checkout_state: checkoutState
        }
      });

      if (funcError) throw funcError;

      if (data.success && data.status === 'completed') {
        setTickets(data.tickets);
        setStatus('success');
        // Limpiar el estado de sesión tras éxito
        sessionStorage.removeItem('checkout_state');
        toast.success('¡Pago verificado exitosamente!');
      } else {
        setStatus('error');
        setError(data.message || 'El pago no pudo ser completado o fue rechazado por el banco.');
      }
    } catch (err: any) {
      console.error('Error verificando pago:', err);
      setStatus('error');
      setError(err.message || 'Ocurrió un error inesperado al verificar tu pago.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {status === 'verifying' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-20"
          >
            <div className="relative w-24 h-24 mx-auto">
              <Loader2 className="w-24 h-24 text-orange-500 animate-spin" />
              <CreditCard className="absolute inset-0 m-auto w-10 h-10 text-white/20" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Verificando tu <span className="text-orange-500">Pago</span></h2>
              <p className="text-slate-400 font-medium">Estamos confirmando la autenticación con tu banco. No cierres esta ventana.</p>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-12"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute inset-0 bg-green-500 blur-[80px] opacity-10 -z-10 rounded-full" />
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
                ¡Tu acceso está <span className="text-green-500">LISTO!</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                El pago ha sido procesado correctamente. Aquí tienes tus carnets digitales para el Encuentro Jóvenes Coparmex.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 max-w-4xl mx-auto">
              {tickets.map((ticket, i) => (
                <motion.div 
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <TicketCarnet ticket={ticket} />
                </motion.div>
              ))}
            </div>

            <div className="pt-16">
              <button 
                onClick={() => navigate('/')}
                className="px-12 py-5 rounded-[2rem] border border-white/10 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center gap-3 mx-auto"
              >
                <Home className="w-4 h-4" /> VOLVER AL INICIO
              </button>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10 py-12 px-8 premium-card border-red-500/20 bg-red-500/5 max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">No pudimos completar tu <span className="text-red-500">Pago</span></h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                {error || "Ocurrió un problema durante la verificación bancaria. Por favor intenta de nuevo o utiliza otra tarjeta."}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-6">
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full premium-button premium-gradient-orange text-white px-8 py-5 text-xl font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                INTENTAR DE NUEVO
                <ArrowRight className="w-6 h-6" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-slate-500 hover:text-white transition-colors font-black uppercase text-xs tracking-widest"
              >
                CANCELAR Y VOLVER AL INICIO
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
