import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ConfirmedReport {
  report_id: number;
  disease_name: string;
  governorate_name: string;
  report_date: string;
  lat: number;
  lng: number;
}

interface Disease {
  disease_id: number;
  disease_name: string;
}

interface Governorate {
  governorate_id: number;
  governorate_name: string;
}

const DISEASE_AR_MAP: Record<string, string> = {
  "measles": "الحصبة",
  "polio": "شلل الأطفال",
  "cholera": "الكوليرا",
  "diphtheria": "الدفتيريا",
  "pertussis": "سعال ديكي",
  "hemorrhagic fevers": "الحميات النزفية",
  "dengue fever": "حمى الضنك"
};

const GOV_AR_MAP: Record<string, string> = {
  "al hodeidah": "الحديدة",
  "abyan": "أبين",
  "ta'iz": "تعز",
  "al jawf": "الجوف",
  "hadramawt": "حضرموت",
  "shabwah": "شبوة",
  "aden": "عدن",
  "lahj": "لحج",
  "ma'rib": "مأرب",
  "al maharah": "المهرة",
  "ad dali'": "الضالع",
  "socotra": "سقطرى",
  "sana'a": "صنعاء"
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Map() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [reports, setReports] = useState<ConfirmedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.5527, 48.5164]); // Center of Yemen
  const [mapZoom, setMapZoom] = useState(6);

  const getLocalizedDisease = (name: string) => {
    return i18n.language === 'ar' ? (DISEASE_AR_MAP[name.toLowerCase()] || name) : name;
  };

  const getLocalizedGov = (name: string) => {
    return i18n.language === 'ar' ? (GOV_AR_MAP[name.toLowerCase()] || name) : name;
  };

  useEffect(() => {
    async function fetchMetadata() {
      const { data: dData } = await supabase.from("disease").select("disease_id, disease_name");
      const { data: gData } = await supabase.from("governorate").select("governorate_id, governorate_name").neq('governorate_name', 'Unknown');
      
      if (dData) setDiseases(dData);
      if (gData) setGovernorates(gData);
    }
    fetchMetadata();
  }, []);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_confirmed_reports');
      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    }
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const diseaseMatch = selectedDisease === "all" || diseases.find(d => d.disease_id.toString() === selectedDisease)?.disease_name === r.disease_name;
    const govMatch = selectedGovernorate === "all" || governorates.find(g => g.governorate_id.toString() === selectedGovernorate)?.governorate_name === r.governorate_name;
    return diseaseMatch && govMatch;
  });

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGovernorate(val);
    
    if (val === "all") {
      setMapCenter([15.5527, 48.5164]);
      setMapZoom(6);
    } else {
      // Find reports for this gov and center if any
      const govReports = reports.filter(r => governorates.find(g => g.governorate_id.toString() === val)?.governorate_name === r.governorate_name);
      if (govReports.length > 0) {
        setMapCenter([govReports[0].lat, govReports[0].lng]);
        setMapZoom(10);
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden font-almarai">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">
            {t('Rasid')}
          </span>
        </div>
        <h1 className="text-lg font-bold text-text-main dark:text-slate-100">
          {t('Live Map')}
        </h1>
      </header>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative">
        <div className="px-4 py-3 z-30 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="relative w-full">
              <label className="block text-xs font-bold text-text-muted mb-1 px-1">
                {t('Disease Type')}
              </label>
              <div className="relative">
                <select 
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark py-2.5 pr-3 pl-8 text-text-main dark:text-slate-100 focus:border-primary focus:ring-primary text-sm shadow-sm appearance-none outline-none"
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <option value="all">{t('All')}</option>
                  {diseases.map(d => (
                    <option key={d.disease_id} value={d.disease_id}>
                      {getLocalizedDisease(d.disease_name)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-text-muted">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>
            <div className="relative w-full">
              <label className="block text-xs font-bold text-text-muted mb-1 px-1">
                {t('Governorate')}
              </label>
              <div className="relative">
                <select 
                  value={selectedGovernorate}
                  onChange={handleGovChange}
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark py-2.5 pr-3 pl-8 text-text-main dark:text-slate-100 focus:border-primary focus:ring-primary text-sm shadow-sm appearance-none outline-none"
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <option value="all">{t('All')}</option>
                  {governorates.map(g => (
                    <option key={g.governorate_id} value={g.governorate_id}>
                      {getLocalizedGov(g.governorate_name)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-text-muted">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative w-full h-full bg-gray-100 dark:bg-black/20 overflow-hidden pb-16 z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map(report => (
              <Marker key={report.report_id} position={[report.lat, report.lng]}>
                <Popup>
                  <div className={`text-${i18n.language === 'ar' ? 'right' : 'left'} font-almarai`}>
                    <div className="font-bold text-primary">{getLocalizedDisease(report.disease_name)}</div>
                    <div className="text-xs text-gray-600">{getLocalizedGov(report.governorate_name)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(report.report_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute top-4 left-4 z-[500] bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl border border-primary/20">
            <div className="text-[10px] text-text-muted font-bold">{t('Confirmed Reports')}</div>
            <div className="text-xl font-black text-primary leading-tight">
              {loading ? '...' : filteredReports.length}
            </div>
          </div>
        </main>

        <div className="fixed bottom-20 left-0 right-0 z-[60] max-w-md mx-auto pointer-events-none px-4">
          <div className="flex justify-end w-full pointer-events-auto">
            <button
              onClick={() => navigate("/new-report")}
              className={`flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 group flex-row${i18n.language === 'ar' ? '' : '-reverse'}`}
            >
              <span className="material-symbols-outlined text-[24px]">add_alert</span>
              <span className="font-bold text-base w-max">{t('Submit Report')}</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
