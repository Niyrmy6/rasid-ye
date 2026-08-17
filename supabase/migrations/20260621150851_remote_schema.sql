


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."news_category" AS ENUM (
    'urgent',
    'alert',
    'guideline',
    'event'
);


ALTER TYPE "public"."news_category" OWNER TO "postgres";


CREATE TYPE "public"."report_status_type" AS ENUM (
    'new',
    'pending',
    'resolved',
    'verified',
    'rejected'
);


ALTER TYPE "public"."report_status_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."report_status_type" IS 'حالات البلاغ لنظام الترصد';



CREATE OR REPLACE FUNCTION "public"."check_disease_threshold"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_disease_id INTEGER;
    v_report_count INTEGER;
    v_threshold INTEGER;
    v_disease_name TEXT;
BEGIN
    -- جلب disease_id من جدول report (المصدر الوحيد للمرض)
    SELECT r.disease_id INTO v_disease_id
    FROM public.report r
    WHERE r.report_id = NEW.report_id;

    -- إذا لم يكن هناك مرض محدد، نتجاوز
    IF v_disease_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- جلب العتبة واسم المرض
    SELECT threshold, disease_name
    INTO v_threshold, v_disease_name
    FROM public.disease
    WHERE disease_id = v_disease_id;

    -- عد البلاغات خلال آخر ساعة من جدول report_history عبر ربطه بجدول report
    SELECT COUNT(*)
    INTO v_report_count
    FROM public.report_history rh
    JOIN public.report r ON r.report_id = rh.report_id
    WHERE r.disease_id = v_disease_id
      AND rh.created_at >= NOW() - INTERVAL '1 hour';

    -- إذا تجاوز الحد
    IF v_report_count >= v_threshold THEN
        -- منع تكرار الإشعار
        IF NOT EXISTS (
            SELECT 1 FROM public.notification
            WHERE disease_id = v_disease_id
              AND created_at >= NOW() - INTERVAL '1 hour'
        ) THEN
            INSERT INTO public.notification (disease_id, message, created_at)
            VALUES (
                v_disease_id,
                '🚨 تنبيه: تم تجاوز الحد المسموح لمرض "' 
                || v_disease_name ||
                '" حيث تم تسجيل ' || v_report_count ||
                ' بلاغاً خلال الساعة الأخيرة.',
                NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_disease_threshold"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_epidemic_threshold"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_threshold INTEGER;
    v_current_count INTEGER;
    v_disease_name TEXT;
    v_gov_name TEXT;
    v_last_message TEXT;
    v_last_count INTEGER;
    v_should_notify BOOLEAN := false;
BEGIN
    -- جلب العتبة الوبائية واسم المرض من جدول الأمراض
    SELECT threshold, ar_name INTO v_threshold, v_disease_name
    FROM public.disease
    WHERE disease_id = NEW.disease_id;

    -- إذا لم يكن هناك عتبة محددة، نتجاوز العملية
    IF v_threshold IS NULL OR v_threshold <= 0 THEN
        RETURN NEW;
    END IF;

    -- حساب عدد الحالات الإجمالي لهذا المرض في هذه المحافظة
    SELECT COUNT(*) INTO v_current_count
    FROM public.report
    WHERE disease_id = NEW.disease_id 
      AND governorate_id = NEW.governorate_id;

    -- تحويل رقم المحافظة إلى اسم مقروء للتنبيه
    CASE NEW.governorate_id
        WHEN 1 THEN v_gov_name := 'عدن';
        WHEN 2 THEN v_gov_name := 'لحج';
        WHEN 3 THEN v_gov_name := 'الضالع';
        WHEN 4 THEN v_gov_name := 'تعز';
        WHEN 5 THEN v_gov_name := 'المهرة';
        WHEN 6 THEN v_gov_name := 'أبين';
        ELSE v_gov_name := 'منطقة أخرى';
    END CASE;

    -- التحقق مما إذا كان العدد تجاوز أو ساوى العتبة الوبائية
    IF v_current_count >= v_threshold THEN
        
        -- جلب أحدث تنبيه أُرسل لنفس المرض والمحافظة خلال الـ 24 ساعة الماضية
        SELECT message INTO v_last_message
        FROM public.notification
        WHERE disease_id = NEW.disease_id
          AND message LIKE '%' || v_gov_name || '%'
          AND created_at > NOW() - INTERVAL '1 day'
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_last_message IS NOT NULL THEN
            -- تم إرسال تنبيه في آخر 24 ساعة.. نستخرج الرقم السابق من نص الرسالة
            -- يعتمد هذا على وجود النص بصيغة "بلغ X حالة"
            v_last_count := substring(v_last_message from 'بلغ ([0-9]+) حالة')::integer;
            
            -- التحقق من حدوث "انفجار وبائي" بنسبة 50% من العتبة
            IF v_last_count IS NOT NULL AND v_current_count >= (v_last_count + (v_threshold * 0.5)) THEN
                v_should_notify := true; -- كسر فترة التبريد وإرسال تنبيه
            ELSE
                v_should_notify := false; -- لا يزال في فترة التبريد ولم يرتفع بشكل خطير
            END IF;
        ELSE
            -- لم يتم إرسال تنبيه في آخر 24 ساعة
            v_should_notify := true;
        END IF;

        -- إدخال التنبيه إذا تحققت الشروط
        IF v_should_notify THEN
            INSERT INTO public.notification (disease_id, message, is_read)
            VALUES (
                NEW.disease_id,
                'تحذير وبائي عاجل: إجمالي حالات ' || COALESCE(v_disease_name, 'المرض') || ' في ' || v_gov_name || ' بلغ ' || v_current_count || ' حالة، مما يمثل تجاوزاً مستمراً للعتبة المحددة (' || v_threshold || ').',
                false
            );
        END IF;

    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_epidemic_threshold"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_epidemic_threshold_for_report"("p_report_id" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_report RECORD;
    v_threshold INTEGER;
    v_current_count INTEGER;
    v_disease_name TEXT;
    v_gov_name TEXT;
    v_last_message TEXT;
    v_last_count INTEGER;
    v_should_notify BOOLEAN := false;
BEGIN
    SELECT * INTO v_report FROM public.report WHERE report_id = p_report_id;
    IF v_report.disease_id IS NULL OR v_report.governorate_id IS NULL THEN
        RETURN;
    END IF;

    -- جلب العتبة الوبائية واسم المرض من جدول الأمراض
    SELECT threshold, ar_name INTO v_threshold, v_disease_name
    FROM public.disease
    WHERE disease_id = v_report.disease_id;

    -- إذا لم يكن هناك عتبة محددة، نتجاوز العملية
    IF v_threshold IS NULL OR v_threshold <= 0 THEN
        RETURN;
    END IF;

    -- حساب عدد الحالات الإجمالي لهذا المرض في هذه المحافظة
    SELECT COUNT(*) INTO v_current_count
    FROM public.report
    WHERE disease_id = v_report.disease_id 
      AND governorate_id = v_report.governorate_id;

    -- تحويل رقم المحافظة إلى اسم مقروء للتنبيه
    CASE v_report.governorate_id
        WHEN 1 THEN v_gov_name := 'عدن';
        WHEN 2 THEN v_gov_name := 'لحج';
        WHEN 3 THEN v_gov_name := 'الضالع';
        WHEN 4 THEN v_gov_name := 'تعز';
        WHEN 5 THEN v_gov_name := 'المهرة';
        WHEN 6 THEN v_gov_name := 'أبين';
        ELSE v_gov_name := 'منطقة أخرى';
    END CASE;

    -- التحقق مما إذا كان العدد تجاوز أو ساوى العتبة الوبائية
    IF v_current_count >= v_threshold THEN
        
        -- جلب أحدث تنبيه أُرسل لنفس المرض والمحافظة خلال الـ 24 ساعة الماضية
        SELECT message INTO v_last_message
        FROM public.notification
        WHERE disease_id = v_report.disease_id
          AND message LIKE '%' || v_gov_name || '%'
          AND created_at > NOW() - INTERVAL '1 day'
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_last_message IS NOT NULL THEN
            v_last_count := substring(v_last_message from 'بلغ ([0-9]+) حالة')::integer;
            
            -- التحقق من حدوث "انفجار وبائي" بنسبة 50% من العتبة
            IF v_last_count IS NOT NULL AND v_current_count >= (v_last_count + (v_threshold * 0.5)) THEN
                v_should_notify := true;
            ELSE
                v_should_notify := false;
            END IF;
        ELSE
            v_should_notify := true;
        END IF;

        -- إدخال التنبيه إذا تحققت الشروط
        IF v_should_notify THEN
            INSERT INTO public.notification (disease_id, message, is_read)
            VALUES (
                v_report.disease_id,
                'تحذير وبائي عاجل: إجمالي حالات ' || COALESCE(v_disease_name, 'المرض') || ' في ' || v_gov_name || ' بلغ ' || v_current_count || ' حالة، مما يمثل تجاوزاً مستمراً للعتبة المحددة (' || v_threshold || ').',
                false
            );
        END IF;

    END IF;
END;
$$;


ALTER FUNCTION "public"."check_epidemic_threshold_for_report"("p_report_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."classify_report_disease"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    v_manual_disease_id INTEGER;
    v_auto_disease_id INTEGER;
BEGIN
    -- 1. جلب disease_id من جدول البلاغ الأصلي
    SELECT disease_id INTO v_manual_disease_id
    FROM public.report
    WHERE report_id = NEW.report_id;

    -- 2. إذا كان فارغاً (المستخدم اختار "لا أعرف")، نصنف تلقائياً بناءً على الأعراض
    IF v_manual_disease_id IS NULL THEN
        SELECT ds.disease_id INTO v_auto_disease_id
        FROM public.disease_symptom ds
        JOIN public.symptom_report sr ON sr.symptom_id = ds.symptom_id
        WHERE sr.report_id = NEW.report_id
        GROUP BY ds.disease_id
        ORDER BY SUM(ds.weight) DESC
        LIMIT 1;

        -- تحديث جدول report فقط (المصدر الوحيد للمرض)
        IF v_auto_disease_id IS NOT NULL THEN
            UPDATE public.report
            SET disease_id = v_auto_disease_id
            WHERE report_id = NEW.report_id;

            ELSE
    UPDATE public.report
    SET disease_id = NULL -- أو ضعي ID لحالة "غير محدد"
    WHERE report_id = NEW.report_id;
            
           
        END IF;
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."classify_report_disease"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_report_history"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.report_history (
        report_id,
        report_status,
        created_at
    )
    VALUES (
        NEW.report_id,
        'new',
        NOW()
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_report_history"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_governorate"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- 1. محاولة البحث عن معرف المحافظة التي تحتوي على الموقع
    SELECT g.governorate_id INTO NEW.governorate_id
    FROM governorate g
    WHERE ST_Contains(g.geom, NEW.location)
      AND g.governorate_id != 13 -- نتأكد أنه لا يبحث داخل مضلع Unknown نفسه إن وجد
    LIMIT 1;
    
    -- 2. إذا لم يجد تقاطع (أي أن النتيجة NULL)، نضع القيمة 13
    IF NEW.governorate_id IS NULL THEN
        NEW.governorate_id := 13;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."find_governorate"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_tracking_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.tracking_number IS NULL THEN
        NEW.tracking_number := 'RPT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_tracking_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_confirmed_reports"() RETURNS TABLE("report_id" integer, "disease_name" "text", "governorate_name" "text", "report_date" timestamp with time zone, "lat" double precision, "lng" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.report_id::integer,
    d.disease_name,
    g.governorate_name,
    r.report_date,
    st_y(r.location) as lat,
    st_x(r.location) as lng
  FROM public.report r
  LEFT JOIN public.disease d ON r.disease_id = d.disease_id
  LEFT JOIN public.governorate g ON r.governorate_id = g.governorate_id
  WHERE r.classification_id = 3; -- 3 = Confirmed
END;
$$;


ALTER FUNCTION "public"."get_confirmed_reports"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."disease" (
    "disease_id" bigint NOT NULL,
    "disease_name" "text" NOT NULL,
    "user_id" bigint,
    "threshold" bigint DEFAULT '1'::bigint NOT NULL,
    "description" "text",
    "ar_name" "text",
    "E_description" "text"
);


ALTER TABLE "public"."disease" OWNER TO "postgres";


COMMENT ON COLUMN "public"."disease"."threshold" IS 'العتبة المطلوبة';



COMMENT ON COLUMN "public"."disease"."E_description" IS 'الوصف بالانجليزي';



ALTER TABLE "public"."disease" ALTER COLUMN "disease_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."disease_disease_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."disease_symptom" (
    "disease_id" integer NOT NULL,
    "symptom_id" integer NOT NULL,
    "weight" numeric(3,2)
);


ALTER TABLE "public"."disease_symptom" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."governorate" (
    "governorate_id" bigint NOT NULL,
    "governorate_name" "text" NOT NULL,
    "user_id" bigint,
    "geom" "extensions"."geometry"(MultiPolygon,4326) NOT NULL,
    "ar_name" "text"
);


ALTER TABLE "public"."governorate" OWNER TO "postgres";


ALTER TABLE "public"."governorate" ALTER COLUMN "governorate_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."governorate_governorate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."news" (
    "item_id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "type" "public"."news_category" NOT NULL,
    "content" "text",
    "publish_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" bigint,
    "image" "text"
);


ALTER TABLE "public"."news" OWNER TO "postgres";


COMMENT ON COLUMN "public"."news"."image" IS 'صورة الخبر';



ALTER TABLE "public"."news" ALTER COLUMN "item_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."news_item_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notification" (
    "notification_id" bigint NOT NULL,
    "disease_id" integer NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_read" boolean
);


ALTER TABLE "public"."notification" OWNER TO "postgres";


ALTER TABLE "public"."notification" ALTER COLUMN "notification_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notification_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."report" (
    "report_id" bigint NOT NULL,
    "patient_name" "text" NOT NULL,
    "age" bigint,
    "location" "extensions"."geometry"(Point,4326),
    "notes" "text",
    "onset_date" timestamp with time zone,
    "report_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "phone" "text",
    "gender" "text",
    "governorate_id" bigint,
    "user_id" bigint NOT NULL,
    "classification_id" bigint DEFAULT '5'::bigint,
    "disease_id" bigint,
    "tracking_number" character varying(15)
);


ALTER TABLE "public"."report" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_classification" (
    "classification_id" bigint NOT NULL,
    "case_classification" "text" NOT NULL
);


