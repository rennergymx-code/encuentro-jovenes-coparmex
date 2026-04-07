import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  Save, 
  Loader2, 
  AlertCircle,
  Building2,
  FileText,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { toast } from 'sonner';

interface BankDetails {
  banco: string;
  clabe: string;
  titular: string;
  instrucciones: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
}

export default function ConfigTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    banco: '',
    clabe: '',
    titular: '',
    instrucciones: ''
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'bank_details')
        .single();
      
      if (settingsData) {
        setBankDetails(settingsData.value);
      }

      const { data: ttData } = await supabase
        .from('ticket_types')
        .select('*')
        .order('price', { ascending: false });
      
      if (ttData) {
        setTicketTypes(ttData);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }

  async function saveBankDetails() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'bank_details',
          value: bankDetails,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Datos bancarios actualizados');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar datos bancarios');
    } finally {
      setSaving(false);
    }
  }

  async function updateTicketPrice(id: string, price: number) {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .update({ price })
        .eq('id', id);

      if (error) throw error;
      toast.success('Precio actualizado');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar precio');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Ticket Prices Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
          <h3 className="text-xl font-black uppercase tracking-tighter">Precios de <span className="text-orange-500">Carnets</span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ticketTypes.map((type) => (
            <div key={type.id} className="premium-card space-y-6 group hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black uppercase tracking-tight text-slate-200">{type.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{type.id}</p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Precio actual (MXN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                  <input 
                    type="number"
                    value={type.price}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value) || 0;
                      setTicketTypes(prev => prev.map(t => t.id === type.id ? { ...t, price: newPrice } : t));
                    }}
                    onBlur={(e) => updateTicketPrice(type.id, parseFloat(e.target.value))}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-10 pr-4 focus:border-orange-500 outline-none transition-all font-black text-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bank Details Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
          <h3 className="text-xl font-black uppercase tracking-tighter">Datos para <span className="text-blue-500">Transferencias</span></h3>
        </div>

        <div className="premium-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Institución Bancaria</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={bankDetails.banco}
                  onChange={(e) => setBankDetails({...bankDetails, banco: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all font-medium text-white"
                  placeholder="Ej. BBVA"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">CLABE Interbancaria</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={bankDetails.clabe}
                  onChange={(e) => setBankDetails({...bankDetails, clabe: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all font-medium text-white"
                  placeholder="012XXXXXXXXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Titular de la Cuenta</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={bankDetails.titular}
                  onChange={(e) => setBankDetails({...bankDetails, titular: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all font-medium text-white"
                  placeholder="Nombre de la empresa o persona"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Instrucciones Adicionales</label>
              <div className="relative">
                <AlertCircle className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <textarea 
                  value={bankDetails.instrucciones}
                  onChange={(e) => setBankDetails({...bankDetails, instrucciones: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all font-medium text-white min-h-[100px]"
                  placeholder="Ej. Enviar comprobante a correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button 
              onClick={saveBankDetails}
              disabled={saving}
              className="premium-button premium-gradient-blue text-white flex items-center gap-3 active:scale-95"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Configuración Bancaria
            </button>
          </div>
        </div>
      </section>

      {/* Info Card */}
      <div className="p-8 bg-orange-500/5 rounded-[2rem] border border-orange-500/10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center shrink-0">
          <AlertCircle className="text-orange-500 w-8 h-8" />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h4 className="text-lg font-black uppercase tracking-tighter">Nota sobre los precios</h4>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Los cambios en los precios se reflejarán instantáneamente en el flujo de compra. Los carnets marcados como <span className="text-orange-300 font-bold">VIP</span> se mantienen como cortesía (precio $0) por defecto.
          </p>
        </div>
      </div>
    </div>
  );
}
