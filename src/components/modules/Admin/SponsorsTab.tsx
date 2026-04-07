import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, Upload, ImageOff, Check, X, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal from './AdminModal';
import type { Sponsor, SponsorTier } from '../../../data/sponsors';

interface SponsorsTabProps {
  sponsors: Sponsor[];
  onRefresh: () => void;
  onSponsorsChange?: (updated: Sponsor[]) => void;
}

const TIER_CONFIG: Record<SponsorTier, { label: string; price: string; perks: string; color: string; bg: string; border: string }> = {
  expansion: {
    label: 'EXPANSIÓN',
    price: '$25,000 MXN',
    perks: 'Stand + Presencia de Marca',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  sonora: {
    label: 'SONORA',
    price: '$10,000 MXN',
    perks: 'Presencia de Marca',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  compa: {
    label: 'COMPA',
    price: 'En Especie',
    perks: 'Apoyo en especie / logístico',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
};

const EMPTY_SPONSOR: Sponsor = { 
  id: undefined,
  name: '', 
  logo: '', 
  tier: 'compa', 
  contribution: '',
  paymentStatus: 'sin_pago'
};

export default function SponsorsTab({ sponsors, onRefresh, onSponsorsChange }: SponsorsTabProps) {
  const [localSponsors, setLocalSponsors] = useState<Sponsor[]>(sponsors);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor & { _index?: number }>(EMPTY_SPONSOR);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [metaGoal, setMetaGoal] = useState(300000);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaInputValue, setMetaInputValue] = useState('300000');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metaInputRef = useRef<HTMLInputElement>(null);

  // Keep in sync if parent refreshes
  React.useEffect(() => { setLocalSponsors(sponsors); }, [sponsors]);

  const openNew = () => {
    setEditingSponsor({ ...EMPTY_SPONSOR });
    setLogoPreview('');
    setModalOpen(true);
  };

  const openEdit = (sponsor: Sponsor, index: number) => {
    setEditingSponsor({ ...sponsor, _index: index });
    setLogoPreview(sponsor.logo || '');
    setModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es muy grande (máx. 5MB)');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setEditingSponsor(prev => ({ ...prev, logo: objectUrl }));
  };

  const handleSave = async () => {
    if (!editingSponsor.name.trim()) {
      toast.error('El nombre del patrocinador es obligatorio');
      return;
    }
    setIsSaving(true);
    try {
      let updated: Sponsor[];
      const cleanSponsor: Sponsor = {
        id: editingSponsor.id,
        name: editingSponsor.name,
        logo: editingSponsor.logo || logoPreview,
        tier: editingSponsor.tier,
        contribution: editingSponsor.contribution,
        paymentStatus: editingSponsor.paymentStatus,
      };

      if (editingSponsor._index !== undefined) {
        updated = localSponsors.map((s, i) => i === editingSponsor._index ? cleanSponsor : s);
        toast.success('Patrocinador actualizado correctamente');
      } else {
        updated = [...localSponsors, cleanSponsor];
        toast.success('Nuevo patrocinador agregado — ya aparece en el Landing 🎉');
      }

      setLocalSponsors(updated);
      onSponsorsChange?.(updated);
      setModalOpen(false);
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (index: number) => {
    const updated = localSponsors.filter((_, i) => i !== index);
    setLocalSponsors(updated);
    onSponsorsChange?.(updated);
    toast.success('Patrocinador eliminado');
  };

  const tierCounts = {
    expansion: localSponsors.filter(s => s.tier === 'expansion').length,
    sonora: localSponsors.filter(s => s.tier === 'sonora').length,
    compa: localSponsors.filter(s => s.tier === 'compa').length,
  };

  const TIER_VALUE = { expansion: 25000, sonora: 10000, compa: 0 };

  // Only count sponsors that are PAGADO toward the total
  const totalCash = localSponsors
    .filter(s => s.paymentStatus === 'pagado')
    .reduce((sum, s) => sum + (TIER_VALUE[s.tier] || 0), 0);

  const pendingCash = localSponsors
    .filter(s => s.paymentStatus !== 'pagado' && s.tier !== 'compa')
    .reduce((sum, s) => sum + (TIER_VALUE[s.tier] || 0), 0);
  
  const totalEspecie = tierCounts.compa;
  const progressPct = metaGoal > 0 ? Math.min((totalCash / metaGoal) * 100, 100) : 0;

  const togglePayment = (index: number) => {
    const updated = localSponsors.map((s, i) => {
      if (i !== index) return s;
      const next = s.paymentStatus === 'pagado' ? 'sin_pago' : 'pagado';
      return { ...s, paymentStatus: next };
    });
    setLocalSponsors(updated);
    onSponsorsChange?.(updated);
    const isPaid = updated[index].paymentStatus === 'pagado';
    toast.success(isPaid ? '✅ Pago confirmado' : 'Marcado como Sin Pago');
  };

  const commitMeta = () => {
    const parsed = parseInt(metaInputValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setMetaGoal(parsed);
      setMetaInputValue(parsed.toLocaleString());
    } else {
      setMetaInputValue(metaGoal.toLocaleString());
    }
    setEditingMeta(false);
  };

  const startEditMeta = () => {
    setMetaInputValue(String(metaGoal));
    setEditingMeta(true);
    setTimeout(() => metaInputRef.current?.select(), 50);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tighter">
            Gestión de <span className="text-orange-500 text-glow-orange">Patrocinadores</span>
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {localSponsors.length} patrocinios activos — 3 paquetes disponibles
          </p>
        </div>
        <button
          onClick={openNew}
          className="premium-button premium-gradient-orange text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Patrocinador
        </button>
      </div>

      {/* Package Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(TIER_CONFIG) as SponsorTier[]).map(tier => {
          const cfg = TIER_CONFIG[tier];
          const value = TIER_VALUE[tier];
          const subtotal = tierCounts[tier] * value;
          return (
            <div key={tier} className={`premium-card border ${cfg.border} !p-6 space-y-2`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                Paquete {cfg.label}
              </span>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black">{tierCounts[tier]}</p>
                  <p className="text-xs text-slate-500 font-bold">{cfg.perks}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black ${cfg.bg} ${cfg.color} px-3 py-1 rounded-full block mb-1`}>
                    {cfg.price}
                  </span>
                  {value > 0 && subtotal > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      = ${subtotal.toLocaleString()} MXN
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="premium-card border border-orange-500/20 !p-0 overflow-hidden">
        {/* Banner header */}
        <div className="px-8 py-5 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Resumen Financiero — Patrocinios</h4>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Ejercicio 2026</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total en efectivo */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Confirmado</p>
            <p className="text-4xl font-black text-emerald-400">
              ${totalCash.toLocaleString()}
              <span className="text-base text-slate-500 font-bold ml-1">MXN</span>
            </p>
            {pendingCash > 0 && (
              <p className="text-[10px] text-yellow-500 font-bold uppercase">
                + ${pendingCash.toLocaleString()} pendiente de cobro
              </p>
            )}
          </div>

          {/* En especie */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patrocinios en Especie</p>
            <p className="text-4xl font-black text-slate-300">
              {totalEspecie}
              <span className="text-base text-slate-500 font-bold ml-1">COMPAS</span>
            </p>
            <p className="text-[10px] text-slate-600 font-bold uppercase">Apoyo logístico / en especie</p>
          </div>

          {/* Meta progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avance vs Meta</p>
              <span className={`text-xs font-black ${
                progressPct >= 100 ? 'text-emerald-400' :
                progressPct >= 50 ? 'text-orange-400' : 'text-yellow-400'
              }`}>{progressPct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  progressPct >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                    : 'bg-gradient-to-r from-orange-500 to-orange-300'
                }`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">${totalCash.toLocaleString()} recaudado</span>

              {/* ── Editable Meta ── */}
              <button
                onClick={startEditMeta}
                className={`group flex items-center gap-1.5 transition-all ${
                  editingMeta ? 'hidden' : 'block'
                }`}
                title="Clic para editar la meta"
              >
                <span className="text-slate-500 group-hover:text-orange-400 transition-colors">
                  Meta: ${metaGoal.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-700 group-hover:text-orange-500 border border-slate-700 group-hover:border-orange-500/40 rounded px-1 py-0.5 transition-all">
                  editar
                </span>
              </button>

              {editingMeta && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Meta: $</span>
                  <input
                    ref={metaInputRef}
                    type="text"
                    inputMode="numeric"
                    value={metaInputValue}
                    onChange={e => setMetaInputValue(e.target.value)}
                    onBlur={commitMeta}
                    onKeyDown={e => { if (e.key === 'Enter') commitMeta(); if (e.key === 'Escape') { setEditingMeta(false); setMetaInputValue(String(metaGoal)); } }}
                    className="w-28 bg-slate-900 border border-orange-500/50 rounded-lg px-2 py-1 text-[10px] font-black text-orange-400 outline-none text-right"
                  />
                  <span className="text-slate-500">MXN</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown row */}
        <div className="border-t border-white/5 px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02]">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">EXPANSIÓN × {tierCounts.expansion}</p>
            <p className="text-sm font-black text-orange-400">${(tierCounts.expansion * 25000).toLocaleString()} MXN</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">SONORA × {tierCounts.sonora}</p>
            <p className="text-sm font-black text-sky-400">${(tierCounts.sonora * 10000).toLocaleString()} MXN</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">COMPA (especie)</p>
            <p className="text-sm font-black text-slate-400">{tierCounts.compa} patrocinios</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">TOTAL PATROCINADORES</p>
            <p className="text-sm font-black">{localSponsors.length}</p>
          </div>
        </div>
      </div>

      {/* Sponsors Table */}
      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-5">Logo</th>
                <th className="px-6 py-5">Empresa</th>
                <th className="px-6 py-5">Paquete</th>
                <th className="px-6 py-5">Aportación</th>
                <th className="px-6 py-5">Estatus Pago</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {localSponsors.map((sponsor, index) => {
                const cfg = TIER_CONFIG[sponsor.tier];
                return (
                  <motion.tr
                    key={`${sponsor.name}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-16 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="max-w-full max-h-full object-contain brightness-150"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <ImageOff className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold uppercase tracking-tight text-sm">{sponsor.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 font-medium">{sponsor.contribution || '—'}</p>
                    </td>
                    {/* Payment Status Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePayment(index)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          sponsor.paymentStatus === 'pagado'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10'
                        }`}
                        title="Clic para cambiar estatus de pago"
                      >
                        {sponsor.paymentStatus === 'pagado'
                          ? <><CheckCircle2 className="w-3.5 h-3.5" /> Pagado</>
                          : <><Clock className="w-3.5 h-3.5" /> Sin Pago</>
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(sponsor, index)}
                          className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-2.5 bg-red-500/5 border border-red-500/5 rounded-xl text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {localSponsors.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">
                Sin patrocinadores registrados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSponsor._index !== undefined ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}
      >
        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Logo de la Empresa
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-24 h-16 rounded-2xl bg-slate-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="preview" className="max-w-full max-h-full object-contain brightness-150" />
                ) : (
                  <ImageOff className="w-6 h-6 text-slate-700" />
                )}
              </div>
              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:text-white hover:border-orange-500/50 transition-all text-sm font-bold"
                >
                  <Upload className="w-4 h-4" />
                  {logoPreview ? 'Cambiar Logo' : 'Subir Logo (PNG/SVG)'}
                </button>
                <p className="text-[10px] text-slate-600 mt-2 font-medium">
                  Fondo transparente recomendado. Máx. 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              value={editingSponsor.name}
              onChange={e => setEditingSponsor(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Nissauto, Gasolineras ARCO..."
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-orange-500 outline-none transition-all font-medium text-sm"
            />
          </div>

          {/* Package Selection */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Paquete de Patrocinio *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(TIER_CONFIG) as SponsorTier[]).map(tier => {
                const cfg = TIER_CONFIG[tier];
                const isSelected = editingSponsor.tier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => setEditingSponsor(prev => ({ ...prev, tier }))}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? `${cfg.border} ${cfg.bg}`
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isSelected && <Check className={`w-3 h-3 ${cfg.color} mb-1`} />}
                    <p className={`text-xs font-black uppercase ${isSelected ? cfg.color : 'text-slate-400'}`}>
                      {cfg.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{cfg.price}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contribution Note */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Detalle de Aportación (opcional)
            </label>
            <input
              type="text"
              value={editingSponsor.contribution || ''}
              onChange={e => setEditingSponsor(prev => ({ ...prev, contribution: e.target.value }))}
              placeholder="Ej: Stand 3x3 + Roll-up + Mochila promo..."
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-orange-500 outline-none transition-all font-medium text-sm"
            />
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
              {isSaving ? 'Guardando...' : editingSponsor._index !== undefined ? 'Guardar Cambios' : 'Agregar Patrocinador'}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
