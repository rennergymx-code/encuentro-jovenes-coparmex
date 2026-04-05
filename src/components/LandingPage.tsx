import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, ArrowRight, Globe } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import ProgramSection from './ProgramSection';
import SocialProof from './SocialProof';
import SurpriseSection from './SurpriseSection';
import SponsorsSection from './SponsorsSection';
import TravelSection from './TravelSection';
import Footer from './layout/Footer';

import SEO from './SEO';

interface LandingPageProps {
  onNavigate: (view: any) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="relative">
      <SEO />
      {/* ───── HERO SECTION ───── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/assets/branding/hero-main-bg.png"
            alt=""
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-branding-deep/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-branding-orange/5 opacity-10" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/assets/logos/logo-white-v.png"
              alt="Coparmex Sonora Norte"
              className="w-48 md:w-64 mx-auto mb-6 opacity-95 drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] scale-[1.3] md:scale-[1.5] transform-gpu"
            />
            <h2 className="text-branding-orange font-black tracking-[0.5em] md:tracking-[0.6em] uppercase text-[9px] md:text-[10px] mb-3 text-glow-orange">
              PRESENTA
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase leading-[1.1] mb-8 text-white drop-shadow-2xl tracking-tighter">
              <span className="block">
                <span className="italic font-black">ENCUENTRO</span> <span className="font-medium">DE JÓVENES:</span>
              </span>
              <span className="text-[#FF5100] text-glow-orange block mt-2">
                <span className="italic font-black">DE SONORA</span> <span className="font-medium">PARA EL MUNDO</span>
              </span>
            </h1>
            <p className="text-sm md:text-lg text-slate-300 max-w-3xl mx-auto mb-10 font-medium leading-relaxed uppercase tracking-wider opacity-80">
              Motivación y liderazgo empresarial con impacto global.
            </p>

            <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-10 text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest">
              <a 
                href="https://www.google.com/calendar/render?action=TEMPLATE&text=Encuentro%20de%20J%C3%B3venes%20Coparmex%3A%20De%20Sonora%20para%20el%20Mundo&dates=20260512T143000Z/20260512T210000Z&details=Motivaci%C3%B3n%20y%20liderazgo%20empresarial%20con%20impacto%20global.&location=Eventos%20Partenon%2C%20Hermosillo%2C%20Sonora"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-2.5 glass-morphism rounded-full border border-white/5 w-full max-w-[260px] md:w-auto hover:bg-white/10 hover:scale-105 transition-all cursor-pointer group"
                title="Agendar en mi calendario"
              >
                <Calendar className="text-branding-orange w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Martes 12 de Mayo</span>
              </a>
              <div className="flex items-center justify-center gap-3 px-6 py-2.5 glass-morphism rounded-full border border-white/5 w-full max-w-[260px] md:w-auto">
                <Clock className="text-branding-orange w-3.5 h-3.5" />
                <span>7:30 AM - 2:00 PM</span>
              </div>
              <div className="flex items-center justify-center gap-3 px-6 py-2.5 glass-morphism rounded-full border border-white/5 w-full max-w-[260px] md:w-auto">
                <MapPin className="text-branding-orange w-3.5 h-3.5" />
                <span>Hermosillo, Sonora</span>
              </div>
              <a 
                href="https://maps.app.goo.gl/tWeCc49vhAKs5dZf6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-2.5 glass-morphism rounded-full border border-branding-orange/20 w-full max-w-[260px] md:w-auto hover:bg-white/10 hover:scale-105 transition-all cursor-pointer group"
                title="Ver en Google Maps"
              >
                <Globe className="text-branding-orange w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Eventos Partenon</span>
              </a>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="premium-button premium-gradient-orange text-white text-lg lg:text-xl px-12 py-5 shadow-2xl shadow-orange-500/30 group uppercase tracking-[0.2em] font-black"
            >
              <span className="flex items-center gap-4">
                Adquirir mi carnet
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ───── COUNTDOWN ───── */}
      <CountdownTimer />

      {/* ───── ¿QUÉ TE LLEVAS? (SOBRE EL ENCUENTRO) ───── */}
      <section id="sobre-el-encuentro" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Un día que <span className="text-[#FF5100]">cambia</span> tu perspectiva
            </h2>
            <p className="text-white/40 mt-4 text-sm max-w-xl mx-auto">
              No es un evento. Es el catalizador que faltaba.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '/assets/branding/cactus.png',
                rotate: 'rotate-12',
                title: 'Conexiones Reales',
                color: '#FF5100',
                desc: 'No tarjetas de presentación. Relaciones estratégicas con los empresarios jóvenes más influyentes de la región.',
              },
              {
                icon: '/assets/branding/shark.png',
                rotate: '-rotate-6',
                title: 'Perspectiva Global',
                color: '#0ea5e9',
                desc: 'Lo que pasa en Sonora impacta al mundo — y este día te dará la visión para verlo y aprovecharlo.',
              },
              {
                icon: '/assets/branding/desert.png',
                rotate: '',
                title: 'Algo Que No Podrás Contar',
                color: '#a855f7',
                desc: 'Algunas experiencias no se describen. El proyecto sorpresa del cierre hace exactamente eso.',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="premium-card group hover:bg-white/10 relative overflow-hidden"
              >
                <div className="absolute -right-10 -bottom-10 opacity-15 group-hover:opacity-30 transition-opacity w-40 h-40">
                  <img src={card.icon} alt="" className={`w-full h-full object-contain ${card.rotate}`} />
                </div>
                <div className="w-10 h-10 rounded-xl mb-6 flex items-center justify-center relative z-10"
                     style={{ background: `${card.color}22`, border: `1px solid ${card.color}44` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: card.color }} />
                </div>
                <h3 className="text-2xl font-black mb-3 uppercase text-white/90 relative z-10">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium relative z-10 text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PROGRAM SECTION (EL LINEUP) ───── */}
      <div id="lineup">
        <ProgramSection onBuyTickets={() => onNavigate('checkout')} />
      </div>

      {/* ───── SOCIAL PROOF / BUZZ (LAS CALLES YA HABLAN) ───── */}
      <div id="buzz">
        <SocialProof />
      </div>

      {/* ───── PROYECTO SORPRESA ───── */}
      <div id="surprise">
        <SurpriseSection onBuyTickets={() => onNavigate('checkout')} />
      </div>

      {/* ───── PATROCINADORES ───── */}
      <div id="sponsors">
        <SponsorsSection />
        
        <div id="guia-viaje">
          <TravelSection />
        </div>
      </div>

      {/* ───── FINAL CTA ───── */}
      <section className="py-20 px-6 text-center bg-orange-600">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-white">
          ¿Listo para el siguiente nivel?
        </h2>
        <button
          onClick={() => onNavigate('checkout')}
          className="bg-white text-branding-orange px-16 py-8 rounded-full font-black text-2xl lg:text-3xl uppercase tracking-[0.2em] hover:scale-105 hover:bg-branding-orange hover:text-white active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        >
          Comprar Boletos Ahora
        </button>
      </section>

      {/* ───── FOOTER ───── */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
