import React from 'react';
import type { RiderProfile } from '../types/auth';
import { Bike, LogOut, MapPin, CheckCircle, CreditCard, IdCard } from 'lucide-react';

interface RiderDashboardProps {
  user: RiderProfile;
  onLogout: () => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ user, onLogout }) => {
  // Mock data for deliveries
  const activeDelivery = {
    id: 'DEL-8832',
    pickup: 'ร้านกระถางลุงสมหมาย',
    dropoff: 'บ้านเลขที่ 123/45 ซ.สวนงาม',
    distance: '4.2 km',
    payout: 85
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bike size={24} />
          <span>แดชบอร์ดไรเดอร์</span>
        </h2>
        <button 
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: '#E63946', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bike size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{user.name}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {user.phone} <br/> {user.email} <br/>
              ID: {user.nationalId}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
            <Bike size={14} /> <strong>พาหนะ:</strong> {user.vehicleType}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
            <IdCard size={14} /> <strong>ใบขับขี่:</strong> {user.driversLicense}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              <CreditCard size={16} color="var(--primary)" /> รายได้วันนี้
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)', marginTop: '8px' }}>฿450</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              <CheckCircle size={16} color="var(--gold)" /> สำเร็จแล้ว
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)', marginTop: '8px' }}>6 งาน</span>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} />
          <span>งานที่กำลังดำเนินการ</span>
        </h3>
        
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>{activeDelivery.id}</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-light)' }}>฿{activeDelivery.payout}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>รับของ:</div>
                <div>{activeDelivery.pickup}</div>
              </div>
            </div>
            <div style={{ width: '2px', height: '12px', background: 'rgba(0,0,0,0.1)', marginLeft: '3px' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E63946', marginTop: '4px' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>ส่งของ:</div>
                <div>{activeDelivery.dropoff}</div>
              </div>
            </div>
          </div>
          <button style={{ marginTop: '8px', padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            อัปเดตสถานะ (ถึงจุดหมาย)
          </button>
        </div>
      </div>
    </div>
  );
};
