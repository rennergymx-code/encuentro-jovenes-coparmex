import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Ticket as TicketIcon, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  Download, 
  Mail, 
  Plus, 
  Trash2, 
  MessageSquare,
  ArrowRight,
  Bell,
  Loader2,
  Calendar,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  AlertCircle,
  MoreVertical,
  ShieldAlert,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';
import CheckinTab from './modules/Admin/CheckinTab';
import TicketsTab from './modules/Admin/TicketsTab';
import QATab from './modules/Admin/QATab';
import AgendaTab from './modules/Admin/AgendaTab';
import SponsorsTab from './modules/Admin/SponsorsTab';
import ConfigTab from './modules/Admin/ConfigTab';
import { PROGRAM } from '../data/program';
import { SPONSORS } from '../data/sponsors';

type Tab = 'overview' | 'checkin' | 'agenda' | 'tickets' | 'sponsors' | 'qa' | 'config';

interface DashboardProps {
  forceTab?: Tab;
  key?: React.Key;
}

export default function Dashboard({ forceTab }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>(forceTab || 'overview');
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>(PROGRAM as any[]);
  const [sponsorsList, setSponsorsList] = useState<any[]>(SPONSORS as any[]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync tab whenever route-driven forceTab changes (including undefined → reset to overview)
  useEffect(() => {
    setActiveTab(forceTab || 'overview');
  }, [forceTab]);

  useEffect(() => {
    fetchData();
    
    const ticketsChannel = supabase
      .channel('tickets-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets' }, () => {
        fetchData();
      })
      .subscribe();

    const questionsChannel = supabase
      .channel('questions-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, () => {
        fetchData();
        toast.info('Nueva pregunta recibida del público');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(questionsChannel);
    };
  }, []);

  async function fetchData() {
    try {
      const [{ data: tData }, { data: pData }, { data: qData }, { data: sData }, { data: spData }, { data: ttData }] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('questions').select('*').order('created_at', { ascending: false }),
        supabase.from('agenda').select('*').order('time', { ascending: true }),
        supabase.from('sponsors').select('*').order('created_at', { ascending: false }),
        supabase.from('ticket_types').select('*').order('name', { ascending: true })
      ]);

      if (tData) setTickets(tData);
      if (ttData) setTicketTypes(ttData);
      if (pData) setPurchases(pData);
      if (qData) setQuestions(qData);
      
      // Map Agenda: DB snake_case -> Frontend camelCase
      if (sData && sData.length > 0) {
        const mappedSessions = sData.map((s: any) => ({
          id: s.id_string,
          time: s.time,
          type: s.type,
          badge: s.badge,
          title: s.title,
          subtitle: s.subtitle,
          tagline: s.tagline,
          value: s.value,
          speakers: s.speakers || [],
          isHighlight: s.is_public,
          isMystery: s.is_surprise,
          accentColor: s.bg_color,
          created_at: s.created_at
        }));
        setSessions(mappedSessions);
      }
      
      // Map Sponsors: DB snake_case -> Frontend camelCase
      if (spData && spData.length > 0) {
        const mappedSponsors = spData.map((s: any) => ({
          id: s.id,
          name: s.name,
          logo: s.logo,
          tier: s.tier,
          contribution: s.contribution,
          paymentStatus: s.payment_status, // CRITICAL FIX: Ensure frontend sees paymentStatus
          created_at: s.created_at
        }));
        setSponsorsList(mappedSponsors);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Refined Change Handlers with Confirmation ─────────────────────────────
  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  const handleAgendaChange = (updatedSessions: any[]) => {
    // Solo actualizar estado local inmediatamente para fluidez visual
    setSessions(updatedSessions);
    
    // Preparar confirmación para persistencia
    setConfirmModal({
      show: true,
      title: 'Actualizar Programa',
      message: '¿Estás seguro de guardar estos cambios en la agenda? Se reflejarán inmediatamente en el Landing Page.',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('agenda')
            .upsert(
              updatedSessions.map(s => ({
                id_string: s.id,
                time: s.time || '',
                type: s.type || 'conferencia',
                badge: s.badge || '',
                title: s.title,
                subtitle: s.subtitle || '',
                tagline: s.tagline || '',
                value: s.value || '',
                speakers: s.speakers || [],
                is_public: !!s.isHighlight,
                is_surprise: !!s.isMystery,
                bg_color: s.accentColor || '',
                created_at: s.created_at || new Date().toISOString()
              })),
              { onConflict: 'id_string' }
            );

          if (error) throw error;
          toast.success("Agenda sincronizada correctamente");
          setConfirmModal(prev => ({ ...prev, show: false }));
        } catch (err: any) {
          console.error("Error updating agenda in Supabase:", err);
          toast.error("Error al guardar en la base de datos");
        }
      }
    });
  };

  const handleSponsorsChange = (updatedSponsors: any[]) => {
    setSponsorsList(updatedSponsors);

    setConfirmModal({
      show: true,
      title: 'Actualizar Patrocinadores',
      message: '¿Estás seguro de guardar los cambios en los patrocinios? Esto afectará el contador de metas y el carrusel de logos.',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('sponsors')
            .upsert(
              updatedSponsors.map(s => ({
                id: s.id,
                name: s.name,
                logo: s.logo,
                tier: s.tier,
                contribution: s.contribution,
                payment_status: s.paymentStatus || 'sin_pago', // CRITICAL FIX: Ensure DB sees payment_status
                updated_at: new Date().toISOString()
              })),
              { onConflict: 'id' }
            );

          if (error) throw error;
          toast.success("Patrocinadores sincronizados");
          setConfirmModal(prev => ({ ...prev, show: false }));
        } catch (err: any) {
          console.error("Error updating sponsors in Supabase:", err);
          toast.error("Error al guardar patrocinadores");
        }
      }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'checkin':
        return <CheckinTab tickets={tickets} />;
      
      case 'tickets':
        return (
          <TicketsTab 
            tickets={tickets} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            onRefresh={fetchData} 
          />
        );

      case 'agenda':
        return <AgendaTab sessions={sessions} onRefresh={fetchData} onSessionsChange={handleAgendaChange} />;

      case 'sponsors':
        return <SponsorsTab sponsors={sponsorsList} onRefresh={fetchData} onSponsorsChange={handleSponsorsChange} />;

      case 'qa':
        return <QATab questions={questions} sessions={sessions} onRefresh={fetchData} />;

      case 'config':
        return <ConfigTab />;

      case 'overview':
      default:
        return (
          <div className="space-y-12">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="premium-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-orange-500/10 transition-colors" />
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="text-orange-500 w-6 h-6" />
                </div>
                <p className="text-slate-500 font-black uppercase font-mono text-[10px] tracking-widest mb-1">Ingresos de Venta</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-black">${purchases.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">0% crecimiento</span>
                </div>
              </div>

              <div className="premium-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-blue-500/10 transition-colors" />
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <TicketIcon className="text-blue-500 w-6 h-6" />
                </div>
                <p className="text-slate-500 font-black uppercase font-mono text-[10px] tracking-widest mb-1">Boletos Vendidos</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-black">{tickets.length}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/ 500 meta</span>
                </div>
              </div>

              <div className="premium-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="text-emerald-500 w-6 h-6" />
                </div>
                <p className="text-slate-500 font-black uppercase font-mono text-[10px] tracking-widest mb-1">Asistentes en Sitio</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-black">{tickets.filter(t => t.status === 'scanned').length}</h4>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    {tickets.length > 0 ? ((tickets.filter(t => t.status === 'scanned').length / tickets.length) * 100).toFixed(0) : 0}% afluencia
                  </span>
                </div>
              </div>

              <div className="premium-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-purple-500/10 transition-colors" />
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="text-purple-500 w-6 h-6" />
                </div>
                <p className="text-slate-500 font-black uppercase font-mono text-[10px] tracking-widest mb-1">Preguntas Q&A</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-black">{questions.length}</h4>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    {questions.filter(q => q.is_approved).length} aprobadas
                  </span>
                </div>
              </div>
            </div>

            {/* Sub Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Speakers Status */}
              <div className="premium-card">
                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Ponentes
                </h5>
                <div className="space-y-6">
                  {(() => {
                    const allSpeakers = sessions.flatMap(s => s.speakers || []);
                    const confirmedCount = allSpeakers.filter((sp: any) => sp.status === 'confirmed').length;
                    const invitedCount = allSpeakers.filter((sp: any) => sp.status === 'invited').length;
                    const total = invitedCount + confirmedCount;
                    
                    return (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-400">Total Invitados</span>
                          <span className="font-black text-white">{total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-sm font-bold text-slate-400">Confirmados</span>
                          </div>
                          <span className="font-black text-emerald-500 text-glow-emerald">{confirmedCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-sm font-bold text-slate-400">Por Confirmar</span>
                          </div>
                          <span className="font-black text-blue-400">{invitedCount}</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.6)]" 
                            style={{ width: `${total > 0 ? (confirmedCount / total) * 100 : 0}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Sponsors Status */}
              <div className="premium-card">
                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Patrocinios
                </h5>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Total Patrocinadores</span>
                    <span className="font-black text-glow-orange text-orange-500">{sponsorsList.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Confirmados (Pagados)</span>
                    <span className="font-black text-emerald-500">{sponsorsList.filter(s => s.paymentStatus === 'pagado').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Pendientes</span>
                    <span className="font-black">{sponsorsList.filter(s => s.paymentStatus === 'sin_pago' || !s.paymentStatus).length}</span>
                  </div>
                </div>
              </div>

              {/* Tickets Breakdown */}
              <div className="premium-card">
                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                  <TicketIcon className="w-4 h-4" /> Tipos de Carnet
                </h5>
                <div className="space-y-6">
                  {ticketTypes.map(type => (
                    <div key={type.id} className="flex justify-between items-center group/item hover:bg-white/5 p-2 rounded-xl transition-all">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter group-hover/item:text-white transition-colors">
                        {type.name}
                      </span>
                      <span className="font-black text-white group-hover/item:text-branding-orange transition-colors">
                        {tickets.filter(t => t.type === type.id).length}
                      </span>
                    </div>
                  ))}
                  {ticketTypes.length === 0 && (
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic text-center py-4">
                      Cargando categorías...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Activity Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="premium-card">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Últimas <span className="text-orange-500 text-glow-orange">Ventas</span></h3>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 text-[9px] font-black uppercase tracking-widest px-3">Live Feed</div>
                </div>
                <div className="space-y-4">
                  {purchases.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                          <Plus className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-sm text-slate-200">{p.buyer_name}</p>
                          <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase italic">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-orange-500 text-glow-orange">${p.amount}</span>
                    </div>
                  ))}
                  {purchases.length === 0 && (
                    <p className="text-center py-12 text-xs text-slate-600 font-bold uppercase tracking-widest italic border-2 border-dashed border-white/5 rounded-3xl">Sin ventas registradas</p>
                  )}
                </div>
              </div>

              <div className="premium-card">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Actividad <span className="text-emerald-500 text-glow-emerald">Q&A</span></h3>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 text-[9px] font-black uppercase tracking-widest px-3">Última Sesión</div>
                </div>
                <div className="space-y-4">
                  {questions.slice(0, 5).map((q) => (
                    <div key={q.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-colors"></div>
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase italic flex items-center gap-2">
                          <Clock className="w-3 h-3 text-emerald-500" /> {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded text-orange-500">#{q.session_id}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-300 line-clamp-2 leading-relaxed italic">"{q.question_text}"</p>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <p className="text-center py-12 text-xs text-slate-600 font-bold uppercase tracking-widest italic border-2 border-dashed border-white/5 rounded-3xl">Esperando preguntas del público</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Cargando métricas...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header & Tabs (Only show tabs if not forced) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-branding-orange rounded-full" />
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              {activeTab === 'overview' ? 'Panel de Control' : 
               activeTab === 'checkin' ? 'Control de Acceso' : 
               activeTab === 'agenda' ? 'Gestión de Programa' : 
               activeTab === 'tickets' ? 'Gestión de Boletos' : 
               activeTab === 'sponsors' ? 'Patrocinadores' : 
               activeTab === 'config' ? 'Configuración del Sistema' : 'Interactividad Q&A'}
            </h1>
          </div>
          <p className="text-slate-400 font-medium">
            {activeTab === 'overview' ? 'Resumen integral de métricas y operativa del evento.' : `Administración del módulo de ${activeTab}.`}
          </p>
        </motion.div>
        
        {/* Redundant internal tabs removed as requested - Sidebar now handles all operational modules */}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* ─── Premium Confirmation Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-emerald-500" />
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <ShieldAlert className="w-8 h-8 text-orange-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                    {confirmModal.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-2">
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                    className="py-4 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black uppercase tracking-widest text-[10px]"
                  >
                    No, Cancelar
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className="premium-button premium-gradient-orange text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Sí, Guardar Cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
