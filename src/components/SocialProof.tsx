import React from 'react';
import { motion } from 'motion/react';

const BUZZ_ITEMS = [
  {
    platform: 'X / Twitter',
    user: '',
    avatar: 'JS',
    color: '#1d9bf0',
    time: 'hace 2 horas',
    text: '¿Es cierto que al Encuentro Jóvenes de Coparmex van a ir artistas de talla mundial? 👀 Alguien que me confirme esto por favor',
  },
  {
    platform: 'Instagram',
    user: '',
    avatar: 'EM',
    color: '#e1306c',
    time: 'hace 5 horas',
    text: 'Me llegó un chisme de que el Encuentro Jóvenes en Hermosillo tiene un "proyecto sorpresa" que va a dejar loca a la ciudad. Solo los que compren su carnet lo sabrán 🤐',
  },
  {
    platform: 'Facebook',
    user: '',
    avatar: 'F',
    color: '#0866ff',
    time: 'hace 1 hora',
    text: 'Oigan, ¿ya vieron lo del Encuentro Jóvenes el 12 de mayo? Me dijeron que está confirmado algo que nunca había pasado en Hermosillo. No me dieron más información 🔒',
  },
  {
    platform: 'X / Twitter',
    user: '',
    avatar: 'SE',
    color: '#1d9bf0',
    time: 'hace 30 min',
    text: 'Habrá conversatorio de música regional en el Encuentro Jóvenes. Dicen que los artistas son GRANDES. No soltaron nombres todavía. Ya me urge que destapen la cartelera completa 🎸',
  },
];

export default function SocialProof() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-branding-deep/80 to-black/60" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#FF5100] text-[10px] font-black tracking-[0.5em] uppercase mb-4">
            Las calles ya hablan
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Ya se está <span className="text-[#FF5100]">hablando</span>
          </h2>
          <p className="text-white/40 mt-4 text-sm">
            El ruido ya empezó. ¿Vas a ser de los que sepan o de los que pregunten después?
          </p>
        </motion.div>

        {/* Buzz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUZZ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? -0.3 : 0.3 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Platform tag */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                  style={{ background: `${item.color}22`, color: item.color }}
                >
                  {item.platform}
                </span>
                <span className="text-[10px] text-white/20">{item.time}</span>
              </div>

              {/* User row */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: `${item.color}44` }}
                >
                  {item.avatar}
                </div>
                <span className="text-xs font-bold text-white/60">{item.user}</span>
              </div>

              {/* Text */}
              <p className="text-sm text-white/80 leading-relaxed font-medium">{item.text}</p>

              {/* Corner glow */}
              <div
                className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl"
                style={{ background: item.color }}
              />
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
