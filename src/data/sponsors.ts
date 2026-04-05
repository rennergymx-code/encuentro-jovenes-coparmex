export type SponsorTier = 'expansion' | 'sonora' | 'compa';
export type PaymentStatus = 'sin_pago' | 'pagado';

export interface Sponsor {
  name: string;
  logo: string;
  tier: SponsorTier;
  contribution?: string;
  paymentStatus?: PaymentStatus;
}

// EXPANSIÓN = $25,000 MXN | SONORA = $10,000 MXN | COMPA = En Especie
export const SPONSORS: Sponsor[] = [
  // ── EXPANSIÓN ($25,000 MXN) ──────────────────────────────────
  { name: 'Nissauto',          logo: '/assets/sponsors/nissan_clean.png',     tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Gasolinera ARCO',   logo: '/assets/sponsors/arco_clean.png',       tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Grupo QAR',         logo: '/assets/sponsors/qar_clean.png',        tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'VitalHealth',       logo: '/assets/sponsors/vital_clean.png',      tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Rennergy',          logo: '/assets/sponsors/rennergy_clean.png',   tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },

  // ── SONORA ($10,000 MXN) ─────────────────────────────────────
  { name: 'Vera Dorame',                  logo: '',                                            tier: 'sonora', contribution: 'Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Porchas Blanco & Asociados',   logo: '/assets/sponsors/porchas_clean.png',          tier: 'sonora', contribution: 'Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Impulsores',                   logo: '/assets/sponsors/impulsores_clean.png',       tier: 'sonora', contribution: 'Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'SECOIP',                       logo: '/assets/sponsors/secoip_clean.png',           tier: 'sonora', contribution: 'Presencia de Marca + Seguridad', paymentStatus: 'sin_pago' },

  // ── COMPA (En Especie) ───────────────────────────────────────
  { name: 'Sangre del Desierto', logo: '', tier: 'compa', contribution: 'Apoyo en Especie', paymentStatus: 'sin_pago' },
];
