<div align="center">

# 📝 رصدنا — دليل إرسال البلاغ
**REPORTING_GUIDE.md**

</div>

---

## من يرسل البلاغ؟

- التطبيق موجّه لـ **المواطنين** (`user.role_id === 3`).
- يجب تسجيل الدخول أو إنشاء حساب مع **OTP واتساب** قبل إتمام الإرسال.
- صفحة الإبلاغ: `/new-report` — الملف: `src/pages/NewReport.tsx`.

---

## مسار المستخدم (User Flow)

```text
/signup أو /login
       ↓
send-whatsapp-otp (Edge Function)
       ↓
/verify-otp → /verification-success
       ↓
/news (الصفحة الرئيسية بعد الدخول)
       ↓
/new-report (نموذج البلاغ)
       ↓
/report-success (رقم التتبع)
       ↓
/my-reports و /report-details/:id (متابعة الحالة)
```

---

## خطوات النموذج

| الخطوة | الحقل | ملاحظة |
|--------|-------|--------|
| 1 | بيانات المريض | الاسم، العمر، الجنس، هاتف اختياري |
| 2 | المرض | اختيار من `disease` أو «غير معروف» (`disease_id: null`) |
| 3 | الأعراض | اختيار متعدد من `symptom` → يُحفظ في `symptom_report` |
| 4 | الموقع | GPS أو نقرة على خريطة Leaflet |
| 5 | تاريخ البداية + ملاحظات | اختياري |

> إذا زار المستخدم `/new-report` دون جلسة، يظهر modal يوجّهه إلى `/login` أو `/signup`.

---

## ماذا يحدث عند الضغط على «إرسال»؟

### 1. التحقق من الجلسة

```typescript
// src/lib/session.ts
getStoredUser() // من localStorage مفتاح "user"
```

### 2. إنشاء صف البلاغ

الدالة `submitReport()` في `src/lib/queries.ts`:

```typescript
await supabase.from('report').insert([{
  patient_name, age, gender, phone, onset_date, notes,
  user_id,
  disease_id,           // null إذا "غير معروف"
  location: 'POINT(lng lat)',  // PostGIS WKT
  report_date: new Date().toISOString(),
  classification_id: 1, // افتراضي إرسال المواطن
}]).select().single();
```

### 3. ربط الأعراض

```typescript
await submitReportSymptoms(reportId, selectedSymptomIds);
// inserts into symptom_report
```

### 4. التوجيه لصفحة النجاح

`ReportSuccess.tsx` يعرض `tracking_number` عبر `fetchTrackingNumber(reportId)`.

---

## متابعة البلاغ بعد الإرسال

| الصفحة | المسار | المصدر |
|--------|--------|--------|
| قائمة بلاغاتي | `/my-reports` | `fetchUserReports(userId)` |
| التفاصيل | `/report-details/:id` | `fetchReportDetails(id)` |
| الإشعارات | `/notifications` | `fetchUserNotifications(userId)` |

الحالة المعروضة = أحدث `report_status` في `report_history` (بعد الترتيب في `queries.ts`).

---

## الخريطة الوبائية

البلاغ **لا يظهر** على الخريطة فور الإرسال. الخريطة (`/map`) تعرض فقط ما يُرجعه:

```typescript
supabase.rpc('get_confirmed_reports')
```

أي بلاغات بحالة **مؤكدة/verified** حسب منطق SQL في Supabase.

---

## تنبيهات الجهات (خلف الكواليس)

عند تجاوز عدد البلاغات لعتبة `disease.threshold`:

- Edge Function **`notify-manager`** يرسل واتساب لـ `disease.user_id` (مسؤول المرض).
- عند تغيير الحالة قد يُفعَّل **`send-email-notification`** (Resend) عبر Webhook.

> تفاصيل Twilio/Resend: [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)

---

## استكشاف أخطاء شائعة

| العرض | السبب المحتمل |
|-------|----------------|
| «يجب تسجيل الدخول» | لا يوجد `user` في `localStorage` |
| فشل الإدراج | RLS أو عمود ناقص — راجع سياسات Supabase |
| لا موقع | `location` فارغ — فعّل GPS أو انقر الخريطة |
| لا يظهر على الخريطة | البلاغ لم يُؤكَّد بعد في `report_history` |

رسائل المستخدم العربية/الإنجليزية: `src/lib/errorMessages.ts` + `useErrorHandler`.

---

<div align="center">
  <b>← <a href="../README.md">README.md</a> · <a href="DATABASE_SCHEMA.md">هيكلية DB</a></b>
</div>
