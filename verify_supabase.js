import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('Verificando conexión con Supabase...');
  console.log(`URL: ${supabaseUrl}`);

  // Verificar tabla Sponsors
  const { data: sponsors, error: errorSponsors } = await supabase
    .from('sponsors')
    .select('name, tier, payment_status');

  if (errorSponsors) {
    console.error('❌ Error leyendo SPONSORS:', errorSponsors.message);
  } else {
    console.log(`✅ Tabla SPONSORS existe. Filas encontradas: ${sponsors.length}`);
    if (sponsors.length > 0) {
      console.log(`   Ejemplo: ${sponsors[0].name} (${sponsors[0].tier}) - ${sponsors[0].payment_status}`);
    }
  }

  // Verificar tabla Agenda
  const { data: agenda, error: errorAgenda } = await supabase
    .from('agenda')
    .select('title, type');

  if (errorAgenda) {
    console.error('❌ Error leyendo AGENDA:', errorAgenda.message);
  } else {
    console.log(`✅ Tabla AGENDA existe. Filas encontradas: ${agenda.length}`);
    if (agenda.length > 0) {
      console.log(`   Ejemplo: ${agenda[0].title} (${agenda[0].type})`);
    }
  }
}

verify();