ALTER TABLE "public"."report_classification" OWNER TO "postgres";


ALTER TABLE "public"."report_classification" ALTER COLUMN "classification_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."report_classification_classification_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."report_history" (
    "report_id" bigint NOT NULL,
    "report_status" "public"."report_status_type" DEFAULT 'new'::"public"."report_status_type" NOT NULL,
    "updated_user_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."report_history" OWNER TO "postgres";


ALTER TABLE "public"."report_history" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."report_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."report" ALTER COLUMN "report_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."report_report_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."symptom" (
    "symptom_id" bigint NOT NULL,
    "symptom_name" "text" NOT NULL,
    "ar_name" "text"
);


ALTER TABLE "public"."symptom" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."symptom_report" (
    "symptom_id" bigint NOT NULL,
    "report_id" bigint NOT NULL
);


ALTER TABLE "public"."symptom_report" OWNER TO "postgres";


ALTER TABLE "public"."symptom" ALTER COLUMN "symptom_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."symptom_symptom_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user" (
    "user_id" bigint NOT NULL,
    "full_name" "text" NOT NULL,
    "password" "text" NOT NULL,
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role_id" bigint DEFAULT '3'::bigint NOT NULL,
    "email" character varying(255),
    "profile_picture" "text"
);


ALTER TABLE "public"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_role" (
    "role_id" bigint NOT NULL,
    "role_name" "text" NOT NULL
);


