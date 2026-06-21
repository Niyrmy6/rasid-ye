drop trigger if exists "trg_create_report_history" on "public"."report";

drop trigger if exists "trg_find_governorate" on "public"."report";

drop trigger if exists "trg_generate_tracking_number" on "public"."report";

drop trigger if exists "trigger_check_disease" on "public"."report_history";

drop trigger if exists "trg_classify_disease" on "public"."symptom_report";

drop policy "admin full access disease" on "public"."disease";

drop policy "admin full access disease_symptom" on "public"."disease_symptom";

drop policy "health_worker see disease_symptom" on "public"."disease_symptom";

drop policy "admin full access governorate" on "public"."governorate";

drop policy "admin full access report" on "public"."report";

drop policy "health_worker see governorate reports" on "public"."report";

drop policy "admin full access report_history" on "public"."report_history";

drop policy "health_worker select report_history" on "public"."report_history";

drop policy "reporter select report_history" on "public"."report_history";

drop policy "health_worker see symptom_report" on "public"."symptom_report";

drop policy "reporter see own symptom_report" on "public"."symptom_report";

alter table "public"."disease" drop constraint "disease_user_id_fkey";

alter table "public"."disease_symptom" drop constraint "disease_symptoms_disease_id_fkey";

alter table "public"."disease_symptom" drop constraint "disease_symptoms_symptom_id_fkey";

alter table "public"."governorate" drop constraint "governorate_user_id_fkey";

alter table "public"."news" drop constraint "news_created_by_fkey";

alter table "public"."notification" drop constraint "notification_disease_id_fkey";

alter table "public"."report" drop constraint "report_classification_id_fkey";

alter table "public"."report" drop constraint "report_disease_id_fkey";

alter table "public"."report" drop constraint "report_governorate_id_fkey";

alter table "public"."report" drop constraint "report_user_id_fkey";

alter table "public"."report_history" drop constraint "report_history_report_fk";

alter table "public"."report_history" drop constraint "report_history_updated_user_id_fkey";

alter table "public"."symptom_report" drop constraint "symptom_report_report_id_fkey";

alter table "public"."symptom_report" drop constraint "symptom_report_symptom_id_fkey";

alter table "public"."user" drop constraint "user_role_id_fkey";

alter table "public"."governorate" alter column "geom" set data type extensions.geometry(MultiPolygon,4326) using "geom"::extensions.geometry(MultiPolygon,4326);

alter table "public"."news" alter column "type" set data type public.news_category using "type"::text::public.news_category;

alter table "public"."report" alter column "location" set data type extensions.geometry(Point,4326) using "location"::extensions.geometry(Point,4326);

alter table "public"."report_history" alter column "report_status" set default 'new'::public.report_status_type;

alter table "public"."report_history" alter column "report_status" set data type public.report_status_type using "report_status"::text::public.report_status_type;

alter table "public"."disease" add constraint "disease_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."disease" validate constraint "disease_user_id_fkey";

