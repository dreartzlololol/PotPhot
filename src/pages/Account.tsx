import React, { useState } from 'react';
import type { Shop } from '../data/shops';
import type { UserProfile } from '../types/auth';
import { AuthForm } from '../components/AuthForm';
import { CustomerDashboard } from '../components/CustomerDashboard';
import { ShopDashboard } from '../components/ShopDashboard';
import { RiderDashboard } from '../components/RiderDashboard';
import { User, Store, Bike, Lock } from 'lucide-react';

interface AccountProps {
  favorites: string[];
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  onToggleFavorite: (shopId: string) => void;
  userPoints: number;
  currentUser?: UserProfile | null;
  onLogin?: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const Account: React.FC<AccountProps> = ({
  favorites,
  shops,
  onSelectShop,
  onToggleFavorite,
  userPoints,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'customer' | 'shop' | 'rider'>('customer');

  const isShopUnlocked = Boolean(currentUser?.shopAddress && currentUser.shopAddress.trim() !== '' && currentUser.shopLocation);
  const isRiderUnlocked = Boolean(currentUser?.driversLicense && currentUser.driversLicense.trim() !== '' && currentUser.driversLicense !== 'ยังไม่ได้ระบุใบขับขี่');

  return (
    <div 
      className="tab-page-container"
      style={{
        padding: '24px',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 140px)',
      }}
    >
      {!currentUser ? (
        <AuthForm onLogin={onLogin!} />
      ) : (
        <>
          {/* Dashboard Switcher Tab Bar */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '4px',
            borderRadius: '16px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid rgba(30, 81, 40, 0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
            <button
              onClick={() => setActiveSubTab('customer')}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '12px',
                border: 'none',
                background: activeSubTab === 'customer' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'customer' ? 'var(--white)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <User size={16} />
              <span>ลูกค้า</span>
            </button>
            <button
              onClick={() => setActiveSubTab('shop')}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '12px',
                border: 'none',
                background: activeSubTab === 'shop' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'shop' ? 'var(--white)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Store size={16} />
              <span>ร้านค้า</span>
              {!isShopUnlocked && <Lock size={12} style={{ opacity: 0.7 }} />}
            </button>
            <button
              onClick={() => setActiveSubTab('rider')}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '12px',
                border: 'none',
                background: activeSubTab === 'rider' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'rider' ? 'var(--white)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Bike size={16} />
              <span>ไรเดอร์</span>
              {!isRiderUnlocked && <Lock size={12} style={{ opacity: 0.7 }} />}
            </button>
          </div>

          {/* Render Active View */}
          {activeSubTab === 'customer' && (
            <CustomerDashboard 
              user={currentUser as any}
              favorites={favorites}
              shops={shops}
              onSelectShop={onSelectShop}
              onToggleFavorite={onToggleFavorite}
              userPoints={userPoints}
              onLogout={onLogout!}
            />
          )}
          {activeSubTab === 'shop' && (
            <ShopDashboard 
              user={currentUser as any}
              onLogout={onLogout!}
              onUpdateUser={onLogin!}
            />
          )}
          {activeSubTab === 'rider' && (
            <RiderDashboard 
              user={currentUser as any}
              onLogout={onLogout!}
              onUpdateUser={onLogin!}
            />
          )}
        </>
      )}
    </div>
  );
};