ALTER TABLE "public"."user_role" OWNER TO "postgres";


ALTER TABLE "public"."user_role" ALTER COLUMN "role_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_role_role_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."user" ALTER COLUMN "user_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."disease"
    ADD CONSTRAINT "disease_disease_name_key" UNIQUE ("disease_name");



ALTER TABLE ONLY "public"."disease"
    ADD CONSTRAINT "disease_pkey" PRIMARY KEY ("disease_id");



ALTER TABLE ONLY "public"."disease_symptom"
    ADD CONSTRAINT "disease_symptoms_pkey" PRIMARY KEY ("disease_id", "symptom_id");



ALTER TABLE ONLY "public"."governorate"
    ADD CONSTRAINT "governorate_governorate_name_key" UNIQUE ("governorate_name");



ALTER TABLE ONLY "public"."governorate"
    ADD CONSTRAINT "governorate_pkey" PRIMARY KEY ("governorate_id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_pkey" PRIMARY KEY ("item_id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id");



ALTER TABLE ONLY "public"."report_classification"
    ADD CONSTRAINT "report_classification_case_classification_key" UNIQUE ("case_classification");



ALTER TABLE ONLY "public"."report_classification"
    ADD CONSTRAINT "report_classification_pkey" PRIMARY KEY ("classification_id");



ALTER TABLE ONLY "public"."report_history"
    ADD CONSTRAINT "report_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_pkey" PRIMARY KEY ("report_id");



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_tracking_number_key" UNIQUE ("tracking_number");



ALTER TABLE ONLY "public"."symptom"
    ADD CONSTRAINT "symptom_pkey" PRIMARY KEY ("symptom_id");



ALTER TABLE ONLY "public"."symptom_report"
    ADD CONSTRAINT "symptom_report_pkey" PRIMARY KEY ("symptom_id", "report_id");



ALTER TABLE ONLY "public"."symptom"
    ADD CONSTRAINT "symptom_symptom_name_key" UNIQUE ("symptom_name");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_role"
    ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("role_id");



ALTER TABLE ONLY "public"."user_role"
    ADD CONSTRAINT "user_role_role_name_key" UNIQUE ("role_name");



CREATE INDEX "governorate_geom_idx" ON "public"."governorate" USING "gist" ("geom");



CREATE INDEX "idx_location_geom" ON "public"."report" USING "gist" ("location");



CREATE OR REPLACE TRIGGER "Email On Report Update" AFTER INSERT OR UPDATE ON "public"."report_history" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/send-email-notification', 'POST', '{"Content-type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "send_notification_alert" AFTER INSERT ON "public"."notification" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/notify-manager', 'POST', '{"Content-type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "trg_classify_disease" AFTER INSERT ON "public"."symptom_report" FOR EACH ROW EXECUTE FUNCTION "public"."classify_report_disease"();



CREATE OR REPLACE TRIGGER "trg_create_report_history" AFTER INSERT ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."create_report_history"();



CREATE OR REPLACE TRIGGER "trg_find_governorate" BEFORE INSERT OR UPDATE ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."find_governorate"();



CREATE OR REPLACE TRIGGER "trg_generate_tracking_number" BEFORE INSERT ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."generate_tracking_number"();



CREATE OR REPLACE TRIGGER "trigger_check_disease" AFTER INSERT OR UPDATE ON "public"."report_history" FOR EACH ROW EXECUTE FUNCTION "public"."check_disease_threshold"();



ALTER TABLE ONLY "public"."disease_symptom"
    ADD CONSTRAINT "disease_symptoms_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "public"."disease"("disease_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."disease_symptom"
    ADD CONSTRAINT "disease_symptoms_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "public"."symptom"("symptom_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."disease"
    ADD CONSTRAINT "disease_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."governorate"
    ADD CONSTRAINT "governorate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user"("user_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "public"."disease"("disease_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "public"."report_classification"("classification_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "public"."disease"("disease_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_governorate_id_fkey" FOREIGN KEY ("governorate_id") REFERENCES "public"."governorate"("governorate_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."report_history"
    ADD CONSTRAINT "report_history_report_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("report_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_history"
    ADD CONSTRAINT "report_history_updated_user_id_fkey" FOREIGN KEY ("updated_user_id") REFERENCES "public"."user"("user_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."symptom_report"
    ADD CONSTRAINT "symptom_report_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."report"("report_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."symptom_report"
    ADD CONSTRAINT "symptom_report_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "public"."symptom"("symptom_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."user_role"("role_id") ON UPDATE CASCADE ON DELETE RESTRICT;



CREATE POLICY "Allow anon insert report table" ON "public"."report" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anon insert symptom_report table" ON "public"."symptom_report" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anon insert user table" ON "public"."user" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anon read user table" ON "public"."user" FOR SELECT USING (true);



CREATE POLICY "admin full access disease" ON "public"."disease" USING ((EXISTS ( SELECT 1
   FROM "public"."user" "u"
  WHERE (("u"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint) AND ("u"."role_id" = 1)))));



CREATE POLICY "admin full access disease_symptom" ON "public"."disease_symptom" USING ((EXISTS ( SELECT 1
   FROM "public"."user" "u"
  WHERE ("u"."role_id" = 1))));



CREATE POLICY "admin full access governorate" ON "public"."governorate" USING ((EXISTS ( SELECT 1
   FROM "public"."user" "u"
  WHERE (("u"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint) AND ("u"."role_id" = 1)))));



CREATE POLICY "admin full access report" ON "public"."report" USING ((EXISTS ( SELECT 1
   FROM "public"."user" "u"
  WHERE (("u"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint) AND ("u"."role_id" = 1)))));



CREATE POLICY "admin full access report_history" ON "public"."report_history" USING ((EXISTS ( SELECT 1
   FROM "public"."user" "u"
  WHERE (("u"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint) AND ("u"."role_id" = 1)))));



CREATE POLICY "admin full access user" ON "public"."user" USING (("role_id" = 1));



CREATE POLICY "admin full access user_role" ON "public"."user_role" USING (("role_id" = 1));



CREATE POLICY "health_worker see disease" ON "public"."disease" FOR SELECT USING (("user_id" = ("current_setting"('app.current_user'::"text"))::bigint));



CREATE POLICY "health_worker see disease_symptom" ON "public"."disease_symptom" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."disease" "d"
  WHERE (("d"."disease_id" = "disease_symptom"."disease_id") AND ("d"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint)))));



CREATE POLICY "health_worker see governorate" ON "public"."governorate" FOR SELECT USING (("user_id" = ("current_setting"('app.current_user'::"text"))::bigint));



CREATE POLICY "health_worker see governorate reports" ON "public"."report" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."governorate" "g"
  WHERE (("g"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint) AND ("g"."governorate_id" = "report"."governorate_id")))));



