import React, { useState, useMemo } from 'react';
import type { Shop } from '../data/shops';
import type { FilterState } from './SearchFilter';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  Search, Heart, Navigation, Star, Map as MapIcon, 
  List as ListIcon, X, BookOpen 
} from 'lucide-react';
import { TiltCard } from '../components/TiltCard';

interface HomeProps {
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  favorites: string[];
  onToggleFavorite: (shopId: string) => void;
  activeShopId: string | null;
  setActiveShopId: (id: string | null) => void;
  filters: FilterState;
  pendingOrders?: any[];
  onOpenTutorial?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'ร้านทั้งหมด 🏺' },
  { id: 'nearby', label: 'ร้านใกล้คุณ 📍' },
  { id: 'popular', label: 'ร้านยอดนิยม 🔥' },
  { id: 'handmade', label: 'ร้าน handmade 🎨' },
  { id: 'now', label: 'ร้านเปิดตอนนี้ ⏰' },
  { id: 'garden', label: 'ร้านตกแต่งสวน 🏡' },
];

export const Home: React.FC<HomeProps> = ({
  shops,
  onSelectShop,
  favorites,
  onToggleFavorite,
  activeShopId,
  setActiveShopId,
  filters,
  pendingOrders = [],
  onOpenTutorial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Filter and Sort shops based on Search, Category, and Advanced Filters
  const filteredShops = useMemo(() => {
    let result = shops.filter((shop) => {
      // 1. Search query matching
      const matchesSearch = 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Category tab matching
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'nearby') {
          const distanceVal = parseFloat(shop.distance.replace(' กม.', ''));
          if (distanceVal > 2.0) return false;
        } else if (selectedCategory === 'now') {
          if (!shop.isOpen) return false;
        } else {
          if (shop.category !== selectedCategory) return false;
        }
      }

      // 3. Distance filter
      const distanceVal = parseFloat(shop.distance.replace(' กม.', ''));
      if (distanceVal > filters.distance) return false;

      // 4. Open Now filter
      if (filters.isOpenNow && !shop.isOpen) return false;

      // 5. Workshop check (shop 1 and shop 3 mock workshops)
      if (filters.hasWorkshop && shop.id !== '1' && shop.id !== '3') return false;

      // 6. Materials tags match
      if (filters.materials.length > 0) {
        let hasMatMatch = false;
        if (filters.materials.includes('terracotta') && 
           (shop.description.includes('ดินเผา') || shop.description.includes('ดินอิฐ') || shop.description.includes('หม้อดิน'))) {
          hasMatMatch = true;
        }
        if (filters.materials.includes('glazed') && 
           (shop.description.includes('เซรามิก') || shop.description.includes('เคลือบ') || shop.description.includes('ลายคราม'))) {
          hasMatMatch = true;
        }
        if (filters.materials.includes('dragon-drawn') && shop.description.includes('มังกร')) {
          hasMatMatch = true;
        }
        if (filters.materials.includes('bonsai-pot') && 
           (shop.description.includes('บอนไซ') || shop.description.includes('จิ๋ว') || shop.description.includes('แคคตัส'))) {
          hasMatMatch = true;
        }
        if (!hasMatMatch) return false;
      }

      // 7. Price Ranges match
      // budget: shop 3, shop 5
      // medium: shop 2
      // collector: shop 1, shop 4
      if (filters.priceRanges.length > 0) {
        let hasPriceMatch = false;
        if (filters.priceRanges.includes('budget') && (shop.id === '3' || shop.id === '5')) {
          hasPriceMatch = true;
        }
        if (filters.priceRanges.includes('medium') && shop.id === '2') {
          hasPriceMatch = true;
        }
        if (filters.priceRanges.includes('collector') && (shop.id === '1' || shop.id === '4')) {
          hasPriceMatch = true;
        }
        if (!hasPriceMatch) return false;
      }

      return true;
    });

    // 8. Sorting logic
    if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'distance') {
      result.sort((a, b) => {
        const distA = parseFloat(a.distance.replace(' กม.', ''));
        const distB = parseFloat(b.distance.replace(' กม.', ''));
        return distA - distB;
      });
    } else if (filters.sortBy === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [shops, searchQuery, selectedCategory, filters]);

  const handleCardClick = (shop: Shop) => {
    setActiveShopId(shop.id);
  };

  const handleCardDoubleClick = (shop: Shop) => {
    onSelectShop(shop);
  };

  const handleNavigateDirect = (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    alert(`กำลังเริ่มระบบนำทางสีเขียวขนาดใหญ่ไปที่ "${shop.name}"\nพิกัด GPS: ${shop.address}\n\nน้องมังกร: เดินทางกันเลยยย! 🚗✨`);
  };

  // Currently active shop object
  const activeShop = useMemo(() => {
    return shops.find((s) => s.id === activeShopId);
  }, [shops, activeShopId]);

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 76px)', overflow: 'hidden' }}>
      
      {/* Top Bar with Brand and Search */}
      <header className="top-bar">
        <div className="brand-wrapper" onClick={() => window.location.reload()}>
          <div className="brand-logo-small">
            <img src="/mascot.png" alt="Logo" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="brand-name" style={{ lineHeight: 1.15 }}>
              Pot<span>Phot</span>
            </h1>
            <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.5px' }}>
              🏺 โพธารามเครื่องดินเผา • Benjarong Craft
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="search-container">
            <div className="search-icon-wrapper">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาร้านกระถางลายมังกร, ต้นไม้, ของแต่งสวน..."
              className="search-input gamepad-focusable"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="gamepad-focusable"
              title="คู่มือการใช้งานเว็บไซต์"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '14px',
                background: 'var(--gold-glow)',
                border: '1px solid var(--gold-light)',
                color: 'var(--clay)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <BookOpen size={16} />
              <span className="hide-mobile">คู่มือ</span>
            </button>
          )}
        </div>
      </header>

      {/* Categories Horizontal Scroll Chips */}
      <nav className="categories-container">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip gamepad-focusable ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Modern View Switcher (Map vs List Tabs) */}
      <div className="view-tab-container">
        <button
          className={`view-tab-btn gamepad-focusable ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => setViewMode('map')}
        >
          <MapIcon size={16} />
          <span>แผนที่แฟนตาซี</span>
        </button>
        <button
          className={`view-tab-btn gamepad-focusable ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <ListIcon size={16} />
          <span>รายชื่อร้านค้า ({filteredShops.length})</span>
        </button>
      </div>

      {/* Main Viewport Content */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Map tab wrapped in absolute content, maintaining map state correctly */}
        <div className={`map-wrapper-tab-content map-panel ${viewMode !== 'map' ? 'hidden' : ''}`}>
          <InteractiveMap
            shops={filteredShops}
            activeShopId={activeShopId}
            onSelectShop={(shop) => {
              setActiveShopId(shop.id);
            }}
            pendingOrders={pendingOrders}
          />

          {/* Floating preview card on map view */}
          {activeShop && viewMode === 'map' && (
            <div className="map-active-card-overlay">
              <div 
                className="shop-card glass-panel gamepad-focusable"
                style={{
                  border: '2px solid var(--primary)',
                  boxShadow: 'var(--premium-shadow)',
                  position: 'relative'
                }}
                onClick={() => onSelectShop(activeShop)}
                title="คลิกเบา ๆ เพื่อดูข้อมูลร้านค้าโดยละเอียด"
              >
                {/* Dismiss Button */}
                <button
                  className="gamepad-focusable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveShopId(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 20
                  }}
                  title="ปิดหน้าพรีวิว"
                >
                  <X size={14} />
                </button>

                <div className="shop-card-image-box" style={{ height: '120px' }}>
                  <video
                    src={activeShop.videoUrl}
                    className="shop-card-img"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                  <span className="shop-card-tag">{activeShop.categoryTh}</span>
                  <span className="shop-card-distance">{activeShop.distance}</span>
                </div>

                <div className="shop-card-info" style={{ padding: '12px' }}>
                  <div className="shop-card-header">
                    <h3 className="shop-card-title" style={{ fontSize: '16px' }}>{activeShop.name.split(' (')[0]}</h3>
                    <div className="shop-card-rating">
                      <Star size={12} fill="currentColor" />
                      <span style={{ fontSize: '13px' }}>{activeShop.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="shop-card-desc" style={{ fontSize: '12px', margin: '4px 0 8px' }}>
                    {activeShop.description.substring(0, 60)}...
                  </p>

                  <div className="shop-card-footer">
                    <button className="navigate-btn-card gamepad-focusable" onClick={(e) => handleNavigateDirect(e, activeShop)}>
                      <Navigation size={12} fill="currentColor" />
                      <span>นำทาง</span>
                    </button>
                    <button
                      className={`favorite-btn-card gamepad-focusable ${favorites.includes(activeShop.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(activeShop.id);
                      }}
                      style={{ width: '34px', height: '34px' }}
                    >
                      <Heart size={14} fill={favorites.includes(activeShop.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shop List Grid Directory tab */}
        {viewMode === 'list' && (
          <div className="shop-grid-scroll-area">
            {filteredShops.length === 0 ? (
              <div 
                className="glass-panel"
                style={{ 
                  width: '100%', 
                  padding: '40px 24px', 
                  textAlign: 'center', 
                  color: 'var(--text-muted)',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                🔍 ไม่พบร้านกระถางที่ตรงกับการค้นหาในหน้านี้ ลองปรับตัวกรองหรือคำค้นดูนะ!
              </div>
            ) : (
              <div className="shop-grid-container">
                {filteredShops.map((shop) => {
                  const isFav = favorites.includes(shop.id);
                  const isActive = shop.id === activeShopId;
                  return (
                    <div
                      key={shop.id}
                      className="shop-card-wrapper"
                      onClick={() => handleCardClick(shop)}
                      onDoubleClick={() => handleCardDoubleClick(shop)}
                    >
                      <TiltCard 
                        className="shop-card gamepad-focusable"
                        style={{
                          border: isActive ? '3px solid var(--primary)' : '1.5px solid rgba(245,158,11,0.25)',
                          boxShadow: isActive ? 'var(--glow-green)' : 'var(--card-shadow)',
                        }}
                      >
                        <div className="shop-card-image-box">
                          <img src={shop.coverImage} alt={shop.name} className="shop-card-img" />
                          <span className="shop-card-tag">{shop.categoryTh}</span>
                          <span className="shop-card-distance">{shop.distance}</span>
                        </div>

                        <div className="shop-card-info">
                          <div className="shop-card-header">
                            <h3 className="shop-card-title">{shop.name.split(' (')[0]}</h3>
                            <div className="shop-card-rating">
                              <Star size={14} fill="currentColor" />
                              <span>{shop.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <p className="shop-card-desc">
                            {shop.description.substring(0, 85)}...
                          </p>

                          <div className="shop-card-footer">
                            <button className="navigate-btn-card gamepad-focusable" onClick={(e) => handleNavigateDirect(e, shop)}>
                              <Navigation size={14} fill="currentColor" />
                              <span>นำทางไปร้านนี้</span>
                            </button>
                            <button
                              className={`favorite-btn-card gamepad-focusable ${isFav ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(shop.id);
                              }}
                            >
                              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </TiltCard>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
