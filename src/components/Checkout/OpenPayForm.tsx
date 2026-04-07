import React, { useState, useEffect } from 'react';
import { CreditCard, User, Calendar, Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { openPayService } from '../../services/openpayService';

interface OpenPayFormProps {
  amount: number;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

const OpenPayForm: React.FC<OpenPayFormProps> = ({ amount, description, customer, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceSessionId, setDeviceSessionId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    holder_name: '',
    card_number: '',
    expiration: '', // MM/AA
    cvv2: ''
  });

  // Logos URLs localizados previamente
  const LOGOS = {
    openpay: 'https://logos-download.com/wp-content/uploads/2016/09/Openpay_logo.png',
    visa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Visa_2021.svg/1200px-Visa_2021.svg.png',
    mastercard: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png',
    amex: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png'
  };

  useEffect(() => {
    const initAntiFraud = async () => {
      try {
        const id = await openPayService.getDeviceSessionId('openpay-form');
        setDeviceSessionId(id);
      } catch (err) {
        console.error('Anti-fraud init failed:', err);
      }
    };
    initAntiFraud();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validaciones de entrada en tiempo real según checklist BBVA
    if (name === 'card_number') {
      const sanitized = value.replace(/\D/g, '').slice(0, 16);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else if (name === 'cvv2') {
      const sanitized = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else if (name === 'expiration') {
      let sanitized = value.replace(/\D/g, '');
      if (sanitized.length >= 2) {
        sanitized = sanitized.slice(0, 2) + '/' + sanitized.slice(2, 4);
      }
      setFormData(prev => ({ ...prev, [name]: sanitized.slice(0, 5) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Evitar pagos duplicados (Checklist BBVA)

    setLoading(true);
    setError(null);

    try {
      const [month, year] = formData.expiration.split('/');
      
      const tokenId = await openPayService.createToken({
        holder_name: formData.holder_name,
        card_number: formData.card_number,
        expiration_month: month,
        expiration_year: year,
        cvv2: formData.cvv2
      });

      // Llamada real a la Edge Function de Supabase
      const { data, error: funcError } = await supabase.functions.invoke('process-payment', {
        body: {
          token_id: tokenId,
          device_session_id: deviceSessionId,
          amount: amount,
          description: description,
          customer: {
            name: customer.name,
            email: customer.email,
            phone_number: customer.phone.replace(/\D/g, '') // OpenPay requiere formato numérico
          }
        }
      });

      if (funcError || !data || data.error) {
        throw data || funcError || new Error("Error en el servidor de pagos");
      }

      console.log('✅ Pago procesado exitosamente:', data.transaction_id);
      
      onSuccess(data.transaction_id);
      setLoading(false);

    } catch (err: any) {
      setLoading(false);
      console.error('Payment Error:', err);
      
      // Mapeo de errores de la Edge Function o OpenPay
      const errorCode = err.code || err.error_code || 0;
      if (errorCode === 3001) {
        setError("Tarjeta rechazada: El pago no pudo ser realizado, intenta de nuevo.");
      } else if (errorCode === 3002) {
        setError("Tarjeta expirada. Por favor usa otra tarjeta.");
      } else if (errorCode === 3003) {
        setError("Fondos insuficientes: Tu pago no pudo ser realizado. Intenta con otra tarjeta.");
      } else {
        setError("Ocurrió un error, intenta de nuevo o comunícate con tu banco.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="premium-card relative overflow-hidden">
        {/* Banner de Seguridad */}
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <ShieldCheck size={80} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl text-white">Pago con Tarjeta</h3>
          <img src={LOGOS.openpay} alt="OpenPay" className="h-6 opacity-80" />
        </div>

        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-sm text-white/60 mb-1">Total a pagar:</div>
          <div className="text-3xl font-bold text-[#FF5100] tracking-tight">
            ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </div>
          <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">{description}</div>
        </div>

        <form id="openpay-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-white/50 ml-1 mb-2 block">Nombre del Titular</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-white/30" size={18} />
              <input
                type="text"
                name="holder_name"
                required
                placeholder="Como aparece en la tarjeta"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[#FF5100]/50 focus:ring-0 transition-all outline-none"
                value={formData.holder_name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-white/50 ml-1 mb-2 block">Número de Tarjeta</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-3 text-white/30" size={18} />
              <input
                type="text"
                name="card_number"
                required
                placeholder="0000 0000 0000 0000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[#FF5100]/50 focus:ring-0 transition-all outline-none font-mono tracking-wider"
                value={formData.card_number}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 ml-1 mb-2 block">Expiración</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 text-white/30" size={18} />
                <input
                  type="text"
                  name="expiration"
                  required
                  placeholder="MM/AA"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[#FF5100]/50 focus:ring-0 transition-all outline-none"
                  value={formData.expiration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 ml-1 mb-2 block">CVV</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-white/30" size={18} />
                <input
                  type="password"
                  name="cvv2"
                  required
                  placeholder="123"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[#FF5100]/50 focus:ring-0 transition-all outline-none"
                  value={formData.cvv2}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-shake">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full premium-button premium-gradient-orange text-white shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 h-14 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando pago...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Pagar Ahora</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full text-white/40 text-sm hover:text-white transition-colors py-2 uppercase tracking-widest"
            >
              Cancelar y volver
            </button>
          </div>

          {/* Logos de Certificación */}
          <div className="flex justify-center items-center gap-6 pt-6 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
            <img src={LOGOS.visa} alt="Visa" className="h-4" />
            <img src={LOGOS.mastercard} alt="Mastercard" className="h-6" />
            <img src={LOGOS.amex} alt="American Express" className="h-5" />
          </div>
          
          <div className="text-[10px] text-center text-white/20 uppercase tracking-widest pt-2">
            Transacciones seguras procesadas por OpenPay by BBVA
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenPayForm;
