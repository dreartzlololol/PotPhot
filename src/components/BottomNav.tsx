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
    { id: 'store' as TabType, label: 'ร้านค้า', icon: <Store size={22} /> },
    { id: 'search' as TabType, label: 'ตัวกรอง', icon: <SlidersHorizontal size={22} /> },
    { 
      id: 'pot' as TabType, 
      label: 'แต่งกระถาง', 
      icon: <Palette size={26} />, 
      badge: customPotsCount > 0 ? customPotsCount : undefined 
    },
    { 
      id: 'account' as TabType, 
      label: 'บัญชี', 
      icon: <User size={22} />, 
      badge: favoritesCount > 0 ? favoritesCount : undefined 
    },
    { id: 'settings' as TabType, label: 'ตั้งค่า', icon: <Settings size={22} /> },
  ];

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

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

      <div className="bottom-nav-inner slippery-wrap" style={{ 
          opacity: isRetracted ? 0 : 1, 
          transition: 'opacity 0.2s', 
          pointerEvents: isRetracted ? 'none' : 'auto',
          position: 'relative',
          display: 'flex',
          width: '100%',
        }}>
        
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tutorial-nav-${tab.id}`}
              className={`gamepad-focusable`}
              onClick={() => onChangeTab(tab.id)}
              style={{
                flex: 1,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 600,
                transition: 'color 0.25s ease',
                zIndex: 2,
                padding: '8px 0',
                position: 'relative',
              }}
            >
              <div className="bottom-nav-icon-wrapper" style={{ position: 'relative' }}>
                {tab.icon}
                {tab.badge && (
                  <span className="bottom-nav-badge" style={{ position: 'absolute', top: '-6px', right: '-8px' }}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label" style={{ marginTop: '4px', fontSize: '11px' }}>{tab.label}</span>
            </button>
          );
        })}

        {/* Sliding background (slidebar) */}
        <div className="slippery-slidebar" style={{
          position: 'absolute',
          top: '6px',
          left: '12px',
          height: 'calc(100% - 12px)',
          width: 'calc((100% - 24px) / 5)',
          borderRadius: '16px',
          background: 'rgba(78, 159, 61, 0.15)', // var(--primary-glow) basically
          zIndex: 0,
          transform: `translateX(${activeIndex * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.33, 0.83, 0.99, 0.98)',
        }} />

        {/* Sliding Top/Bottom Bars (bar) */}
        <div className="slippery-bar" style={{
          position: 'absolute',
          top: '0',
          left: '12px',
          height: '100%',
          width: 'calc((100% - 24px) / 5)',
          zIndex: 1,
          pointerEvents: 'none',
          transform: `translateX(${activeIndex * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.33, 0.83, 0.99, 0.98)',
        }}>
           <div style={{ position: 'absolute', top: 0, height: '3px', width: '50%', left: '25%', background: 'var(--primary)', borderRadius: '0 0 4px 4px' }} />
           <div style={{ position: 'absolute', bottom: 0, height: '3px', width: '50%', left: '25%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} />
        </div>

      </div>
    </div>
  );
};
