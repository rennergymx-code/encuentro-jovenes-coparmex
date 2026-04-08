import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import SEO from './SEO';

interface LoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function Login({ onSuccess, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Bypass for the user's requested admin credentials
    if (email === 'admin' && password === '123456') {
      // In a real app we'd set a real session, 
      // but for this specific request we'll just trigger success
      // and App.tsx will check if the "mock" session exists or just allow it.
      // We'll set a temporary value in localStorage to simulate "admin"
      localStorage.setItem('coparmex_dev_admin', 'true');
      onSuccess();
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Bienvenido, Organizador');
      onSuccess();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <SEO title="Acceso Organizadores | Encuentro Jóvenes Coparmex" path="/login" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md premium-card glass-morphism !p-12 relative overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative text-center mb-12">
          <img 
            src="/assets/logos/logo-white-v.png" 
            alt="Coparmex" 
            className="w-48 mx-auto mb-10 drop-shadow-xl"
          />
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">Acceso <span className="text-branding-orange text-glow-orange">Organizador</span></h2>
          <p className="text-slate-400 font-medium">Ingresa tus credenciales para administrar el evento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-branding-orange outline-none transition-all font-medium text-white font-sans"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-branding-orange outline-none transition-all font-medium text-white shadow-inner font-sans"
                required
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full premium-button premium-gradient-orange text-white py-5 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Entrar <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            <button 
              type="button" 
              onClick={onBack}
              className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Regresar al Evento
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Encuentro Jóvenes Coparmex &copy; 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
