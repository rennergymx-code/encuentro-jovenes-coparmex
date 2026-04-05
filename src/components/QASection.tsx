import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, User, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export default function QASection() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
    
    // Subscribe to changes
    const channel = supabase
      .channel('public:questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchQuestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
          text: newQuestion,
          author_name: authorName.trim() || 'Anónimo',
          is_answered: false
        }]);

      if (error) throw error;

      setNewQuestion('');
      setAuthorName('');
      toast.success('¡Pregunta enviada! Estaremos respondiendo al final.');
    } catch (error: any) {
      console.error(error);
      toast.error('Error al enviar pregunta: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <div className="w-24 h-24 premium-gradient-orange rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/20">
          <MessageSquare className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Preguntas <span className="text-orange-500 text-glow-orange">Q&A</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto font-medium">
          ¿Tienes alguna duda para nuestros ponentes? Escríbela aquí y la responderemos al final del evento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Form Section */}
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="premium-card space-y-8 sticky top-32">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Enviar <span className="text-orange-500">Pregunta</span></h3>
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Tu Nombre (Opcional)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-orange-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Tu Pregunta</label>
              <textarea 
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Escribe aquí tu duda..."
                rows={5}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-4 focus:border-orange-500 outline-none transition-all font-medium resize-none shadow-inner"
              />
            </div>

            <button 
              type="submit"
              disabled={submitting || !newQuestion.trim()}
              className="w-full premium-button premium-gradient-orange text-white py-5 text-lg"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Enviar Pregunta</>}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight">Recientes</h3>
            <span className="bg-orange-500/10 text-orange-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">{questions.length} Preguntas</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode="popLayout">
              {questions.map((q, i) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-10 rounded-[48px] border-2 transition-all shadow-xl glass-morphism ${
                    q.is_answered 
                    ? 'bg-slate-900/40 border-white/5 opacity-60' 
                    : 'bg-slate-900 border-white/5 hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-sm font-black text-orange-500 shadow-inner">
                        {q.author_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <span className="font-black text-sm uppercase tracking-tight block">{q.author_name || 'Anónimo'}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xl font-medium leading-relaxed mb-8 italic text-slate-200">"{q.text}"</p>
                  
                  {q.is_answered && (
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-2 px-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 w-fit">
                      <CheckCircle2 className="w-4 h-4" /> Respondida
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {questions.length === 0 && !loading && (
            <div className="text-center py-32 premium-card border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <MessageSquare className="w-10 h-10 text-slate-700" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm italic">Aún no hay preguntas. <br/> ¡Sé el primero en participar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
