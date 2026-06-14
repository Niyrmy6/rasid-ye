/**
 * Database webhook: emails citizens when `report` / `report_history` changes.
 * Uses Resend + HTML template; `verify_jwt = false` in config.toml for webhook calls.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { Resend } from 'npm:resend@3.2.0';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { renderReportStatusEmail } from './template.tsx';

type ReportStatus = 'received' | 'under_review' | 'resolved' | 'rejected';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

function mapReportStatus(raw: unknown): ReportStatus {
  const dbStatus = String(raw ?? '').toLowerCase();
  if (dbStatus === 'new') return 'received';
  if (dbStatus === 'resolved' || dbStatus === 'completed' || dbStatus === 'verified') return 'resolved';
  if (dbStatus === 'rejected') return 'rejected';
  if (dbStatus === 'pending') return 'under_review';
  return 'received';
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record ?? payload.new;

    if (!record?.report_id) {
      return new Response('No report_id found in payload', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userId = record.user_id;
    let trackingNumber = record.tracking_number;

    if (!userId || !trackingNumber) {
      const { data: reportData, error: reportError } = await supabase
        .from('report')
        .select('user_id, tracking_number')
        .eq('report_id', record.report_id)
        .single();

      if (reportError || !reportData?.user_id) {
        console.log('Could not find user_id for report_id:', record.report_id);
        return new Response('Report not found', { status: 200 });
      }
      userId = reportData.user_id;
      trackingNumber = reportData.tracking_number ?? String(record.report_id);
    }

    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    if (userError || !userData?.email) {
      console.log('No email configured for user_id:', userId);
      return new Response('Email not provided by user', { status: 200 });
    }

    const statusText = mapReportStatus(record.report_status);
    const appUrl = Deno.env.get('APP_URL') ?? 'https://rasidna.vercel.app';
    const reportUrl = `${appUrl}/report-details/${record.report_id}`;

    const emailHtml = renderReportStatusEmail({
      reportNumber: trackingNumber,
      status: statusText,
      reporterName: userData.full_name ?? undefined,
      reportUrl,
    });

    const emailData = await resend.emails.send({
      from: 'Rasdina Notifications <onboarding@resend.dev>',
      to: userData.email,
      subject: `تحديث حالة البلاغ #${trackingNumber} - منصة رصدنا`,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(String(error), { status: 500 });
  }
});
