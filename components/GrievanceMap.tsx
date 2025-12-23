
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Report, ReportStatus, ReportCategory } from '../types.ts';

const WARD_GEO_COORDS: Record<string, [number, number]> = {
  "Darbe": [12.7561, 75.2014],
  "Bolwar": [12.7654, 75.2052],
  "Nehru Nagar": [12.7682, 75.1951],
  "Kombettu": [12.7612, 75.1903],
  "Kabaka": [12.7831, 75.1821],
  "Bannur": [12.7521, 75.2152],
  "Court Road": [12.7628, 75.1982],
  "Parlane": [12.7672, 75.2012],
  "Vivekananda College Area": [12.7751, 75.2103],
  "Muraliya": [12.7481, 75.1852],
  "Sampya": [12.7351, 75.2252],
  "Kemminje": [12.7581, 75.1752],
  "Padil": [12.7721, 75.2252],
  "Kodimbadi": [12.8051, 75.1652],
  "Other Area": [12.7663, 75.1923]
};

const PUTTUR_WARDS = Object.keys(WARD_GEO_COORDS);

const getCategoryIconSvg = (category: ReportCategory) => {
  switch (category) {
    case ReportCategory.WASTE:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
    case ReportCategory.WATER:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;
    case ReportCategory.ROADS:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="8" rx="2"/><path d="m9 10 3-8 3 8"/><path d="M8 22h8"/></svg>`;
    case ReportCategory.SOCIAL:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`;
  }
};

interface GrievanceMapProps {
  reports: Report[];
  selectedWard?: string | 'ALL';
  selectedStatus?: ReportStatus | 'ALL';
  selectedCategory?: ReportCategory | 'ALL';
  focusedReport?: Report | null;
  onMarkerClick?: (report: Report) => void;
  height?: string;
  className?: string;
}

const GrievanceMap: React.FC<GrievanceMapProps> = ({ 
  reports, 
  selectedWard = 'ALL', 
  selectedStatus = 'ALL', 
  selectedCategory = 'ALL',
  focusedReport = null,
  onMarkerClick,
  height = "600px",
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      }).setView([12.7663, 75.1923], 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      markersRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    if (markersRef.current && mapInstanceRef.current) {
      markersRef.current.clearLayers();
      
      const filtered = reports.filter(r => {
        const wardMatch = selectedWard === 'ALL' || r.location.includes(selectedWard);
        const statusMatch = selectedStatus === 'ALL' || r.status === selectedStatus;
        const categoryMatch = selectedCategory === 'ALL' || r.category === selectedCategory;
        return wardMatch && statusMatch && categoryMatch;
      });
      
      filtered.forEach((report) => {
        const wardName = PUTTUR_WARDS.find(w => report.location.includes(w)) || "Other Area";
        const coords = WARD_GEO_COORDS[wardName];
        
        const jitteredCoords: [number, number] = [
          coords[0] + (Math.random() - 0.5) * 0.003,
          coords[1] + (Math.random() - 0.5) * 0.003
        ];

        const markerColor = report.status === ReportStatus.RESOLVED ? '#10b981' : 
                           report.status === ReportStatus.IN_PROGRESS ? '#3b82f6' : '#f59e0b';

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex items-center justify-center">
              <div style="background-color: ${markerColor};" class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse-soft">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div style="background-color: ${markerColor};" class="absolute -bottom-1 w-2 h-2 rotate-45 border-r border-b border-white"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });

        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location)}`;
        const categoryIcon = getCategoryIconSvg(report.category);

        const popupContent = document.createElement('div');
        popupContent.className = 'p-5 min-w-[240px] text-slate-200 bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl';
        popupContent.innerHTML = `
          <div class="flex items-center gap-2 mb-3">
            <div class="p-1.5 bg-brand-500/10 text-brand-500 rounded-lg shadow-inner">
              ${categoryIcon}
            </div>
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">${report.category}</span>
          </div>
          <div class="mb-4">
            <h4 class="font-black text-base uppercase tracking-tight text-white leading-tight mb-2">${report.title}</h4>
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${markerColor}"></div>
              <span class="text-[8px] font-black uppercase tracking-widest text-slate-400">${report.status}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 text-slate-400 text-[10px] font-bold mb-5 p-3 bg-white/5 rounded-2xl border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="truncate">${report.location}</span>
          </div>
          <a href="${googleMapsLink}" target="_blank" class="flex items-center justify-center gap-3 w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-brand-500/20 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            Locate Site
          </a>
        `;

        const marker = L.marker(jitteredCoords, { icon: customIcon })
          .bindPopup(popupContent);
        
        marker.on('click', () => {
          if (onMarkerClick) onMarkerClick(report);
        });

        markersRef.current?.addLayer(marker);
      });
    }

    if (mapInstanceRef.current && focusedReport) {
      const wardName = PUTTUR_WARDS.find(w => focusedReport.location.includes(w)) || "Other Area";
      const coords = WARD_GEO_COORDS[wardName];
      mapInstanceRef.current.flyTo(coords, 16, {
        animate: true,
        duration: 1.5
      });
    } else if (mapInstanceRef.current && selectedWard !== 'ALL' && WARD_GEO_COORDS[selectedWard]) {
      mapInstanceRef.current.flyTo(WARD_GEO_COORDS[selectedWard], 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [reports, selectedWard, selectedStatus, selectedCategory, focusedReport]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 dark:border-black/5 rounded-[inherit] z-10"></div>
    </div>
  );
};

export default GrievanceMap;
