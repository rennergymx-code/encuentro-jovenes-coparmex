import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';

interface CheckoutFlowProps {
  onComplete: () => void;
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
}

export default function CheckoutFlow({ onComplete }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: '', email: '', phone: '' }]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    const newAttendees = Array.from({ length: val }, (_, i) => 
      attendees[i] || { name: '', email: '', phone: '' }
    );
    setAttendees(newAttendees);
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const validateStep2 = () => {
    return attendees.every(a => a.name && a.email && a.phone);
  };

  const handlePayment = async () => {
    if (!session) {
      toast.error('Debes iniciar sesión para comprar boletos');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Purchase record in Supabase
      const { data: purchase, error: pError } = await supabase
        .from('purchases')
        .insert([{
          buyer_name: session.user.user_metadata?.full_name || 'Usuario',
          buyer_email: session.user.email,
          total_tickets: quantity,
          amount: quantity * 500,
          status: 'completed'
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Create individual Tickets
      const ticketsToInsert = attendees.map(attendee => {
        const ticketId = Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
          id: ticketId,
          purchase_id: purchase.id,
          attendee_name: attendee.name,
          attendee_email: attendee.email,
          attendee_phone: attendee.phone,
          qr_code: `TICKET-${ticketId}`,
          status: 'pending',
          type: 'general'
        };
      });

      const { error: tError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert);

      if (tError) throw tError;

      toast.success('¡Compra exitosa! Tus boletos han sido generados.');
      setStep(4);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 z-0"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-xl ${
              step >= s ? 'premium-gradient-orange text-white scale-110 shadow-orange-500/20' : 'bg-slate-900 text-slate-500'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Selecciona tus <span className="text-orange-500">Carnets</span></h2>
              <p className="text-slate-400 font-medium">Cada carnet es personal e intransferible.</p>
            </div>

            <div className="premium-card flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Acceso General</h3>
                <p className="text-slate-400 text-sm font-medium">Incluye todas las conferencias y networking.</p>
                <p className="text-orange-500 font-black text-3xl mt-4">$500 MXN</p>
              </div>
              <div className="flex items-center gap-8 bg-black/20 p-4 rounded-3xl border border-white/5">
                <button 
                  onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-2xl font-black"
                >
                  -
                </button>
                <span className="text-4xl font-black w-12 text-center text-glow-orange">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(Math.min(10, quantity + 1))}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-2xl font-black"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button 
                onClick={() => setStep(2)}
                className="premium-button premium-gradient-orange text-white"
              >
                Siguiente Paso <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Datos de <span className="text-orange-500">Asistentes</span></h2>
              <p className="text-slate-400 font-medium">Ingresa la información de cada persona que asistirá.</p>
            </div>

            <div className="space-y-8">
              {attendees.map((attendee, i) => (
                <div key={i} className="premium-card space-y-8">
                  <h4 className="text-orange-500 font-black uppercase text-xs tracking-[0.3em]">Asistente #{i + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="text" 
                          value={attendee.name}
                          onChange={(e) => updateAttendee(i, 'name', e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-white"
                          placeholder="Juan Pérez"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="email" 
                          value={attendee.email}
                          onChange={(e) => updateAttendee(i, 'email', e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-white"
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="tel" 
                          value={attendee.phone}
                          onChange={(e) => updateAttendee(i, 'phone', e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-white"
                          placeholder="662 123 4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-8">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Regresar
              </button>
              <button 
                disabled={!validateStep2()}
                onClick={() => setStep(3)}
                className="bg-[#ff4e00] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar al Pago <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Finalizar <span className="text-[#ff4e00]">Pago</span></h2>
              <p className="text-gray-400">Procesado de forma segura por OpenPay.</p>
            </div>

            <div className="bg-[#111] p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-white/10">
                <span className="text-gray-400 uppercase text-sm font-bold">Resumen</span>
                <span className="text-xl font-black">{quantity} Carnet(s)</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black">
                <span>Total</span>
                <span className="text-[#ff4e00]">${quantity * 500} MXN</span>
              </div>

              <div className="pt-6 space-y-4">
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                  <CreditCard className="text-[#ff4e00] w-6 h-6" />
                  <div className="flex-1">
                    <p className="text-sm font-bold uppercase tracking-tight">Tarjeta de Crédito / Débito</p>
                    <p className="text-xs text-gray-500">Aceptamos Visa, Mastercard y American Express</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center italic">
                  Al hacer clic en "Pagar", aceptas los términos y condiciones del evento.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <button 
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" /> Regresar
              </button>
              <button 
                onClick={handlePayment}
                disabled={loading}
                className="bg-[#ff4e00] text-white px-12 py-5 rounded-full font-black text-xl uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pagar Ahora'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="w-24 h-24 bg-[#ff4e00] rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,78,0,0.5)]">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter">¡Wow, ya tienes tu <span className="text-[#ff4e00]">Boleto!</span></h2>
              <p className="text-xl text-gray-400 max-w-md mx-auto">
                Tus accesos han sido enviados a tu correo electrónico y también puedes verlos en la sección "Mis Boletos".
              </p>
            </div>
            <button 
              onClick={onComplete}
              className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#ff4e00] hover:text-white transition-all"
            >
              Ver mis boletos
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
