<div align="center">

# 🚀 رصدنا — دليل النشر والتشغيل
**DEPLOYMENT_GUIDE.md**

</div>

---

## 📑 جدول المحتويات

- [المتطلبات](#prerequisites)
- [التثبيت والإعداد](#setup)
- [كيفية التشغيل](#run)
- [Docker](#docker)
- [هيكل المجلدات](#folder-structure)
- [النشر على Vercel](#vercel)
- [Sentry — مراقبة الأخطاء](#sentry)
- [مراقبة إضافية](#monitoring)
- [اختبار يدوي قبل النشر](#manual-testing)
- [Edge Functions](#edge-functions)
- [استكشاف الأخطاء](#troubleshooting)

---

<a name="prerequisites"></a>
## 🛠️ المتطلبات الأساسية

| الأداة | الإصدار / الملاحظة |
|--------|---------------------|
| **Node.js** | 18+ (Dockerfile يستخدم 22-alpine) |
| **npm** | مع `package-lock.json` |
| **Git** | لاستنساخ المستودع |
| **Docker** (اختياري) | لتشغيل nginx على المنفذ 8080 |
| **Supabase** | مشروع سحابي + Edge Functions |
| **Vercel** | للاستضافة الإنتاجية |

حسابات خارجية للميزات الكاملة: Groq، Serper، Langfuse، Twilio، Resend — راجع [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md).

---

<a name="setup"></a>
## ⚙️ التثبيت والإعداد

### 1️⃣ استنساخ المستودع

```bash
git clone https://github.com/Niyrmy6/rasid-ye.git
cd rasid-ye
```

### 2️⃣ تثبيت الحزم

```bash
npm install
```

### 3️⃣ ملف البيئة `.env`

انسخ القالب:

```bash
# Linux / macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

**متغيرات الواجهة (إلزامية للتشغيل):**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-key@o....ingest.us.sentry.io/...
```

> `VITE_SENTRY_DSN` في **Vercel** أو `.env` المحلي — **ليس** في Supabase Secrets. التفاصيل: [قسم Sentry](#sentry).

**اختياري:**

```env
VITE_BUILD_ID=1.0.0
APP_URL=https://rasidna.vercel.app
```

### 4️⃣ أسرار Edge Functions (Supabase Dashboard)

**Project Settings → Edge Functions → Secrets**

| Secret | مطلوب لـ |
|--------|----------|
| `GROQ_API_KEY` | `chat-rag-bot` |
| `SERPER_API_KEY` | `chat-rag-bot` |
| `LANGFUSE_PUBLIC_KEY` | `chat-rag-bot` |
| `LANGFUSE_SECRET_KEY` | `chat-rag-bot` |
| `TWILIO_ACCOUNT_SID` | OTP + `notify-manager` |
| `TWILIO_AUTH_TOKEN` | OTP + `notify-manager` |
| `RESEND_API_KEY` | `send-email-notification` |

> `send-whatsapp-otp` تُستدعى من `SignUp.tsx` و`OTPVerification.tsx` — يجب نشرها على نفس مشروع Supabase (قد لا تكون في مجلد `supabase/functions` المحلي).

---

<a name="run"></a>
## 🚀 التشغيل المحلي

### خادم التطوير

```bash
npm run dev
```

| الإعداد | القيمة (من `package.json`) |
|---------|---------------------------|
| المنفذ | **3000** |
| Host | `0.0.0.0` (متاح من الشبكة المحلية) |
| الرابط | http://localhost:3000 |

### بناء ومعاينة الإنتاج

```bash
npm run build    # مخرجات في dist/
npm run preview  # معاينة البناء
npm run lint     # tsc --noEmit
```

### تنظيف مجلد البناء

```bash
npm run clean
```

---

<a name="docker"></a>
## 🐳 Docker

الملفات: `Dockerfile`, `docker-compose.yml`, `nginx.conf`.

```bash
# تأكد من وجود VITE_SUPABASE_* في .env
npm run docker:up      # build + up -d — المنفذ 8080:80
npm run docker:down    # إيقاف
npm run docker:build   # بناء الصورة فقط
```

| الخدمة | المنفذ |
|--------|--------|
| `web` (nginx) | http://localhost:8080 |

`docker-compose.yml` يمرّر `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` كـ build args.

---

<a name="folder-structure"></a>
## 📂 هيكل المجلدات

```text
rasid-ye/
├── public/
│   ├── manifest.json       # PWA
│   └── sw.js               # Service Worker
├── src/
│   ├── components/         # BottomNav, ErrorBoundary, PageShell, …
│   ├── hooks/              # useErrorHandler
│   ├── lib/
│   │   ├── supabase.ts     # عميل Supabase
│   │   ├── queries.ts      # طبقة الوصول للبيانات
│   │   ├── session.ts      # جلسة localStorage
│   │   └── logger.ts       # تسجيل DEV فقط
│   ├── pages/              # 20+ صفحة (انظر App.tsx)
│   ├── types/
│   │   ├── database.ts     # أنواع Supabase
│   │   └── models.ts       # نماذج الواجهة
│   ├── App.tsx             # المسارات + Analytics
│   └── main.tsx
├── supabase/
│   ├── config.toml
│   └── functions/
│       ├── chat-rag-bot/
│       ├── send-email-notification/
│       └── notify-manager/
├── docs/                   # التوثيق
├── docker-compose.yml
├── vercel.json             # SPA rewrites
└── package.json
```

---

<a name="vercel"></a>
## ☁️ النشر على Vercel

1. اربط مستودع GitHub: `Niyrmy6/rasid-ye`.
2. **Framework Preset:** Vite  
3. **Build Command:** `npm run build`  
4. **Output Directory:** `dist`  
5. **Environment Variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SENTRY_DSN` (مراقبة الأخطاء — `src/instrument.ts`)

`vercel.json` يوجّه كل المسارات إلى `index.html` (SPA).

بعد إضافة `VITE_SENTRY_DSN` نفّذ **Redeploy** — المتغير يُحقَن عند البناء فقط.

---

<a name="sentry"></a>
## 🛡️ Sentry — مراقبة الأخطاء

**[Sentry](https://sentry.io/)** مدمج في الواجهة عبر `@sentry/react`.

### الملفات في المشروع

| الملف | الدور |
|-------|--------|
| `src/instrument.ts` | `Sentry.init()` — يُستورد أولاً من `main.tsx` |
| `src/main.tsx` | `reactErrorHandler()` لـ React 19 |
| `src/components/ErrorBoundary.tsx` | `Sentry.captureException` عند أخطاء العرض |

### أين تضع الـ DSN؟

| المكان | مناسب؟ |
|--------|--------|
| **Vercel → Environment Variables** | ✅ إنتاج |
| **`.env` محلي** (مستثنى من Git) | ✅ تطوير |
| **Supabase Edge Secrets** | ❌ لا يصل لتطبيق React |

### الإعداد

1. أنشئ مشروعاً في [sentry.io](https://sentry.io/) (منصة React).
2. انسخ **DSN** من: Settings → Client Keys.
3. أضفه كـ `VITE_SENTRY_DSN` في Vercel و/أو `.env`.
4. **Redeploy** على Vercel بعد أي تغيير.

### ما يُفعَّل تلقائياً

- تتبع الأخطاء غير المعالجة + أخطاء React
- تتبع التنقل (React Router)
- Session Replay مع `maskAllText` (خصوصية)
- `sendDefaultPii: false` — لا يُرسل IP/PII افتراضياً
- فلتر `beforeSend` يحذف أحداثاً تحتوي `password` / `otp` في النص

### التحقق أن Sentry يعمل

**تطوير (`npm run dev`):**

```bash
npm run dev
# http://localhost:3000
```

في Console المتصفح:

```js
typeof Sentry !== 'undefined' && Sentry.getClient?.()
// يجب أن يُرجع كائن Client وليس undefined

Sentry.captureException(new Error('Rasidna Sentry test'))
```

> في DEV فقط: `window.Sentry` متاح للاختبار اليدوي.

**إنتاج:**

```js
Sentry.captureException(new Error('Rasidna production test'))
```

ثم راجع **Issues** في لوحة Sentry (فلتر `production`).

| المشكلة | الحل |
|---------|------|
| `getClient()` = `undefined` | لم يُبنَ التطبيق مع DSN — Redeploy بعد إضافة المتغير |
| لا أحداث في Sentry | حاجب إعلانات يحجب `*.sentry.io` — جرّب نافذة خاصة |
| `throw` من Console لا يظهر | استخدم `Sentry.captureException(...)` |

---

<a name="monitoring"></a>
## 📊 مراقبة إضافية

| الأداة | الغرض | أين |
|--------|--------|-----|
| **Vercel Analytics** | عدد الزيارات | `@vercel/analytics` في `App.tsx` |
| **Langfuse** | أداء مساعد AI (Groq) | Edge Function `chat-rag-bot` — أسرار Supabase |
| **`src/lib/logger.ts`** | Console منسّق | **وضع التطوير فقط** |

تفاصيل Langfuse: [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md#langfuse).

---

<a name="manual-testing"></a>
## ✅ اختبار يدوي قبل النشر

لا يوجد `npm test` في المشروع. تحقق من:

| # | السينario | المسار |
|---|-----------|--------|
| 1 | دخول مواطن | `/login` → `/news` |
| 2 | بلاغ | `/new-report` → `/report-success` |
| 3 | بلاغاتي | `/my-reports` |
| 4 | خريطة | `/map` |
| 5 | محادثة | `/chat` |
| 6 | أخبار | `/news` |

```bash
npm run lint
npm run build
```

---

<a name="edge-functions"></a>
## ⚡ نشر Edge Functions

من جذر المشروع (مع [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase functions deploy chat-rag-bot
supabase functions deploy send-email-notification
supabase functions deploy notify-manager
# وأيضاً send-whatsapp-otp إن وُجدت على السحابة
```

إعدادات JWT في `supabase/config.toml`:

| Function | `verify_jwt` |
|----------|----------------|
| `chat-rag-bot` | `true` |
| `notify-manager` | `true` |
| `send-email-notification` | `false` (Webhook) |

---

<a name="troubleshooting"></a>
## 🔧 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| شاشة بيضاء بعد البناء | تحقق من `VITE_*` وقت `npm run build` |
| `Failed to fetch` من Supabase | URL/Key خاطئ أو RLS يمنع القراءة |
| المساعد لا يرد | `GROQ_API_KEY` في Secrets + نشر `chat-rag-bot` |
| OTP لا يُرسل | نشر `send-whatsapp-otp` + Twilio WhatsApp Sandbox/Production |
| الخريطة فارغة | لا توجد بلاغات **مؤكدة** في RPC — طبيعي في بيئة تجريبية |
| Docker بدون بيانات | `.env` فارغ عند `docker compose build` |
| Sentry لا يلتقط أخطاء | `VITE_SENTRY_DSN` ناقص عند البناء — راجع [Sentry](#sentry) |

---

<div align="center">
  <b>← <a href="../README.md">README.md</a> · <a href="API_INTEGRATION_GUIDE.md">APIs</a></b>
</div>
