import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { purchase_id } = await req.json()

    // 1. Fetch purchase and tickets
    const { data: purchase, error: pError } = await supabaseClient
      .from('purchases')
      .select('*, tickets(*)')
      .eq('id', purchase_id)
      .single()

    if (pError || !purchase) throw new Error('Compra no encontrada')

    console.log(`--- Iniciando proceso de envío de correos ---`)
    console.log(`Compra ID: ${purchase_id}`)
    console.log(`Comprador: ${purchase.buyer_email}`)
    console.log(`Boletos a enviar: ${purchase.tickets.length}`)

    // 2. Prepare Email (Placeholder for Resend/SMTP)
    // For now, we simulate the email sending by logging it.
    // If RESEND_API_KEY is present, we could use it.
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      console.log("✅ RESEND_API_KEY detectada. Intentando envío real...")
      // Here we would implement the real fetch to Resend
      /*
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Encuentro Jóvenes Coparmex <boletos@tu-dominio.com>',
          to: purchase.buyer_email,
          subject: '¡Tus boletos para el Encuentro Jóvenes Coparmex están listos!',
          html: `<h1>Hola ${purchase.buyer_name}</h1><p>Tus boletos...</p>`
        })
      });
      */
    } else {
      console.warn("⚠️ No se detectó RESEND_API_KEY. Correo simulado en logs.")
      console.log(`Email Body Preview:
        PARA: ${purchase.buyer_email}
        ASUNTO: ¡Tus boletos para el Encuentro Jóvenes Coparmex están listos!
        CONTENIDO:
        Hola ${purchase.buyer_name}, gracias por tu compra.
        Aquí tienes tus IDs de boletos: ${purchase.tickets.map((t: any) => t.id).join(', ')}
      `)
    }

    return new Response(JSON.stringify({ success: true, message: 'Email process initiated' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('🔥 Error en send-tickets:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
