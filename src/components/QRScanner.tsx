import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Ticket as TicketIcon,
  X,
  Camera,
  Search,
  Loader2,
  Users,
  Clock,
  LayoutDashboard,
  Power
} from 'lucide-react';

export default function QRScanner() {
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isScanning, setIsScanning] = useState(!isDesktop);
  const [recentFeed, setRecentFeed] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, entered: 0 });
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  
  // Audio Feedback Utilities
  const playSound = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      }

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio disabled or failed", e);
    }
  };

  // Device detection
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    fetchStats();
    fetchRecentCheckins();

    // REAL-TIME FEED SUBSCRIPTION
    const channel = supabase
      .channel('ticket-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        (payload) => {
          const newTicket = payload.new;
          const oldTicket = payload.old;
          
          // Only trigger if status changed to scanned
          if (newTicket.status === 'scanned' && oldTicket.status !== 'scanned') {
            handleSystemCheckin(newTicket);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('resize', handleResize);
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle a check-in coming from any device (real-time or local scan)
  const handleSystemCheckin = (ticket: any) => {
    setScannedData(ticket);
    playSound('success');
    setRecentFeed(prev => [ticket, ...prev].slice(0, 15));
    fetchStats();
  };

  const fetchStats = async () => {
    const { data: tickets } = await supabase.from('tickets').select('status');
    if (tickets) {
      setStats({
        total: tickets.length,
        entered: tickets.filter(t => t.status === 'scanned').length
      });
    }
  };

  const fetchRecentCheckins = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'scanned')
      .order('scanned_at', { ascending: false })
      .limit(15);
    
    if (data) setRecentFeed(data);
  };

  // Scanner Logic (Mobile/Manual)
  useEffect(() => {
    if (!isDesktop && isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [isDesktop, isScanning]);

  async function onScanSuccess(decodedText: string) {
    if (loading) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('qr_code', decodedText)
        .single();

      if (fetchError || !data) {
        playSound('error');
        setError("Boleto no encontrado");
        toast.error("Boleto no encontrado");
      } else if (data.status === 'scanned') {
        playSound('error');
        setError(`Ya ingresó: ${new Date(data.scanned_at).toLocaleString()}`);
        setScannedData(data);
      } else {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ status: 'scanned', scanned_at: new Date().toISOString() })
          .eq('id', data.id);

        if (updateError) throw updateError;
        // The handleSystemCheckin will be triggered by Realtime subscription anyway, 
        // but we can update local state immediately for faster UI feedback
        toast.success(`Acceso: ${data.attendee_name}`);
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function onScanFailure(error: any) {}

  const handleManualSearch = async () => {
    if (!manualSearch) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', manualSearch.toUpperCase())
        .single();
      
      if (fetchError || !data) throw new Error("No encontrado");
      onScanSuccess(data.qr_code);
    } catch (err) {
      toast.error("ID no válido");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScannedData(null);
    setError(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header section adaptativo */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 premium-gradient-orange rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Operación Check-in</h4>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isDesktop ? 'Centro de' : 'Escaner de'} <span className="text-[#FF5100] text-glow-orange">Acceso</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <div className="glass-morphism px-8 py-5 rounded-[32px] border border-white/5 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Afluencia Total</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-2xl font-black text-white">{stats.entered}</span>
                <span className="text-xs text-slate-500 font-bold">/ {stats.total}</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Users className="text-branding-orange w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lógica Principal Adaptativa */}
        <div className="lg:col-span-8 space-y-8">
          {isDesktop ? (
            /* MONITOR VIEW (Desktop) */
            <div className="h-full min-h-[600px]">
              <AnimatePresence mode="wait">
                {scannedData ? (
                  <motion.div 
                    key={scannedData.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`h-full p-12 rounded-[48px] border-4 flex flex-col justify-between shadow-2xl glass-morphism relative overflow-hidden ${
                      error ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                      <LayoutDashboard className="w-64 h-64" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-8">
                        <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] ${
                          error ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {error ? 'Validación Fallida' : 'Validación Exitosa'}
                        </div>
                        <span className="text-xs font-bold text-slate-500 italic">
                          Justo ahora • {new Date().toLocaleTimeString()}
                        </span>
                      </div>

                      <h3 className="text-7xl font-black uppercase tracking-tighter mb-4 text-white">
                        {scannedData.attendee_name}
                      </h3>
                      <p className={`text-xl font-black uppercase tracking-widest ${error ? 'text-red-400' : 'text-emerald-400'}`}>
                        {error || `¡BIENVENIDO(A)! - ${scannedData.type}`}
                      </p>

                      <div className="grid grid-cols-2 gap-8 mt-16 max-w-2xl">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                          <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Ticket ID</p>
                          <p className="text-3xl font-black text-orange-500">#{scannedData.id}</p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                          <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Tipo de Carnet</p>
                          <p className="text-2xl font-black text-white">{scannedData.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex items-center gap-4 text-slate-500 font-bold uppercase text-xs tracking-widest">
                      <Clock className="w-4 h-4" />
                      Esperando siguiente validación en tiempo real...
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-20 border-4 border-dashed border-white/5 rounded-[48px] bg-white/[0.02]"
                  >
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 animate-pulse">
                      <LayoutDashboard className="w-16 h-16 text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.3em]">Monitor Activo</h3>
                    <p className="text-slate-600 font-medium max-w-sm mt-4">Esperando escaneos desde dispositivos móviles en los accesos.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* SCANNER VIEW (Mobile) */
            <div className="space-y-8">
              <div className="premium-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Cámara de Escaneo</h4>
                  <button 
                    onClick={() => setIsScanning(!isScanning)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black transition-all ${
                      isScanning ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/40'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {isScanning ? 'APAGAR CÁMARA' : 'ENCENDER CÁMARA'}
                  </button>
                </div>
                
                {isScanning ? (
                  <div id="reader" className="rounded-2xl overflow-hidden border border-white/10 bg-black min-h-[300px]"></div>
                ) : (
                  <div className="bg-slate-900/50 rounded-2xl h-[300px] flex flex-col items-center justify-center border border-dashed border-white/10 text-slate-600">
                    <Camera className="w-12 h-12 mb-4" />
                    <p className="font-black text-[10px] uppercase tracking-widest">Scanner Apagado</p>
                  </div>
                )}
              </div>

              <div className="premium-card">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Búsqueda Manual</h4>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      value={manualSearch}
                      onChange={(e) => setManualSearch(e.target.value)}
                      placeholder="ID del boleto..."
                      className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleManualSearch}
                    className="premium-button premium-gradient-orange text-white px-6"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {scannedData && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-3xl border ${error ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}
                 >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${error ? 'bg-red-500' : 'bg-emerald-500'}`}>
                           {error ? <AlertCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <p className="text-white font-black uppercase text-sm leading-tight">{scannedData.attendee_name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{error || 'Acceso Permitido'}</p>
                        </div>
                      </div>
                      <button onClick={reset} className="text-slate-600"><X /></button>
                    </div>
                 </motion.div>
              )}
            </div>
          )}
        </div>

        {/* FEED LATERAL (Común) */}
        <div className="lg:col-span-4 h-full">
          <div className="h-full flex flex-col premium-card !p-0 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Feed en Vivo</h4>
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-h-[700px] custom-scrollbar">
              <AnimatePresence initial={false}>
                {recentFeed.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                     <Clock className="w-12 h-12 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Sin actividad hoy</p>
                  </div>
                ) : (
                  recentFeed.map((ticket) => (
                    <motion.div
                      key={`${ticket.id}-${ticket.scanned_at}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.06] transition-all"
                    >
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                         <User className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-black text-white truncate uppercase">{ticket.attendee_name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">{ticket.type}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-medium text-slate-600 mb-0.5">
                           {new Date(ticket.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                         <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">OK</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <button 
                onClick={fetchRecentCheckins}
                className="w-full text-center text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
              >
                Actualizar Lista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className, ...props }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
