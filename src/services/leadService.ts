import { supabase } from './supabaseClient';

export const leadService = {
  async createLead(data: { name: string, email?: string, phone?: string, source: string }) {
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([{
        full_name: data.name,
        email: data.email,
        whatsapp: data.phone,
        status: 'new',
        metadata: { source: data.source }
      }])
      .select()
      .single();

    if (error) throw error;
    return lead;
  },

  async updateLeadStatus(id: string, status: string) {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
};
