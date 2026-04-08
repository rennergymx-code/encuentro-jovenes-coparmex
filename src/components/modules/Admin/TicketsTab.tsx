import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Download, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  History,
  Edit3,
  CreditCard,
  Banknote,
  UserCheck,
  Filter,
  RefreshCw,
  Receipt,
  QrCode,
  Loader2
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { toast } from 'sonner';
import AdminModal from './AdminModal';
import { QRCodeCanvas } from 'qrcode.react';

interface TicketsTabProps {
  tickets: any[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onRefresh: () => void;
}

export default function TicketsTab({ tickets, searchTerm, setSearchTerm, onRefresh }: TicketsTabProps) {
  const [view, setView] = useState<'tickets' | 'purchases'>('tickets');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [editForm, setEditForm] = useState({ attendee_name: '', attendee_email: '', type: 'general' });
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<any | null>(null);
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<any | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [createForm, setCreateForm] = useState({ 
    attendee_name: '', 
    attendee_email: '', 
    attendee_phone: '',
    type: 'general' 
  });

  useEffect(() => {
    if (view === 'purchases') {
      fetchPurchases();
    }
  }, [view]);

  async function fetchPurchases() {
    setLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPurchases(data || []);
    } catch (err: any) {
      toast.error('Error al cargar compras: ' + err.message);
    } finally {
      setLoadingPurchases(false);
    }
  }

  const openEdit = (t: any) => {
    setEditingTicket(t);
    setEditForm({ attendee_name: t.attendee_name || '', attendee_email: t.attendee_email || '', type: t.type || 'general' });
  };

