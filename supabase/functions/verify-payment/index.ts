import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transaction_id, checkout_state } = await req.json()

    if (!transaction_id || !checkout_state) {
      throw new Error("Missing transaction_id or checkout_state")
    }

    const MERCHANT_ID = Deno.env.get('OPENPAY_MERCHANT_ID') || 'mbelpk22gx9nutnfyucj';
    const PRIVATE_KEY = Deno.env.get('OPENPAY_PRIVATE_KEY') || 'sk_b587b0ece0824668b9e434ce6bee42f7';
    const API_URL = `https://sandbox-api.openpay.mx/v1/${MERCHANT_ID}/charges/${transaction_id}`;

    const auth = btoa(`${PRIVATE_KEY}:`);

    console.log(`--- Verificando Transacción ${transaction_id} ---`);

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });

    const charge = await response.json();

    if (!response.ok) {
      console.error('❌ Error OpenPay get charge:', charge);
      throw new Error(charge.description || "Error al consultar la transacción");
    }

    console.log(`Estatus OpenPay: ${charge.status}`);

    if (charge.status === 'completed') {
      // Inicializar Supabase con Service Role para saltar RLS y asegurar el registro
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Verificar idempotencia: ¿Ya existe esta compra?
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('openpay_id', transaction_id)
        .maybeSingle();

      if (existingPurchase) {
        console.log('Compra ya registrada anteriormente.');
        // Recuperar boletos existentes para devolverlos
        const { data: existingTickets } = await supabase
          .from('tickets')
          .select('*')
          .eq('purchase_id', existingPurchase.id);

        return new Response(JSON.stringify({ 
          success: true, 
          status: 'completed',
          already_registered: true,
          tickets: existingTickets 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 2. Registrar la compra
      const { attendees, selectedType, quantity, billing, paymentMethod } = checkout_state;

      const { data: purchase, error: pError } = await supabase
        .from('purchases')
        .insert([{
          buyer_name: attendees[0].name,
          buyer_email: attendees[0].email,
          total_amount: charge.amount, // Usar el monto real cobrado
          payment_method: paymentMethod || 'card',
          status: 'completed',
          billing_info: billing.requiresInvoice ? billing : {},
          openpay_id: transaction_id
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 3. Generar boletos
      const ticketsToInsert = attendees.map((attendee: any) => {
        const ticketId = Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
          id: ticketId,
          purchase_id: purchase.id,
          attendee_name: attendee.name,
          attendee_email: attendee.email,
          attendee_phone: attendee.phone,
          type: selectedType,
          qr_code: ticketId,
          status: 'active'
        };
      });

      const { error: tError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert);

      if (tError) throw tError;

      console.log('✅ Registro completado exitosamente.');

      return new Response(JSON.stringify({ 
        success: true, 
        status: 'completed',
        tickets: ticketsToInsert 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Si no está completo, retornar el estatus actual
    return new Response(JSON.stringify({ 
      success: false, 
      status: charge.status,
      message: `El cargo está en estado: ${charge.status}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🔥 Error en verify-payment:', error);
    return new Response(JSON.stringify({ error: true, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
})
