/**
 * Webhook handler: when a report triggers an alert, notify the disease owner via WhatsApp.
 * Expects `{ record: { disease_id, message? } }` from a Supabase Database Webhook.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';
import { notificationService } from '../_shared/notifications/NotificationService.ts';

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

    const { data: diseaseInfo, error: dbError } = await supabase
      .from('disease')
      .select('disease_name, user_id')
      .eq('disease_id', record.disease_id)
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return jsonResponse({ error: `Database error: ${dbError.message}` }, 400);
    }

    if (!diseaseInfo) {
      return jsonResponse({ error: 'لم يتم العثور على المرض في قاعدة البيانات' }, 404);
    }

    if (!diseaseInfo.user_id) {
      return jsonResponse({ error: 'لم يتم تعيين موظف مسؤول لهذا المرض في قاعدة البيانات' }, 404);
    }

    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('phone, full_name')
      .eq('user_id', diseaseInfo.user_id)
      .single();

    if (userError || !userData) {
      console.error('User Database Error:', userError);
      return jsonResponse({ error: 'لم يتم العثور على موظف مسؤول لهذا المرض في قاعدة البيانات' }, 404);
    }

    const employeePhone = userData.phone;
    const employeeName = userData.full_name;
    const alertMessage = record.message ?? '⚠️ تنبيه وبائي جديد.';

    if (!employeePhone) {
      return jsonResponse({ error: 'رقم هاتف الموظف غير مسجل' }, 400);
    }

    const result = await notificationService.sendWhatsApp(
      employeePhone,
      `مرحباً ${employeeName}،\n${alertMessage}`,
    );

    if (!result.success) {
      console.error('Notification Error:', result);
      return jsonResponse(
        { error: result.error ?? 'Failed to send notification', details: result.details },
        500,
      );
    }

    return jsonResponse({ status: 'Success', sent_to: employeeName });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Function Error:', error);
    return jsonResponse({ error: message }, 500);
  }
});
