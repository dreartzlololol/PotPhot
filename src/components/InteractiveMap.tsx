import React, { useRef, useEffect, useState } from 'react';
import type { Shop } from '../data/shops';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Compass, Layers, Sun, Moon, Globe, CloudSun } from 'lucide-react';

interface InteractiveMapProps {
  shops: Shop[];
  activeShopId: string | null;
  onSelectShop: (shop: Shop) => void;
  pendingOrders?: any[];
}

const PHOTHARAM_CENTER: [number, number] = [13.685, 99.845];

type MapStyleType = 'terracotta' | 'satellite' | 'moonlight';

const TILE_LAYERS: Record<MapStyleType, { url: string; attr: string }> = {
  terracotta: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '&copy; CartoDB Voyager',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri World Imagery',
  },
  moonlight: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CartoDB Dark Matter',
  },
};

const CULTURAL_LANDMARKS = [
  { title: 'วัดขนอน หนังใหญ่', emoji: '🎨', lat: 13.720, lng: 99.850 },
  { title: 'ตลาดเก่า 119 ปี โพธาราม', emoji: '🚣', lat: 13.690, lng: 99.855 },
  { title: 'คาเฟ่โรงปั้นโพธาราม', emoji: '☕', lat: 13.670, lng: 99.835 },
  { title: 'ศูนย์ปั้นกระถางมังกร', emoji: '🏺', lat: 13.705, lng: 99.825 },
];

// Custom Leaflet DivIcon generator for Dragon Pots with Benjarong Gold Aura
const createPotIcon = (isActive: boolean, shopName: string, coverImage: string) => {
  return L.divIcon({
    className: `map-pin-leaflet-wrapper ${isActive ? 'active' : ''}`,
    html: `
      <div class="pin-icon-pot" style="${isActive ? 'transform: scale(1.25); filter: drop-shadow(0 0 16px #F59E0B);' : ''}">
        <div class="pin-pot-rim"></div>
        <div class="pin-pot-body" style="overflow: hidden; border: 2px solid #F59E0B;">
          <img src="${coverImage}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div class="pin-glow-effect"></div>
      </div>
      <div class="leaflet-pin-tooltip" style="display: ${isActive ? 'block' : 'none'}; font-weight: 800; background: rgba(21,67,38,0.95); border: 1.5px solid #F59E0B; color: #FFD700; border-radius: 12px; padding: 4px 10px; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
        🏺 ${shopName.split(' (')[0]}
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
        <div class="pin-order-glow" style="width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle, #FFA500 0%, #FF4757 100%); border: 2.5px solid white; box-shadow: 0 4px 14px rgba(255,71,87,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">🏺</div>
      </div>
      <div class="leaflet-pin-tooltip order-tooltip" style="display: block; background: rgba(255,71,87,0.95); border-color: #FF4757; color: white; font-weight: 800; white-space: nowrap; font-size: 11px; padding: 3px 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(255,71,87,0.4);">
        สั่งปั้น: ${potName.substring(0, 10)} • ฿${price}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
};

// Custom Leaflet DivIcon generator for Aesthetic Photharam Cultural Landmarks
const createLandmarkIcon = (title: string, iconEmoji: string) => {
  return L.divIcon({
    className: 'map-landmark-leaflet-wrapper',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: mapPulseRing 2.2s infinite ease-out;"></div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #154326, #2D7A47); border: 2px solid #FFD700; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 15px; z-index: 2;">
          ${iconEmoji}
        </div>
        <div style="background: rgba(21, 67, 38, 0.95); border: 1.5px solid #FFD700; color: #FFD700; font-weight: 800; font-size: 10.5px; padding: 2px 8px; border-radius: 10px; margin-top: 4px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
          ${title}
        </div>
      </div>
    `,
    iconSize: [36, 50],
    iconAnchor: [18, 25],
  });
};

