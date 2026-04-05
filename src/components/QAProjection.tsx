import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, User, Clock, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function QAProjection() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [questions, setQuestions] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('qa-projection-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  async function fetchData() {
    try {
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_answered', false)
        .order('created_at', { ascending: false });

      const { data: sData } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (qData) setQuestions(qData);
      if (sData) setSession(sData);
    } catch (err) {
      console.error(err);
    }
  }

  // Si no hay sesión seleccionada, mostramos un aviso
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-700">SESIÓN NO SELECCIONADA</h1>
      </div>
    );
  }

  const currentQuestion = questions[0]; // La más reciente (o la que elijan moderar)
  const remainingQuestions = questions.slice(1, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-montserrat p-20 relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[200px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[200px]"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-end mb-24 z-10">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter opacity-50 italic">Preguntas al Ponente</h2>
           </div>
           <h1 className="text-6xl font-black uppercase tracking-tighter text-glow-orange leading-none">
             {session?.title || 'Siguiente Sesión'}
           </h1>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">Moderación en Tiempo Real</p>
           <p className="text-2xl font-black uppercase tracking-widest text-slate-400">Escanea el QR para preguntar</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-20 z-10">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div 
                key={currentQuestion.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="premium-card p-20 min-h-[500px] flex flex-col justify-center border-white/5 shadow-3xl bg-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
                
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-white/10">
                      <User className="w-8 h-8 text-slate-500" />
                   </div>
                   <div>
                      <p className="text-3xl font-black uppercase tracking-tighter text-orange-500">{currentQuestion.attendee_name || 'Anónimo'}</p>
                      <p className="text-lg font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-5 h-5" /> {new Date(currentQuestion.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                </div>

                <p className="text-6xl font-extrabold text-slate-100 leading-tight">
                  "{currentQuestion.question_text}"
                </p>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                 <Sparkles className="w-24 h-24 mb-6" />
                 <p className="text-4xl font-black uppercase tracking-widest">Esperando preguntas del público...</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-12">
           <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 flex items-center gap-4">
             <div className="h-[2px] flex-1 bg-white/10 text-glow-white"></div>
             Cola de Espera
           </h3>
           
           <div className="space-y-8">
             <AnimatePresence mode="popLayout">
               {remainingQuestions.map((q) => (
                 <motion.div 
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card p-8 border-white/5 bg-white/2"
                 >
                   <p className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">{q.attendee_name || 'Anónimo'}</p>
                   <p className="text-2xl font-bold text-slate-300 line-clamp-3">"{q.question_text}"</p>
                 </motion.div>
               ))}
             </AnimatePresence>

             {questions.length > 4 && (
               <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">+{questions.length - 4} preguntas más en espera</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-20 flex justify-between items-center z-10 pt-12 border-t border-white/5">
        <div className="flex items-center gap-10">
          <img src="/logo-coparmex.png" alt="Coparmex" className="h-12 opacity-50" />
          <div className="h-8 w-px bg-white/10"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">Encuentro Jóvenes COPARMEX 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-glow-red"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">LIVE MODERATION</span>
        </div>
      </div>
    </div>
  );
}
