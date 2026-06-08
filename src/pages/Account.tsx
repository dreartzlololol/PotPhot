import React from 'react';
import type { Shop } from '../data/shops';
import type { UserProfile } from '../types/auth';
import { AuthForm } from '../components/AuthForm';
import { CustomerDashboard } from '../components/CustomerDashboard';
import { ShopDashboard } from '../components/ShopDashboard';
import { RiderDashboard } from '../components/RiderDashboard';

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
          {currentUser.role === 'customer' && (
            <CustomerDashboard 
              user={currentUser}
              favorites={favorites}
              shops={shops}
              onSelectShop={onSelectShop}
              onToggleFavorite={onToggleFavorite}
              userPoints={userPoints}
              onLogout={onLogout!}
            />
          )}
          {currentUser.role === 'shop' && (
            <ShopDashboard 
              user={currentUser}
              onLogout={onLogout!}
              onUpdateUser={onLogin!}
            />
          )}
          {currentUser.role === 'rider' && (
            <RiderDashboard 
              user={currentUser}
              onLogout={onLogout!}
            />
          )}
        </>
      )}
    </div>
  );
};
