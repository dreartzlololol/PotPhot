import React, { useState, useEffect } from 'react';
import type { RiderProfile } from '../types/auth';
import { Bike, LogOut, MapPin, CheckCircle, CreditCard, IdCard, Search, X, Store, Package } from 'lucide-react';

interface RiderDashboardProps {
  user: RiderProfile;
  onLogout: () => void;
  onUpdateUser: (user: any) => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [sessionEarnings, setSessionEarnings] = useState<number>(0);
  const [sessionCompletedJobs, setSessionCompletedJobs] = useState<number>(0);

  const [isEditing, setIsEditing] = useState(false);
  const [vehicleType, setVehicleType] = useState(user.vehicleType || 'Motorcycle');
  const [driversLicense, setDriversLicense] = useState(user.driversLicense || '');
  const [isSaving, setIsSaving] = useState(false);

  const [showJobModal, setShowJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isRiderUnlocked = Boolean(
    user.driversLicense && 
    user.driversLicense.trim() !== '' && 
    user.driversLicense !== 'ยังไม่ได้ระบุใบขับขี่'
  );

  useEffect(() => {
    if (user) {
      setVehicleType(user.vehicleType || 'Motorcycle');
      setDriversLicense(user.driversLicense || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!driversLicense.trim() || driversLicense === 'ยังไม่ได้ระบุใบขับขี่') {
      return alert('กรุณากรอกเลขที่ใบขับขี่ที่ถูกต้อง');
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/riders/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType, driversLicense })
      });
      if (res.ok) {
        onUpdateUser({ ...user, vehicleType, driversLicense });
        setIsEditing(false);
        alert('อัปเดตและปลดล็อกบทบาทไรเดอร์เรียบร้อยแล้ว! 🏍️💨');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSaving(false);
    }
  };

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        // 1. Check if this rider has an active delivery (status = picked_up, assigned to user.id)
        const myActive = data.orders.find((o: any) => o.status === 'picked_up' && o.riderId === user.id);
        setActiveJob(myActive || null);

