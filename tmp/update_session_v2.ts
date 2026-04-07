import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runUpdate() {
  console.log('Updating session "conv2" in Supabase...');
  
  const { data, error } = await supabase
    .from('sessions')
    .update({ 
      title: 'El Sonido de Sonora en el Mundo',
      subtitle: 'La Industria Musical como Detonador Económico Regional'
    })
    .eq('id', 'conv2');

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('Session record not found in Supabase (possibly fresh install). Skipping DB update.');
    } else {
      console.error('Error updating session:', error.message);
    }
  } else {
    console.log('Session updated successfully in Supabase.');
  }
}

runUpdate();
