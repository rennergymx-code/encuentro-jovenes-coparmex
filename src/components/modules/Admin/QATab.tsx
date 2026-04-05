import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  QrCode, 
  Filter,
  User,
  Clock,
  ChevronRight
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../../services/supabaseClient';
import { toast } from 'sonner';

interface QATabProps {
  questions: any[];
  sessions: any[];
  onRefresh: () => void;
}

export default function QATab({ questions, sessions, onRefresh }: QATabProps) {
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [showQR, setShowQR] = useState<string | null>(null);

  const filteredQuestions = questions.filter(q => 
    selectedSession === 'all' || q.session_id === selectedSession
  );

  const toggleAnswered = async (q: any) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ is_answered: !q.is_answered })
        .eq('id', q.id);
      
      if (error) throw error;
      toast.success(q.is_answered ? 'Pregunta marcada como pendiente' : 'Pregunta marcada como respondida');
      onRefresh();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('¿Seguro quieres eliminar esta pregunta?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Pregunta eliminada');
      onRefresh();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const openProjection = () => {
    const url = `/qa-projection?session=${selectedSession}`;
    window.open(url, '_blank', 'width=1200,height=800');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-glow-emerald">Moderación <span className="text-orange-500">Q&A</span></h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sincronización en tiempo real con el público</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest outline-none focus:border-orange-500 transition-all appearance-none"
            >
              <option value="all">Todas las Sesiones</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={openProjection}
            disabled={selectedSession === 'all'}
            className="premium-button premium-gradient-orange text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Proyectar Screen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Questions List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <motion.div 
                  key={q.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`premium-card transition-all ${
                    q.is_answered ? 'opacity-50 border-emerald-500/20' : 'border-white/10 shadow-xl'
                  }`}
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <User className="w-3 h-3" /> {q.attendee_name || 'Anónimo'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Clock className="w-3 h-3" /> {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {q.is_answered && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Respondida</span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-slate-200 leading-tight">"{q.question_text}"</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/50 italic">#{q.session_id}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                         onClick={() => toggleAnswered(q)}
                         className={`p-4 rounded-2xl transition-all border ${
                           q.is_answered 
                           ? 'bg-slate-800 border-white/5 text-slate-500' 
                           : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                         }`}
                         title={q.is_answered ? "Marcar como pendiente" : "Marcar como respondida"}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteQuestion(q.id)}
                        className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="premium-card text-center py-20">
                <MessageSquare className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No hay preguntas registradas para esta sesión</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* QR Section */}
        <div className="space-y-8">
           <div className="premium-card sticky top-8">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                 <QrCode className="w-5 h-5 text-orange-500" />
               </div>
               <div>
                 <h4 className="text-sm font-black uppercase tracking-widest">Código QR Público</h4>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Para escaneo en pantalla</p>
               </div>
             </div>

             {selectedSession !== 'all' ? (
               <div className="space-y-8">
                 <div className="bg-white p-6 rounded-3xl flex justify-center shadow-2xl">
                    <QRCodeCanvas 
                      value={`${window.location.origin}/ask-question?session=${selectedSession}`} 
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                 </div>
                 <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">URL de la sesión:</p>
                   <p className="text-xs font-mono text-orange-500 text-center break-all">{window.location.origin}/ask-question?session={selectedSession}</p>
                 </div>
                 <button className="w-full premium-button bg-white/5 text-xs text-white border border-white/10">
                   <Download className="w-4 h-4 mr-2" /> Descargar QR
                 </button>
               </div>
             ) : (
               <div className="aspect-square bg-slate-900/50 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-8">
                 <Filter className="w-10 h-10 text-slate-800 mb-4" />
                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Selecciona una sesión para generar el QR</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
