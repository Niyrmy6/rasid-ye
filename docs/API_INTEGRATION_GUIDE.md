<div align="center">

# 🔌 رصدنا — دليل التكامل مع APIs
**API_INTEGRATION_GUIDE.md**

</div>

---

## 📑 جدول المحتويات

- [Supabase](#supabase)
- [Groq AI](#groq)
- [Serper.dev](#serper)
- [Langfuse](#langfuse)
- [Twilio](#twilio)
- [send-whatsapp-otp](#whatsapp-otp)
- [Resend](#resend)
- [Google News + rss2json](#google-news)
- [OpenStreetMap + Leaflet](#maps)
- [متغيرات البيئة](#env)

---

<a name="supabase"></a>
## 1. 🟢 Supabase

**الرابط:** [supabase.com](https://supabase.com/)

### الدور

- **PostgreSQL** — مستخدمون، بلاغات، أمراض، أعراض، أخبار
- **RLS** — سياسات على مستوى الصف
- **Edge Functions** — AI، OTP، إيميل، تنبيه واتساب
- **Realtime** — حسب إعداد المشروع

### العميل في الواجهة

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### أمثلة حقيقية من المشروع

```typescript
// بلاغ جديد — src/lib/queries.ts → submitReport
await supabase.from('report').insert([{ ... }]).select().single()

// خريطة — RPC
await supabase.rpc('get_confirmed_reports')

// مساعد ذكي
await supabase.functions.invoke('chat-rag-bot', {
  body: { userQuestion: '...', lang: 'ar' }
})

// OTP
await supabase.functions.invoke('send-whatsapp-otp', {
  body: { phone: '+9677...' }
})
```

### المفاتيح

| المفتاح | المكان |
|---------|--------|
| `VITE_SUPABASE_URL` | `.env` |
| `VITE_SUPABASE_ANON_KEY` | `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Secrets (تلقائي غالباً) |

> هيكل الجداول: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

<a name="groq"></a>
## 2. 🤖 Groq AI

**الرابط:** [console.groq.com](https://console.groq.com/)

### التدفق

1. المستخدم يكتب في `src/pages/Chat.tsx`
2. استدعاء `chat-rag-bot`
3. (اختياري) Serper يجلب سياق ويب
4. طلب إلى `https://api.groq.com/openai/v1/chat/completions`
5. النموذج: **`llama-3.1-8b-instant`**

### Secret

`GROQ_API_KEY` في Supabase Edge Function Secrets.

---

<a name="serper"></a>
## 3. 🔍 Serper.dev

**الرابط:** [serper.dev](https://serper.dev/)

بحث Google عبر `https://google.serper.dev/search` داخل `chat-rag-bot` — مع `gl: 'ye'` لسياق يمني.

| المفتاح | المكان |
|---------|--------|
| `SERPER_API_KEY` | Edge Secrets |

---

<a name="langfuse"></a>
## 4. 📊 Langfuse

**الرابط:** [cloud.langfuse.com](https://cloud.langfuse.com/)

تتبع `trace` و`generation` لكل سؤال في `chat-rag-bot/index.ts`.

| المفتاح | المكان |
|---------|--------|
| `LANGFUSE_PUBLIC_KEY` | Edge Secrets |
| `LANGFUSE_SECRET_KEY` | Edge Secrets |

---

<a name="twilio"></a>
## 5. 📲 Twilio (واتساب)

**الرابط:** [twilio.com](https://www.twilio.com/)

| الاستخدام | الملف / الدالة |
|-----------|----------------|
| OTP تسجيل/استعادة كلمة المرور | `send-whatsapp-otp` (سحابي) |
| تنبيه وبائي جديد | `notify-manager/index.ts` → يحفظ إشعار في جدول `notification` (لم يعد يرسل واتساب) |

| المفتاح | المكان |
|---------|--------|
| `TWILIO_ACCOUNT_SID` | Edge Secrets (لـ OTP فقط) |
| `TWILIO_AUTH_TOKEN` | Edge Secrets (لـ OTP فقط) |

> ملاحظة: الدالة `send-whatsapp` غير مستخدمة في المشروع، يمكن تخطي نشرها.

---

<a name="whatsapp-otp"></a>
## 6. 📱 Edge Function: `send-whatsapp-otp`

**مُستدعاة من:**

- `src/pages/SignUp.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/OTPVerification.tsx` (إعادة إرسال)

**ملاحظة:** الدالة **غير موجودة** في مجلد `supabase/functions/` داخل هذا المستودع، لكنها **منشورة** على مشروع Supabase المرتبط بالتطبيق. عند إعادة بناء البنية التحتية، انسخها من لوحة Supabase أو مستودع النسخ الاحتياطي.

---

<a name="resend"></a>
## 7. 📧 Resend

**الرابط:** [resend.com](https://resend.com/)

`supabase/functions/send-email-notification/index.ts`:

- حزمة `npm:resend@3.2.0`
- قالب HTML: `template.tsx`
- يستخدم `APP_URL` لروابط التطبيق
- `verify_jwt = false` — مخصصة لـ Database Webhooks

| المفتاح | المكان |
|---------|--------|
| `RESEND_API_KEY` | Edge Secrets |
| `APP_URL` | Edge Secrets / `.env.example` |

---

<a name="google-news"></a>
## 8. 📰 Google News RSS + rss2json

**ليس مخزناً في Supabase.**

`src/pages/NewsFeed.tsx`:

1. أخبار محلية: `fetchLocalNews()` → جدول `news`
2. أخبار عالمية: Google News RSS حسب اللغة
3. التحويل عبر **rss2json**:  
   `https://api.rss2json.com/v1/api.json?rss_url=...`

| اللغة | استعلام RSS (مختصر) |
|-------|---------------------|
| عربي | `news.google.com/rss/search?q=الأمراض+الصحة&hl=ar...` |
| إنجليزي | `health+disease+outbreak&hl=en-US...` |

تصنيفات الأخبار المحلية: `urgent`, `alert`, `guidelines`, `event` — انظر `src/lib/newsUtils.ts`.

---

<a name="maps"></a>
## 9. 🗺️ OpenStreetMap + Leaflet + React-Leaflet

| الطبقة | الدور |
|--------|-------|
| **OpenStreetMap** | بلاطات الخريطة |
| **Leaflet** | محرك الخريطة |
| **React-Leaflet** | مكونات React |

```tsx
// Map.tsx / NewReport.tsx
<MapContainer center={[15.3694, 44.191]} zoom={6}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
</MapContainer>
```

إعداد الأيقونات: `src/lib/leafletSetup.ts`.

---

<a name="env"></a>
## 🔐 ملخص متغيرات البيئة

### Frontend (`.env`)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# اختياري: VITE_BUILD_ID, APP_URL
```

### Edge Function Secrets (Supabase)

```env
GROQ_API_KEY=
SERPER_API_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
RESEND_API_KEY=
APP_URL=
```

`SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` يتوفران تلقائياً في بيئة Edge.

---

<div align="center">
  <b>← <a href="../README.md">README.md</a> · <a href="DEPLOYMENT_GUIDE.md">النشر</a></b>
</div>
