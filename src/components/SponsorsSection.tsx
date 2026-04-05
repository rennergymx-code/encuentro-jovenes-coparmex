import { motion } from 'motion/react';
import { Phone } from 'lucide-react';

import { SPONSORS } from '../data/sponsors';

const MARQUEE_ITEMS = [...SPONSORS, ...SPONSORS, ...SPONSORS];

function SponsorLogo({ name, logo }: { name: string; logo: string }) {
  return (
    <div
      className="flex items-center justify-center px-10 py-2 cursor-default select-none"
      style={{ minWidth: '160px' }}
    >
      <img
        src={logo}
        alt={name}
        className="h-10 max-w-[140px] object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale brightness-200"
      />
    </div>
  );
}

export default function SponsorsSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Edge fades */}
      <div
        className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #06000c 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #06000c 0%, transparent 100%)' }}
      />

      {/* Header */}
      <div className="relative z-5 max-w-4xl mx-auto px-6 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#FF5100] text-[10px] font-black tracking-[0.5em] uppercase mb-4">
            Este evento es posible gracias a
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Nuestros <span className="text-branding-orange">Patrocinadores</span>
          </h2>
          <p className="text-white/30 text-sm mt-4 uppercase tracking-widest font-bold">
            Empresas con Visión de Futuro
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative border-y border-white/5 py-4">
        <div
          className="flex items-center"
          style={{
            width: 'max-content',
            animation: 'sponsorMarquee 35s linear infinite',
          }}
        >
          {MARQUEE_ITEMS.map((s, i) => (
            <SponsorLogo
              key={`sponsor-item-${s.name}-${i}`}
              name={s.name}
              logo={s.logo}
            />
          ))}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center text-white/15 text-[10px] mt-12 uppercase tracking-[0.3em] font-black"
      >
        + más patrocinadores en confirmación
      </motion.p>

      {/* Sponsorship CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="max-w-2xl mx-auto px-6 text-center mt-20"
      >
        <div className="glass-morphism rounded-3xl p-8 border-branding-orange/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-branding-orange/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xl font-black uppercase mb-4 tracking-wider">¿Te gustaría ser patrocinador?</h3>
          <p className="text-sm text-white/50 mb-8 leading-relaxed font-medium">
            Únete a las marcas líderes que están impulsando el futuro empresarial de Sonora y el mundo.
          </p>
          <a 
            href="https://wa.me/526624745255?text=Hola%20Lupita,%20quiero%20más%20información%20sobre%20patrocinios%20para%20el%20Encuentro%20Jóvenes."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 premium-button bg-white text-black hover:bg-branding-orange hover:text-white px-8 py-4 text-xs font-black uppercase tracking-widest transition-all"
          >
            Contactar a Lupita Gálvez 
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
