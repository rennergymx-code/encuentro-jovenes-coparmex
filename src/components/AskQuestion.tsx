import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, User, ChevronRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

export default function AskQuestion() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [session, setSession] = useState<any>(null);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  async function fetchSession() {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (data) setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
          session_id: sessionId || 'general',
          attendee_name: name || 'Anónimo',
          question_text: question,
          is_answered: false
        }]);

      if (error) throw error;
      
      setIsSuccess(true);
      toast.success('¡Pregunta enviada! Estará en la lista de moderación.');
    } catch (err: any) {
      toast.error('Error al enviar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-montserrat flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-500/50 rounded-full blur-[150px] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 rotate-3">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Haz tu <span className="text-orange-500">Pregunta</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {session ? `Sesión: ${session.title}` : 'Preguntas al Ponente'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Tu Nombre (Opcional)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Tu Pregunta</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Escribe aquí tu duda..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 px-6 outline-none focus:border-orange-500/50 transition-all font-medium text-sm resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !question.trim()}
                className="w-full premium-gradient-orange py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Enviar Pregunta <Send className="w-4 h-4" /></>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card text-center py-12 space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">¡Gracias por participar!</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Tu pregunta ha sido enviada al equipo de moderación. Esté atento a la respuesta en pantalla.</p>
              </div>
              <button 
                onClick={() => { setIsSuccess(false); setQuestion(''); }}
                className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:gap-3 transition-all"
              >
                Hacer otra pregunta <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Encuentro Jóvenes COPARMEX 2026</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
