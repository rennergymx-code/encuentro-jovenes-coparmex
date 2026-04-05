import React from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';

export default function SurpriseSection({ onBuyTickets }: { onBuyTickets: () => void }) {
  return (
    <section className="relative py-32 px-6 overflow-hidden text-center" style={{ background: '#000' }}>
      {/* Animated background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FF5100 0%, transparent 70%)' }}
        />
      </div>

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,81,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,81,0,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Lock icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
          style={{
            background: 'rgba(255,81,0,0.1)',
            border: '1px solid rgba(255,81,0,0.3)',
          }}
        >
          <Lock className="w-10 h-10 text-[#FF5100]" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#FF5100] text-[10px] font-black tracking-[0.5em] uppercase mb-6">
            Cierre del Encuentro
          </p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-8">
            PROYECTO
            <br />
            <span
              className="relative inline-block"
              style={{ WebkitTextStroke: '2px rgba(255,81,0,0.6)', color: 'transparent' }}
            >
              SORPRESA
            </span>
          </h2>
        </motion.div>

        {/* Scrambled text effect */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-white/70 font-medium italic leading-relaxed mb-4 max-w-xl mx-auto"
        >
          "Algo que nunca ha pasado en Sonora."
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-white/30 text-sm leading-relaxed mb-12 max-w-lg mx-auto"
        >
          El cierre del día guardará el secreto mejor guardado del evento.
          Solo los que estén en la sala lo sabrán. Y no podrán contarlo todo.
        </motion.p>

        {/* Redacted blocks */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {['█████████', '████', '███████████', '██', '████████'].map((block, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
              className="text-white/30 font-black text-lg tracking-wider select-none"
            >
              {block}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={onBuyTickets}
            className="premium-button premium-gradient-orange text-white text-base lg:text-lg px-12 py-5 shadow-2xl shadow-orange-500/40 group uppercase tracking-[0.25em] font-black"
          >
            <span className="flex items-center gap-4">
              Estar ahí cuando suceda
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          <p className="text-white/20 text-xs mt-6 uppercase tracking-widest">
            Carnets limitados · 12 de Mayo · Eventos Partenón
          </p>
        </motion.div>
      </div>
    </section>
  );
}
