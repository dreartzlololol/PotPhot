import React, { useState } from 'react';
import { Store, SlidersHorizontal, Palette, User, Settings, ChevronDown, ChevronUp } from 'lucide-react';

export type TabType = 'store' | 'search' | 'pot' | 'account' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  favoritesCount: number;
  customPotsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount,
  customPotsCount,
}) => {
  const [isRetracted, setIsRetracted] = useState(false);

  React.useEffect(() => {
    const handleToggle = () => {
      setIsRetracted((prev) => !prev);
    };
    window.addEventListener('gamepad-toggle-menu', handleToggle);
    return () => window.removeEventListener('gamepad-toggle-menu', handleToggle);
  }, []);

  React.useEffect(() => {
    if (isRetracted) {
      document.body.classList.add('nav-retracted');
    } else {
      document.body.classList.remove('nav-retracted');
    }
    return () => {
      document.body.classList.remove('nav-retracted');
    };
  }, [isRetracted]);

  const tabs = [
    { id: 'store' as TabType, label: 'ร้านค้า', icon: <Store size={20} /> },
    { id: 'search' as TabType, label: 'ตัวกรอง', icon: <SlidersHorizontal size={20} /> },
    { 
      id: 'pot' as TabType, 
      label: 'แต่งกระถาง', 
      icon: <Palette size={20} />, 
      badge: customPotsCount > 0 ? customPotsCount : undefined 
    },
    { 
      id: 'account' as TabType, 
      label: 'บัญชี', 
      icon: <User size={20} />, 
      badge: favoritesCount > 0 ? favoritesCount : undefined 
    },
    { id: 'settings' as TabType, label: 'ตั้งค่า', icon: <Settings size={20} /> },
  ];

  return (
    <div 
      className={`bottom-nav-bar ${isRetracted ? 'retracted' : ''}`}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* Retraction Toggle Grab Handle Pill */}
      <button
        onClick={() => setIsRetracted(!isRetracted)}
        style={{
          position: 'absolute',
          top: '-18px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '54px',
          height: '18px',
          borderRadius: '10px 10px 0 0',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(30, 81, 40, 0.1)',
          borderBottom: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--primary)',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.04)',
          zIndex: 100
        }}
        title={isRetracted ? 'เปิดเมนูบาร์' : 'ย่อเมนูบาร์บดบังหน้าจอ'}
      >
        {isRetracted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div className="bottom-nav-inner" style={{ opacity: isRetracted ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: isRetracted ? 'none' : 'auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tutorial-nav-${tab.id}`}
              className={`bottom-nav-btn gamepad-focusable ${isActive ? 'active' : ''}`}
              onClick={() => onChangeTab(tab.id)}
              title={tab.label}
            >
              <div className="bottom-nav-icon-wrapper">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="bottom-nav-badge">{tab.badge}</span>
                )}
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
