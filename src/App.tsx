import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingCart, ArrowRight, LayoutDashboard } from 'lucide-react';
import { AppArea } from './types';
import AdminSuite from './components/modules/Admin/AdminSuite';
import SalesSuite from './components/modules/Sales/SalesSuite';
import EngSuite from './components/modules/Eng/EngSuite';
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
    navigate('/dashboard');
    setActiveArea('admin');
  };

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
      
      {isManagementArea && (
        <Sidebar 
          activeArea={activeArea} 
          activeTab={activeTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onAreaChange={(area) => { setActiveArea(area); navigate(`/${area}`); }}
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
              <Route path="/admin/config" element={<div className="max-w-7xl mx-auto py-8 text-center text-white/20 uppercase font-black py-20">Configuración del Sistema en Desarrollo</div>} />
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

              <button 
                onClick={() => navigate('/checkout')} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                title="Checkout"
              >
                <ShoppingCart className="w-4 h-4" />
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
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-50 bg-[#0b0c14] pt-24 px-8 overflow-y-auto"
              >
                <div className="flex flex-col gap-6 pb-12">
                  <button 
                    onClick={() => { navigate('/'); window.scrollTo(0,0); setIsMobileMenuOpen(false); }}
                    className="text-4xl font-black uppercase text-left group"
                  >
                    <span className="group-hover:text-branding-orange transition-colors italic">Inicio</span>
                  </button>

                  <div className="h-px w-full bg-white/5 my-2" />

                  {[
                    { label: 'Sobre el Encuentro', id: 'sobre-el-encuentro' },
                    { label: 'El Lineup', id: 'lineup' },
                    { label: 'Las calles ya hablan', id: 'buzz' },
                    { label: 'Proyecto Sorpresa', id: 'surprise' },
                    { label: 'Patrocinadores', id: 'sponsors' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => scrollToHash(item.id)}
                      className="text-xl font-bold uppercase text-left text-white/50 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}

                  <div className="h-px w-full bg-white/5 my-2" />

                  <button 
                    onClick={() => { navigate('/checkout'); setIsMobileMenuOpen(false); }}
                    className="text-3xl font-black uppercase text-left group flex items-center gap-4 text-branding-orange"
                  >
                    Adquirir Carnet
                    <ArrowRight className="w-8 h-8" />
                  </button>

                  <button 
                    onClick={() => { navigate('/mis-tickets'); setIsMobileMenuOpen(false); }}
                    className="text-xl font-bold uppercase text-left text-white/40 mt-4"
                  >
                    Mis Tickets
                  </button>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => { navigate('/dashboard'); setActiveArea('admin'); setIsMobileMenuOpen(false); }}
                      className="text-xl font-bold uppercase text-left text-white/40"
                    >
                      Panel de Gestión
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
