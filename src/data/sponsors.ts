export type SponsorTier = 'expansion' | 'sonora' | 'compa';
export type PaymentStatus = 'sin_pago' | 'pagado';

export interface Sponsor {
  id?: string;
  name: string;
  logo: string;
  tier: SponsorTier;
  contribution?: string;
  paymentStatus?: PaymentStatus;
}

// EXPANSIÓN = $25,000 MXN | SONORA = $10,000 MXN | COMPA = En Especie
export const SPONSORS: Sponsor[] = [
  // ── EXPANSIÓN ($25,000 MXN) ──────────────────────────────────
  { name: 'Nissauto',          logo: '/assets/sponsors/Nissan Granauto.png',   tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Gasolinera ARCO',   logo: '/assets/sponsors/Arco.png',              tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Grupo QAR',         logo: '/assets/sponsors/Grupo QAR.png',         tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'VitalHealth',       logo: '/assets/sponsors/VitalHealth.png',       tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Rennergy',          logo: '/assets/sponsors/Rennergy.png',          tier: 'expansion', contribution: 'Stand + Presencia de Marca', paymentStatus: 'sin_pago' },

  // ── SONORA ($10,000 MXN) ─────────────────────────────────────
  { name: 'Vera Dorame',                  logo: '/assets/sponsors/Dora Verame.png',            tier: 'sonora', contribution: 'Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Porchas Blanco & Asociados',   logo: '/assets/sponsors/Porchas Blanco.png',         tier: 'sonora', contribution: 'Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'Impulsores',                   logo: '/assets/sponsors/Impulsores.png',              tier: 'sonora', contribution: 'Presencia de Marca', paymentStatus: 'sin_pago' },
  { name: 'SECOIP',                       logo: '/assets/sponsors/SECOIP.png',                  tier: 'sonora', contribution: 'Presencia de Marca + Seguridad', paymentStatus: 'sin_pago' },

  // ── COMPA (En Especie) ───────────────────────────────────────
  { name: 'Sangre del Desierto', logo: '/assets/sponsors/Sangre del Desierto.png', tier: 'compa', contribution: 'Apoyo en Especie', paymentStatus: 'sin_pago' },
  { name: 'DVL Film House',      logo: '/assets/sponsors/DVL Film House.png',      tier: 'compa', contribution: 'Apoyo en Especie', paymentStatus: 'sin_pago' },
];
