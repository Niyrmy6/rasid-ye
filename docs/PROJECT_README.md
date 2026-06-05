<div align="center">

# 🛡️ رصدنا — التفاصيل الشاملة للمشروع
**PROJECT_README.md**

</div>

---

## 📑 جدول المحتويات

- [هيكل النظام](#architecture)
- [صفحات التطبيق](#routes)
- [تصميم النظام](#system-design)
- [نظام التصميم](#design-system)
- [تجربة الاستخدام](#ux)
- [أدوات التطوير](#tools)

---

<a name="architecture"></a>
## 🏗️ هيكل النظام

هندسة **Serverless**: واجهة React PWA + **Supabase BaaS** + خدمات خارجية عبر Edge Functions.

### مكونات رئيسية

| المكون | التقنية |
|--------|---------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, TypeScript ~5.8 |
| Routing | React Router DOM v7 |
| State | React Hooks + `localStorage` (`session.ts`) |
| Data | `@supabase/supabase-js` + `src/lib/queries.ts` |
| i18n | i18next + react-i18next |
| Maps | Leaflet + React-Leaflet + OSM |
| Motion | Motion (Framer Motion successor) |
| Icons | Material Symbols + Lucide React |
| AI | Groq `llama-3.1-8b-instant` + Serper + Langfuse |
| OTP / تنبيه | Twilio WhatsApp |
| Email | Resend |
| Hosting | Vercel + `@vercel/analytics` |

### مخطط معماري

```text
┌─────────────────────────────────────────────────────────────┐
│              Rasidna PWA (React 19 + Vite 6)                 │
├─────────────────────────────────────────────────────────────┤
│  Pages / Components / i18n / ErrorBoundary / BottomNav       │
│                          ↓                                   │
│  lib/queries.ts · lib/session.ts · lib/errorMessages.ts      │
│                          ↓                                   │
│              Supabase Client (anon key + RLS)                │
├─────────────────────────────────────────────────────────────┤
│           Supabase Cloud (PostgreSQL + Edge Functions)        │
├─────────────────────────────────────────────────────────────┤
│  Groq │ Serper │ Langfuse │ Twilio │ Resend │ rss2json (RSS) │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:** SPA + PWA (`public/manifest.json`, `public/sw.js`, `registerServiceWorker`).
- **Backend:** لا يوجد خادم Node مخصص للإنتاج — Express في `package.json` legacy/أدوات مساعدة؛ الإنتاج static على Vercel أو nginx في Docker.
- **المصادقة:** مخصصة على جدول `user` (ليست Supabase Auth JWT) — انظر [REPORTING_GUIDE.md](REPORTING_GUIDE.md).

---

<a name="routes"></a>
## 📄 صفحات التطبيق (`src/App.tsx`)

| المسار | الصفحة | الوظيفة |
|--------|--------|---------|
| `/` | Landing | الصفحة التعريفية |
| `/login`, `/signup` | Login, SignUp | دخول / تسجيل |
| `/verify-otp` | OTPVerification | تحقق واتساب |
| `/forgot-password` | ForgotPassword | استعادة كلمة المرور |
| `/news`, `/news/:id` | NewsFeed, NewsDetails | أخبار محلية + عالمية |
| `/map` | Map | خريطة وبائية |
| `/chat` | Chat | مساعد Groq |
| `/new-report` | NewReport | إرسال بلاغ |
| `/my-reports` | MyReports | بلاغات المستخدم |
| `/report-details/:id` | ReportDetails | تفاصيل بلاغ |
| `/report-success` | ReportSuccess | بعد الإرسال |
| `/notifications` | Notifications | تحديثات الحالة |
| `/profile`, `/personal-info` | Profile, PersonalInfo | الحساب |
| `/contact`, `/journey` | ContactUs, Journey | تواصل / رحلة المستخدم |

التنقل الرئيسي بعد الدخول: **BottomNav** — أخبار، خريطة، محادثة، ملف شخصي.

---

<a name="system-design"></a>
## 📐 تصميم النظام

### طبقات التطبيق

**أ) Presentation** — 20+ صفحة، مكونات مشتركة، RTL/LTR، Dark Mode.

**ب) Business Logic** — Hooks، i18n، Router، تحقق هاتف يمني (`phoneValidation.ts`).

**ج) Data Access** — `queries.ts`، `supabase.functions.invoke` للـ Edge.

### تدفق البلاغ

```text
NewReport.tsx → submitReport() → report
              → submitReportSymptoms() → symptom_report
              → ReportSuccess.tsx (tracking_number)
```

### تدفق المصادقة

```text
Login: user table + password match + role_id === 3
     → setStoredUser() → localStorage
     → navigate /news
```

> **تنبيه أمني:** كلمة المرور تُقارَن كنص في الاستعلام الحالي — تحسين مستقبلي موثّق في [FEATURE_IDEAS.md](FEATURE_IDEAS.md).

### Schema

- **Users 1:N Reports**
- **Reports N:1 Disease, Classification, Governorate**
- **Reports 1:N report_history, symptom_report**

تفاصيل الأعمدة: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

---

<a name="design-system"></a>
## 🎨 نظام التصميم

فلسفة **Modern Health-Centric Design** — ألوان دلالية، زوايا `rounded-2xl`، ظلال `shadow-soft` / `shadow-card`.

### الألوان

| Token | قيمة تقريبية | الاستخدام |
|-------|-------------|-----------|
| Primary | `#56BCA4` | هوية، أزرار |
| Primary Dark | `#3DA892` | Hover |
| Pastel Purple | `#E9DFF5` | خلفيات ثانوية |
| Pastel Green | `#E0F5EE` | نجاح |
| Accent Yellow | `#F4C430` | تنبيه |
| Background | `#FAFCFB` / Dark `#1F2B28` | وضع فاتح/داكن |

### الطباعة

| الاستخدام | الخط |
|-----------|------|
| عناوين ونص | **Almarai** Regular |
| ثانوي | **IBM Plex Sans Arabic** Medium |
| أيقونات | Material Symbols Outlined |

### مكونات بارزة

- **BottomNav** — تنقل سفلي بأيقونات variable
- **PageShell / PageHeader** — تخطيط موحّد
- **ErrorBoundary** — fallback عند crash
- **NetworkBanner** — حالة الاتصال
- **خرائط Leaflet** — في Map و NewReport
- **Chat** — إدخال نصي + Web Speech API (صوت)

---

<a name="ux"></a>
## 🌓 تجربة الاستخدام

- **Dark Mode** — تبديل لحظي
- **Responsive / Mobile-First PWA**
- **RTL/LTR** — مع i18n
- **Micro-animations** — Motion (blob, pulse, …)
- **Toasts** — Sonner (`dir="rtl"` في `App.tsx`)

---

<a name="tools"></a>
## 🧰 أدوات التطوير وإدارة المشروع

| الأداة | الغرض |
|--------|-------|
| **VS Code** | بيئة التطوير |
| **Git / GitHub** | `Niyrmy6/rasid-ye` |
| **Antigravity** | مساعد برمجي (Google DeepMind) |
| **Jira** | Agile — مهام وسبرنتات |
| **Google Stitch** | نماذج UI أولية |
| **Langfuse** | مراقبة LLM في الإنتاج |
| **Sentry** | `src/instrument.ts` — [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#sentry) |
| **Vercel Analytics** | إحصائيات الزيارات |

### طبقة التسجيل في الكود

| الملف | السلوك |
|-------|--------|
| `logger.ts` | Console منسّق — **DEV فقط** |
| `main.tsx` | `unhandledrejection` + `error` |
| `ErrorBoundary` | `componentDidCatch` → logger + `Sentry.captureException` |
| `instrument.ts` | تهيئة Sentry قبل التطبيق |

---

<div align="center">
  <b>← <a href="../README.md">README.md</a> · <a href="DATABASE_SCHEMA.md">قاعدة البيانات</a> · <a href="REPORTING_GUIDE.md">الإبلاغ</a></b>
</div>
