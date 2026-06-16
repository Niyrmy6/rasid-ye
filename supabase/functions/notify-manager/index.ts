/**
 * Webhook handler: when a report triggers an alert, saves notification in database table.
 * Expects `{ record: { disease_id, message? } }` from a Supabase Database Webhook.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    let requestBody: { record?: { disease_id?: number; message?: string } };
    try {
      requestBody = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }

    const { record } = requestBody;
    if (!record?.disease_id) {
      return jsonResponse({ error: 'Missing required field: record.disease_id' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get disease name for the notification message
    const { data: diseaseInfo, error: dbError } = await supabase
      .from('disease')
      .select('disease_name, ar_name')
      .eq('disease_id', record.disease_id)
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return jsonResponse({ error: `Database error: ${dbError.message}` }, 400);
    }

    if (!diseaseInfo) {
      return jsonResponse({ error: 'لم يتم العثور على المرض في قاعدة البيانات' }, 404);
    }

    // Build the notification message (use Arabic or English name)
    const diseaseName = diseaseInfo.ar_name || diseaseInfo.disease_name;
    const alertMessage = record.message ?? `⚠️ تنبيه وبائي جديد لمرض ${diseaseName}.`;

    // Insert into notification table (instead of sending WhatsApp!)
    const { error: insertError } = await supabase
      .from('notification')
      .insert({
        disease_id: record.disease_id,
        message: alertMessage,
        is_read: false,
      });

    if (insertError) {
      console.error('Notification Insert Error:', insertError);
      return jsonResponse(
        { error: insertError.message ?? 'Failed to save notification' },
        500,
      );
    }

    return jsonResponse({ status: 'Success', notification_saved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Function Error:', error);
    return jsonResponse({ error: message }, 500);
  }
});
