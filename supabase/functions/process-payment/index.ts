import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token_id, device_session_id, amount, description, customer } = await req.json()

    // Credenciales (En producción usar Deno.env.get)
    const MERCHANT_ID = Deno.env.get('OPENPAY_MERCHANT_ID') || 'mbelpk22gx9nutnfyucj';
    const PRIVATE_KEY = Deno.env.get('OPENPAY_PRIVATE_KEY') || 'sk_b587b0ece0824668b9e434ce6bee42f7';
    const API_URL = `https://sandbox-api.openpay.mx/v1/${MERCHANT_ID}/charges`;

    // Autenticación Basic Auth (PK como usuario, password vacío)
    const auth = btoa(`${PRIVATE_KEY}:`);

    const payload = {
      method: 'card',
      source_id: token_id,
      amount: amount,
      description: description,
      device_session_id: device_session_id,
      customer: customer,
      send_email: true // Notificación automática de OpenPay
    };

    console.log('--- Procesando cargo en OpenPay ---');
    console.log('Monto:', amount);
    console.log('Cliente:', customer.email);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error de OpenPay:', data);
      return new Response(JSON.stringify({ 
        error: true, 
        message: data.description || "Error procesando el pago",
        code: data.error_code 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('✅ Cargo exitoso:', data.id);

    return new Response(JSON.stringify({ 
      success: true, 
      transaction_id: data.id,
      status: data.status 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('🔥 Error crítico:', error);
    return new Response(JSON.stringify({ error: true, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
