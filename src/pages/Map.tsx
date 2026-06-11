import React, { useState, useEffect, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import PageShell from "../components/PageShell";

import PageHeader from "../components/PageHeader";

import { useErrorHandler } from "../hooks/useErrorHandler";

import { fetchMapMetadata, fetchConfirmedReports } from "../lib/queries";

import { formatAppDate } from "../lib/localeUtils";
import { pickLocalizedName } from "../lib/localization";
import { setupLeafletIcons } from "../lib/leafletSetup";

import type { ConfirmedReport, DiseaseListItem, GovernorateRow } from "../types/models";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';



setupLeafletIcons();



type Disease = Pick<DiseaseListItem, 'disease_id' | 'disease_name' | 'ar_name'>;

type Governorate = Pick<GovernorateRow, 'governorate_id' | 'governorate_name' | 'ar_name'>;



/** Imperatively pans the Leaflet map when governorate filter changes (react-leaflet has no declarative center prop on MapContainer). */
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}



export default function Map() {

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { handleError } = useErrorHandler();

  const [diseases, setDiseases] = useState<Disease[]>([]);

  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  const [selectedDisease, setSelectedDisease] = useState<string>("all");

  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");

  const [reports, setReports] = useState<ConfirmedReport[]>([]);

  const [loading, setLoading] = useState(true);

  const [mapCenter, setMapCenter] = useState<[number, number]>([15.5527, 48.5164]);

  const [mapZoom, setMapZoom] = useState(6);



  const getLocalizedDisease = (name: string | null | undefined) => {
    if (!name) return t('Undetermined Case');
    const row = diseases.find((d) => d.disease_name.toLowerCase() === name.toLowerCase());
    return pickLocalizedName(name, row?.ar_name, i18n.language);
  };

  const getLocalizedGov = (name: string | null | undefined) => {
    if (!name) return '—';
    const row = governorates.find((g) => g.governorate_name.toLowerCase() === name.toLowerCase());
    return pickLocalizedName(name, row?.ar_name, i18n.language);
  };

  const mappableReports = useMemo(
    () => reports.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng)),
    [reports],
  );



  useEffect(() => {

    async function loadMetadata() {

      try {

        const { diseasesError, governoratesError, diseases: dData, governorates: gData } = await fetchMapMetadata();



        if (diseasesError) handleError(diseasesError, { context: 'Map Diseases' });

        if (governoratesError) handleError(governoratesError, { context: 'Map Governorates' });



        setDiseases(dData);

        setGovernorates(gData);

      } catch (err) {

        handleError(err, { context: 'Map Metadata Catch' });

      }

    }

    loadMetadata();

  }, [handleError]);



  useEffect(() => {

    async function loadReports() {

      try {

        setLoading(true);

        const { data, error } = await fetchConfirmedReports();

        if (error) {

          handleError(error, { context: 'Map Reports RPC' });

        } else {

          setReports(data);

        }

      } catch (err) {

        handleError(err, { context: 'Map Reports Catch' });

      } finally {

        setLoading(false);

      }

    }

    loadReports();

  }, [handleError]);



  // RPC returns English `disease_name` / `governorate_name`; filters compare against metadata rows by id → name.
  const filteredReports = mappableReports.filter(r => {
    const diseaseMatch = selectedDisease === "all" || diseases.find(d => d.disease_id.toString() === selectedDisease)?.disease_name === r.disease_name;
    const govMatch = selectedGovernorate === "all" || governorates.find(g => g.governorate_id.toString() === selectedGovernorate)?.governorate_name === r.governorate_name;
    return diseaseMatch && govMatch;
  });



  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const val = e.target.value;

    setSelectedGovernorate(val);

    

    if (val === "all") {
      // Default viewport: Yemen-wide
      setMapCenter([15.5527, 48.5164]);
      setMapZoom(6);
    } else {
      // Pan to first confirmed report in governorate — not a true centroid, keeps logic simple
      const govReports = mappableReports.filter(r => governorates.find(g => g.governorate_id.toString() === val)?.governorate_name === r.governorate_name);
      if (govReports.length > 0) {
        setMapCenter([govReports[0].lat, govReports[0].lng]);
        setMapZoom(10);
      }
    }

  };



  return (

    <PageShell withBottomNav className="font-almarai">

      <PageHeader title={t('Live Map')} />



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
                      {formatAppDate(report.report_date, i18n.language, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
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



    </PageShell>

  );

}

