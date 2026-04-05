import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, EyeOff, Edit3, Trash2, Clock, Users, Star, Zap, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal from './AdminModal';

interface AgendaTabProps {
  sessions: any[];
  onRefresh: () => void;
  onSessionsChange?: (updated: any[]) => void;
}

const TYPE_CONFIGS: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  conferencia: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Zap, label: 'Conferencia' },
  conversatorio: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Users, label: 'Conversatorio' },
  especial: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Star, label: 'Especial' },
  registro: { color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Clock, label: 'Registro / Break' },
  sorpresa: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Lock, label: '🔒 Sorpresa' },
};

const EMPTY_SESSION = {
  id: '',
  badge: '',
  title: '',
  subtitle: '',
  type: 'conferencia',
  time: '',
  isMystery: false,
  isHighlight: false,
  speakers: [] as { name: string; title: string }[],
};

export default function AgendaTab({ sessions, onRefresh, onSessionsChange }: AgendaTabProps) {
  const [localSessions, setLocalSessions] = useState<any[]>(sessions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any & { _index?: number }>(EMPTY_SESSION);
  const [speakerInput, setSpeakerInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => { setLocalSessions(sessions); }, [sessions]);

  const openNew = () => {
    setEditing({ ...EMPTY_SESSION, id: `custom-${Date.now()}` });
    setSpeakerInput('');
    setModalOpen(true);
  };

  const openEdit = (session: any, index: number) => {
    setEditing({ ...session, _index: index });
    setSpeakerInput('');
    setModalOpen(true);
  };

  const addSpeaker = () => {
    const trimmed = speakerInput.trim();
    if (!trimmed) return;
    setEditing((prev: any) => ({
      ...prev,
      speakers: [...(prev.speakers || []), { name: trimmed, title: '' }],
    }));
    setSpeakerInput('');
  };

  const removeSpeaker = (i: number) => {
    setEditing((prev: any) => ({
      ...prev,
      speakers: prev.speakers.filter((_: any, idx: number) => idx !== i),
    }));
  };

  const toggleReveal = (index: number) => {
    const updated = localSessions.map((s, i) =>
      i === index ? { ...s, isMystery: !s.isMystery } : s
    );
    setLocalSessions(updated);
    onSessionsChange?.(updated);
    toast.success('Visibilidad actualizada');
  };

  const handleDelete = (index: number) => {
    const updated = localSessions.filter((_, i) => i !== index);
    setLocalSessions(updated);
    onSessionsChange?.(updated);
    toast.success('Sesión eliminada');
  };

  const handleSave = async () => {
    if (!editing.title.trim()) {
      toast.error('El título de la sesión es obligatorio');
      return;
    }
    setIsSaving(true);
    try {
      let updated: any[];
      const cleanSession = { ...editing };
      delete cleanSession._index;

      if (editing._index !== undefined) {
        updated = localSessions.map((s, i) => i === editing._index ? cleanSession : s);
        toast.success('Sesión actualizada correctamente');
      } else {
        updated = [...localSessions, cleanSession];
        toast.success('Nueva sesión agregada al programa 🗓️');
      }

      setLocalSessions(updated);
      onSessionsChange?.(updated);
      setModalOpen(false);
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tighter">
            Gestión de <span className="text-orange-500 text-glow-orange">Agenda</span>
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {localSessions.length} sesiones en el programa — {localSessions.filter(s => !s.isMystery).length} visibles para el público
          </p>
        </div>
        <button
          onClick={openNew}
          className="premium-button premium-gradient-orange text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Sesión
        </button>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-4">
        {localSessions.map((session, index) => {
          const cfg = TYPE_CONFIGS[session.type] || TYPE_CONFIGS.conferencia;
          const Icon = cfg.icon;
          const isRevealed = !session.isMystery;
          const speakerNames = session.speakers?.map((s: any) => s.name).join(' • ');

          return (
            <motion.div
              key={session.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`premium-card !p-0 overflow-hidden border-l-4 ${
                isRevealed ? 'border-emerald-500' : 'border-purple-500'
              } group hover:border-orange-500 transition-all`}
            >
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {session.badge || cfg.label}
                    </span>
                    {session.isHighlight && (
                      <span className="text-[9px] font-black uppercase bg-orange-500 text-white px-2 py-0.5 rounded">
                        Highlight
                      </span>
                    )}
                    {!isRevealed && (
                      <span className="text-[9px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Oculta
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-orange-500 transition-colors truncate">
                    {session.title}
                  </h4>
                  {session.subtitle && (
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                      {session.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-bold">
                    {session.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" /> {session.time}
                      </span>
                    )}
                    {speakerNames && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Users className="w-3 h-3 text-slate-600" /> {speakerNames}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleReveal(index)}
                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                    title={isRevealed ? 'Ocultar del público' : 'Revelar al público'}
                  >
                    {isRevealed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(session, index)}
                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all"
                    title="Editar sesión"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2.5 bg-red-500/5 border border-red-500/5 rounded-xl text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing._index !== undefined ? 'Editar Sesión' : 'Nueva Sesión'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título *</label>
              <input
                type="text"
                value={editing.title}
                onChange={e => setEditing((p: any) => ({ ...p, title: e.target.value }))}
                placeholder="Ej: Impacto Sonorense Internacional"
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subtítulo</label>
              <input
                type="text"
                value={editing.subtitle || ''}
                onChange={e => setEditing((p: any) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Ej: Lo Hecho en Sonora se Hace Bien"
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Badge & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Etiqueta / Badge</label>
              <input
                type="text"
                value={editing.badge || ''}
                onChange={e => setEditing((p: any) => ({ ...p, badge: e.target.value }))}
                placeholder="Ej: CONFERENCIA MAGISTRAL"
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Horario</label>
              <input
                type="text"
                value={editing.time || ''}
                onChange={e => setEditing((p: any) => ({ ...p, time: e.target.value }))}
                placeholder="Ej: 10:00 – 10:50 hrs"
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tipo de Sesión</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_CONFIGS).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = editing.type === key;
                return (
                  <button
                    key={key}
                    onClick={() => setEditing((p: any) => ({ ...p, type: key }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? `${cfg.bg} ${cfg.color} border-current`
                        : 'border-white/10 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speakers */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Ponentes / Participantes
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={speakerInput}
                onChange={e => setSpeakerInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSpeaker()}
                placeholder="Nombre del ponente — Enter para agregar"
                className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-sm font-medium transition-all"
              />
              <button
                onClick={addSpeaker}
                className="px-4 bg-orange-500/20 border border-orange-500/30 rounded-2xl text-orange-400 hover:bg-orange-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editing.speakers?.map((s: any, i: number) => (
                <span key={i} className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-full px-3 py-1.5 text-xs font-bold">
                  {s.name}
                  <button onClick={() => removeSpeaker(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <button
              onClick={() => setEditing((p: any) => ({ ...p, isMystery: !p.isMystery }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                editing.isMystery
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                  : 'border-white/10 text-slate-500 hover:border-white/20'
              }`}
            >
              {editing.isMystery ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {editing.isMystery ? 'Sesión Oculta' : 'Pública'}
            </button>
            <button
              onClick={() => setEditing((p: any) => ({ ...p, isHighlight: !p.isHighlight }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                editing.isHighlight
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'border-white/10 text-slate-500 hover:border-white/20'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Highlight
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3.5 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all font-bold text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 premium-button premium-gradient-orange text-white disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : editing._index !== undefined ? 'Guardar Cambios' : 'Agregar Sesión'}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
