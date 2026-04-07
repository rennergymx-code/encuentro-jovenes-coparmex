import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  Users, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Menu,
  X,
  Ticket,
  Calendar,
  Award,
  MessageSquare,
  QrCode
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  // Props kept for compatibility, but behavior changed to flat navigation
  activeArea?: string; 
  activeTab?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAreaChange?: (area: any) => void;
  onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Sesión cerrada correctamente');
      navigate('/');
      window.location.reload(); 
    } catch (err: any) {
      toast.error('Error al cerrar sesión: ' + err.message);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'checkin', label: 'Control de Acceso', icon: QrCode, path: '/admin/check-in' },
    { id: 'tickets', label: 'Gestión de Boletos', icon: Ticket, path: '/admin/boletos' },
    { id: 'agenda', label: 'Programa y Agenda', icon: Calendar, path: '/admin/agenda' },
    { id: 'sponsors', label: 'Patrocinadores', icon: Award, path: '/admin/patrocinios' },
    { id: 'qa', label: 'Moderación Q&A', icon: MessageSquare, path: '/admin/moderacion-qa' },
    { id: 'reports', label: 'Ventas y Reportes', icon: TrendingUp, path: '/admin/reportes' },
    { id: 'users', label: 'Usuarios / Staff', icon: Users, path: '/admin/usuarios' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/admin/config' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Buttons (Only visible on mobile) */}
      <div className="lg:hidden fixed top-4 right-4 z-[60] flex items-center gap-3">
        <button 
          onClick={() => navigate('/admin/check-in')}
          className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl text-white/40 border border-white/10 active:scale-95 transition-all hover:text-branding-orange"
        >
          <QrCode size={20} />
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-branding-orange/10 backdrop-blur-xl rounded-2xl text-branding-orange shadow-xl border border-branding-orange/20 active:scale-95 transition-all"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Premium Mobile Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 z-50 bg-[#0b0c14]/98 backdrop-blur-2xl px-6 pt-24 pb-12 overflow-y-auto"
          >
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-branding-orange/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md mx-auto space-y-8 relative z-10">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-6 rounded-[32px] bg-white/5 border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-branding-orange/20 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-branding-orange" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Gestión</h2>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Panel Administrativo</p>
                </div>
              </div>

              {/* Grid of modules */}
              <div className="grid grid-cols-2 gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col gap-4 p-5 rounded-[28px] border transition-all active:scale-95 text-left group ${
                      isActive(item.path)
                        ? 'bg-branding-orange text-white border-transparent shadow-xl shadow-orange-500/20'
                        : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    <item.icon size={24} className={isActive(item.path) ? 'text-white' : 'text-branding-orange/40 group-hover:text-branding-orange'} />
                    <span className="text-[11px] font-black uppercase tracking-tighter leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => { navigate('/'); setIsOpen(false); }}
                  className="w-full flex items-center justify-between p-6 rounded-[28px] bg-white/5 border border-white/10 text-white/60 hover:text-white uppercase font-black text-[10px] tracking-widest active:scale-95 transition-all"
                >
                  Volver al Landing
                  <LogOut className="w-4 h-4 opacity-40 rotate-180" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-6 rounded-[28px] bg-red-500/10 border border-red-500/20 text-red-500 uppercase font-black text-[10px] tracking-widest active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cerrar Sesión Activa
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Only visible on large screens) */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out z-40 glass-morphism border-r border-white/10 flex-col
        ${isOpen ? 'w-72' : 'w-20'}
      `}>
        <div className="p-0 flex items-center justify-center overflow-hidden h-24">
          {isOpen ? (
            <div className="flex flex-col items-center justify-center w-full px-6 py-4 select-none">
              <h1 className="text-2xl md:text-3xl uppercase leading-none text-white tracking-tighter text-center">
                <span className="block italic font-black text-branding-orange text-3xl">ENCUENTRO</span>
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-medium text-lg text-white/50">JÓVENES</span>
                    <span className="font-black text-lg text-white glow-white">2026</span>
                </div>
              </h1>
            </div>
          ) : (
            <div className="w-12 h-12 premium-gradient-orange rounded-xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/20 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsOpen(true)}>
              <span className="font-black text-white text-xs leading-none italic">ENC</span>
              <span className="font-bold text-white text-[10px] leading-none">26</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${
                isActive(item.path) 
                  ? 'premium-gradient-orange text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`flex items-center justify-center transition-all ${!isOpen ? 'w-full' : ''}`}>
                <item.icon size={22} className={isActive(item.path) ? 'animate-pulse' : ''} />
              </div>
              {isOpen && <span className={`text-[13px] uppercase tracking-tighter ${isActive(item.path) ? 'font-black italic' : 'font-bold'}`}>{item.label}</span>}
              {isOpen && isActive(item.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
            </button>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300 ${!isOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {isOpen && <span className="font-black text-xs uppercase tracking-widest italic">Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

