import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react';
import SEO from './SEO';

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
      <SEO title="Contacto | Encuentro Jóvenes Coparmex" path="/contacto" />
      
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-branding-orange hover:text-orange-400 transition-colors mb-12 group font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver al Inicio
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-8 md:p-12 rounded-3xl border border-white/10 overflow-hidden relative"
      >
        {/* Decorative background flare */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-12 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Mail className="text-branding-orange w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Contácta<span className="text-branding-orange">nos</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <MapPin className="text-branding-orange w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Ubicación</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Blvd. Antonio Quiroga 108 Fracc. Real de Quiroga<br />
                  Hermosillo, Sonora, México.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Phone className="text-branding-orange w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Teléfono</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-bold">
                  <a href="tel:6622144393" className="hover:text-branding-orange transition-colors">
                    662 214 4393
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Mail className="text-branding-orange w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Correo Electrónico</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  <a href="mailto:atencion@coparmexsonoranorte.org.mx" className="hover:text-branding-orange transition-colors">
                    atencion@coparmexsonoranorte.org.mx
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Clock className="text-branding-orange w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Horarios de Atención</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Lunes a Viernes: 8:00 AM - 5:00 PM<br />
                  Sábados y Domingos: Cerrado
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                Cualquier duda respecto a la adquisición de carnets, patrocinios o detalles de la agenda, estamos para servirte.
              </p>
              <div className="flex gap-3">
                 <div className="w-2 h-2 rounded-full bg-branding-orange animate-pulse" />
                 <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Soporte Activo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest text-center">
            COPARMEX SONORA NORTE • COMISIÓN DE EMPRESARIOS JÓVENES 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
