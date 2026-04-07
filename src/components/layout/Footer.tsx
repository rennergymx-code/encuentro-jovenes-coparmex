import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Facebook, Instagram, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';
import SahuaroIcon from '../icons/SahuaroIcon';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Sobre el Encuentro', id: 'sobre-el-encuentro' },
    { label: 'El Lineup', id: 'lineup' },
    { label: 'Las calles ya hablan', id: 'buzz' },
    { label: 'Proyecto Sorpresa', id: 'surprise' },
    { label: 'Patrocinadores', id: 'sponsors' },
    { label: 'Hospedaje y Renta', to: '/guia-viaje' },
  ];

  return (
    <footer className="relative bg-slate-950 pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-branding-orange/5 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <img 
              src="/assets/logos/logo-white-h.png" 
              alt="Coparmex Sonora Norte" 
              className="h-10 md:h-12 w-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[3.5] md:scale-[3] origin-left -translate-x-12 md:-translate-x-14"
            />
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              COPARMEX Sonora Norte <br />
              <span className="text-white/60">Comisión de Empresarios Jóvenes 2026</span>
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={`social-${i}`} href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-branding-orange/20 border border-white/10 flex items-center justify-center text-white/50 hover:text-branding-orange transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Navegación</h4>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.id || link.to}>
                {link.to ? (
                  <Link 
                    to={link.to}
                    className="text-slate-400 hover:text-branding-orange transition-colors text-sm font-bold uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button 
                    onClick={() => scrollToSection(link.id!)}
                    className="text-slate-400 hover:text-branding-orange transition-colors text-sm font-bold uppercase tracking-wider text-left"
                  >
                    {link.label}
                  </button>
                )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Información Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/legal/terminos"
                  className="text-slate-400 hover:text-branding-orange transition-colors text-sm font-bold uppercase tracking-wider"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/privacidad"
                  className="text-slate-400 hover:text-branding-orange transition-colors text-sm font-bold uppercase tracking-wider"
                >
                  Aviso de Privacidad
                </Link>
              </li>
              <li>
                <a href="mailto:contacto@coparmexsonoranorte.org.mx" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mt-6">
                  <Mail className="w-4 h-4 text-branding-orange" />
                  contacto@coparmex.org
                </a>
              </li>
            </ul>
          </div>

          {/* Action Column */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">¿Listo para el impacto?</h4>
            <Link 
              to="/checkout"
              className="w-full premium-button premium-gradient-orange text-white text-xs font-black uppercase tracking-[0.2em] py-4 shadow-2xl shadow-orange-500/20 active:scale-95 transition-all group flex items-center justify-center gap-3 rounded-2xl"
            >
              Adquirir Carnet
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
              <MapPin className="text-branding-orange w-5 h-5 shrink-0 mt-1" />
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                <span className="text-white block mb-1 uppercase font-bold">Lugar del Evento</span>
                Eventos Partenon <br />
                Hermosillo, Sonora.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            © 2026 COPARMEX SONORA NORTE. Todos los derechos reservados.
          </p>
          
          {/* Admin Login Link - Sahuaro Secret Access (Increased tap target for mobile) */}
          <div className="absolute left-1/2 bottom-2 -translate-x-1/2 z-[50] opacity-30 hover:opacity-100 transition-opacity">
            <Link 
              to="/login" 
              className="p-5 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95"
              title="Acceso Organizador"
            >
              <SahuaroIcon className="w-8 h-8 md:w-6 md:h-6" color="#FF5100" />
            </Link>
          </div>

          <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
            <img src="/assets/logos/logo-white-h.png" alt="Coparmex Horizontal" className="h-4 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}
