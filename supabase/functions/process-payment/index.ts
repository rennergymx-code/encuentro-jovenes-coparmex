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
    const { token_id, device_session_id, amount, description, customer, redirect_url } = await req.json()

    // Credenciales (En producción usar Deno.env.get)
    const MERCHANT_ID = Deno.env.get('OPENPAY_MERCHANT_ID') || 'mbelpk22gx9nutnfyucj';
    const PRIVATE_KEY = Deno.env.get('OPENPAY_PRIVATE_KEY') || 'sk_b587b0ece0824668b9e434ce6bee42f7';
    const API_URL = `https://sandbox-api.openpay.mx/v1/${MERCHANT_ID}/charges`;

    // Normalización de Datos de Cliente para OpenPay
    const fullName = (customer.name || "").trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "Coparmex";

    // Normalización de Teléfono (OpenPay Sandbox espera 10 dígitos)
    const phone = (customer.phone_number || "").replace(/\D/g, '').slice(-10);

    // Autenticación Basic Auth (PK como usuario, password vacío)
    const auth = btoa(`${PRIVATE_KEY}:`);

    const payload: any = {
      method: 'card',
      source_id: token_id,
      amount: amount,
      description: description,
      device_session_id: device_session_id,
      customer: {
        name: firstName,
        last_name: lastName,
        email: customer.email,
        phone_number: phone,
        address: customer.address
      },
      send_email: true,
      use_3d_secure: true,
      redirect_url: redirect_url
    };

    console.log('--- Request to OpenPay ---');
    console.log('Payload Data:', { amount, email: customer.email, phone, firstName, lastName });

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
      console.error('❌ Error de OpenPay (Detailed):', JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ 
        error: true, 
        message: data.description || "Error procesando el pago",
        code: data.error_code,
        category: data.category
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('✅ Respuesta de OpenPay:', data.status, data.id);

    // Si requiere 3DS, el status será 'charge_pending' y tendrá payment_method.url
    const result = {
      success: true,
      transaction_id: data.id,
      status: data.status,
      redirect_url: data.payment_method?.url
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('🔥 Error crítico en process-payment:', error);
    return new Response(JSON.stringify({ error: true, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }

})
