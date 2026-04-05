import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const EVENT_DATE = new Date('2026-05-12T07:30:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-14 h-14 md:w-22 md:h-22 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-black/70 border border-white/10 backdrop-blur-sm flex items-center justify-center"
           style={{ minWidth: '3.5rem', minHeight: '3.5rem' }}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-2xl md:text-4xl lg:text-5xl font-black text-[#FF5100] absolute"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
    </div>
  );
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 px-6 relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[#FF5100] text-[10px] font-black tracking-[0.35em] uppercase mb-8"
        >
          ⏳ Los carnets tienen fecha de vencimiento. El tuyo también.
        </motion.p>

        <div className="flex items-end justify-center gap-3 md:gap-5 lg:gap-6">
          <FlipUnit value={time.days} label="Días" />
          <span className="text-white/20 text-xl md:text-3xl font-black pb-8 select-none">:</span>
          <FlipUnit value={time.hours} label="Horas" />
          <span className="text-white/20 text-xl md:text-3xl font-black pb-8 select-none">:</span>
          <FlipUnit value={time.minutes} label="Minutos" />
          <span className="text-white/20 text-xl md:text-3xl font-black pb-8 select-none">:</span>
          <FlipUnit value={time.seconds} label="Segundos" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-white/25 text-[10px] md:text-xs mt-8 font-medium uppercase tracking-widest"
        >
          12 de Mayo · Eventos Partenón · Hermosillo, Sonora
        </motion.p>
      </div>
    </section>
  );
}
