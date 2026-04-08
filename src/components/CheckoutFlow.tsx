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
  Loader2,
  Building2,
  Receipt,
  Banknote,
  AlertCircle,
  QrCode,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';
import OpenPayForm from './Checkout/OpenPayForm';
import TicketCarnet from './Checkout/TicketCarnet';
import { openPayService } from '../services/openpayService';

interface CheckoutFlowProps {
  onComplete: () => void;
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
}

interface BillingInfo {
  requiresInvoice: boolean;
  rfc: string;
  razonSocial: string;
  cp: string;
  regimenFiscal: string;
  email: string;
  formaPago: string;
  usoCfdi: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
}

export default function CheckoutFlow({ onComplete }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  
  // Selections
  const [selectedType, setSelectedType] = useState<string>('general');
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: '', email: '', phone: '' }]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [showOpenPayForm, setShowOpenPayForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [finalTickets, setFinalTickets] = useState<any[]>([]);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  
  // Billing
  const [billing, setBilling] = useState<BillingInfo>({
    requiresInvoice: false,
    rfc: '',
    razonSocial: '',
    cp: '',
    regimenFiscal: '601', // General de Ley Personas Morales
    email: '',
    formaPago: '03', // Transferencia electrónica de fondos
    usoCfdi: 'G03' // Gastos en general
  });

  const currentType = ticketTypes.find(t => t.id === selectedType);
  const totalAmount = (currentType?.price || 0) * quantity;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: ttData } = await supabase.from('ticket_types').select('*').eq('active', true);
      if (ttData) setTicketTypes(ttData);

      const { data: sData } = await supabase.from('settings').select('*').eq('key', 'bank_details').single();
      if (sData) setBankDetails(sData.value);
    } catch (err) {
      console.error(err);
    }
  }

  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    const newAttendees = Array.from({ length: val }, (_, i) => 
      attendees[i] || { name: '', email: '', phone: '' }
    );
    setAttendees(newAttendees);
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
    const newAttendees = [...attendees];
    let sanitizedValue = value;
    
    // Auto-sanitizar teléfono: solo números, max 10 dígitos
    if (field === 'phone') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    newAttendees[index] = { ...newAttendees[index], [field]: sanitizedValue };
    setAttendees(newAttendees);
  };


  const validateAttendees = () => {
    return attendees.every(a => a.name.trim() && a.email.trim() && a.phone.trim());
  };

  const validateBilling = () => {
    if (!billing.requiresInvoice) return true;
    return billing.rfc && billing.razonSocial && billing.cp && billing.email;
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const isFree = (currentType?.price || 0) === 0;
      const status = isFree || paymentMethod === 'card' ? 'completed' : 'pending_verification';
      const ticketStatus = isFree || paymentMethod === 'card' ? 'active' : 'pending';

      const { data: purchase, error: pError } = await supabase
        .from('purchases')
        .insert([{
          buyer_name: attendees[0].name,
          buyer_email: attendees[0].email,
          total_amount: totalAmount,
          payment_method: isFree ? 'free' : paymentMethod,
          status: status,
          billing_info: billing.requiresInvoice ? billing : {}
        }])
        .select()
        .single();

      if (pError) throw pError;

      const ticketsToInsert = attendees.map(attendee => {
        const ticketId = Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
          id: ticketId,
          purchase_id: purchase.id,
          attendee_name: attendee.name,
          attendee_email: attendee.email,
          attendee_phone: attendee.phone,
          type: selectedType,
          qr_code: ticketId,
          status: ticketStatus
        };
      });

      const { error: tError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert);

      if (tError) throw tError;

      setFinalTickets(ticketsToInsert);
      setPurchaseId(purchase.id);
      toast.success(paymentMethod === 'card' ? '¡Pago exitoso!' : 'Registro recibido. Pendiente de verificación.');
      setStep(4); // Now step 4 is success
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Mapping internal steps to progress bar dots
  // Internal: 1 (Tickets), 2 (Registro), 3 (Pago), 4 (Exito)
  const progressStep = step;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Progress Bar - Simplified to 3 main phases */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-16 relative px-10 md:px-20">
          <div className="absolute top-1/2 left-10 md:left-20 right-10 md:right-20 h-1 bg-white/5 -translate-y-1/2 z-0"></div>
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-xl ${
                step >= s ? 'premium-gradient-orange text-white scale-110 shadow-orange-500/20' : 'bg-slate-900 text-slate-500'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter w-max transition-colors ${step >= s ? 'text-orange-500' : 'text-slate-600'}`}>
                {s === 1 ? 'Carnets' : s === 2 ? 'Registro' : 'Pago'}
              </span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: SELECT CARNETS */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Selecciona tus <span className="text-orange-500">Carnets</span></h2>
              <p className="text-slate-400 font-medium italic">Empodera tu futuro en el Encuentro Jóvenes Coparmex.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ticketTypes.filter(t => ['general', 'prueba'].includes(t.id)).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`premium-card text-left transition-all relative overflow-hidden group ${selectedType === type.id ? 'border-orange-500 shadow-orange-500/10 scale-[1.02]' : 'hover:border-white/20'}`}
                >
                  {selectedType === type.id && (
                    <div className="absolute top-0 right-0 w-24 h-24 premium-gradient-orange opacity-10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                  )}
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-orange-500 transition-colors">{type.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">Válido para acceso total a conferencias, conversatorios y after</p>
                  <p className="text-orange-500 font-black text-3xl mt-6">${type.price.toLocaleString()} <span className="text-xs uppercase text-slate-500 font-bold">MXN</span></p>
                </button>
              ))}
            </div>

            <div className="premium-card flex flex-col md:flex-row items-center justify-between gap-8 border-white/5 bg-white/[0.02]">
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight">Cantidad de Personas</h4>
                <p className="text-slate-500 text-sm mt-1">Puedes registrar hasta 10 asistentes por compra.</p>
              </div>
              <div className="flex items-center gap-8 bg-black/40 p-4 rounded-3xl border border-white/5">
                <button 
                  onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-2xl font-black"
                >
                  -
                </button>
                <span className="text-4xl font-black w-14 text-center text-glow-orange">{quantity}</span>
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
                className="premium-button premium-gradient-orange text-white px-10 py-5 text-xl group"
              >
                Siguiente Paso <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ATTENDEE DATA & OPTIONAL BILLING */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Datos de <span className="text-orange-500">{showBillingForm ? 'Facturación' : 'Registro'}</span></h2>
              <p className="text-slate-400 font-medium">Información individual de cada asistente.</p>
            </div>

            <div className="space-y-8">
              {!showBillingForm ? (
                <>
                  {attendees.map((attendee, i) => (
                    <motion.div layout key={i} className="premium-card space-y-8 border-white/10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-orange-500 font-black uppercase text-xs tracking-[0.4em] flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          Asistente #{i + 1}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Nombre Completo</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input 
                              type="text" 
                              value={attendee.name}
                              onChange={(e) => updateAttendee(i, 'name', e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-white"
                              placeholder="Como aparecerá en el carnet"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Correo Electrónico</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input 
                              type="email" 
                              value={attendee.email}
                              onChange={(e) => updateAttendee(i, 'email', e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-white"
                              placeholder="Para enviar el boleto digital"
                            />
                          </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Teléfono Celular</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input 
                              type="tel" 
                              value={attendee.phone}
                              onChange={(e) => updateAttendee(i, 'phone', e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-white"
                              placeholder="WhatsApp para notificaciones importantes"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="flex flex-col md:flex-row gap-6 pt-12 border-t border-white/5">
                    {currentType?.price !== 0 && (
                      <div className="flex-1 space-y-4">
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">¿Necesitas Factura?</h4>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium">Si requieres comprobante fiscal, selecciona esta opción para ingresar tus datos.</p>
                        <button 
                          disabled={!validateAttendees()}
                          onClick={() => {
                            setBilling({...billing, requiresInvoice: true});
                            setShowBillingForm(true);
                          }}
                          className="w-full premium-button bg-white/5 border border-white/10 text-white px-8 py-5 text-lg font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3 group disabled:opacity-30"
                        >
                          SÍ, LLENAR DATOS DE FACTURACIÓN
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}

                    {currentType?.price !== 0 && <div className="w-px bg-white/5 hidden md:block" />}

                    <div className="flex-1 flex flex-col justify-end gap-4">
                      <p className="text-slate-500 text-xs leading-relaxed font-medium md:text-right">
                        {currentType?.price === 0 
                          ? 'Al ser un registro gratuito, puedes finalizar directamente.'
                          : 'Al continuar sin factura, irás directamente a la selección del método de pago.'}
                      </p>
                      <button 
                        disabled={!validateAttendees()}
                        onClick={() => {
                          setBilling({...billing, requiresInvoice: false});
                          if (currentType?.price === 0) {
                            handleFinalSubmit();
                          } else {
                            setStep(3);
                          }
                        }}
                        className="w-full premium-button premium-gradient-orange text-white px-8 py-5 text-lg font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                      >
                        {currentType?.price === 0 ? 'FINALIZAR REGISTRO' : 'NO, IR AL PAGO'}
                        {currentType?.price === 0 ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-card space-y-10 border-orange-500/20 bg-orange-500/5 shadow-2xl shadow-orange-500/5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-orange-500 font-black uppercase text-xs tracking-[0.4em] flex items-center gap-3">
                      <Receipt className="w-4 h-4" />
                      Información Fiscal
                    </h4>
                    <button 
                      onClick={() => setShowBillingForm(false)}
                      className="text-[10px] uppercase font-black text-slate-500 hover:text-white transition-colors underline underline-offset-4"
                    >
                      Regresar a Registro
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">RFC</label>
                      <input 
                        type="text" 
                        value={billing.rfc}
                        onChange={(e) => setBilling({...billing, rfc: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-black"
                        placeholder="XAXX010101000"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Razón Social</label>
                      <input 
                        type="text" 
                        value={billing.razonSocial}
                        onChange={(e) => setBilling({...billing, razonSocial: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-black"
                        placeholder="EMPRESA S.A. DE C.V."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Código Postal</label>
                      <input 
                        type="text" 
                        value={billing.cp}
                        maxLength={5}
                        onChange={(e) => setBilling({...billing, cp: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-black"
                        placeholder="83000"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Régimen Fiscal</label>
                      <select 
                        value={billing.regimenFiscal}
                        onChange={(e) => setBilling({...billing, regimenFiscal: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-bold"
                      >
                        <option value="601">601 - General de Ley Personas Morales</option>
                        <option value="602">602 - Régimen Simplificado de Ley Personas Morales</option>
                        <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                        <option value="604">604 - Régimen de Pequeños Contribuyentes</option>
                        <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                        <option value="606">606 - Régimen de Arrendamiento</option>
                        <option value="607">607 - Régimen de Enajenación o Adquisición de Bienes</option>
                        <option value="608">608 - Régimen de los Demás Ingresos</option>
                        <option value="609">609 - Régimen de Consolidación</option>
                        <option value="610">610 - Residentes en el Extranjero sin Establecimiento Permanente en México</option>
                        <option value="611">611 - Ingresos por Dividendos (Socios y Accionistas)</option>
                        <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                        <option value="613">613 - Régimen Intermedio de las Personas Físicas con Actividades Empresariales</option>
                        <option value="614">614 - Ingresos por Intereses</option>
                        <option value="615">615 - Ingresos por Obtención de Premios</option>
                        <option value="616">616 - Sin Obligaciones Fiscales</option>
                        <option value="617">617 - PEMEX</option>
                        <option value="618">618 - Régimen Simplificado de Ley Personas Físicas</option>
                        <option value="619">619 - Ingresos por la Obtención de Préstamos</option>
                        <option value="620">620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos</option>
                        <option value="621">621 - Régimen de Incorporación Fiscal</option>
                        <option value="622">622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras PM</option>
                        <option value="623">623 - Opcional para Grupos de Sociedades</option>
                        <option value="624">624 - Régimen de los Coordinados</option>
                        <option value="625">625 - Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                        <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                      </select>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 italic">Correo para Facturación</label>
                      <input 
                        type="email" 
                        value={billing.email}
                        onChange={(e) => setBilling({...billing, email: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-bold"
                        placeholder="facturacion@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-orange-500/10">
                    <button 
                      disabled={!validateBilling()}
                      onClick={() => setStep(3)}
                      className="w-full premium-button premium-gradient-orange text-white px-8 py-5 text-xl font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                    >
                      CONTINUAR AL PAGO
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-start pt-8">
              {!showBillingForm && (
                <button 
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-white flex items-center gap-3 transition-all font-black uppercase text-xs tracking-widest"
                >
                  <ArrowLeft className="w-5 h-5" /> Regresar
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: PAYMENT SELECTION */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Finaliza tu <span className="text-orange-500">Compra</span></h2>
              <p className="text-slate-400 font-medium">Selecciona el método que prefieras.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="md:col-span-1 space-y-6">
                <div className="premium-card bg-white/[0.02] border-white/5 space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Resumen de Orden</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">{quantity}x {currentType?.name}</span>
                      <span className="font-black">${(quantity * (currentType?.price || 0)).toLocaleString()}</span>
                    </div>
                    {billing.requiresInvoice && (
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>IVA incluido (16%)</span>
                        <span className="font-bold">${((quantity * (currentType?.price || 0)) * 0.16).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center text-2xl font-black text-orange-500">
                      <span>Total</span>
                      <span>${(quantity * (currentType?.price || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-white/5 rounded-3xl bg-black/40 space-y-3">
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Las transacciones serán efectuadas mediante la pasarela de Openpay.
                  </p>
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Al proceder con el pago, aceptas los términos y condiciones del evento Encuentro Jóvenes Coparmex 2026.
                  </p>
                </div>
              </div>

              {/* Payment Methods / Forms */}
              <div className="md:col-span-2 space-y-6">
                {showOpenPayForm ? (
                  <OpenPayForm 
                    amount={(quantity * (currentType?.price || 0))}
                    description={`${quantity}x ${currentType?.name} - Encuentro Coparmex`}
                    customer={attendees[0]}
                    onSuccess={(transactionId) => {
                      console.log("Pago exitoso. ID:", transactionId);
                      handleFinalSubmit();
                    }}
                    onCancel={() => setShowOpenPayForm(false)}
                  />
                ) : (
                  <>
                    <button 
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full premium-card flex items-center gap-6 text-left transition-all relative overflow-hidden group ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight italic">Tarjeta Crédito / Débito</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Pago seguro vía OpenPay (BBVA)</p>
                      </div>
                      {paymentMethod === 'card' && <CheckCircle2 className="absolute top-6 right-6 text-orange-500 w-6 h-6" />}
                    </button>

                    <button 
                      onClick={() => setPaymentMethod('transfer')}
                      className={`w-full premium-card flex items-center gap-6 text-left transition-all relative overflow-hidden group ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'transfer' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                        <Banknote className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight italic">Transferencia SPEI</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Verificación manual (24-48 hrs)</p>
                      </div>
                      {paymentMethod === 'transfer' && <CheckCircle2 className="absolute top-6 right-6 text-blue-500 w-6 h-6" />}
                    </button>

                    {paymentMethod === 'transfer' && bankDetails && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 bg-black/40 border border-blue-500/30 rounded-[2.5rem] space-y-6"
                      >
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Datos Bancarios</h5>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div>
                            <p className="text-slate-500 uppercase text-[9px] font-black tracking-widest mb-1">Banco</p>
                            <p className="font-bold text-white text-lg">{bankDetails.banco}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 uppercase text-[9px] font-black tracking-widest mb-1">CLABE</p>
                            <p className="font-bold text-white text-lg">{bankDetails.clabe}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-500 uppercase text-[9px] font-black tracking-widest mb-1">Titular</p>
                            <p className="font-bold text-white">{bankDetails.titular}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-between pt-8 items-center">
                      <button 
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="text-slate-500 hover:text-white flex items-center gap-3 transition-all font-black uppercase text-xs tracking-widest"
                      >
                        <ArrowLeft className="w-5 h-5" /> Regresar
                      </button>
                      <button 
                        onClick={() => {
                          if (paymentMethod === 'card') {
                            // Guardar estado crítico en sessionStorage antes de iniciar pago (3DS)
                            const checkoutState = {
                              attendees,
                              selectedType,
                              quantity,
                              billing,
                              paymentMethod
                            };
                            sessionStorage.setItem('checkout_state', JSON.stringify(checkoutState));
                            setShowOpenPayForm(true);
                          } else {
                            handleFinalSubmit();
                          }
                        }}
                        disabled={loading}
                        className={`premium-button px-12 py-5 text-2xl font-black transition-all ${paymentMethod === 'card' ? 'premium-gradient-orange' : 'premium-gradient-blue'} text-white flex items-center gap-4`}
                      >
                        {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : 
                         paymentMethod === 'card' ? 'CONFIGURAR PAGO' : 'ENVIAR REGISTRO'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 space-y-12"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-orange-500/30">
                <CheckCircle2 className="w-12 h-12 text-orange-500" />
              </div>
              <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-10 -z-10 rounded-full" />
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
                {paymentMethod === 'card' ? '¡Tu acceso está ' : 'Registro '}<span className="text-orange-500">{paymentMethod === 'card' ? 'LISTO!' : 'RECIBIDO'}</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                {paymentMethod === 'card' ? 
                  'Aquí tienes tus carnets digitales. Puedes descargarlos individualmente ahora mismo.' : 
                  'Una vez que realices la transferencia y la validemos, tus carnets aparecerán activos en tu cuenta.'}
              </p>
            </div>

            {paymentMethod === 'card' && finalTickets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 pt-12 max-w-4xl mx-auto">
                {finalTickets.map((ticket, i) => (
                  <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <TicketCarnet 
                      ticket={{
                        ...ticket,
                        type: ticket.type || selectedType 
                      }} 
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="pt-16 flex flex-col md:flex-row justify-center gap-6">
              <button onClick={onComplete} className="px-12 py-5 rounded-[2rem] border border-white/10 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                VOLVER AL INICIO
              </button>
              {paymentMethod === 'transfer' && (
                <button onClick={() => window.print()} className="px-12 py-5 rounded-[2rem] border border-white/10 text-slate-400 font-black uppercase tracking-widest text-xs">
                  IMPRIMIR DATOS BANCARIOS
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
