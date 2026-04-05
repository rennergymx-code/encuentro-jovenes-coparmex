import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  User,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchTickets(user.email);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function fetchTickets(email?: string) {
    if (!email) return;

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('attendee_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar boletos');
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  }

  const handleDownload = (ticketId: string) => {
    toast.info(`Descargando boleto ${ticketId}...`);
  };

  const handleResend = (ticketId: string) => {
    toast.success(`Boleto ${ticketId} reenviado a tu correo.`);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center glass-morphism rounded-[40px] border border-white/10">
        <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Inicia Sesión</h2>
        <p className="text-gray-400 mb-8">Debes iniciar sesión para ver tus boletos adquiridos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Mis <span className="text-[#ff4e00]">Boletos</span></h2>
          <p className="text-gray-400">Aquí encontrarás tus accesos para el Encuentro Jóvenes COPARMEX.</p>
        </div>
        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{tickets.length} Boletos Adquiridos</span>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-24 glass-morphism rounded-[40px] border border-dashed border-white/10">
          <TicketIcon className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Aún no tienes boletos</h3>
          <p className="text-slate-400 mb-8">Adquiere tus carnets para vivir la experiencia COPARMEX.</p>
          <button className="premium-button premium-gradient-orange text-white">
            Comprar ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Ticket List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {tickets.map((ticket, i) => (
                <motion.div 
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`group relative premium-card cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-orange-500 bg-white/10' : 'hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        ticket.status === 'scanned' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        <TicketIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tighter">{ticket.attendee_name || ticket.attendeeName}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID: {ticket.id}</p>
                      </div>
                    </div>
                    {ticket.status === 'scanned' ? (
                      <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Ingresado</span>
                    ) : (
                      <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tight">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      12 Mayo, 2026
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tight">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Hermosillo, SON
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-600">Acceso General</span>
                    <ArrowRight className={`w-5 h-5 transition-transform ${selectedTicket?.id === ticket.id ? 'translate-x-2 text-orange-500' : 'text-slate-700'}`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Ticket Detail / QR */}
          <div className="lg:sticky lg:top-32 h-fit">
            <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div 
                  key={selectedTicket.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white text-black p-10 rounded-[60px] shadow-[0_0_100px_rgba(255,78,0,0.2)] relative overflow-hidden"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-4 bg-[#ff4e00]"></div>
                  <div className="absolute bottom-0 left-0 w-full h-4 bg-black"></div>
                  <div className="absolute top-1/2 -left-6 w-12 h-12 bg-[#0a0502] rounded-full -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-6 w-12 h-12 bg-[#0a0502] rounded-full -translate-y-1/2"></div>

                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Encuentro <span className="text-orange-500">Jóvenes</span></h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">COPARMEX SONORA NORTE</p>
                  </div>

                  <div className="flex justify-center mb-10 p-6 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <QRCodeSVG 
                      value={selectedTicket.qr_code || selectedTicket.qrCode} 
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-6 mb-10 text-slate-900 leading-none">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Asistente</p>
                        <p className="text-xl font-black uppercase tracking-tight">{selectedTicket.attendee_name || selectedTicket.attendeeName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ID Boleto</p>
                        <p className="text-lg font-black text-orange-500 tracking-tighter">#{selectedTicket.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha</p>
                        <p className="font-bold text-sm uppercase">12 Mayo, 2026</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hora</p>
                        <p className="font-bold text-sm uppercase">07:30 AM</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleDownload(selectedTicket.id)}
                      className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 transition-all"
                    >
                      <Download className="w-4 h-4" /> Descargar
                    </button>
                    <button 
                      onClick={() => handleResend(selectedTicket.id)}
                      className="flex-1 border-2 border-slate-950 text-slate-950 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-950 hover:text-white transition-all"
                    >
                      <Mail className="w-4 h-4" /> Reenviar
                    </button>
                  </div>

                  <p className="text-center text-[8px] text-slate-400 uppercase font-bold tracking-widest mt-8">
                    Presenta este código QR en la entrada del evento. <br />
                    No compartas este código con nadie.
                  </p>
                </motion.div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-[60px] glass-morphism">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <TicketIcon className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-slate-500">Selecciona un boleto</h3>
                  <p className="text-slate-600 text-sm">Haz clic en un boleto de la lista para ver los detalles y el código QR de acceso.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
