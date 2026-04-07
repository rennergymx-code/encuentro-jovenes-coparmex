import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingCart, ArrowRight, LayoutDashboard, Home, Info, Users, Star, Megaphone } from 'lucide-react';
import SahuaroIcon from './components/icons/SahuaroIcon';
import { AppArea } from './types';
import { Toaster } from 'sonner';
import { supabase } from './services/supabaseClient';
import LandingPage from './components/LandingPage';
import CheckoutFlow from './components/CheckoutFlow';
import Dashboard from './components/Dashboard';
import QRScanner from './components/QRScanner';
import MyTickets from './components/MyTickets';
import Login from './components/Login';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import TravelPage from './components/TravelPage';
import AskQuestion from './components/AskQuestion';
import QAProjection from './components/QAProjection';
import CookieBanner from './components/CookieBanner';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

export default function App() {
  const [activeArea, setActiveArea] = useState<AppArea>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState<any>(null);
  const [isDevAdmin, setIsDevAdmin] = useState(localStorage.getItem('coparmex_dev_admin') === 'true');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on smaller screens, auto-expand on desktop if window is resized
      if (window.innerWidth < 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isAdmin = isDevAdmin || session?.user?.email === 'rennergymx@gmail.com' || session?.user?.email?.includes('coparmex');

  const managementPaths = ['/admin', '/dashboard', '/scanner'];
  const isManagementArea = (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) && isAdmin;

  const handleLoginSuccess = () => {
    setIsDevAdmin(localStorage.getItem('coparmex_dev_admin') === 'true');
    setIsMobileMenuOpen(false);
    setIsSidebarOpen(window.innerWidth >= 1024);
    navigate('/dashboard');
    setActiveArea('admin');
  };

  // Close menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Only auto-close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const scrollToHash = (id: string) => {
    navigate('/');
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-orange-500 font-bold text-2xl animate-pulse">COPARMEX...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh selection:bg-orange-500/30 overflow-x-hidden">
      <Toaster position="top-right" theme="dark" richColors />
      <CookieBanner />
      
      {isManagementArea && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      <main className={`${isManagementArea ? (isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20') : ''} transition-all duration-300 min-h-screen`}>
        <Routes>
          <Route path="/" element={<LandingPage onNavigate={(v: any) => {
            if(v === 'checkout') navigate('/checkout');
            if(v === 'my-tickets') navigate('/mis-tickets');
            if(v === 'terms') navigate('/legal/terminos');
            if(v === 'privacy') navigate('/legal/privacidad');
            if(v === 'login') navigate('/login');
          }} />} />
          <Route path="/checkout" element={<div className="pt-24 min-h-screen"><CheckoutFlow onComplete={() => navigate('/mis-tickets')} /></div>} />
          <Route path="/login" element={<div className="pt-24 min-h-screen flex items-center justify-center"><Login onSuccess={handleLoginSuccess} onBack={() => navigate('/')} /></div>} />
          <Route path="/mis-tickets" element={<div className="pt-24 min-h-screen"><MyTickets /></div>} />
          <Route path="/legal/terminos" element={<div className="pt-24 min-h-screen"><TermsPage onBack={() => navigate('/')} /></div>} />
          <Route path="/legal/privacidad" element={<div className="pt-24 min-h-screen"><PrivacyPage onBack={() => navigate('/')} /></div>} />
          <Route path="/guia-viaje" element={<TravelPage onBack={() => navigate('/')} />} />
          <Route path="/ask-question" element={<AskQuestion />} />
          <Route path="/qa-projection" element={<QAProjection />} />

          {/* Protected Admin Routes */}
          {isAdmin && (
            <>
              <Route path="/dashboard" element={<div className="max-w-7xl mx-auto py-8"><Dashboard key="overview" /></div>} />
              
              <Route path="/admin/check-in" element={<div className="max-w-7xl mx-auto py-8"><QRScanner /></div>} />
              
              <Route path="/admin/boletos" element={
                <div className="max-w-7xl mx-auto py-8">
                  <Dashboard key="tickets" forceTab="tickets" />
                </div>
              } />

              <Route path="/admin/agenda" element={
                <div className="max-w-7xl mx-auto py-8">
                  <Dashboard key="agenda" forceTab="agenda" />
                </div>
              } />

              <Route path="/admin/patrocinios" element={
                <div className="max-w-7xl mx-auto py-8">
                  <Dashboard key="sponsors" forceTab="sponsors" />
                </div>
              } />

              <Route path="/admin/moderacion-qa" element={
                <div className="max-w-7xl mx-auto py-8">
                  <Dashboard key="qa" forceTab="qa" />
                </div>
              } />

              {/* Placeholder for future expansion */}
              <Route path="/admin/reportes" element={<div className="max-w-7xl mx-auto py-8 text-center text-white/20 uppercase font-black py-20">Módulo de Reportes en Desarrollo</div>} />
              <Route path="/admin/usuarios" element={<div className="max-w-7xl mx-auto py-8 text-center text-white/20 uppercase font-black py-20">Gestión de Usuarios en Desarrollo</div>} />
              <Route path="/admin/config" element={
                <div className="max-w-7xl mx-auto py-8">
                  <Dashboard key="config" forceTab="config" />
                </div>
              } />
            </>
          )}
        </Routes>
      </main>

      {!isManagementArea && (
        <>
          <nav className="fixed top-0 left-0 right-0 z-[60] glass-morphism border-b border-white/10 px-6 py-0 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center group cursor-pointer" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
              <img 
                src="/assets/logos/logo-white-h.png" 
                alt="Coparmex Sonora Norte" 
                className="h-10 md:h-12 w-auto object-contain brightness-125 scale-[2.2] md:scale-[3] origin-left transition-all duration-300 ml-4 transform-gpu"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => navigate('/')} 
                className={`text-xs uppercase tracking-widest font-black transition-colors ${location.pathname === '/' ? 'text-branding-orange' : 'text-white/60 hover:text-white'}`}
              >
                Inicio
              </button>
              
              <button 
                onClick={() => navigate('/checkout')} 
                className="premium-button premium-gradient-orange text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                Adquirir Carnet
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              <button 
                onClick={() => navigate('/checkout')}
                className="flex items-center justify-center p-2.5 rounded-full bg-branding-orange/20 border border-branding-orange/30 text-branding-orange"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/80 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile Overlay Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#0b0c14]/95 backdrop-blur-2xl px-6 pt-28 pb-12 overflow-y-auto"
              >
                {/* Background decorative elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-branding-orange/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex flex-col gap-3 max-w-sm mx-auto relative z-10">
                  <button 
                    onClick={() => { navigate('/'); window.scrollTo(0,0); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 text-left group transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-branding-orange/20 transition-colors">
                      <Home className="w-6 h-6 text-white/40 group-hover:text-branding-orange" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Volver al inicio</p>
                      <p className="text-xl font-black text-white uppercase tracking-tighter italic">Inicio</p>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { label: 'Encuentro', id: 'sobre-el-encuentro', icon: Info },
                      { label: 'Lineup', id: 'lineup', icon: Users },
                      { label: 'Ya se está hablando', id: 'buzz', icon: Megaphone },
                      { label: 'Sponsors', id: 'sponsors', icon: Star },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => scrollToHash(item.id)}
                        className="flex flex-col gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 text-left group transition-all active:scale-95"
                      >
                         <item.icon className="w-5 h-5 text-branding-orange/40 group-hover:text-branding-orange" />
                         <p className="text-[10px] font-black text-white/50 group-hover:text-white uppercase leading-tight tracking-wider">
                           {item.label}
                         </p>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => { navigate('/checkout'); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between p-6 mt-4 rounded-3xl premium-gradient-orange text-white shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Reserva tu lugar</p>
                      <p className="text-2xl font-black uppercase tracking-tighter">Adquirir Carnet</p>
                    </div>
                    <ArrowRight className="w-8 h-8" />
                  </button>

                  <div className="flex items-center justify-center mt-6">
                  {isAdmin && (
                    <div className="flex justify-center mt-4">
                      <button 
                        onClick={() => { navigate('/dashboard'); setActiveArea('admin'); setIsMobileMenuOpen(false); }}
                        className="opacity-20 hover:opacity-100 transition-opacity p-2"
                        title="Gestión"
                      >
                        <SahuaroIcon className="w-10 h-10" color="#FF5100" />
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
