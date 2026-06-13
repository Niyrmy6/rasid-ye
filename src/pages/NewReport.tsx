import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageShell, { MAIN_CLASS } from "../components/PageShell";
import PageHeader from "../components/PageHeader";
import { useErrorHandler } from "../hooks/useErrorHandler";
import {
  fetchDiseases,
  fetchSymptoms,
  submitReport,
  submitReportSymptoms,
  fetchExistingReports,
} from "../lib/queries";
import { pickLocalizedName } from "../lib/localization";
import { setupLeafletIcons } from "../lib/leafletSetup";
import { getStoredUser } from "../lib/session";
import { toast } from "sonner";
import type { DiseaseListItem, SymptomListItem } from "../types/models";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

setupLeafletIcons();

/** Captures map clicks and recenters when GPS sets `location` */
function MapEventsHandler({
  onSelect,
  location,
}: {
  onSelect: (lat: number, lng: number) => void;
  location: { lat: number; lng: number } | null;
}) {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.lat, location.lng],
        map.getZoom() < 13 ? 14 : map.getZoom(),
      );
    }
  }, [location, map]);

  return null;
}

export default function NewReport() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [patientName, setPatientName] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<number | "unknown">(
    "unknown",
  );
  const [diseases, setDiseases] = useState<DiseaseListItem[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomListItem[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [onsetDate, setOnsetDate] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Allow browsing the form but block submit until login — modal steers to auth routes
    if (!getStoredUser()) {
      setShowAuthModal(true);
    }

    const loadMetadata = async () => {
      try {
        const [
          { data: diseasesData, error: diseasesError },
          { data: symptomsData, error: symptomsError },
        ] = await Promise.all([fetchDiseases(), fetchSymptoms()]);

        if (diseasesError)
          handleError(diseasesError, { context: "Fetch Diseases" });
        else setDiseases(diseasesData);

        if (symptomsError)
          handleError(symptomsError, { context: "Fetch Symptoms" });
        else setSymptoms(symptomsData);
      } catch (err) {
        handleError(err, { context: "Fetch Metadata Catch" });
      }
    };
    loadMetadata();
  }, [handleError]);

  const toggleSymptom = (symptomId: number, isChecked: boolean) => {
    setSelectedSymptoms((prev) => {
      if (isChecked) {
        return prev.includes(symptomId) ? prev : [...prev, symptomId];
      }
      return prev.filter((id) => id !== symptomId);
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => handleError(err, { context: "Geolocation" }),
      );
    } else {
      toast.error(t("Location feature is not supported in your browser"));
    }
  };

  const handleSubmit = async () => {
    // Validation 1: Patient name must be 4 parts
    const nameParts = patientName.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setError(
        "يجب أن يكون اسم المريض رباعي الأجزاء (الاسم الأول، الأب، الجد، العائلة)",
      );
      return;
    }

    if (!patientName || selectedSymptoms.length === 0) {
      setError("الرجاء إدخال اسم المريض واختيار عرض واحد على الأقل.");
      return;
    }

    // Validation 2: Check for duplicate reports
    const disease_id = selectedDisease === "unknown" ? null : selectedDisease;
    const { data: existingReports, error: existingError } =
      await fetchExistingReports(patientName, disease_id);

    if (existingError) {
      handleError(existingError, { context: "Check Existing Reports" });
      return;
    }

    if (existingReports && existingReports.length > 0) {
      setError("يوجد بلاغ مسبقاً لهذا المريض ونفس المرض");
      return;
    }

    const user = getStoredUser();
    if (!user) {
      setError("يجب تسجيل الدخول لتقديم البلاغ.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Two-step persist: report row first, then junction rows in `symptom_report`
      const { data: reportData, error: reportError } = await submitReport({
        patient_name: patientName,
        age: age ? Number(age) : null,
        gender,
        phone: phone || null,
        onset_date: onsetDate ? new Date(onsetDate).toISOString() : null,
        notes: notes || null,
        user_id: user.user_id,
        disease_id,
        // PostGIS WKT: longitude first, then latitude
        location: location ? `POINT(${location.lng} ${location.lat})` : null,
      });

      if (reportError) {
        handleError(reportError, { context: "Submit Report" });
        return;
      }

      if (reportData?.report_id) {
        const { error: sympError } = await submitReportSymptoms(
          reportData.report_id,
          selectedSymptoms,
        );

        if (sympError) {
          handleError(sympError, { context: "Submit Symptoms" });
          return;
        }
      }

      navigate("/report-success", {
        state: { reportId: reportData?.report_id },
      });
    } catch (err) {
      handleError(err, { context: "Submit Report Catch" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell withBottomNav>
      <PageHeader title={t("Create New Report")} showBack />

      <main className={MAIN_CLASS}>
        <div className="p-4 space-y-6">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-2 font-almarai">
              {t("Patient Name")}
            </label>
            <div className="relative">
              <input
                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right placeholder-gray-400 dark:placeholder-gray-700"
                placeholder={t("Enter patient's full name")}
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-700">
                person
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-text-muted font-almarai">
                {t("Set Location")}
              </label>
              <button
                onClick={handleGetLocation}
                className="text-xs text-primary font-bold hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  my_location
                </span>
                {t("Use Current Location")}
              </button>
            </div>
            {location ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 text-sm font-bold text-center border border-green-200 dark:border-green-800 mb-3">
                {t("Location set successfully")} ✓ <br />
                <span className="text-xs font-normal">
                  ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                </span>
              </div>
            ) : null}

            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner z-0 border border-gray-200 dark:border-gray-800">
              <MapContainer
                center={[12.8, 45.0333]}
                zoom={12}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                />
                <MapEventsHandler
                  onSelect={(lat, lng) => setLocation({ lat, lng })}
                  location={location}
                />
                {location && <Marker position={[location.lat, location.lng]} />}
              </MapContainer>
            </div>
          </div>

          {/* ... UI for Symptoms and Diseases ... */}
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <label className="block text-sm font-bold text-text-muted mb-1 font-almarai">
              {t("Select Disease")}
            </label>
            <div
              className={`grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto ${i18n.language === "ar" ? "pr-1" : "pl-1"} scrollbar-hide`}
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            >
              <label className="cursor-pointer block group">
                <input
                  className="hidden"
                  name="disease"
                  type="radio"
                  checked={selectedDisease === "unknown"}
                  onChange={(e) =>
                    e.target.checked && setSelectedDisease("unknown")
                  }
                />
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 transition-all group-hover:bg-gray-100 dark:group-hover:bg-white/10 group-has-[:checked]:!bg-primary group-has-[:checked]:!border-primary">
                  <h4 className="font-bold text-primary group-has-[:checked]:!text-white mb-1 font-almarai text-base">
                    {t("I don't know (Rely on symptoms)")}
                  </h4>
                  <p className="text-xs text-text-muted dark:text-gray-800 group-has-[:checked]:!text-white/90">
                    {t(
                      "The system will auto-classify based on selected symptoms.",
                    )}
                  </p>
                </div>
              </label>
              {diseases.map((disease) => (
                <label
                  key={disease.disease_id}
                  className="cursor-pointer block group"
                >
                  <input
                    className="hidden"
                    name="disease"
                    type="radio"
                    checked={selectedDisease === disease.disease_id}
                    onChange={(e) =>
                      e.target.checked && setSelectedDisease(disease.disease_id)
                    }
                  />
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 transition-all group-hover:bg-gray-100 dark:group-hover:bg-white/10 group-has-[:checked]:!bg-primary group-has-[:checked]:!border-primary">
                    <h4 className="font-bold text-primary group-has-[:checked]:!text-white mb-1 font-almarai text-base">
                      {pickLocalizedName(
                        disease.disease_name,
                        disease.ar_name,
                        i18n.language,
                      )}
                    </h4>
                    {disease.description && (
                      <p className="text-xs text-text-muted dark:text-gray-800 group-has-[:checked]:!text-white/90">
                        {disease.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-3 font-almarai">
              {t("Symptoms (Select all that apply)")}
            </label>
            <div
              className={`flex flex-wrap gap-2 max-h-[300px] overflow-y-auto scrollbar-hide ${i18n.language === "ar" ? "pr-1" : "pl-1"}`}
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            >
              {symptoms.map((symptom) => {
                const label = pickLocalizedName(
                  symptom.symptom_name,
                  symptom.ar_name,
                  i18n.language,
                );
                const checked = selectedSymptoms.includes(symptom.symptom_id);

                return (
                  <label
                    key={symptom.symptom_id}
                    className="cursor-pointer group"
                  >
                    <input
                      className="hidden"
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        toggleSymptom(symptom.symptom_id, e.target.checked)
                      }
                    />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-text-muted dark:text-gray-800 transition-all select-none group-has-[:checked]:!bg-primary group-has-[:checked]:!text-white group-has-[:checked]:!border-primary">
                      <span className="text-sm font-medium font-almarai">
                        {label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* New Patient Info Section */}
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-3 font-almarai">
              بيانات إضافية
            </label>

            {/* Age and Gender side by side */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2 font-almarai">
                  العمر
                </label>
                <div className="relative">
                  <input
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right placeholder-gray-400 dark:placeholder-gray-700 font-almarai"
                    placeholder="اختر العمر"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    min="0"
                    max="120"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-700">
                    cake
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2 font-almarai">
                  الجنس
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex-1 py-3 rounded-xl border text-sm font-bold font-almarai ${gender === "female" ? "bg-primary text-white border-primary" : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-700 text-text-muted dark:text-gray-800"} transition-all`}
                  >
                    أنثى
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex-1 py-3 rounded-xl border text-sm font-bold font-almarai ${gender === "male" ? "bg-primary text-white border-primary" : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-700 text-text-muted dark:text-gray-800"} transition-all`}
                  >
                    ذكر
                  </button>
                </div>
              </div>
            </div>

            {/* Age / Date of Birth */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-muted mb-2 font-almarai">
                تاريخ الإصابة
              </label>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right placeholder-gray-400 dark:placeholder-gray-700"
                  type="date"
                  value={onsetDate}
                  onChange={(e) => setOnsetDate(e.target.value)}
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-700">
                  calendar_today
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2 font-almarai">
                رقم هاتف آخر
              </label>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right placeholder-gray-400 dark:placeholder-gray-700"
                  placeholder="05XXXXXXXX"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-700">
                  phone
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {error && (
              <p className="text-red-500 text-sm font-bold text-center mb-4">
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-[#56BCA4] hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg mt-4 disabled:opacity-70 disabled:pointer-events-none flex-row${i18n.language === "ar" ? "" : "-reverse"}`}
            >
              <span className="material-symbols-outlined">send</span>
              {loading ? t("Submitting...") : t("Submit Report")}
            </button>
          </div>
        </div>
      </main>
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-surface-dark shadow-soft">
              <span className="material-symbols-outlined text-4xl text-red-400">
                lock
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground dark:text-white mb-3 tracking-tight">
              {t("Login Required")}
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 mb-8 leading-relaxed font-medium">
              {t(
                "Sorry, you must log in to your account first in order to contribute and submit a new health report.",
              )}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-[0.98]"
              >
                {t("Login Now")}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-muted dark:bg-white/5 text-muted-foreground dark:text-gray-300 font-bold py-4 rounded-2xl transition-all duration-300 active:scale-[0.98]"
              >
                {t("Back to Home")}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
