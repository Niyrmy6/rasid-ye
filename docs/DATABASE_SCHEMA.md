<div align="center">

# 🗄️ رصدنا — هيكلية قاعدة البيانات
**DATABASE_SCHEMA.md**

</div>

---

## نظرة عامة

قاعدة البيانات على **Supabase (PostgreSQL)** مع **Row Level Security (RLS)**. أنواع TypeScript المولَّدة موجودة في:

`src/types/database.ts`

> إعداد المشروع والمفاتيح: [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)  
> مسار الإبلاغ من التطبيق: [REPORTING_GUIDE.md](REPORTING_GUIDE.md)

---

## الجداول الرئيسية

| الجدول | الغرض |
|--------|--------|
| `user` | حسابات المستخدمين (هاتف، كلمة مرور، `role_id`) |
| `user_role` | أدوار النظام (مواطن = `role_id` 3 في تطبيق الجوال) |
| `report` | البلاغات الصحية (مريض، مرض، موقع PostGIS، رقم تتبع) |
| `report_history` | سجل تغيّر حالة كل بلاغ |
| `report_classification` | تصنيفات الحالة (اشتباه، مؤكد، مرفوض، …) |
| `symptom` | قائمة الأعراض |
| `symptom_report` | ربط many-to-many بين بلاغ وأعراض |
| `disease` | الأمراض + عتبة التنبيه `threshold` |
| `disease_symptom` | ربط مرض بأعراضه ووزنها |
| `governorate` | المحافظات (هندسة `geom`) |
| `news` | أخبار صحية محلية |
| `notification` | إشعارات مرتبطة بالأمراض/البلاغات |

---

## علاقات مبسطة (ERD)

```text
user (1) ──────< (N) report
user_role (1) ──< (N) user

report (N) >──── (1) disease
report (N) >──── (1) report_classification
report (N) >──── (1) governorate
report (1) ─────< (N) report_history
report (1) ─────< (N) symptom_report >──── (N) symptom

disease (1) ────< (N) disease_symptom >──── (N) symptom
```

---

## جدول `report` (الأعمدة المستخدمة في التطبيق)

| العمود | الوصف |
|--------|--------|
| `report_id` | المعرّف |
| `tracking_number` | رقم التتبع للمواطن |
| `patient_name`, `age`, `gender`, `phone` | بيانات المريض |
| `onset_date`, `notes` | تاريخ بداية الأعراض وملاحظات |
| `user_id` | المُبلّغ |
| `disease_id` | المرض (قد يكون `null` عند «غير معروف») |
| `classification_id` | عند الإنشاء من التطبيق يُستخدم `1` (افتراضي المواطن) |
| `governorate_id` | المحافظة (إن وُجدت) |
| `location` | موقع **PostGIS** بصيغة WKT مثل `POINT(lng lat)` |
| `report_date` | وقت الإرسال |

---

## جدول `report_history` وحالات البلاغ

الحالة الحالية تُستنتج من **أحدث** سجل في `report_history` (الواجهة ترتب السجلات في `src/lib/queries.ts`).

**Enum `report_status_type`** (من `database.ts`):

| القيمة | المعنى التقريبي في الواجهة |
|--------|---------------------------|
| `new` | جديد / مستلم |
| `pending` | قيد المراجعة |
| `verified` | مؤكد (يظهر على الخريطة بعد RPC) |
| `resolved` | اكتمال المعالجة |
| `rejected` | مرفوض |

---

## دالة RPC: `get_confirmed_reports`

تُستدعى من `fetchConfirmedReports()` في `src/lib/queries.ts` لصفحة الخريطة `Map.tsx`.

**الإرجاع:**

| الحقل | الاستخدام |
|-------|-----------|
| `report_id` | المعرّف |
| `lat`, `lng` | إحداثيات العلامة |
| `disease_name` | التصفية والنافذة المنبثقة |
| `governorate_name` | التصفية الجغرافية |
| `report_date` | العرض |

> منطق «مؤكد» يُعرَّف في قاعدة البيانات (الدالة SQL)، وليس في الواجهة.

---

## Edge Functions المرتبطة بالبيانات

| الدالة | موجودة في المستودع | الدور |
|--------|-------------------|--------|
| `chat-rag-bot` | ✅ `supabase/functions/chat-rag-bot/` | مساعد صحي — **لا يقرأ** جداول البلاغات |
| `send-email-notification` | ✅ | إيميل عند تغيير الحالة (Webhook) |
| `notify-manager` | ✅ | واتساب لمالك المرض عند تجاوز `threshold` |
| `send-whatsapp-otp` | ⚠️ مُستدعاة من الواجهة، **غير موجودة في هذا المجلد** | OTP — تُنشر على مشروع Supabase السحابي |

إعداد `verify_jwt` لكل دالة: راجع `supabase/config.toml`.

---

## نصائح للمطور

| المهمة | الأمر / الملف |
|--------|----------------|
| تحديث الأنواع بعد تغيير Schema | Supabase MCP أو Dashboard → Generate types → `database.ts` |
| طبقة الوصول الموحّدة | `src/lib/queries.ts` |
| نماذج الواجهة | `src/types/models.ts` |

---

<div align="center">
  <b>← <a href="../README.md">README.md</a> · <a href="REPORTING_GUIDE.md">دليل الإبلاغ</a></b>
</div>
