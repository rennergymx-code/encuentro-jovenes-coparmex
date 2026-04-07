import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase Config');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSession() {
  const { data, error } = await supabase
    .from('sessions')
    .update({ 
      title: 'El Sonido de Sonora en el Mundo',
      subtitle: 'La Industria Musical como Detonador Económico Regional' 
    })
    .eq('id', 'conv2');

  if (error) {
    console.error('Error updating session:', error);
  } else {
    console.log('Session updated successfully:', data);
  }
}

updateSession();
