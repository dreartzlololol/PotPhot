import { useState, useEffect } from 'react';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { ShopDetail } from './pages/ShopDetail';
import { LeafParticles } from './components/LeafParticles';

import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { SearchFilter } from './pages/SearchFilter';
import type { FilterState } from './pages/SearchFilter';
import { PotCollection } from './pages/PotCollection';
import type { CustomPot } from './pages/PotCollection';
import { Account } from './pages/Account';
import type { AppSettingsConfig } from './pages/Settings';
import { Settings } from './pages/Settings';
import { SHOPS_DATA } from './data/shops';
import type { Shop, Review } from './data/shops';
import { GamepadManager } from './components/GamepadManager';
import { BackgroundMusic } from './components/BackgroundMusic';
import type { UserProfile } from './types/auth';
import { UserTutorialModal } from './components/UserTutorialModal';
import { InteractiveTourOverlay } from './components/InteractiveTourOverlay';
import { ClickSparkleEffect } from './components/ClickSparkleEffect';
import { FlyingDragonMascot } from './components/FlyingDragonMascot';

import { soundFX } from './utils/audioFX';

function App() {
  const [page, setPage] = useState<'onboarding' | 'home'>('onboarding');
  const [activeTab, setActiveTab] = useState<TabType>('store');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shops, setShops] = useState<Shop[]>(SHOPS_DATA);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [customPots, setCustomPots] = useState<CustomPot[]>([]);
  const [userPoints, setUserPoints] = useState<number>(15); // Starter points
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isInteractiveTourActive, setIsInteractiveTourActive] = useState<boolean>(false);
  const [isTetrisActive, setIsTetrisActive] = useState<boolean>(false);

  const [appSettings, setAppSettings] = useState<AppSettingsConfig>(() => {
    const saved = localStorage.getItem('photpot_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      performanceMode: false,
      modelQuality: 'high',
      showDragonMascot: true,
      showLeafParticles: true,
      showClickSparkles: true,
      musicEnabled: true,
      musicVolume: 80,
    };
  });

  // Global Tactile Audio Click Listener for all UI buttons & controls
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('button, .gamepad-focusable, .view-tab-btn, .category-chip, .bottom-nav-item, input[type="button"], input[type="submit"]')) {
        soundFX.playClick();
      }
    };
    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const handleUpdateSettings = (newSettings: Partial<AppSettingsConfig>) => {
    setAppSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('photpot_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Load shops from database
  useEffect(() => {
    const fetchDBShops = async () => {
      try {
        const res = await fetch('/api/shops');
        if (res.ok) {
          const data = await res.json();
          const dbShopsMapped: Shop[] = data.shops.map((s: any) => ({
            id: s.id,
            name: s.shopName,
            category: s.category || 'now',
            categoryTh: s.categoryTh || 'ร้านเปิดตอนนี้',
            description: s.shopDescription || 'ไม่มีคำอธิบายร้านค้า',
            rating: s.rating || 5.0,
            reviewCount: s.reviewCount || 0,
            distance: s.distance || '2.0 กม.',
            lat: s.lat,
            lng: s.lng,
            address: s.shopAddress || '',
            openStatus: s.openStatus || 'เปิดอยู่ • ปิด 21:00',
            isOpen: s.isOpen,
            phone: s.phone || '',
            coverImage: s.coverImage || s.shopThumbnail || 'https://images.unsplash.com/photo-1493325619176-79116e45187e?auto=format&fit=crop&w=300&q=80',
            videoUrl: s.videoUrl || '/videos/thai_pot_00001.mp4',
            gallery: s.gallery && s.gallery.length > 0 ? s.gallery : [
              'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60'
            ],
            reviews: []
          }));
          setShops(dbShopsMapped);
        }
      } catch (err) {
        console.error('Failed to load shops from DB:', err);
      }
    };

    fetchDBShops();
    // Poll every 10 seconds to keep shop listing and statuses up to date
    const interval = setInterval(fetchDBShops, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('photpot_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Sync user points state with currentUser on mount/change
  useEffect(() => {
    if (currentUser) {
      setUserPoints(currentUser.points !== undefined ? currentUser.points : 15);
    } else {
      setUserPoints(15);
    }
  }, [currentUser]);

  // Load claimed custom pots from database when user logs in or mounts
  useEffect(() => {
    const fetchClaimedPots = async () => {
      if (!currentUser) {
        setCustomPots([]);
        return;
      }
      try {
        const res = await fetch(`/api/orders?customerId=${currentUser.id}&status=claimed`);
        if (res.ok) {
          const data = await res.json();
          const mappedPots: CustomPot[] = data.orders.map((o: any) => ({
            id: o.id,
            name: o.potName,
            shape: o.potDetails?.shape || 'classic',
            shapeTh: o.potDetails?.shapeTh || 'ทรงดั้งเดิม 🏺',
            color: o.potDetails?.color || '#CD853F',
            colorName: o.potDetails?.colorName || 'ดินส้มอิฐ',
            pattern: o.potDetails?.pattern || 'ancient-wave',
            patternTh: o.potDetails?.patternTh || 'ไม่มีลาย',
            cost: o.price
          }));
          setCustomPots(mappedPots);
        }
      } catch (err) {
        console.error('Failed to fetch claimed pots:', err);
      }
    };
    fetchClaimedPots();
  }, [currentUser]);

  // Global pending custom orders (shown as alerts on map)
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch('/api/orders?status=pending');
        if (res.ok) {
          const data = await res.json();
          setPendingOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch pending orders:', err);
      }
    };
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncUserPoints = async (newPts: number) => {
    if (currentUser) {
      try {
        await fetch(`/api/users/${currentUser.id}/points`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: newPts })
        });
        const updatedUser = { ...currentUser, points: newPts };
        setCurrentUser(updatedUser);
        localStorage.setItem('photpot_user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Failed to sync points:', err);
      }
    }
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('photpot_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('photpot_user');
    setActiveTab('store'); // Redirect to home
  };

  // Advanced filters state
  const [filters, setFilters] = useState<FilterState>({
    distance: 10,
    materials: [],
    isOpenNow: false,
    hasWorkshop: false,
    priceRanges: [],
    sortBy: 'rating',
  });

  // Favorite toggle function
  const handleToggleFavorite = (shopId: string) => {
    setFavorites((prev) =>
      prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId]
    );
  };

  // Add review dynamically and update average rating for the shop
  const handleAddReview = (shopId: string, newReview: Review) => {
    setShops((prevShops) =>
      prevShops.map((shop) => {
        if (shop.id === shopId) {
          const updatedReviews = [newReview, ...shop.reviews];
          const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const newAvgRating = totalRating / updatedReviews.length;
          
          const updatedShop = {
            ...shop,
            reviews: updatedReviews,
            rating: newAvgRating,
            reviewCount: updatedReviews.length,
          };

          // Also update selected shop if it's currently open
          if (selectedShop && selectedShop.id === shopId) {
            setSelectedShop(updatedShop);
          }

          // Reward user points for contributing to community
          setUserPoints((pts) => {
            const nextPts = pts + 10;
            syncUserPoints(nextPts);
            return nextPts;
          });

          return updatedShop;
        }
        return shop;
      })
    );
  };

  // Add custom designed pot to user inventory
  const handleAddCustomPot = (newPot: CustomPot) => {
    setCustomPots((prev) => [newPot, ...prev]);
    setUserPoints((pts) => {
      const nextPts = pts + 10;
      syncUserPoints(nextPts);
      return nextPts;
    });
  };

  const handleAwardPoints = (points: number) => {
    setUserPoints((pts) => {
      const nextPts = pts + points;
      syncUserPoints(nextPts);
      return nextPts;
    });
  };



  const handleClearAllData = () => {
    setFavorites([]);
    setCustomPots([]);
    setUserPoints(0);
    setFilters({
      distance: 10,
      materials: [],
      isOpenNow: false,
      hasWorkshop: false,
      priceRanges: [],
      sortBy: 'rating',
    });
  };

  return (
    <>
      {/* Dynamic pattern background overlay */}
      <div className="fantasy-bg-overlay" />

      {/* Background music player - Only plays in Tetris game section */}
      <BackgroundMusic isPlaying={appSettings.musicEnabled && activeTab === 'pot' && isTetrisActive} />

      {/* Background cinematic particles (Leaves & Sun dust) */}
      {appSettings.showLeafParticles && <LeafParticles />}

      {/* Xbox 360 Gamepad Input Manager */}
      <GamepadManager
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        shops={shops}
        activeShopId={activeShopId}
        setActiveShopId={setActiveShopId}
        selectedShop={selectedShop}
        setSelectedShop={setSelectedShop}
      />

      {/* Main Pages Switcher */}
      {page === 'onboarding' ? (
        <Onboarding onComplete={() => setPage('home')} />
      ) : (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          
          {/* Active Tab Screen render */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'store' && (
              <Home
                shops={shops}
                onSelectShop={(shop) => setSelectedShop(shop)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                activeShopId={activeShopId}
                setActiveShopId={setActiveShopId}
                filters={filters}
                pendingOrders={pendingOrders}
                onOpenTutorial={() => setIsTutorialOpen(true)}
              />
            )}
            {activeTab === 'search' && (
              <SearchFilter
                filters={filters}
                onUpdateFilters={setFilters}
                onApply={() => setActiveTab('store')}
              />
            )}
            {activeTab === 'pot' && (
              <PotCollection
                customPots={customPots}
                onAddCustomPot={handleAddCustomPot}
                userPoints={userPoints}
                onAwardPoints={handleAwardPoints}
                shops={shops}
                currentUser={currentUser}
                onTetrisActiveChange={setIsTetrisActive}
              />
            )}
            {activeTab === 'account' && (
              <Account
                favorites={favorites}
                shops={shops}
                onSelectShop={(shop) => setSelectedShop(shop)}
                onToggleFavorite={handleToggleFavorite}
                userPoints={userPoints}
                currentUser={currentUser}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            )}
            {activeTab === 'settings' && (
              <Settings 
                onClearAllData={handleClearAllData} 
                onOpenTutorial={() => setIsTutorialOpen(true)}
                settings={appSettings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </div>

          {/* Sticky Bottom App Navigation Bar */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            favoritesCount={favorites.length}
            customPotsCount={customPots.length}
          />
        </div>
      )}

      {/* Shop Detail Slide Over Panel */}
      {selectedShop && (
        <ShopDetail
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.includes(selectedShop.id)}
          onAddReview={handleAddReview}
          currentUser={currentUser}
        />
      )}

      {/* Interactive User Tutorial Modal */}
      <UserTutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
        onStartInteractiveTour={() => setIsInteractiveTourActive(true)}
      />

      {/* Interactive Guided App Spotlight Tour */}
      <InteractiveTourOverlay
        isActive={isInteractiveTourActive}
        onFinish={() => setIsInteractiveTourActive(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Click Petal & Gold Sparkle Burst Effect */}
      {appSettings.showClickSparkles && <ClickSparkleEffect />}

      {/* Floating Interactive Dragon Mascot Gimmick */}
      {appSettings.showDragonMascot && <FlyingDragonMascot />}


    </>
  );
}

export default App;