alter table "public"."disease_symptom" add constraint "disease_symptoms_disease_id_fkey" FOREIGN KEY (disease_id) REFERENCES public.disease(disease_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."disease_symptom" validate constraint "disease_symptoms_disease_id_fkey";

alter table "public"."disease_symptom" add constraint "disease_symptoms_symptom_id_fkey" FOREIGN KEY (symptom_id) REFERENCES public.symptom(symptom_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."disease_symptom" validate constraint "disease_symptoms_symptom_id_fkey";

alter table "public"."governorate" add constraint "governorate_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."governorate" validate constraint "governorate_user_id_fkey";

alter table "public"."news" add constraint "news_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."news" validate constraint "news_created_by_fkey";

alter table "public"."notification" add constraint "notification_disease_id_fkey" FOREIGN KEY (disease_id) REFERENCES public.disease(disease_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notification" validate constraint "notification_disease_id_fkey";

alter table "public"."report" add constraint "report_classification_id_fkey" FOREIGN KEY (classification_id) REFERENCES public.report_classification(classification_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."report" validate constraint "report_classification_id_fkey";

alter table "public"."report" add constraint "report_disease_id_fkey" FOREIGN KEY (disease_id) REFERENCES public.disease(disease_id) ON DELETE SET NULL not valid;

alter table "public"."report" validate constraint "report_disease_id_fkey";

alter table "public"."report" add constraint "report_governorate_id_fkey" FOREIGN KEY (governorate_id) REFERENCES public.governorate(governorate_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."report" validate constraint "report_governorate_id_fkey";

alter table "public"."report" add constraint "report_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."report" validate constraint "report_user_id_fkey";

alter table "public"."report_history" add constraint "report_history_report_fk" FOREIGN KEY (report_id) REFERENCES public.report(report_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."report_history" validate constraint "report_history_report_fk";

alter table "public"."report_history" add constraint "report_history_updated_user_id_fkey" FOREIGN KEY (updated_user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."report_history" validate constraint "report_history_updated_user_id_fkey";

alter table "public"."symptom_report" add constraint "symptom_report_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.report(report_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."symptom_report" validate constraint "symptom_report_report_id_fkey";

alter table "public"."symptom_report" add constraint "symptom_report_symptom_id_fkey" FOREIGN KEY (symptom_id) REFERENCES public.symptom(symptom_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."symptom_report" validate constraint "symptom_report_symptom_id_fkey";

alter table "public"."user" add constraint "user_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.user_role(role_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."user" validate constraint "user_role_id_fkey";


  create policy "admin full access disease"
  on "public"."disease"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public."user" u
  WHERE ((u.user_id = (current_setting('app.current_user'::text))::bigint) AND (u.role_id = 1)))));



  create policy "admin full access disease_symptom"
  on "public"."disease_symptom"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public."user" u
  WHERE (u.role_id = 1))));



  create policy "health_worker see disease_symptom"
  on "public"."disease_symptom"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.disease d
  WHERE ((d.disease_id = disease_symptom.disease_id) AND (d.user_id = (current_setting('app.current_user'::text))::bigint)))));



  create policy "admin full access governorate"
  on "public"."governorate"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public."user" u
  WHERE ((u.user_id = (current_setting('app.current_user'::text))::bigint) AND (u.role_id = 1)))));



  create policy "admin full access report"
  on "public"."report"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public."user" u
  WHERE ((u.user_id = (current_setting('app.current_user'::text))::bigint) AND (u.role_id = 1)))));



  create policy "health_worker see governorate reports"
  on "public"."report"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.governorate g
  WHERE ((g.user_id = (current_setting('app.current_user'::text))::bigint) AND (g.governorate_id = report.governorate_id)))));



  create policy "admin full access report_history"
  on "public"."report_history"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public."user" u
  WHERE ((u.user_id = (current_setting('app.current_user'::text))::bigint) AND (u.role_id = 1)))));



  create policy "health_worker select report_history"
  on "public"."report_history"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.report r
     JOIN public.disease d ON ((d.disease_id = r.disease_id)))
  WHERE ((r.report_id = report_history.report_id) AND (d.user_id = (current_setting('app.current_user'::text))::bigint)))));



  create policy "reporter select report_history"
  on "public"."report_history"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.report r
  WHERE ((r.report_id = report_history.report_id) AND (r.user_id = (current_setting('app.current_user'::text))::bigint)))));



  create policy "health_worker see symptom_report"
  on "public"."symptom_report"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.report r
     JOIN public.disease d ON ((d.disease_id = r.disease_id)))
  WHERE ((symptom_report.report_id = r.report_id) AND (d.user_id = (current_setting('app.current_user'::text))::bigint)))));



  create policy "reporter see own symptom_report"
  on "public"."symptom_report"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.report r
  WHERE ((r.report_id = symptom_report.report_id) AND (r.user_id = (current_setting('app.current_user'::text))::bigint)))));


CREATE TRIGGER trg_create_report_history AFTER INSERT ON public.report FOR EACH ROW EXECUTE FUNCTION public.create_report_history();

CREATE TRIGGER trg_find_governorate BEFORE INSERT OR UPDATE ON public.report FOR EACH ROW EXECUTE FUNCTION public.find_governorate();

CREATE TRIGGER trg_generate_tracking_number BEFORE INSERT ON public.report FOR EACH ROW EXECUTE FUNCTION public.generate_tracking_number();

CREATE TRIGGER trigger_check_disease AFTER INSERT OR UPDATE ON public.report_history FOR EACH ROW EXECUTE FUNCTION public.check_disease_threshold();

CREATE TRIGGER trg_classify_disease AFTER INSERT ON public.symptom_report FOR EACH ROW EXECUTE FUNCTION public.classify_report_disease();


  create policy "Delete Access"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Update Access"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Upload Access"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'avatars'::text));