// Custom Animated Rider Scooter Icon
const createRiderIcon = () => {
  return L.divIcon({
    className: 'map-rider-leaflet-wrapper',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
        <div style="background: linear-gradient(135deg, #D97706, #F59E0B); border: 2px solid #FFFFFF; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 6px 16px rgba(217,119,6,0.5); animation: float 2.5s infinite ease-in-out;">
          🛵
        </div>
        <div style="background: rgba(217, 119, 6, 0.95); border: 1px solid #FFFFFF; color: #FFFFFF; font-weight: 800; font-size: 9.5px; padding: 2px 7px; border-radius: 8px; margin-top: 2px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          🛵💨 ไรเดอร์ส่งกระถาง
        </div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 24],
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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const orderMarkersRef = useRef<L.Marker[]>([]);

  const [mapStyle, setMapStyle] = useState<MapStyleType>('terracotta');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapContainerRef.current && !leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: PHOTHARAM_CENTER,
        zoom: 13,
        zoomControl: false,
        minZoom: 11,
        maxZoom: 18,
      });

      leafletMapRef.current = map;

      // Add initial Tile Layer
      const initialConfig = TILE_LAYERS['terracotta'];
      tileLayerRef.current = L.tileLayer(initialConfig.url, {
        attribution: initialConfig.attr,
      }).addTo(map);

      // Render Pure Aesthetic Photharam Cultural Landmarks
      CULTURAL_LANDMARKS.forEach((lm) => {
        L.marker([lm.lat, lm.lng], {
          icon: createLandmarkIcon(lm.title, lm.emoji),
          interactive: false,
        }).addTo(map);
      });

      // Render Pure Aesthetic Moving Rider Marker
      const riderMarker = L.marker([13.680, 99.840], {
        icon: createRiderIcon(),
        interactive: false,
      }).addTo(map);

      // Animate rider along Photharam road
      let step = 0;
      const riderInterval = setInterval(() => {
        step += 0.05;
        const latOffset = Math.sin(step) * 0.008;
        const lngOffset = Math.cos(step) * 0.008;
        riderMarker.setLatLng([13.685 + latOffset, 99.845 + lngOffset]);
      }, 500);

      (map as any)._riderInterval = riderInterval;
    }

    return () => {
      if (leafletMapRef.current) {
        if ((leafletMapRef.current as any)._riderInterval) {
          clearInterval((leafletMapRef.current as any)._riderInterval);
        }
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Handle Tile Layer Switch
  const handleSwitchMapStyle = (newStyle: MapStyleType) => {
    setMapStyle(newStyle);
    setShowLayerMenu(false);
    const map = leafletMapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = TILE_LAYERS[newStyle];
    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attr,
    }).addTo(map);
  };

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
          <div style="font-family: 'Mitr', sans-serif; padding: 6px; width: 190px;">
            <h4 style="margin: 0 0 6px 0; color: #FF4757; font-size: 13px; display: flex; align-items: center; gap: 4px;">
              <span>📢 ประกาศสั่งปั้นบอร์ดกลาง</span>
            </h4>
            <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; color: #1E293B;">${ord.potName}</div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
              ผู้สั่ง: ${ord.customerName}<br/>
              ราคาใบสั่งทำ: <strong style="color: #2D7A47; font-size: 13px;">฿${ord.price}</strong>
            </div>
            <div style="font-size: 10px; color: #FF4757; font-style: italic; font-weight: 600;">
              * หน้าร้านค้ากดยอมรับปั้นได้จากแดชบอร์ดร้านค้า
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
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* 👑 Pure Aesthetic Ornate Thai Corner Flourishes */}
      <div className="map-corner-flourish map-corner-flourish-tl" />
      <div className="map-corner-flourish map-corner-flourish-tr" />
      <div className="map-corner-flourish map-corner-flourish-bl" />
      <div className="map-corner-flourish map-corner-flourish-br" />

      {/* Leaflet container hook */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />

      {/* 🌤️ Aesthetic Weather & Heritage Status Badge (Top-Left Overlay) */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '10px 16px',
          background: 'rgba(250, 246, 240, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid var(--gold-light)',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(21, 67, 38, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        <CloudSun size={20} style={{ color: 'var(--gold)' }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>โพธาราม • 29°C ลมพัดอบอุ่น</span>
            <span style={{ fontSize: '10px', color: 'var(--gold)', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '10px' }}>
              อู่ปั้นดิน 🏺
            </span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
            เขตชุมชนหัตถกรรมเครื่องดินเผามังกรสยาม
          </div>
        </div>
      </div>

      {/* Floating Interactive Map Controls & Style Switcher (Top-Right Overlay) */}
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
          borderRadius: '18px',
          zIndex: 1000,
          pointerEvents: 'auto',
          border: '1.5px solid var(--gold-light)',
          boxShadow: '0 8px 25px rgba(21, 67, 38, 0.15)',
        }}
      >
        {/* Layer Switcher Toggle Button */}
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: showLayerMenu ? 'var(--primary)' : 'var(--white)',
            color: showLayerMenu ? '#FFD700' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.25s ease',
          }}
          title="สลับโหมดสไตล์แผนที่"
        >
          <Layers size={20} />
        </button>

        {/* Zoom In */}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.25s ease',
          }}
          title="ขยายแผนที่ (Zoom In)"
        >
          <ZoomIn size={20} />
        </button>

        {/* Zoom Out */}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.25s ease',
          }}
          title="ย่อแผนที่ (Zoom Out)"
        >
          <ZoomOut size={20} />
        </button>

        {/* Reset View Compass with Rotating Benjarong Dragon Ring */}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.25s ease',
          }}
          title="รีเซ็ตมุมกล้องนำทาง (Reset View)"
        >
          <Compass size={20} className="thai-dragon-compass-inner" />
        </button>
      </div>

      {/* 🗺️ Interactive Map Layer Switcher Floating Menu */}
      {showLayerMenu && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '20px',
            right: '76px',
            zIndex: 1000,
            padding: '12px',
            borderRadius: '18px',
            background: 'rgba(250, 246, 240, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid var(--gold-light)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '180px',
            animation: 'scaleUpTour 0.2s ease-out',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
            🗺️ สไตล์แผนที่ (Map Styles):
          </div>

          {/* Terracotta Craft Map */}
          <button
            type="button"
            onClick={() => handleSwitchMapStyle('terracotta')}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: mapStyle === 'terracotta' ? '2px solid var(--primary-light)' : '1px solid rgba(0,0,0,0.1)',
              background: mapStyle === 'terracotta' ? 'rgba(45,122,71,0.12)' : 'white',
              color: mapStyle === 'terracotta' ? 'var(--primary)' : 'var(--text-dark)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sun size={16} style={{ color: 'var(--gold)' }} />
            <span>🌱 สยามดินเผา</span>
          </button>

          {/* Satellite Map */}
          <button
            type="button"
            onClick={() => handleSwitchMapStyle('satellite')}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: mapStyle === 'satellite' ? '2px solid var(--primary-light)' : '1px solid rgba(0,0,0,0.1)',
              background: mapStyle === 'satellite' ? 'rgba(45,122,71,0.12)' : 'white',
              color: mapStyle === 'satellite' ? 'var(--primary)' : 'var(--text-dark)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Globe size={16} style={{ color: '#0288D1' }} />
            <span>🛰️ ดาวเทียม HD</span>
          </button>

          {/* Moonlight Dark Map */}
          <button
            type="button"
            onClick={() => handleSwitchMapStyle('moonlight')}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: mapStyle === 'moonlight' ? '2px solid var(--primary-light)' : '1px solid rgba(0,0,0,0.1)',
              background: mapStyle === 'moonlight' ? 'rgba(45,122,71,0.12)' : 'white',
              color: mapStyle === 'moonlight' ? 'var(--primary)' : 'var(--text-dark)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Moon size={16} style={{ color: '#7E57C2' }} />
            <span>🌙 แสงจันทร์</span>
          </button>
        </div>
      )}

    </div>
  );
};