  const handleSaveEdit = async () => {
    if (!editingTicket) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update(editForm)
        .eq('id', editingTicket.id);
      if (error) throw error;
      toast.success('Boleto actualizado correctamente');
      setEditingTicket(null);
      onRefresh();
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const authorizePurchase = async (purchase: any) => {
    setIsAuthorizing(purchase.id);
    try {
      // 1. Update purchase status
      const { error: pError } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', purchase.id);
      
      if (pError) throw pError;

      // 2. Activate all associated tickets
      const { error: tError } = await supabase
        .from('tickets')
        .update({ status: 'active' })
        .eq('purchase_id', purchase.id);
      
      if (tError) throw tError;

      toast.success('Compra autorizada y boletos activados');
      fetchPurchases();
      onRefresh();
    } catch (err: any) {
      toast.error('Error al autorizar: ' + err.message);
    } finally {
      setIsAuthorizing(null);
    }
  };

  const handleManualCreate = async () => {
    if (!createForm.attendee_name || !createForm.attendee_email) {
      toast.error('Nombre y Correo son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create a "manual" purchase
      const { data: purchase, error: pError } = await supabase
        .from('purchases')
        .insert([{
          buyer_name: createForm.attendee_name,
          buyer_email: createForm.attendee_email,
          total_amount: 0,
          payment_method: 'admin_manual',
          status: 'completed'
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Create the ticket
      const ticketId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error: tError } = await supabase
        .from('tickets')
        .insert([{
          id: ticketId,
          purchase_id: purchase.id,
          attendee_name: createForm.attendee_name,
          attendee_email: createForm.attendee_email,
          attendee_phone: createForm.attendee_phone,
          type: createForm.type,
          qr_code: ticketId,
          status: 'active'
        }]);

      if (tError) throw tError;

      toast.success('Carnet creado exitosamente');
      setIsCreatingTicket(false);
      setCreateForm({ attendee_name: '', attendee_email: '', attendee_phone: '', type: 'general' });
      onRefresh();
    } catch (err: any) {
      toast.error('Error al crear carnet: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.attendee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.attendee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCheckIn = async (ticket: any) => {
    if (ticket.status === 'pending') {
      toast.error('Este boleto no ha sido pagado o verificado');
      return;
    }

    const newStatus = ticket.status === 'scanned' ? 'active' : 'scanned';
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          scanned_at: newStatus === 'scanned' ? new Date().toISOString() : null
        })
        .eq('id', ticket.id);

      if (error) throw error;
      
      toast.success(newStatus === 'scanned' ? 'Ingreso registrado correctamente' : 'Estado restaurado a activo');
      onRefresh();
    } catch (err: any) {
      toast.error('Error al actualizar estado: ' + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanned': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'active': return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">
              Gestión de {view === 'tickets' ? <span className="text-orange-500">Boletos</span> : <span className="text-blue-500">Compras</span>}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {view === 'tickets' ? 'Control de asistentes y validación manual' : 'Autorización de pagos y facturación'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 h-14">
              <button 
                onClick={() => setView('tickets')}
                className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'tickets' ? 'premium-gradient-orange text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Asistentes
              </button>
              <button 
                onClick={() => setView('purchases')}
                className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'purchases' ? 'premium-gradient-blue text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Pagos
              </button>
            </div>

            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium h-14"
              />
            </div>

            <button 
              onClick={() => setIsCreatingTicket(true)}
              className="premium-button premium-gradient-orange text-white h-14 px-6 flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span className="hidden sm:inline">Crear Carnet</span>
            </button>
          </div>
        </div>

        {view === 'tickets' ? (
          <div className="premium-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-glow-white/10">
                  <tr>
                    <th className="px-8 py-6">ID / Ticket</th>
                    <th className="px-8 py-6">Asistente</th>
                    <th className="px-8 py-6">Tipo</th>
                    <th className="px-8 py-6">Estatus</th>
                    <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs text-orange-500 font-black tracking-widest">{t.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold uppercase tracking-tight">{t.attendee_name}</div>
                        <div className="text-xs text-slate-500 font-medium">{t.attendee_email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">
                          {t.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleCheckIn(t)}
                          disabled={t.status === 'pending'}
                          className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${
                            t.status === 'scanned' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : t.status === 'active'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {getStatusIcon(t.status)}
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {t.status === 'scanned' ? 'YA INGRESÓ' : t.status === 'active' ? 'ACTIVO' : 'PENDIENTE PAGO'}
                          </span>
                        </button>
                        {t.scanned_at && (
                          <p className="text-[8px] text-slate-500 mt-1 font-bold uppercase flex items-center gap-1 ml-1">
                            <History className="w-2.5 h-2.5" />
                            {new Date(t.scanned_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right space-x-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-3 bg-white/5 hover:bg-orange-500/20 rounded-xl transition-all text-slate-400 hover:text-orange-400"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedTicketForQR(t)}
                          className="p-3 bg-white/5 hover:bg-emerald-500/20 rounded-xl transition-all text-slate-400 hover:text-emerald-400"
                          title="Ver QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                          <Mail className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="premium-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-glow-white/10">
                  <tr>
                    <th className="px-8 py-6">Comprador</th>
                    <th className="px-8 py-6">Monto</th>
                    <th className="px-8 py-6">Método</th>
                    <th className="px-8 py-6">Estatus</th>
                    <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold uppercase tracking-tight">{p.buyer_name}</div>
                        <div className="text-xs text-slate-500 font-medium">{p.buyer_email}</div>
                      </td>
                      <td className="px-8 py-6 font-black text-white">${p.total_amount}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {p.payment_method === 'card' ? <CreditCard className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                          {p.payment_method === 'card' ? 'Tarjeta' : 'Transferencia'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          p.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {p.status === 'completed' ? 'Completado' : 'Pendiente Verificación'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        {p.status === 'pending_verification' && (
                          <button
                            onClick={() => authorizePurchase(p)}
                            disabled={isAuthorizing === p.id}
                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto"
                          >
                            {isAuthorizing === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Autorizar
                          </button>
                        )}
                        {p.billing_info && Object.keys(p.billing_info).length > 2 && (
                          <button 
                            onClick={() => setSelectedBilling(p)}
                            className="p-2 border border-white/10 hover:border-blue-500/50 rounded-xl text-slate-500 hover:text-blue-400 bg-white/5 transition-all" 
                            title="Ver datos de facturación"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loadingPurchases && (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        title="Editar Datos del Asistente"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nombre del Asistente</label>
            <input
              type="text"
              value={editForm.attendee_name}
              onChange={e => setEditForm(p => ({ ...p, attendee_name: e.target.value }))}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={editForm.attendee_email}
              onChange={e => setEditForm(p => ({ ...p, attendee_email: e.target.value }))}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipo de Carnet</label>
            <select
              value={editForm.type}
              onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
            >
              <option value="vip">VIP - Cortesía</option>
              <option value="general">Acceso General</option>
              <option value="estudiante">Estudiante</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditingTicket(null)}
              className="flex-1 py-3.5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all font-bold text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex-1 premium-button premium-gradient-orange text-white disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Billing Info Modal */}
      <AdminModal
        isOpen={!!selectedBilling}
        onClose={() => setSelectedBilling(null)}
        title="Datos de Facturación"
        maxWidth="max-w-md"
      >
        {selectedBilling && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Razón Social</p>
                <p className="text-sm font-bold text-white uppercase">{selectedBilling.billing_info.razonSocial || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">RFC</p>
                  <p className="text-sm font-bold text-white uppercase">{selectedBilling.billing_info.rfc || 'N/A'}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">CP</p>
                  <p className="text-sm font-bold text-white uppercase">{selectedBilling.billing_info.cp || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Correo Electrónico</p>
                <p className="text-sm font-bold text-white lowercase">{selectedBilling.billing_info.email || 'N/A'}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Régimen Fiscal</p>
                <p className="text-xs font-bold text-white uppercase">{selectedBilling.billing_info.regimenFiscal || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Forma de Pago</p>
                  <p className="text-xs font-bold text-white uppercase">{selectedBilling.billing_info.formaPago || 'N/A'}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Uso de CFDI</p>
                  <p className="text-xs font-bold text-white uppercase">{selectedBilling.billing_info.usoCFDI || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedBilling(null)}
                className="w-full py-4 rounded-2xl premium-gradient-blue text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        )}
      </AdminModal>
      
      {/* QR Code Modal */}
      <AdminModal
        isOpen={!!selectedTicketForQR}
        onClose={() => setSelectedTicketForQR(null)}
        title="Boleto Digital"
        maxWidth="max-w-md"
      >
        {selectedTicketForQR && (
          <div className="flex flex-col items-center space-y-8 py-4">
            <div className="text-center space-y-2">
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white">
                {selectedTicketForQR.attendee_name}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
                {selectedTicketForQR.type} • #{selectedTicketForQR.id}
              </p>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-orange-500/10 border-8 border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <QRCodeCanvas 
                id="ticket-qr"
                value={selectedTicketForQR.qr_code || selectedTicketForQR.id}
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/favicon.ico",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => {
                  const canvas = document.getElementById('ticket-qr') as HTMLCanvasElement;
                  const url = canvas.toDataURL("image/png");
                  const link = document.createElement('a');
                  link.download = `QR-Encuentro-${selectedTicketForQR.attendee_name.replace(/\s+/g, '-')}.png`;
                  link.href = url;
                  link.click();
                  toast.success('Código QR descargado');
                }}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={() => {
                  toast.info("Función de re-envío en desarrollo. Se integrará con servicio de correo.");
                  // Placeholder for mailto or API call
                }}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl premium-gradient-orange text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              >
                <Mail className="w-4 h-4" />
                Re-Enviar
              </button>
            </div>

            <button
              onClick={() => setSelectedTicketForQR(null)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Cerrar Ventana
            </button>
          </div>
        )}
      </AdminModal>

      {/* MODAL PARA CREAR CARNET MANUAL */}
      <AdminModal
        isOpen={isCreatingTicket}
        onClose={() => setIsCreatingTicket(false)}
        title="Crear Carnet Manual"
      >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Nombre Completo</label>
              <input 
                type="text" 
                value={createForm.attendee_name}
                onChange={(e) => setCreateForm({...createForm, attendee_name: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-bold"
                placeholder="Nombre del asistente"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={createForm.attendee_email}
                onChange={(e) => setCreateForm({...createForm, attendee_email: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-bold"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Teléfono (Opcional)</label>
              <input 
                type="text" 
                value={createForm.attendee_phone}
                onChange={(e) => setCreateForm({...createForm, attendee_phone: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-bold"
                placeholder="6621234567"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Tipo de Carnet</label>
              <select 
                value={createForm.type}
                onChange={(e) => setCreateForm({...createForm, type: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 px-5 focus:border-orange-500 outline-none text-white font-bold"
              >
                <option value="general">Acceso General</option>
                <option value="vip">VIP - CORTESÍA</option>
                <option value="medios">Medios</option>
                <option value="patrocinador">Patrocinador</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsCreatingTicket(false)}
                className="flex-1 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleManualCreate}
                disabled={isSaving}
                className="flex-[2] premium-button premium-gradient-orange text-white px-8 py-4 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Crear Carnet
              </button>
            </div>
          </div>
      </AdminModal>
    </>
  );
}
