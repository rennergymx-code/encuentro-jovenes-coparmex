import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Lock, ChevronDown, Clock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { PROGRAM, type Speaker, type Session } from '../data/program';

// ─── Speaker Cards ─────────────────────────────────────────────────────────────
function HiddenSpeakerCard({ role }: { role: string }) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} className="flex flex-col items-center gap-2 group cursor-default">
      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/10"
           style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <svg viewBox="0 0 64 64" className="w-full h-full opacity-40">
          <circle cx="32" cy="20" r="10" fill="#334155" />
          <ellipse cx="32" cy="50" rx="16" ry="14" fill="#334155" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Lock className="w-4 h-4 text-white/50" />
        </div>
      </div>
      <p className="text-[10px] font-black text-white/40 tracking-wider">Invitado Sorpresa</p>
      <p className="text-[10px] text-white/15 text-center leading-tight max-w-[70px]">{role}</p>
    </motion.div>
  );
}

function RevealedSpeakerCard({ speaker }: { speaker: Speaker }) {
  const { name, role, photo, isModerator } = speaker;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const photoSrc = photo ? `/assets/speakers/${photo}` : null;
  const [imgError, setImgError] = useState(false);
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }} className="flex flex-col items-center gap-2">
      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2"
           style={{ borderColor: isModerator ? '#f59e0b' : 'rgba(255,81,0,0.5)' }}>
        {photoSrc && !imgError ? (
          <img src={photoSrc} alt={name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-sm"
               style={{ background: 'linear-gradient(135deg, #FF5100, #ff8c42)', color: 'white' }}>
            {initials}
          </div>
        )}
        {isModerator && (
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
            <span className="text-[7px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">MOD</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-white leading-tight max-w-[80px]">{name}</p>
        <p className="text-[9px] text-white/40 leading-tight max-w-[80px] mt-0.5">{role}</p>
      </div>
    </motion.div>
  );
}

// ─── Card Configs & Art ───────────────────────────────────────────────────────
const SESSION_IMAGES: Record<string, string> = {
  registro:     '/assets/branding/card_registro.png',
  inauguracion: '/assets/branding/card_inauguracion.png',
  conf1:        '/assets/branding/card_conf1.png',
  conv1:        '/assets/branding/card_conv1.png',
  conf2:        '/assets/branding/card_conf2.png',
  conv2:        '/assets/branding/card_conv2.png',
  sorpresa:     '/assets/branding/card_sorpresa.png',
  after:        '/assets/branding/card_after.png',
};

const CARD_CONFIGS: Record<string, { suit: string; rank: string; color: string; }> = {
  registro:     { suit: '◆', rank: 'R',  color: '#f59e0b' },
  inauguracion: { suit: '♦', rank: 'A',  color: '#FF5100' },
  conferencia:  { suit: '♣', rank: 'C',  color: '#f59e0b' },
  conversatorio:{ suit: '♠', rank: 'CV', color: '#0ea5e9' },
  sorpresa:     { suit: '★', rank: '?',  color: '#a855f7' },
  especial:     { suit: '♦', rank: 'I',  color: '#FF5100' },
};

function CardBack({ session }: { session: Session; key?: React.Key }) {
  const cfg = CARD_CONFIGS[session.type] || CARD_CONFIGS.conferencia;
  const color = cfg.color;
  const cardImage = SESSION_IMAGES[session.id] || '/assets/branding/desert.png';

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col select-none"
      style={{
        background: '#0b0b14',
        border: `2px solid ${color}60`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(1px)',
        boxShadow: `0 0 0 1px rgba(0,0,0,0.5) inset, 0 4px 32px ${color}20`,
      }}
    >
      <div className="absolute inset-[6px] rounded-xl pointer-events-none z-10" style={{ border: `1px solid ${color}35` }} />
      <div className="absolute inset-[10px] rounded-lg pointer-events-none z-10" style={{ border: `0.5px solid ${color}20` }} />

      {/* Rank Corner TR */}
      <div className="absolute top-3 left-4 z-20 flex flex-col items-center leading-none">
        <span className="font-black text-lg leading-none" style={{ color, fontFamily: 'Georgia, serif', textShadow: `0 0 8px ${color}80` }}>{cfg.rank}</span>
        <span className="text-xs leading-none mt-0.5" style={{ color, opacity: 0.85 }}>{cfg.suit}</span>
      </div>

      {/* Rank Corner BL */}
      <div className="absolute bottom-3 right-4 z-20 flex flex-col items-center leading-none rotate-180">
        <span className="font-black text-lg leading-none" style={{ color, fontFamily: 'Georgia, serif', textShadow: `0 0 8px ${color}80` }}>{cfg.rank}</span>
        <span className="text-xs leading-none mt-0.5" style={{ color, opacity: 0.85 }}>{cfg.suit}</span>
      </div>

      <div className="absolute inset-[14px] rounded-lg overflow-hidden">
        <img src={cardImage} alt={session.badge} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(11,11,20,0.55) 0%, transparent 35%, transparent 60%, rgba(11,11,20,0.75) 100%)` }} />
        <div className="absolute inset-0" style={{ background: `${color}10`, mixBlendMode: 'overlay' }} />
      </div>

      {/* Horario en esquina superior derecha para Registro y After */}
      {(session.id === 'registro' || session.id === 'after') && (
        <div className="absolute top-6 right-6 z-30">
          <span className="text-[10px] font-black tracking-tight text-white/90 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 uppercase shadow-2xl">
            <Clock className="w-3 h-3 text-branding-orange" />
            {session.id === 'registro' ? '7:30 - 8:00 am' : '2:00 - 5:00 pm'}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-4 pt-16"
           style={{ background: `linear-gradient(to top, rgba(11,11,20,0.97) 60%, transparent)` }}>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-center mb-1" style={{ color }}>{session.badge}</p>
        <p className="text-[7px] text-center uppercase tracking-[0.2em] font-bold text-white/20">Encuentro Jóvenes · Coparmex</p>
      </div>

      <div className="absolute bottom-14 left-0 right-0 flex justify-center z-30 pointer-events-none text-center">
        <motion.div animate={{ opacity: [0.7, 1, 0.7], y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full text-white"
          style={{ background: `${color}55`, border: `1.5px solid ${color}`, backdropFilter: 'blur(8px)', textShadow: `0 0 10px ${color}` }}>
          ✦ Toca para revelar ✦
        </motion.div>
      </div>
    </div>
  );
}

function CardFront({ session, onHeightChange }: { session: Session; onHeightChange: (h: number) => void; key?: React.Key }) {
  const { badge, title, subtitle, tagline, value, speakers, isMystery, accentColor } = session;
  const color = accentColor || '#FF5100';
  const [speakersOpen, setSpeakersOpen] = useState(true);
  const hasSpk = speakers.length > 0;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onHeightChange(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div className="absolute inset-0 rounded-2xl flex flex-col overflow-hidden"
         style={{
           background: isMystery ? 'linear-gradient(145deg, #0f0920 0%, #0d0d18 100%)' : 'linear-gradient(145deg, #0d0d18 0%, #13131f 100%)',
           border: `1px solid ${color}35`,
           backfaceVisibility: 'hidden',
           WebkitBackfaceVisibility: 'hidden',
           transform: 'rotateY(180deg) translateZ(1px)',
         }}>
      <div className="h-1 w-full flex-shrink-0" style={{ background: color }} />

      <div ref={contentRef} className="p-5 flex flex-col gap-3">
        
        <div className="flex justify-between items-center w-full">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full text-white"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            {badge}
          </span>
          {/* Solo mostrar horario para REGISTRO y EL AFTER */}
          {session.time && (session.id === 'registro' || session.id === 'after') && (
            <span className="text-[10px] font-black text-white/50 tracking-tighter tabular-nums flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-branding-orange" /> {session.time}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
            {session.id === 'after' ? 'EL AFTER: TACOS, CHEVES Y DEALS' : title}
          </h3>
          {subtitle && <p className="text-[11px] text-white/35 uppercase tracking-wide mt-1">{subtitle}</p>}
        </div>

        <p className="text-white/60 italic text-sm leading-relaxed border-l-2 pl-3 border-white/10">"{tagline}"</p>

        <div className="flex items-start gap-2 bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <span className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-branding-orange">Impacto:</span>
          <p className="text-white/40 text-[11px] leading-relaxed">{value}</p>
        </div>

        {hasSpk && (
          <div className="mt-2 flex flex-col flex-1">
            <div className={`transition-all duration-300 ${speakersOpen ? 'opacity-100 h-auto visible mb-4' : 'opacity-0 h-0 invisible overflow-hidden'}`}>
              <div className="flex flex-wrap gap-3">
                {speakers.map(s => (
                  <div key={s.id}>
                    {s.revealed ? <RevealedSpeakerCard speaker={s} /> : <HiddenSpeakerCard role={s.role} />}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setSpeakersOpen(!speakersOpen); }}
              className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 hover:text-white/60 transition-colors mt-auto py-3 border-t border-white/5 w-full bg-[#0d0e1a]/90 backdrop-blur-md"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${speakersOpen ? 'rotate-180' : ''}`} />
              {speakersOpen ? 'OCULTAR DETALLES' : 'VER PARTICIPANTES'}
              {isMystery && <span className="text-[8px] text-red-500 font-black animate-pulse ml-2">🔴 REVELACIÓN</span>}
            </button>
          </div>
        )}
        {session.id === 'after' && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center mb-6">
            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest leading-relaxed">
              * Acceso exclusivo para los que hayan estado en el evento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FlipCard({ session, shuffleDelay }: { session: Session; shuffleDelay: number; key?: React.Key }) {
  const [flipped, setFlipped] = useState(false);
  const [frontHeight, setFrontHeight] = useState(460);

  return (
    <motion.div
      initial={{ opacity: 0, y: -80, rotate: Math.random() * 40 - 20, scale: 0.6 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        rotate: 0, 
        scale: 1,
        height: flipped ? Math.max(frontHeight + 32, 460) : 460 
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 20, 
        delay: shuffleDelay,
        height: { type: 'spring', stiffness: 100, damping: 20 }
      }}
      className="relative"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        onClick={() => setFlipped(f => !f)}
      >
        <CardBack session={session} />
        <CardFront session={session} onHeightChange={setFrontHeight} />
      </motion.div>
    </motion.div>
  );
}

function shuffleKeepEnds<T>(arr: T[]): T[] {
  if (arr.length <= 2) return arr;
  const first = arr[0];
  const last = arr[arr.length - 1];
  const middle = arr.slice(1, -1);
  
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  
  return [first, ...middle, last];
}

export default function ProgramSection({ onBuyTickets }: { onBuyTickets: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [shuffledProgram, setShuffledProgram] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);
  const [fullProgram, setFullProgram] = useState<Session[]>(PROGRAM);

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const { data, error } = await supabase
          .from('agenda')
          .select('*')
          .order('time', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map((s: any) => ({
            id: s.id_string,
            badge: s.badge,
            title: s.title,
            subtitle: s.subtitle,
            tagline: s.tagline,
            value: s.value,
            speakers: s.speakers || [],
            isHighlight: s.is_public,
            isMystery: s.is_surprise,
            accentColor: s.bg_color,
            time: s.time,
            type: s.type
          }));
          setFullProgram(mapped);
        }
      } catch (err) {
        console.error("Error fetching agenda from Supabase:", err);
      }
    }

    fetchAgenda();
  }, []);

  const filteredProgram = useMemo(() => {
    return fullProgram.filter(s => {
      const id = (s.id || '').toLowerCase();
      const hideIds = ['anuncios', 'break1', 'break2', 'break3', 'cierre', 'extra'];
      return !hideIds.includes(id);
    });
  }, [fullProgram]);

  useEffect(() => {
    if (isInView && filteredProgram.length > 0) {
      setShuffledProgram(shuffleKeepEnds([...filteredProgram]));
      const t = setTimeout(() => setReady(true), 400);
      return () => clearTimeout(t);
    }
  }, [isInView, filteredProgram]);

  return (
    <section ref={sectionRef} className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-branding-deep via-black/95 to-branding-deep" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <p className="text-[#FF5100] text-[10px] font-black tracking-[0.5em] uppercase mb-4">12 de Mayo · Hermosillo, Sonora</p>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            El <span className="text-[#FF5100]">Lineup</span>
          </h2>
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs uppercase tracking-widest font-bold">
              <span>🃏</span> Elige una carta para conocer los detalles
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ready && shuffledProgram.map((session, index) => (
            <FlipCard key={session.id} session={session} shuffleDelay={index * 0.1} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} className="text-center mt-20">
          <button onClick={onBuyTickets}
            className="premium-button premium-gradient-orange text-white px-12 py-5 shadow-2xl shadow-orange-500/30 font-black uppercase tracking-[0.2em]">
            Asegurar mi lugar ahora →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
