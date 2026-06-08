import React, { useRef, useEffect } from 'react';
import type { Shop } from '../data/shops';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface InteractiveMapProps {
  shops: Shop[];
  activeShopId: string | null;
  onSelectShop: (shop: Shop) => void;
}

const PHOTHARAM_CENTER: [number, number] = [13.685, 99.845];

// Custom Leaflet DivIcon generator for Dragon Pots
const createPotIcon = (isActive: boolean, shopName: string, coverImage: string) => {
  return L.divIcon({
    className: `map-pin-leaflet-wrapper ${isActive ? 'active' : ''}`,
    html: `
      <div class="pin-icon-pot">
        <div class="pin-pot-rim"></div>
        <div class="pin-pot-body" style="overflow: hidden;">
          <img src="${coverImage}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div class="pin-glow-effect"></div>
      </div>
      <div class="leaflet-pin-tooltip" style="display: ${isActive ? 'block' : 'none'}">
        ${shopName.split(' (')[0]}
      </div>
    `,
    iconSize: [44, 48],
    iconAnchor: [22, 48],
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shops,
  activeShopId,
  onSelectShop,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});


  // Initialize Leaflet Map
  useEffect(() => {
    if (mapContainerRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapContainerRef.current, {
        center: PHOTHARAM_CENTER,
        zoom: 13,
        zoomControl: false,
        minZoom: 11,
        maxZoom: 18,
      });

      // Cozy colored CartoDB Voyager tiles (warm roads, leafy green parks)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
      }).addTo(leafletMapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Sync Markers and selection status
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Render new markers
    shops.forEach((shop) => {
      const isActive = shop.id === activeShopId;
      const marker = L.marker([shop.lat, shop.lng], {
        icon: createPotIcon(isActive, shop.name, shop.coverImage),
        zIndexOffset: isActive ? 1000 : 0,
      }).addTo(map);

      marker.on('click', () => {
        onSelectShop(shop);
      });

      markersRef.current[shop.id] = marker;
    });
  }, [shops, activeShopId, onSelectShop]);

  // Center active pin when it changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !activeShopId) return;

    const activeShop = shops.find((s) => s.id === activeShopId);
    if (activeShop) {
      map.setView([activeShop.lat, activeShop.lng], 14, {
        animate: true,
        duration: 0.6,
      });
    }
  }, [activeShopId, shops]);

  // Gamepad pan/zoom event listener
  useEffect(() => {
    const handleGamepadPan = (e: Event) => {
      const map = leafletMapRef.current;
      if (!map) return;
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      // Pan map by detailed stick movement
      map.panBy([customEvent.detail.x * 20, customEvent.detail.y * 20], { animate: false });
    };

    const handleGamepadZoom = (e: Event) => {
      const map = leafletMapRef.current;
      if (!map) return;
      const customEvent = e as CustomEvent<{ direction: 'in' | 'out' }>;
      if (customEvent.detail.direction === 'in') {
        map.zoomIn();
      } else {
        map.zoomOut();
      }
    };

    window.addEventListener('gamepad-pan', handleGamepadPan);
    window.addEventListener('gamepad-zoom', handleGamepadZoom);

    return () => {
      window.removeEventListener('gamepad-pan', handleGamepadPan);
      window.removeEventListener('gamepad-zoom', handleGamepadZoom);
    };
  }, []);

  // Button Controls handlers
  const handleZoom = (zoomType: 'in' | 'out') => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (zoomType === 'in') {
      map.zoomIn();
    } else {
      map.zoomOut();
    }
  };

  const handleResetPan = () => {
    const map = leafletMapRef.current;
    if (!map) return;
    map.setView(PHOTHARAM_CENTER, 13, {
      animate: true,
      duration: 0.8,
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Leaflet container hook */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Interactive Map Controls */}
      <div
        className="map-controls glass-panel"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '8px',
          borderRadius: '16px',
          zIndex: 1000, // Make sure controls sit above Leaflet layers
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => handleZoom('in')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--white)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => handleZoom('out')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--white)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleResetPan}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--white)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          title="Reset View"
        >
          <Compass size={20} />
        </button>
      </div>


    </div>
  );
};
