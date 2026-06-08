import { useState } from 'react';
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
import { Settings } from './pages/Settings';
import { SHOPS_DATA } from './data/shops';
import type { Shop, Review } from './data/shops';
import { GamepadManager } from './components/GamepadManager';
import { BackgroundMusic } from './components/BackgroundMusic';
import type { UserProfile } from './types/auth';

function App() {
  const [page, setPage] = useState<'onboarding' | 'home'>('onboarding');
  const [activeTab, setActiveTab] = useState<TabType>('store');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shops, setShops] = useState<Shop[]>(SHOPS_DATA);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [customPots, setCustomPots] = useState<CustomPot[]>([]);
  const [userPoints, setUserPoints] = useState<number>(15); // Starter points

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
          setUserPoints((pts) => pts + 10);

          return updatedShop;
        }
        return shop;
      })
    );
  };

  // Add custom designed pot to user inventory
  const handleAddCustomPot = (newPot: CustomPot) => {
    setCustomPots((prev) => [newPot, ...prev]);
    setUserPoints((pts) => pts + 10);
  };

  const handleAwardPoints = (points: number) => {
    setUserPoints((pts) => pts + points);
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
      {/* Background music player */}
      <BackgroundMusic />

      {/* Background cinematic particles (Leaves & Sun dust) */}
      <LeafParticles />

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
              <Settings onClearAllData={handleClearAllData} />
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
        />
      )}


    </>
  );
}

export default App;
