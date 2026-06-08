import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Info, Trash2, ShieldAlert, Gamepad } from 'lucide-react';

interface SettingsProps {
  onClearAllData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClearAllData }) => {
  const [sunlightMode, setSunlightMode] = useState(true);


  // Toggle Dark Mode (Moonlight) vs Light Mode (Sunlight) on the body element
  const handleThemeToggle = () => {
    setSunlightMode(!sunlightMode);
    document.body.classList.toggle('dark-theme');
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
      {/* Title */}
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SettingsIcon size={24} />
        <span>ตั้งค่าแอปพลิเคชัน</span>
      </h2>

      {/* Theme Toggles */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>โหมดการแสดงผล</div>
        
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
              transition: 'background-color 0.3s',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>
      </div>



      {/* Xbox 360 Controller Settings Guide */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม X</span>
            <span style={{ color: 'var(--text-muted)' }}>กดบันทึกร้านโปรด ❤️</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม Y</span>
            <span style={{ color: 'var(--text-muted)' }}>ซ่อน / แสดง แถบเมนูด้านล่าง 📂</span>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)', marginTop: '8px' }}>
          🎮 การควบคุมเกมตัวต่อดินเผา (Clay Tetris)
        </div>
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
            <span style={{ fontWeight: 600 }}>อนาล็อกซ้าย / D-pad ซ้าย-ขวา</span>
            <span style={{ color: 'var(--text-muted)' }}>เลื่อนบล็อกตัวต่อดินเผา 🧱</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>อนาล็อกซ้าย / D-pad ล่าง</span>
            <span style={{ color: 'var(--text-muted)' }}>เร่งบล็อกหล่นลงมา (Soft Drop) ⬇️</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม A / D-pad บน</span>
            <span style={{ color: 'var(--text-muted)' }}>หมุนชิ้นตัวต่อดินเผา 🔄</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม X / Y</span>
            <span style={{ color: 'var(--text-muted)' }}>วางบล็อกทันที (Hard Drop) 💥</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>ปุ่ม B</span>
            <span style={{ color: 'var(--text-muted)' }}>หยุดเกมชั่วคราว / เล่นต่อ ⏸️</span>
          </div>
        </div>
      </div>

      {/* Reset Data Section */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={18} />
          <span>พื้นที่ดูแลความปลอดภัยข้อมูล</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          หากรู้สึกว่าต้องการเริ่มต้นการสะสมคะแนนปั้นกระถางและรายชื่อร้านค้าโปรดใหม่ทั้งหมด สามารถกดปุ่มล้างข้อมูลด้านล่างนี้ได้
        </p>
        <button 
          className="gamepad-focusable"
          onClick={handleClearData}
          style={{
            background: 'rgba(211, 47, 47, 0.08)',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            borderRadius: '12px',
            color: '#D32F2F',
            padding: '12px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(211, 47, 47, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(211, 47, 47, 0.08)'}
        >
          <Trash2 size={16} />
          <span>ล้างประวัติการเก็บแต้ม & ร้านโปรด</span>
        </button>
      </div>

      {/* App Info Box */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>PotPhot - Cozy Thai Garden Fantasy</div>
          <div>รุ่นปัจจุบัน: v1.2.0 - Photharam Pot Discovery Edition</div>
          <div>พัฒนาเพื่ออนุรักษ์ลวดลายมังกรดินเผาคู่บ้านคู่เมืองราชบุรีและส่งเสริมการท่องเที่ยวชุมชนท้องถิ่น อำเภอโพธาราม 🇹🇭🐉</div>
        </div>
      </div>

    </div>
  );
};
