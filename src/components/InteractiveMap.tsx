import React, { useRef, useEffect } from 'react';
import type { Shop } from '../data/shops';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface InteractiveMapProps {
  shops: Shop[];
  activeShopId: string | null;
  onSelectShop: (shop: Shop) => void;
  pendingOrders?: any[];
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

// Custom Leaflet DivIcon generator for open pending orders (alert bubbles)
const createOrderAlertIcon = (potName: string, price: number) => {
  return L.divIcon({
    className: 'map-order-alert-leaflet-wrapper',
    html: `
      <div class="pin-icon-order-alert" style="position: relative; animation: sparkle-glow 1.5s infinite alternate;">
        <div class="alert-exclamation" style="position: absolute; top: -10px; right: -10px; background: #FF4757; color: white; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">!</div>
        <div class="pin-order-glow" style="width: 32px; height: 32px; border-radius: 50%; background: radial-gradient(circle, #FFA500 0%, #FF4757 100%); border: 2.5px solid white; box-shadow: 0 4px 10px rgba(255,71,87,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🏺</div>
      </div>
      <div class="leaflet-pin-tooltip order-tooltip" style="display: block; background: rgba(255,71,87,0.95); border-color: #FF4757; color: white; font-weight: 700; white-space: nowrap; font-size: 11px; padding: 2px 6px; border-radius: 6px;">
        สั่งปั้น: ${potName.substring(0, 8)} • ฿${price}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shops,
  activeShopId,
  onSelectShop,
  pendingOrders = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const orderMarkersRef = useRef<L.Marker[]>([]);


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

    // Render new markers safely
    shops.forEach((shop) => {
      const rawLat = shop.lat ?? shop.shopLocation?.lat;
      const rawLng = shop.lng ?? shop.shopLocation?.lng;
      if (rawLat === undefined || rawLat === null || rawLng === undefined || rawLng === null) return;
      const lat = Number(rawLat);
      const lng = Number(rawLng);
      if (isNaN(lat) || isNaN(lng)) return;

      const isActive = shop.id === activeShopId;
      const marker = L.marker([lat, lng], {
        icon: createPotIcon(isActive, shop.name, shop.coverImage || shop.shopThumbnail || 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=300'),
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
      const rawLat = activeShop.lat ?? activeShop.shopLocation?.lat;
      const rawLng = activeShop.lng ?? activeShop.shopLocation?.lng;
      if (rawLat != null && rawLng != null) {
        const lat = Number(rawLat);
        const lng = Number(rawLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          map.setView([lat, lng], 14, {
            animate: true,
            duration: 0.6,
          });
        }
      }
    }
  }, [activeShopId, shops]);

  // Sync Order Alerts on the map
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old order markers
    orderMarkersRef.current.forEach((m) => m.remove());
    orderMarkersRef.current = [];

    // Render pending order alerts
    pendingOrders.forEach((ord) => {
      if (ord.lat != null && ord.lng != null) {
        const lat = Number(ord.lat);
        const lng = Number(ord.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng], {
          icon: createOrderAlertIcon(ord.potName, ord.price),
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; padding: 6px; width: 180px;">
            <h4 style="margin: 0 0 6px 0; color: #FF4757; font-size: 13px; display: flex; align-items: center; gap: 4px;">
              <span>📢 ประกาศสั่งปั้นบอร์ดกลาง</span>
            </h4>
            <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; color: #2C3E30;">${ord.potName}</div>
            <div style="font-size: 11px; color: #555; margin-bottom: 6px;">
              ผู้สั่ง: ${ord.customerName}<br/>
              ราคาใบสั่งทำ: <strong style="color: #4E9F3D; font-size: 13px;">฿${ord.price}</strong>
            </div>
            <div style="font-size: 10px; color: #FF4757; font-style: italic; font-weight: 600;">
              * หน้าร้านค้ากดยอมรับปั้นได้จากบอร์ดแดชบอร์ดร้านค้า
            </div>
          </div>
        `);

        orderMarkersRef.current.push(marker);
      }
    });
  }, [pendingOrders]);

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