        // 2. Fetch jobs available for pickup (status = ready)
        const available = data.orders.filter((o: any) => o.status === 'ready');
        setAvailableJobs(available);
      }
    } catch (err) {
      console.error('Failed to fetch rider jobs:', err);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleAcceptJob = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'picked_up', 
          progress: 85, 
          riderId: user.id, 
          riderName: user.name 
        })
      });
      if (res.ok) {
        loadJobs();
        alert('รับงานสำเร็จแล้ว! 🏍️💨\nกรุณาเดินทางไปรับกระถางที่หน้าร้านค้าและนำส่งให้ลูกค้าด่วนคร้าบ');
      } else {
        alert('เกิดข้อผิดพลาดในการรับงาน');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleCompleteJob = async (orderId: string, price: number, quantity: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'delivered', 
          progress: 100 
        })
      });
      if (res.ok) {
        const payout = Math.max(60, Math.round(price * quantity * 0.1));
        setSessionEarnings(prev => prev + payout);
        setSessionCompletedJobs(prev => prev + 1);
        loadJobs();
        alert(`จัดส่งกระถางเรียบร้อยแล้ว! 📦🎉\nคุณได้รับค่าแรง +฿${payout} เรียบร้อยแล้วครับ!`);
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const todayEarnings = 450 + sessionEarnings;
  const todayJobsCount = 6 + sessionCompletedJobs;

  if (!isRiderUnlocked) {
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

        <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(244, 180, 26, 0.15)', border: '2px dashed var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clay)' }}>
            <Bike size={40} />
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', background: 'rgba(244, 180, 26, 0.2)', color: 'var(--clay)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <span>🔒 ยืนยันใบขับขี่เพื่อปลดล็อกบทบาทไรเดอร์</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>เปิดใช้งานบทบาทผู้ส่งสาร (Rider)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '8px auto 0' }}>
              เพื่อความปลอดภัยในการจัดส่งกระถางดินเผาแสนประณีต กรุณายืนยันข้อมูลพาหนะและเลขที่ใบขับขี่ของคุณเพื่อเริ่มรับงานส่งสินค้าในโพธารามครับ
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ประเภทพาหนะ / Vehicle Type</label>
              <select 
                value={vehicleType} 
                onChange={e => setVehicleType(e.target.value)} 
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: '14px' }}
              >
                <option value="Motorcycle">มอเตอร์ไซค์ (Motorcycle)</option>
                <option value="Pickup">รถกระบะ (Pickup Truck)</option>
                <option value="Van">รถตู้ทึบ (Van)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>เลขที่ใบขับขี่ / Driver's License</label>
              <input 
                type="text" 
                value={driversLicense === 'ยังไม่ได้ระบุใบขับขี่' ? '' : driversLicense} 
                onChange={e => setDriversLicense(e.target.value)} 
                placeholder="ตัวอย่าง: 1-5599-XXXXX-XX-X"
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <button
              disabled={isSaving}
              onClick={handleSaveProfile}
              style={{ 
                marginTop: '8px',
                padding: '14px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <span>{isSaving ? 'กำลังตรวจสอบ...' : '🔓 ยืนยันและปลดล็อกบทบาทไรเดอร์'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Prominent Job Finder Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'radial-gradient(circle, var(--gold-glow) 0%, rgba(244, 180, 26, 0.05) 100%)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--gold)', boxShadow: '0 4px 15px rgba(244, 180, 26, 0.15)' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>พร้อมออกรอบส่งกระถางแล้วหรือยัง?</span>
            <span style={{ fontSize: '11px', background: 'var(--gold)', color: 'var(--text-dark)', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>LIVE</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>มีงานที่พร้อมให้คุณกดรับส่งตอนนี้ {availableJobs.length} รายการ</div>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(30, 81, 40, 0.2)'
          }}
        >
          <Search size={16} />
          <span>เมนูค้นหางาน ({availableJobs.length})</span>
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

        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>ข้อมูลผู้ขับขี่ / Rider Details</span>
            <button 
              onClick={() => {
                if (isEditing) {
                  setVehicleType(user.vehicleType || 'Motorcycle');
                  setDriversLicense(user.driversLicense || '');
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              {isEditing ? 'ยกเลิก' : 'แก้ไขข้อมูล'}
            </button>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>ประเภทพาหนะ / Vehicle Type</label>
                <select 
                  value={vehicleType} 
                  onChange={e => setVehicleType(e.target.value)} 
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: '13px' }}
                >
                  <option value="Motorcycle">มอเตอร์ไซค์ (Motorcycle)</option>
                  <option value="Pickup">รถกระบะ (Pickup Truck)</option>
                  <option value="Van">รถตู้ทึบ (Van)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>เลขที่ใบขับขี่ / Driver's License</label>
                <input 
                  type="text" 
                  value={driversLicense} 
                  onChange={e => setDriversLicense(e.target.value)} 
                  placeholder="XX-XXXXXXX"
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <button
                disabled={isSaving}
                onClick={handleSaveProfile}
                style={{ 
                  marginTop: '4px',
                  padding: '10px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
                <Bike size={14} /> <strong>พาหนะ:</strong> {user.vehicleType}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
                <IdCard size={14} /> <strong>ใบขับขี่:</strong> {user.driversLicense}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              <CreditCard size={16} color="var(--primary)" /> รายได้วันนี้
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)', marginTop: '8px' }}>฿{todayEarnings}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              <CheckCircle size={16} color="var(--gold)" /> สำเร็จแล้ว
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)', marginTop: '8px' }}>{todayJobsCount} งาน</span>
          </div>
        </div>
      </div>

      {/* Active Delivery Section */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} />
          <span>งานที่กำลังดำเนินการ</span>
        </h3>
        
        {activeJob ? (
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>{activeJob.id}</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-light)' }}>
                ฿{Math.max(60, Math.round(activeJob.price * activeJob.quantity * 0.1))}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>รับของ:</div>
                  <div>{activeJob.shopName}</div>
                </div>
              </div>
              <div style={{ width: '2px', height: '12px', background: 'rgba(0,0,0,0.1)', marginLeft: '3px' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E63946', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>ส่งของ (ลูกค้า: {activeJob.customerName}):</div>
                  <div>{activeJob.address}</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleCompleteJob(activeJob.id, activeJob.price, activeJob.quantity)}
              style={{ marginTop: '8px', padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              จัดส่งสำเร็จ (Delivered) 🎉
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            คุณยังไม่มีงานจัดส่งที่อยู่ระหว่างดำเนินการในขณะนี้ 🏍️💨
          </div>
        )}
      </div>

      {/* Available Delivery Jobs Pool */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bike size={18} />
          <span>งานด่วนรอไรเดอร์วิ่งส่ง ({availableJobs.length})</span>
        </h3>
        {availableJobs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            🌾 ตอนนี้ไม่มีงานปั้นกระถางที่พร้อมจัดส่งรอบโพธารามเลยครับ
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableJobs.map(job => (
              <div key={job.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>รับที่: {job.shopName}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-light)' }}>
                    ฿{Math.max(60, Math.round(job.price * job.quantity * 0.1))}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong>ส่งที่:</strong> {job.address} (ลูกค้า: {job.customerName})
                </div>
                <button 
                  onClick={() => handleAcceptJob(job.id)}
                  style={{ padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Bike size={14} /> ยืนยันกดรับงานวิ่งส่ง 🏍️💨
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Finder Modal Menu */}
      {showJobModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--white)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--premium-shadow)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.9)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bike size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>เมนูค้นหางานจัดส่งกระถาง</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>รายการออเดอร์ที่เตรียมวัตถุดิบและปั้นเสร็จแล้วพร้อมส่ง</span>
                </div>
              </div>
              <button 
                onClick={() => setShowJobModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar inside Modal */}
            <div style={{ padding: '16px 24px 8px', display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Search size={16} color="var(--text-muted)" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อกระถาง หรือชื่อร้านค้า..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Job List Container */}
            <div style={{ padding: '16px 24px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {availableJobs.filter(j => 
                !searchQuery || j.potName.includes(searchQuery) || j.shopName.includes(searchQuery)
              ).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>ยังไม่มีงานที่พร้อมส่งในขณะนี้</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>เมื่อร้านค้าปั้นกระถางเสร็จแล้ว รายการจะขึ้นแสดงที่นี่โดยอัตโนมัติครับ</div>
                </div>
              ) : (
                availableJobs
                  .filter(j => !searchQuery || j.potName.includes(searchQuery) || j.shopName.includes(searchQuery))
                  .map(j => {
                    const payout = Math.max(60, Math.round(j.price * j.quantity * 0.1));
                    return (
                      <div key={j.id} style={{
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid rgba(30, 81, 40, 0.1)',
                        background: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-light)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '10px' }}>
                              พร้อมรับส่ง 📦
                            </span>
                            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{j.potName}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>สั่งโดย: {j.customerName}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>+฿{payout}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ค่ารอบจัดส่ง</div>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Store size={14} color="var(--clay-light)" />
                            <span><strong>รับจากร้าน:</strong> {j.shopName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="var(--primary)" />
                            <span><strong>นำส่งที่อยู่:</strong> {j.address || 'อำเภอโพธาราม'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            handleAcceptJob(j.id);
                            setShowJobModal(false);
                          }}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckCircle size={16} />
                          <span>รับงานจัดส่งนี้ (+฿{payout})</span>
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
