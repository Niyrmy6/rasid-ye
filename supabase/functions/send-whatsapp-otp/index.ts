import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Shared CORS headers allowing frontend applications to access this Edge Function.
 * Includes support for Sentry integration tracking headers (baggage, sentry-trace).
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, baggage, sentry-trace',
};

import { notificationService } from '../_shared/notifications/NotificationService.ts';

/**
 * Deno Edge Function to send a 6-digit WhatsApp OTP verification code.
 * Sends a 6-digit WhatsApp OTP via Twilio (server-side only).
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const result = await notificationService.sendOtp(phone);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error ?? 'فشل إرسال رسالة الواتساب',
          details: result.details,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }

    return new Response(JSON.stringify({ success: true, otp: result.otp }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Uncaught exception in send-whatsapp-otp:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
