<div align="center">
  <img src="src/assets/surveillance_illustration.webp" alt="Rasidna Logo" width="280" height="auto" style="border-radius: 16px;" />

  # 🛡️ رصدنا — Rasidna

  **نظام المراقبة الوبائية الصحية المجتمعية**  
  *Community Epidemiological Health Monitoring System*

  *مشروع تخرج 2025–2026 | جامعة العلوم والتكنولوجيا — فرع عدن*
</div>

<br />

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Bundler-Vite_6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS_4-38B2AC?logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/App-PWA-5A0FC8?logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Hosting-Vercel-000000?logo=vercel&logoColor=white)

---

## ما هو المشروع؟ (What it is)

**رصدنا (Rasidna)** تطبيق ويب تقدمي (**PWA**) يتيح للمواطنين في اليمن الإبلاغ عن حالات الاشتباه بالأمراض، ومتابعة بلاغاتهم، واستعراض خريطة وبائية تفاعلية، والتفاعل مع مساعد صحي ذكي.

يعتمد النظام على مبدأ **مصدر حقيقة موحّد (Single Source of Truth)**: كل بلاغ يُسجَّل في **Supabase (PostgreSQL)** ويظهر على الخريطة بعد التأكيد، وتتغيّر حالة البلاغ في سجل `report_history` الذي يقرأه التطبيق في «بلاغاتي» والإشعارات.

| البيئة | الرابط |
|--------|--------|
| الإنتاج | [rasidna.vercel.app](https://rasidna.vercel.app) |

> للتفاصيل المعمارية والتصميم: [PROJECT_README.md](docs/PROJECT_README.md)

---

## مميزات النظام (Features)

| الميزة | الوصف المختصر |
|--------|----------------|
| **الإبلاغ** | نموذج بلاغ كامل (مريض، أعراض، مرض، موقع GPS/خريطة) + رقم تتبع |
| **الخريطة** | بلاغات مؤكدة عبر RPC `get_confirmed_reports` + تصفية مرض/محافظة |
| **المساعد الذكي** | محادثة عبر Edge Function `chat-rag-bot` (Groq + Serper) |
| **OTP واتساب** | تحقق عند التسجيل واستعادة كلمة المرور عبر `send-whatsapp-otp` |
| **الأخبار** | أخبار محلية من جدول `news` + عالمية عبر Google News RSS |
| **الإشعارات** | بريد (Resend) + واتساب للمسؤول (`notify-manager`) عند التنبيه |
| **ثنائي اللغة** | عربي/إنجليزي مع RTL/LTR |
| **PWA** | تثبيت على الجوال + Service Worker |

> شرح مسار الإبلاغ خطوة بخطوة: [REPORTING_GUIDE.md](docs/REPORTING_GUIDE.md)

---

## تقنيات العمل (Tech Stack)

### الواجهة والبنية

| الطبقة | التقنية |
|--------|---------|
| UI | React 19, TypeScript ~5.8, Tailwind CSS 4, Motion |
| التوجيه | React Router DOM v7 |
| البناء | Vite 6 (`npm run dev` على المنفذ **3000**) |
| الترجمة | i18next + react-i18next |
| الخرائط | Leaflet + React-Leaflet + OpenStreetMap |
| Toast / أخطاء UI | Sonner + `ErrorBoundary` |

### الخلفية والتكاملات

| الخدمة | الاستخدام في المشروع |
|--------|----------------------|
| **Supabase** | PostgreSQL، RLS، Edge Functions، Realtime (حسب الإعداد) |
| **Groq** | `llama-3.1-8b-instant` في `chat-rag-bot` |
| **Serper.dev** | بحث ويب لسياق المساعد |
| **Langfuse** | تتبع استعلامات AI في Edge Function |
| **Twilio** | OTP واتساب + تنبيه المسؤول |
| **Resend** | إيميل تحديث حالة البلاغ |
| **rss2json** | تحويل Google News RSS في `NewsFeed.tsx` |
| **Vercel** | استضافة + Analytics (`@vercel/analytics`) |

### الجودة والمراقبة

| الأداة | الدور |
|--------|------|
| **[Sentry](https://sentry.io/)** | `@sentry/react` — `src/instrument.ts` + `VITE_SENTRY_DSN` |
| **`src/lib/logger.ts`** | Console في **وضع التطوير** فقط (بجانب Sentry في الإنتاج) |

> إعداد APIs والأسرار: [API_INTEGRATION_GUIDE.md](docs/API_INTEGRATION_GUIDE.md)  
> Sentry والنشر: [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md#sentry)

---

## التشغيل المحلي (Local Setup)

### المتطلبات

- **Node.js** 18+ (يفضّل 22 لمطابقة Docker)
- **npm** (يُستخدم `package-lock.json` مع `npm ci` في Docker)
- ملف `.env` من `.env.example`
- مشروع **Supabase** مفعّل (URL + Anon Key)

### الخطوات

```bash
# 1. استنساخ المستودع
git clone https://github.com/Niyrmy6/rasid-ye.git
cd rasid-ye

# 2. تثبيت الحزم
npm install

# 3. متغيرات البيئة (Linux/macOS)
cp .env.example .env
# Windows (PowerShell): Copy-Item .env.example .env

# عدّل على الأقل:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_SENTRY_DSN  ← في Vercel أو .env محلي فقط (ليس في .env.example)

# 4. خادم التطوير
npm run dev
```

يفتح التطبيق على: **http://localhost:3000**

### أوامر npm المفيدة

| الأمر | الوظيفة |
|-------|---------|
| `npm run dev` | Vite — منفذ 3000، `host=0.0.0.0` |
| `npm run build` | بناء إنتاج إلى `dist/` |
| `npm run preview` | معاينة البناء محلياً |
| `npm run lint` | فحص TypeScript (`tsc --noEmit`) |
| `npm run docker:up` | بناء وتشغيل حاوية nginx على **8080** |
| `npm run docker:down` | إيقاف Docker Compose |

> Docker يحتاج `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` في `.env` عند البناء. التفاصيل: [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## التوثيق (Documentation)

| الملف | ماذا ستجد فيه |
|-------|----------------|
| [PROJECT_README.md](docs/PROJECT_README.md) | المعمارية، الطبقات، تدفق البيانات، نظام التصميم، الصفحات |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | جداول PostgreSQL، العلاقات، RPC، Enums |
| [REPORTING_GUIDE.md](docs/REPORTING_GUIDE.md) | كيفية إرسال بلاغ من الواجهة حتى قاعدة البيانات |
| [API_INTEGRATION_GUIDE.md](docs/API_INTEGRATION_GUIDE.md) | Supabase، Groq، Twilio، Resend، الخرائط، RSS |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | البيئة، Docker، Vercel، استكشاف الأخطاء |
| [FEATURE_IDEAS.md](docs/FEATURE_IDEAS.md) | أفكار تطوير مستقبلية |

---

## فريق العمل والتقدير (Credit)

تم تخطيط وتصميم وتطوير النظام ضمن مشروع التخرج 2025–2026 بإشراف:  
👩‍🏫 **د. أميمة باحيدر (Dr. Omaima Baheider)**

تنفيذ هذا الجزء من النظام:  
👩‍💻 **نور العطاس (Noor Alattas)**

---

## الترخيص (License)

مشروع تخرج أكاديمي. جميع الحقوق محفوظة © 2025–2026.

---

<div align="center">
  <b>تم التطوير بـ ❤️ في جامعة العلوم والتكنولوجيا — عدن</b>
  <br/><br/>
  <i>رصدنا: لأن صحة مجتمعك تبدأ من بلاغك 🛡️</i>
</div>