CREATE POLICY "health_worker see symptom_report" ON "public"."symptom_report" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."report" "r"
     JOIN "public"."disease" "d" ON (("d"."disease_id" = "r"."disease_id")))
  WHERE (("symptom_report"."report_id" = "r"."report_id") AND ("d"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint)))));



CREATE POLICY "health_worker select report_history" ON "public"."report_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."report" "r"
     JOIN "public"."disease" "d" ON (("d"."disease_id" = "r"."disease_id")))
  WHERE (("r"."report_id" = "report_history"."report_id") AND ("d"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint)))));



CREATE POLICY "reporter insert report" ON "public"."report" FOR INSERT WITH CHECK (("user_id" = ("current_setting"('app.current_user'::"text"))::bigint));



CREATE POLICY "reporter see own reports" ON "public"."report" FOR SELECT USING (("user_id" = ("current_setting"('app.current_user'::"text"))::bigint));



CREATE POLICY "reporter see own symptom_report" ON "public"."symptom_report" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."report" "r"
  WHERE (("r"."report_id" = "symptom_report"."report_id") AND ("r"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint)))));



CREATE POLICY "reporter select report_history" ON "public"."report_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."report" "r"
  WHERE (("r"."report_id" = "report_history"."report_id") AND ("r"."user_id" = ("current_setting"('app.current_user'::"text"))::bigint)))));



