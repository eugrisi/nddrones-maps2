import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Reseller } from '@/data/mockData';
import { useEffect } from 'react';

interface DroneMapProps {
  resellers: Reseller[];
  center: [number, number];
  zoom: number;
  darkMode?: boolean;
  mapType?: 'traditional' | 'satellite';
  showCoverageCircles?: boolean;
}

const createDroneIcon = (isHeadquarters: boolean) => {
  const color = isHeadquarters ? '#1B2A1A' : '#F2994A';
  const shadowColor = isHeadquarters ? 'rgba(27, 42, 26, 0.3)' : 'rgba(242, 153, 74, 0.3)';
  
  return L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="
        width: 40px; 
        height: 40px; 
        background: ${color}; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        border: 3px solid white; 
        box-shadow: 0 4px 12px ${shadowColor}, 0 2px 6px rgba(0,0,0,0.15);
        position: relative;
        transform: rotate(0deg);
        animation: droneHover 3s ease-in-out infinite;
      ">
        <svg width="24" height="24" viewBox="0 0 100 100" fill="currentColor">
          <ellipse cx="50" cy="50" rx="12" ry="8" fill="currentColor" opacity="0.9"/>
          <line x1="38" y1="42" x2="20" y2="24" stroke="currentColor" strokeWidth="3" opacity="0.8"/>
          <line x1="62" y1="42" x2="80" y2="24" stroke="currentColor" strokeWidth="3" opacity="0.8"/>
          <line x1="38" y1="58" x2="20" y2="76" stroke="currentColor" strokeWidth="3" opacity="0.8"/>
          <line x1="62" y1="58" x2="80" y2="76" stroke="currentColor" strokeWidth="3" opacity="0.8"/>
          <g opacity="0.7">
            <circle cx="20" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="20" cy="24" r="3" fill="currentColor"/>
            <circle cx="80" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="80" cy="24" r="3" fill="currentColor"/>
            <circle cx="20" cy="76" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="20" cy="76" r="3" fill="currentColor"/>
            <circle cx="80" cy="76" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="80" cy="76" r="3" fill="currentColor"/>
          </g>
          <circle cx="50" cy="58" r="4" fill="currentColor" opacity="0.6"/>
          <circle cx="50" cy="42" r="2" fill="#00ff00" opacity="0.8"/>
        </svg>
      </div>
      
      <style>
        @keyframes droneHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(2deg); }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const DroneMap = ({ resellers, center, zoom, darkMode = false, mapType = 'traditional', showCoverageCircles = false }: DroneMapProps) => {

  const getTileLayer = () => {
    if (mapType === 'satellite') {
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '© Esri © DigitalGlobe © GeoEye'
      };
    }
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '© OpenStreetMap contributors'
    };
  };

  const tileLayer = getTileLayer();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-drone-icon { 
        background: none !important; 
        border: none !important; 
      }
      .leaflet-popup-content-wrapper {
        padding: 0;
        border: none;
      }
      .leaflet-popup-content {
        margin: 0;
        padding: 0;
      }
      .leaflet-popup-close-button {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => { 
      if (document.head.contains(style)) {
        document.head.removeChild(style); 
      }
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        key={`${center[0]}-${center[1]}-${zoom}`}
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }} 
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url={tileLayer.url}
          attribution={tileLayer.attribution}
          maxZoom={18}
          minZoom={3}
        />
        
        {/* Círculos de Cobertura */}
        {showCoverageCircles && resellers.map((reseller) => (
          reseller.coverageRadius && (
            <Circle
              key={`coverage-${reseller.id}`}
              center={reseller.position}
              radius={reseller.coverageRadius * 1000}
              pathOptions={{
                color: reseller.type === 'Sede Principal' ? '#1B2A1A' : '#F2994A',
                fillColor: reseller.type === 'Sede Principal' ? '#1B2A1A' : '#F2994A',
                fillOpacity: 0.1,
                weight: 2,
                opacity: 0.6,
                dashArray: reseller.type === 'Sede Principal' ? undefined : '5, 5'
              }}
            />
          )
        ))}

        {/* Marcadores das Unidades */}
        {resellers.map((reseller) => (
          <Marker
            key={reseller.id}
            position={reseller.position}
            icon={createDroneIcon(reseller.type === 'Sede Principal')}
          >
            <Popup closeButton={false} autoPan={true} className="custom-popup">
              <div className="w-[280px] sm:w-[380px] bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-3 sm:p-4 text-xs sm:text-sm text-gray-800 font-sans">
                {/* Título */}
                <h3 className="m-0 mb-1 text-sm sm:text-base font-semibold">
                  {reseller.name}
                </h3>
                <span className="inline-block bg-orange-50 text-orange-600 text-xs px-1.5 py-0.5 rounded mb-2 sm:mb-3">
                  Unidade Regional
                </span>
                
                {/* Lista de informações */}
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {/* Endereço */}
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-6 8-12a8 8 0 10-16 0c0 6 8 12 8 12z"/>
                    </svg>
                    <span>{reseller.address}</span>
                  </div>
                  
                  {/* Telefone */}
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.518 4.553a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.553 1.518A1 1 0 0121 18.72V22a2 2 0 01-2 2h-1C9.163 24 0 14.837 0 3a2 2 0 012-2h1z"/>
                    </svg>
                    <span>{reseller.phone}</span>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px] text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m8 0H8m0 0L4 8m4 4l4 4"/>
                    </svg>
                    <span>{reseller.email}</span>
                  </div>
                  
                  {/* Raio */}
                  {reseller.coverageRadius && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4"/>
                      </svg>
                      <span>Raio: {reseller.serviceRadius} km</span>
                    </div>
                  )}
                  
                  {/* Cidades */}
                  {reseller.coveredCities && reseller.coveredCities.length > 0 && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                      </svg>
                      <span>{reseller.serviceCities?.join(', ') || 'Não informado'}</span>
                    </div>
                  )}
                </div>
                
                {/* Botões */}
                <div className="flex justify-between gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                  <button
                    onClick={() => window.open(`tel:${reseller.phone}`)}
                    className="flex-1 bg-[#2563eb] text-white border-none py-2 sm:py-2.5 px-2 sm:px-4 rounded-md cursor-pointer hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                  >
                    Ligar
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${reseller.phone?.replace(/\D/g, '')}`)}
                    className="flex-1 bg-[#22c55e] text-white border-none py-2 sm:py-2.5 px-2 sm:px-4 rounded-md cursor-pointer hover:bg-green-700 transition-colors text-xs sm:text-sm"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DroneMap;