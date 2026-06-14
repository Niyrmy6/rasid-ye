/**
 * Inline HTML email for report status updates (Resend).
 * RTL layout; status copy is Arabic for citizen recipients.
 */

export interface ReportStatusEmailProps {
  reportNumber: string;
  status: 'received' | 'under_review' | 'resolved' | 'rejected';
  reporterName?: string;
  reportUrl: string;
}

const statusConfig = {
  received: {
    label: 'تم استلام البلاغ',
    color: '#3B82F6',
    icon: '📩',
    message: 'تم استلام بلاغك بنجاح وسيتم مراجعته من قبل الفريق الصحي المختص في أقرب وقت.',
  },
  under_review: {
    label: 'قيد المراجعة',
    color: '#F59E0B',
    icon: '⏳',
    message: 'بلاغك حالياً قيد المراجعة من قبل الفريق الصحي المختص.',
  },
  resolved: {
    label: 'تم حل البلاغ',
    color: '#16A34A',
    icon: '✅',
    message: 'تمت مراجعة البلاغ واتخاذ الإجراءات اللازمة وحل المشكلة الصحية.',
  },
  rejected: {
    label: 'مرفوض',
    color: '#DC2626',
    icon: '❌',
    message: 'لم يتم اعتماد البلاغ لعدم كفاية المعلومات.',
  },
};

export const renderReportStatusEmail = ({
  reportNumber,
  status,
  reporterName,
  reportUrl,
}: ReportStatusEmailProps): string => {
  const current = statusConfig[status] || statusConfig.under_review;
  const greeting = reporterName ? `<p style="text-align: center; color: #6b7280; font-size: 16px; margin: 0 0 20px 0;">مرحباً ${reporterName}</p>` : '';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تحديث حالة البلاغ #${reportNumber}</title>
    </head>
    <body style="margin: 0; background-color: #f3f7f6; font-family: Tahoma, Arial, sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #56bca4; padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">رصدنا</h1>
          <p style="margin: 5px 0 0 0; font-size: 13px;">Rasdina - Health Reporting Platform</p>
        </div>

        <!-- Card Content -->
        <div style="padding: 24px;">
          <h2 style="text-align: center; font-size: 22px; color: #1f2937; margin: 0 0 10px 0;">تحديث حالة البلاغ</h2>
          
          ${greeting}

          <!-- Report Number -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="margin: 0 0 5px 0; color: #4b5563;">رقم البلاغ</p>
            <p style="font-size: 26px; color: #56bca4; font-weight: bold; margin: 0;">#${reportNumber}</p>
          </div>

          <!-- Status Badge -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="margin: 0 0 8px 0; color: #4b5563;">الحالة الحالية</p>
            <div style="display: inline-block; background-color: ${current.color}; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              ${current.icon} ${current.label}
            </div>
          </div>

          <!-- Message -->
          <p style="text-align: center; margin-top: 20px; color: #374151; font-size: 15px; line-height: 1.5;">
            ${current.message}
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="${reportUrl}" style="background-color: #56bca4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">
              عرض تفاصيل البلاغ
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background-color: #fafafa; border-top: 1px solid #f0f0f0; font-size: 12px; color: #6b7280;">
          <p style="margin: 0 0 5px 0;">رصدنا - منصة الإبلاغ الصحي لبلاغات الأوبئة والأمراض</p>
          <p style="margin: 0;">اليمن</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
