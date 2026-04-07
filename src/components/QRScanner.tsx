import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  Power,
  ShieldCheck,
  RefreshCw,
  CameraOff,
  QrCode
} from 'lucide-react';

export default function QRScanner() {
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isScanning, setIsScanning] = useState(false); 
  const [recentFeed, setRecentFeed] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, entered: 0 });
  const [cameraReady, setCameraReady] = useState(false);
  
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const scanPaused = useRef(false);

  const initAudio = () => {
    if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
    }
  };

  const playSound = (type: 'success' | 'error') => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    if (type === 'success') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.current.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.1);
    } else {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioContext.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.current.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.2);
    }

    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + 0.2);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    fetchStats();
    fetchRecentCheckins();

    const channel = supabase
      .channel('ticket-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log("Realtime update received:", payload);
          const newTicket = payload.new;
          if (newTicket.status === 'scanned') {
            fetchStats();
            setRecentFeed(prev => {
                if (prev.find(t => t.id === newTicket.id)) return prev;
                return [newTicket, ...prev].slice(0, 15);
            });
            // MONITOR EN VIVO: Si estamos en escritorio, mostramos el escaneo inmediatamente
            if (window.innerWidth >= 1024) {
                setScannedData(newTicket);
                playSound('success');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime connection status:", status);
        if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to public:tickets updates");
        }
        if (status === 'CHANNEL_ERROR') {
            console.error("Error connecting to Realtime channel. Check RLS or Publication.");
        }
      });

    return () => {
      window.removeEventListener('resize', handleResize);
      supabase.removeChannel(channel);
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    initAudio();
    setIsScanning(true);
    setScannedData(null);
    setError(null);
    scanPaused.current = false;
    localStorage.setItem('qr_scanner_remembered', 'true');
    
    // Use a small delay to ensure #reader is painted
    setTimeout(async () => {
        try {
            const readerElement = document.getElementById("reader");
            if (!readerElement) {
                console.error("Reader element not found");
                return;
            }

            if (!html5QrCode.current) {
                html5QrCode.current = new Html5Qrcode("reader");
            }
            
            await html5QrCode.current.start(
                { facingMode: "environment" }, 
                { fps: 15, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                () => {}
            );
            setCameraReady(true);
        } catch (err) {
            console.error("Error starting scanner:", err);
            toast.error("Error al iniciar cámara. Verifica los permisos.");
            setIsScanning(false);
        }
    }, 300);
  };

  const resumeScanner = async () => {
    setScannedData(null);
    setError(null);
    // Añadimos un pequeño delay de seguridad para que el usuario retire el celular del QR anterior
    setTimeout(() => {
        scanPaused.current = false;
    }, 800);
  };

  const stopScanner = async () => {
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      try {
        await html5QrCode.current.stop();
        setCameraReady(false);
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  async function onScanSuccess(decodedText: string) {
    if (scanPaused.current) return;
    
    // Pause logical processing immediately to prevent duplicate scans
    scanPaused.current = true;
    
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
        setScannedData({ attendee_name: 'Desconocido', id: '???' });
      } else if (data.status === 'scanned') {
        playSound('error');
        setError(`Ya ingresó: ${new Date(data.scanned_at).toLocaleTimeString()}`);
        setScannedData(data);
      } else {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ status: 'scanned', scanned_at: new Date().toISOString() })
          .eq('id', data.id);

        if (updateError) throw updateError;
        
        playSound('success');
        setScannedData(data); // Show detailed success UI
        // Trigger local attendance feed update immediately
        setRecentFeed(prev => [
          { ...data, status: 'scanned', scanned_at: new Date().toISOString() },
          ...prev.filter(t => t.id !== data.id)
        ].slice(0, 15));
        
        toast.success(`Acceso concedido: ${data.attendee_name}`);
      }
    } catch (err: any) {
      console.error("Scan processing error:", err);
      const isAuthError = err.code === '42501' || err.message?.includes('permission');
      toast.error(isAuthError ? "Error de permisos en DB" : "Error de conexión o datos");
      // If error, auto-resume after a small delay
      setTimeout(() => {
        resumeScanner();
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

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

  const fetchStats = async () => {
    // Usamos count() para obtener totales reales
    const { count: total } = await supabase.from('tickets').select('*', { count: 'exact', head: true });
    const { count: scanned } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'scanned');
    
    setStats({
      total: total || 0,
      entered: scanned || 0
    });
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

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 min-h-[80vh]">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 premium-gradient-orange rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Operación Check-in</h4>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
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
        <div className="lg:col-span-8 space-y-8 h-full">
          {isDesktop ? (
             <div className="h-full min-h-[500px]">
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
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>

                      <h3 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white">
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
                       <RefreshCw className="w-4 h-4 animate-spin-slow" />
                       Esperando siguiente validación...
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
            <div className="space-y-6">
              {/* MOBILE SCANNING VIEW (Reader container is PERSISTENT here) */}
              <div 
                  className={`space-y-4 ${scannedData ? 'hidden pointer-events-none' : 'block'}`}
                  style={{ display: !isScanning ? 'none' : (scannedData ? 'none' : 'block') }}
              >
                {!scannedData && isScanning && (
                  <>
                    <div className="premium-card p-4 overflow-hidden relative min-h-[380px]">
                        <div 
                            id="reader" 
                            className={`rounded-3xl overflow-hidden bg-black aspect-square max-w-md mx-auto relative border-2 border-white/10 ${!cameraReady ? 'opacity-0' : 'opacity-100'}`}
                            style={{ minHeight: '300px' }}
                        />
                        
                        {!cameraReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Iniciando Cámara...</p>
                            </div>
                        )}
                        
                        {cameraReady && (
                            /* Scanning Overlay */
                            <div className="absolute inset-0 z-10 pointer-events-none p-8 flex items-center justify-center">
                                <div className="w-full aspect-square max-w-[250px] border-2 border-orange-500/50 rounded-2xl relative">
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-lg" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-lg" />
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-lg" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-lg" />
                                    
                                    <motion.div 
                                        animate={{ top: ['5%', '95%', '5%'] }} 
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="absolute left-0 right-0 h-1 bg-orange-500/50 shadow-[0_0_20px_rgba(255,81,0,1)]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                        
                    <div className="flex flex-col gap-4 px-4">
                        <p className="text-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em] animate-pulse">
                            Encuadra el código QR
                        </p>
                        <button 
                            onClick={stopScanner}
                            className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all active:bg-white/10"
                        >
                            <CameraOff className="w-4 h-4" /> Finalizar Operación
                        </button>
                    </div>
                  </>
                )}
              </div>

              <AnimatePresence mode="wait">
                {scannedData ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-10 rounded-[40px] border-2 flex flex-col items-center text-center shadow-2xl relative z-50 ${
                        error ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                        error ? 'bg-red-500' : 'bg-emerald-500'
                    }`}>
                        {error ? <AlertCircle className="w-12 h-12 text-white" /> : <CheckCircle2 className="w-12 h-12 text-white" />}
                    </div>
                    
                    <h3 className="text-4xl font-black uppercase tracking-tight text-white mb-2 leading-none">
                        {scannedData.attendee_name}
                    </h3>
                    <div className={`text-sm font-black uppercase tracking-widest mb-10 ${error ? 'text-red-400' : 'text-emerald-400'}`}>
                        {error || (
                            <div className="space-y-1">
                                <span className="block opacity-50 text-[10px]">Carnet {scannedData.type}</span>
                                <span className="text-lg">¡BIENVENIDO(A)!</span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            setScannedData(null);
                            setError(null);
                            stopScanner();
                        }}
                        className="w-full premium-button premium-gradient-orange text-white py-6 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 text-lg active:scale-95 transition-all shadow-xl"
                    >
                        <QrCode className="w-6 h-6" />
                        {error ? 'Volver a Intentar' : 'Finalizar Operación'}
                    </button>
                  </motion.div>
                ) : !isScanning ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center px-4 mb-2">
                        <p className="text-slate-500 text-xs font-medium italic">Acceso de Personal Autorizado</p>
                    </div>

                    <button 
                        onClick={startScanner}
                        className="w-full aspect-square max-w-[320px] mx-auto glass-morphism border-2 border-dashed border-white/10 rounded-[64px] flex flex-col items-center justify-center gap-6 group hover:border-orange-500/50 hover:bg-orange-500/5 transition-all active:scale-95"
                    >
                        <div className="w-28 h-28 bg-orange-500/10 rounded-[36px] flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-orange-500/20 shadow-2xl">
                            <Camera className="w-12 h-12 text-orange-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-white uppercase tracking-tighter">Iniciar Cámara</p>
                            <p className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest mt-1">Check-in via QR</p>
                        </div>
                    </button>

                    <div className="premium-card p-8 group">
                        <div className="flex items-center gap-3 mb-6">
                            <Search className="w-4 h-4 text-orange-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Búsqueda Manual</h4>
                        </div>
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                value={manualSearch}
                                onChange={(e) => setManualSearch(e.target.value)}
                                placeholder="ID de boleto..."
                                className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl py-5 px-6 focus:border-orange-500 outline-none transition-all font-bold text-white placeholder:text-slate-700"
                            />
                            <button 
                                onClick={handleManualSearch}
                                className="premium-button premium-gradient-orange text-white px-8 rounded-2xl active:scale-90"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* FEED LATERAL */}
        <div className="lg:col-span-4 h-full min-h-[400px]">
          <div className="h-full flex flex-col premium-card !p-0 overflow-hidden border border-white/5 bg-black/20">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Bitácora de Ingresos</h4>
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-h-[600px] custom-scrollbar">
              <AnimatePresence initial={false}>
                {recentFeed.length === 0 ? (
                  <div className="text-center py-20 opacity-10">
                     <Clock className="w-16 h-16 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-white">Sincronizando...</p>
                  </div>
                ) : (
                  recentFeed.map((ticket, i) => (
                    <motion.div
                      key={`${ticket.id}-${i}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.06] transition-all"
                    >
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                         <User className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-base font-black text-white truncate uppercase tracking-tight">{ticket.attendee_name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ticket.type}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 mb-0.5">
                           {ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                         </p>
                         <div className="flex items-center justify-end gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">ENTRÓ</p>
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            
            <div className="p-8 bg-white/[0.01] border-t border-white/5">
              <button 
                onClick={fetchRecentCheckins}
                className="w-full text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Actualizar Datos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
