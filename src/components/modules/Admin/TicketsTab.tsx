import React, { useState } from 'react';
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
  Edit3
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { toast } from 'sonner';
import AdminModal from './AdminModal';

interface TicketsTabProps {
  tickets: any[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onRefresh: () => void;
}

export default function TicketsTab({ tickets, searchTerm, setSearchTerm, onRefresh }: TicketsTabProps) {
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [editForm, setEditForm] = useState({ attendee_name: '', attendee_email: '', type: 'Personal' });
  const [isSaving, setIsSaving] = useState(false);

  const openEdit = (t: any) => {
    setEditingTicket(t);
    setEditForm({ attendee_name: t.attendee_name || '', attendee_email: t.attendee_email || '', type: t.type || 'Personal' });
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

  const filteredTickets = tickets.filter(t => 
    t.attendee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.attendee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCheckIn = async (ticket: any) => {
    const newStatus = ticket.status === 'scanned' ? 'pending' : 'scanned';
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          scanned_at: newStatus === 'scanned' ? new Date().toISOString() : null
        })
        .eq('id', ticket.id);

      if (error) throw error;
      
      toast.success(newStatus === 'scanned' ? 'Ingreso registrado manualmente' : 'Estado restaurado a pendiente');
      onRefresh();
    } catch (err: any) {
      toast.error('Error al actualizar estado: ' + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanned': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <>
      <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tighter">Base de Datos de <span className="text-orange-500">Boletos</span></h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión manual y respaldo de acceso</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-glow-white/10">
              <tr>
                <th className="px-8 py-6">ID / Ticket</th>
                <th className="px-8 py-6">Asistente</th>
                <th className="px-8 py-6">Tipo</th>
                <th className="px-8 py-6">Estatus Acceso</th>
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
                      {t.type || 'Personal'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleCheckIn(t)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${
                        t.status === 'scanned' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                      }`}
                    >
                      {getStatusIcon(t.status)}
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        {t.status === 'scanned' ? 'YA INGRESÓ' : 'PENDIENTE'}
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
                      title="Editar datos del asistente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white" title="Reenviar ticket">
                      <Mail className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="p-20 text-center">
              <AlertCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No se encontraron boletos con ese criterio</p>
            </div>
          )}
        </div>
      </div>
      </div>

    {/* Edit Ticket Modal */}
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
            {['Personal', 'VIP', 'FULL', 'STUDENT', 'STAFF', 'Cortesía'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
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
    </>
  );
}
