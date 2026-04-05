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
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed top-4 right-4 z-50 flex items-center gap-3">
        <button 
          onClick={() => {
            navigate('/admin/check-in');
            setIsOpen(false);
          }}
          className="p-3 premium-gradient-orange rounded-2xl text-white shadow-xl shadow-orange-500/30 border border-orange-400/20 active:scale-95 transition-all"
        >
          <QrCode size={24} />
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 glass-morphism rounded-2xl text-white shadow-xl border border-white/10 active:scale-95 transition-all"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out z-40 glass-morphism border-r border-white/10 flex flex-col
        ${isOpen ? 'w-72 translate-x-0' : 'w-72 lg:w-20 -translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-0 flex items-center justify-center overflow-hidden">
          {isOpen ? (
            <div className="flex flex-col items-center justify-center w-full px-6 py-4 select-none">
              <h1 className="text-2xl md:text-3xl uppercase leading-none text-white tracking-tighter text-center">
                <span className="block italic font-black text-branding-orange">ENCUENTRO</span>
                <span className="block font-medium text-xl md:text-2xl mt-1 text-white/90">JÓVENES</span>
                <span className="block font-black text-2xl md:text-3xl mt-0.5 glow-white">2026</span>
              </h1>
            </div>
          ) : (
            <div className="w-12 h-12 premium-gradient-orange rounded-xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/20 my-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsOpen(true)}>
              <span className="font-black text-white text-xs leading-none italic">ENC</span>
              <span className="font-bold text-white text-[10px] leading-none">26</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 ${
                isActive(item.path) 
                  ? 'premium-gradient-orange text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={isActive(item.path) ? 22 : 20} className={isActive(item.path) ? 'animate-pulse' : ''} />
              {isOpen && <span className={`text-sm ${isActive(item.path) ? 'font-black' : 'font-medium'}`}>{item.label}</span>}
              {isOpen && isActive(item.path) && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
          >
            <LogOut size={20} />
            {isOpen && <span className="font-bold text-sm uppercase tracking-widest">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

