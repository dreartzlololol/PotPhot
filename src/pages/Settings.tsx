import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Gamepad, 
  Trash2, 
  Check, 
  Music
} from 'lucide-react';

export interface AppSettingsConfig {
  performanceMode: boolean;
  modelQuality: 'high' | 'medium' | 'low';
  showDragonMascot: boolean;
  showLeafParticles: boolean;
  showClickSparkles: boolean;
  musicEnabled: boolean;
  musicVolume: number;
}

interface SettingsProps {
  onClearAllData: () => void;
  onOpenTutorial?: () => void;
  settings: AppSettingsConfig;
  onUpdateSettings: (newSettings: Partial<AppSettingsConfig>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onClearAllData, 
  onOpenTutorial, 
  settings, 
  onUpdateSettings 
}) => {
  const [sunlightMode, setSunlightMode] = useState(true);

  // Toggle Dark Mode (Moonlight) vs Light Mode (Sunlight)
  const handleThemeToggle = () => {
    setSunlightMode(!sunlightMode);
    document.body.classList.toggle('dark-theme');
  };

  const handlePerformanceModeToggle = (enabled: boolean) => {
    if (enabled) {
      onUpdateSettings({
        performanceMode: true,
        showLeafParticles: false,
        showClickSparkles: false,
        showDragonMascot: false,
        modelQuality: 'low'
      });
      document.body.classList.add('perf-mode');
    } else {
      onUpdateSettings({
        performanceMode: false,
        showLeafParticles: true,
        showClickSparkles: true,
        showDragonMascot: true,
        modelQuality: 'high'
      });
      document.body.classList.remove('perf-mode');
    }
  };

  const handleClearData = () => {
    const confirm = window.confirm(
      '⚠️ คุณแน่ใจหรือไม่ที่จะล้างข้อมูลแอปทั้งหมด?\n\nการกระทำนี้จะลบ:\n- รายการร้านค้าโปรด\n- กระถางที่ออกแบบเก็บสะสมไว้\n- เลเวลและแต้มสะสมสวนทั้งหมด'
    );
    if (confirm) {
      onClearAllData();
      alert('ล้างข้อมูลเรียบร้อยแล้ว! เริ่มต้นการเดินทางดินเผาครั้งใหม่ได้เลย 🐉✨');
      window.location.reload();
    }
  };

  return (
    <div 
      className="tab-page-container"
      style={{
        padding: '24px 24px 100px 24px',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SettingsIcon size={24} />
        <span>ตั้งค่าแอปพลิเคชัน</span>
      </h2>

      {/* Tutorial Guide Banner */}
      {onOpenTutorial && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, rgba(30,81,40,0.08) 0%, rgba(245,158,11,0.15) 100%)',
            border: '1.5px solid var(--gold-light)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', marginBottom: '4px' }}>
              📖 คู่มือการใช้งานเว็บไซต์ (Tutorial Guide)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              อ่านคำแนะนำพาทัวร์เว็บไซต์ และระบบการจอยเกม Xbox 360
            </div>
          </div>
          <button 
            className="premium-btn gamepad-focusable"
            onClick={onOpenTutorial}
            style={{ padding: '10px 18px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            <span>เปิดคู่มือ 🏺</span>
          </button>
        </div>
      )}

      {/* 🚀 Section 1: Performance & Speed Mode */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--gold-light)' }} />
          <span>โหมดประสิทธิภาพ (Performance Mode)</span>
        </div>

        {/* Master Performance Switch */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(245,158,11,0.06)', padding: '12px 14px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary)' }}>
              ⚡ Performance Mode (โหมดเพิ่มความเร็ว)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              ปิดเอฟเฟกต์เบลอและเอฟเฟกต์ลอยบนหน้าจอ สำหรับคอม/มือถือสเปกประหยัด
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.performanceMode}
            onChange={(e) => handlePerformanceModeToggle(e.target.checked)}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: settings.performanceMode ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>

        {/* 3D Render Quality Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
            🎨 ความละเอียดกราฟิก 3D (3D Model Quality)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {(['high', 'medium', 'low'] as const).map((q) => (
              <button
                key={q}
                type="button"
                className="gamepad-focusable"
                onClick={() => onUpdateSettings({ modelQuality: q })}
                style={{
                  padding: '8px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: settings.modelQuality === q ? '2px solid var(--primary-light)' : '1px solid rgba(0,0,0,0.1)',
                  background: settings.modelQuality === q ? 'rgba(45,122,71,0.12)' : 'var(--white)',
                  color: settings.modelQuality === q ? 'var(--primary)' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {settings.modelQuality === q && <Check size={14} />}
                <span>{q === 'high' ? 'High 🌟' : q === 'medium' ? 'Medium ⚡' : 'Low 🍃'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🎨 Section 2: Visual Effects & Animations */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--gold)' }} />
          <span>อนิเมชันและเอฟเฟกต์ (Visual Effects)</span>
        </div>

        {/* Flying Dragon Mascot Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
            🐉 น้องมังกรมาสคอตลอยทักทาย (Dragon Mascot Animation)
          </span>
          <input
            type="checkbox"
            checked={settings.showDragonMascot}
            onChange={(e) => onUpdateSettings({ showDragonMascot: e.target.checked })}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: settings.showDragonMascot ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>

        {/* Falling Leaves Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
            🍃 ใบไม้ปลิวร่วงหล่น (Falling Leaf Particles)
          </span>
          <input
            type="checkbox"
            checked={settings.showLeafParticles}
            onChange={(e) => onUpdateSettings({ showLeafParticles: e.target.checked })}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: settings.showLeafParticles ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>

        {/* Click Sparkles Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
            ✨ พลุละอองดาวเมื่อคลิก (Click Sparkle Bursts)
          </span>
          <input
            type="checkbox"
            checked={settings.showClickSparkles}
            onChange={(e) => onUpdateSettings({ showClickSparkles: e.target.checked })}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: settings.showClickSparkles ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>
      </div>

      {/* 🎵 Section 3: Audio & Sound Effects */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music size={18} style={{ color: 'var(--clay-light)' }} />
          <span>ระบบเสียงและเพลง (Audio Settings)</span>
        </div>

        {/* BGM Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {settings.musicEnabled ? <Volume2 size={18} style={{ color: 'var(--primary-light)' }} /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
            <span>เล่นเพลงประกอบเกม Tetris (Background Music)</span>
          </span>
          <input
            type="checkbox"
            checked={settings.musicEnabled}
            onChange={(e) => onUpdateSettings({ musicEnabled: e.target.checked })}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: settings.musicEnabled ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>

        {/* Volume Slider */}
        {settings.musicEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
              <span>ระดับเสียงเพลง (Music Volume)</span>
              <span>{settings.musicVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) => onUpdateSettings({ musicVolume: parseInt(e.target.value, 10) })}
              style={{ width: '100%', accentColor: 'var(--primary-light)', cursor: 'pointer' }}
              className="gamepad-focusable"
            />
          </div>
        )}
      </div>

      {/* 🌙 Section 4: Theme Toggle */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>โหมดธีมการแสดงผล</div>
        
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sunlightMode ? <Sun size={18} style={{ color: 'var(--gold)' }} /> : <Moon size={18} style={{ color: '#90CAF9' }} />}
            <span>{sunlightMode ? 'โหมดแสงแดดอบอุ่น (Sunlight)' : 'โหมดคืนแสงจันทร์ (Moonlight)'}</span>
          </span>
          <input
            type="checkbox"
            checked={!sunlightMode}
            onChange={handleThemeToggle}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: !sunlightMode ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>
      </div>

      {/* 🎮 Section 5: Xbox Controller Guide */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gamepad size={18} style={{ color: 'var(--primary-light)' }} />
          <span>การควบคุมด้วยจอยเกม Xbox 360</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          แอปพลิเคชันรองรับการนำทางผ่าน Gamepad คอนโทรลเลอร์ เสียบสายต่อจอยเล่นได้ทันทีเสมือนเกมสร้างสวนสุดอบอุ่น:
        </p>
        <div 
          style={{
            background: 'var(--bg-cream)',
            padding: '12px 16px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            border: '1px solid rgba(30, 81, 40, 0.06)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>LB / RB</span>
            <span style={{ color: 'var(--text-muted)' }}>สลับหน้าเมนูบาร์ด่วน 🔀</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>LT / RT</span>
            <span style={{ color: 'var(--text-muted)' }}>ซูมแผนที่เข้า - ออก 🔍</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>อนาล็อกซ้าย / D-pad</span>
            <span style={{ color: 'var(--text-muted)' }}>เลื่อนมุมกล้องนำทางแผนที่ 🗺️</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม A</span>
            <span style={{ color: 'var(--text-muted)' }}>ตกลง / เปิดข้อมูลร้านค้าที่ไฮไลต์ 🏺</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม B</span>
            <span style={{ color: 'var(--text-muted)' }}>ยกเลิก / ปิดกล่องข้อความย้อนกลับ ❌</span>
          </div>
        </div>
      </div>

      {/* 🗑️ Section 6: Danger Zone */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          borderColor: 'rgba(239, 68, 68, 0.3)',
          background: 'rgba(254, 242, 242, 0.6)' 
        }}
      >
        <div style={{ color: '#DC2626', fontWeight: 700, fontSize: '15px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={18} />
          <span>ล้างแคชและข้อมูลแอปทั้งหมด</span>
        </div>
        <p style={{ fontSize: '12px', color: '#991B1B', lineHeight: 1.5, marginBottom: '14px' }}>
          การล้างข้อมูลจะทำการรีเซ็ตรายการโปรด กระถางที่คุณออกแบบทั้งหมด และแต้มสะสมสวน
        </p>
        <button
          onClick={handleClearData}
          className="gamepad-focusable"
          style={{
            background: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
          }}
        >
          ล้างข้อมูลทั้งหมด ⚠️
        </button>
      </div>
    </div>
  );
};