CREATE POLICY "select all symptoms" ON "public"."symptom" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notification";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_disease_threshold"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_disease_threshold"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_disease_threshold"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_epidemic_threshold"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_epidemic_threshold"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_epidemic_threshold"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_epidemic_threshold_for_report"("p_report_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_epidemic_threshold_for_report"("p_report_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_epidemic_threshold_for_report"("p_report_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."classify_report_disease"() TO "anon";
GRANT ALL ON FUNCTION "public"."classify_report_disease"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."classify_report_disease"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_report_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_report_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_report_history"() TO "service_role";



GRANT ALL ON FUNCTION "public"."find_governorate"() TO "anon";
GRANT ALL ON FUNCTION "public"."find_governorate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_governorate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tracking_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tracking_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tracking_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_confirmed_reports"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_confirmed_reports"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_confirmed_reports"() TO "service_role";





























































































GRANT ALL ON TABLE "public"."disease" TO "anon";
GRANT ALL ON TABLE "public"."disease" TO "authenticated";
GRANT ALL ON TABLE "public"."disease" TO "service_role";



GRANT ALL ON SEQUENCE "public"."disease_disease_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."disease_disease_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."disease_disease_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."disease_symptom" TO "anon";
GRANT ALL ON TABLE "public"."disease_symptom" TO "authenticated";
GRANT ALL ON TABLE "public"."disease_symptom" TO "service_role";



GRANT ALL ON TABLE "public"."governorate" TO "anon";
GRANT ALL ON TABLE "public"."governorate" TO "authenticated";
GRANT ALL ON TABLE "public"."governorate" TO "service_role";



GRANT ALL ON SEQUENCE "public"."governorate_governorate_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."governorate_governorate_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."governorate_governorate_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";



GRANT ALL ON SEQUENCE "public"."news_item_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."news_item_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."news_item_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notification" TO "anon";
GRANT ALL ON TABLE "public"."notification" TO "authenticated";
GRANT ALL ON TABLE "public"."notification" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notification_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notification_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notification_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."report" TO "anon";
GRANT ALL ON TABLE "public"."report" TO "authenticated";
GRANT ALL ON TABLE "public"."report" TO "service_role";



GRANT ALL ON TABLE "public"."report_classification" TO "anon";
GRANT ALL ON TABLE "public"."report_classification" TO "authenticated";
GRANT ALL ON TABLE "public"."report_classification" TO "service_role";



GRANT ALL ON SEQUENCE "public"."report_classification_classification_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."report_classification_classification_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."report_classification_classification_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."report_history" TO "anon";
GRANT ALL ON TABLE "public"."report_history" TO "authenticated";
GRANT ALL ON TABLE "public"."report_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."report_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."report_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."report_history_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."report_report_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."report_report_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."report_report_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."symptom" TO "anon";
GRANT ALL ON TABLE "public"."symptom" TO "authenticated";
GRANT ALL ON TABLE "public"."symptom" TO "service_role";



GRANT ALL ON TABLE "public"."symptom_report" TO "anon";
GRANT ALL ON TABLE "public"."symptom_report" TO "authenticated";
GRANT ALL ON TABLE "public"."symptom_report" TO "service_role";



GRANT ALL ON SEQUENCE "public"."symptom_symptom_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."symptom_symptom_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."symptom_symptom_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."user_role" TO "anon";
GRANT ALL ON TABLE "public"."user_role" TO "authenticated";
GRANT ALL ON TABLE "public"."user_role" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_role_role_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_role_role_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_role_role_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_user_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































