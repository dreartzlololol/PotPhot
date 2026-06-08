import React, { useState } from 'react';
import type { UserProfile, UserRole } from '../types/auth';
import { User, Store, Bike, Key, Phone, ArrowRight, Upload } from 'lucide-react';

interface AuthFormProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  
  // Shop
  const [shopEmail, setShopEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  
  // Rider
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [driversLicense, setDriversLicense] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!email) return alert('กรุณากรอกอีเมล');
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin(data.user);
        } else {
          alert(data.error || 'ไม่พบผู้ใช้ในระบบ');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Registration Validation
    if (!name || !phone) return alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
    if (!email || !nationalId) return alert('กรุณากรอกอีเมลและรหัสบัตรประชาชน');
    
    let newUser: any;
    const id = 'u-' + Math.random().toString(36).substr(2, 9);
    
    if (role === 'customer') {
      newUser = { id, role, name, phone, email, nationalId };
    } else if (role === 'shop') {
      if (!shopName || !shopDescription || !shopEmail) return alert('กรุณากรอกข้อมูลร้านให้ครบถ้วน');
      newUser = { 
        id, role, name, phone, email, nationalId,
        shopEmail, shopName, shopDescription, 
        shopThumbnail: 'https://images.unsplash.com/photo-1493325619176-79116e45187e?auto=format&fit=crop&w=300&q=80',
        isOpen: false
      };
    } else {
      if (!driversLicense) return alert('กรุณากรอกเลขที่ใบขับขี่');
      newUser = { id, role: 'rider', name, phone, email, nationalId, vehicleType, driversLicense };
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        // Automatically login after register
        const fullUser = { ...newUser, salesHistory: [] };
        onLogin(fullUser as UserProfile);
      } else {
        alert(data.error || 'การสมัครสมาชิกผิดพลาด');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { id: 'customer', label: 'ลูกค้าทั่วไป', icon: User },
    { id: 'shop', label: 'เจ้าของร้าน', icon: Store },
    { id: 'rider', label: 'ไรเดอร์', icon: Bike },
  ] as const;

  return (
    <div style={{ padding: '24px', maxWidth: '400px', margin: '40px auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
            <Key size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            {isLogin ? 'ยินดีต้อนรับกลับสู่ PhotPot' : 'ร่วมเป็นส่วนหนึ่งของชุมชนของเรา'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLogin && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {roleOptions.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: `2px solid ${role === r.id ? 'var(--primary)' : 'rgba(30,81,40,0.1)'}`,
                    background: role === r.id ? 'rgba(30,81,40,0.05)' : 'transparent',
                    color: role === r.id ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <r.icon size={20} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ชื่อ-นามสกุล / Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="สมหญิง รักสวน"
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                  required={!isLogin}
                />
              </div>

              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>เบอร์โทรศัพท์ / Phone</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="08X-XXX-XXXX"
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>อีเมล / Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="your.email@example.com"
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>รหัสบัตรประชาชน (National ID)</label>
              <input 
                type="text" 
                value={nationalId} 
                onChange={e => setNationalId(e.target.value)} 
                placeholder="1-XXXX-XXXXX-XX-X"
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                required
              />
            </div>
          )}

          {!isLogin && role === 'shop' && (
            <>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>อีเมลร้านค้า (Shop Email)</label>
                <input 
                  type="email" 
                  value={shopEmail} 
                  onChange={e => setShopEmail(e.target.value)} 
                  placeholder="shop@example.com"
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                  required
                />
              </div>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ชื่อร้านค้า (Shop Name)</label>
                <input 
                  type="text" 
                  value={shopName} 
                  onChange={e => setShopName(e.target.value)} 
                  placeholder="กระถางดินเผาตาชู"
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                  required
                />
              </div>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>รายละเอียดร้าน (Description)</label>
                <textarea 
                  value={shopDescription} 
                  onChange={e => setShopDescription(e.target.value)} 
                  placeholder="จำหน่ายกระถางดินเผาราคาปลีก-ส่ง..."
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                  required
                />
              </div>
            </>
          )}

          {!isLogin && role === 'rider' && (
            <>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ประเภทพาหนะ (Vehicle Type)</label>
                <select 
                  value={vehicleType} 
                  onChange={e => setVehicleType(e.target.value)} 
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'white' }}
                >
                  <option value="Motorcycle">มอเตอร์ไซค์ (Motorcycle)</option>
                  <option value="Pickup">รถกระบะ (Pickup Truck)</option>
                  <option value="Van">รถตู้ทึบ (Van)</option>
                </select>
              </div>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>เลขที่ใบขับขี่ (Driver's License)</label>
                <input 
                  type="text" 
                  value={driversLicense} 
                  onChange={e => setDriversLicense(e.target.value)} 
                  placeholder="XX-XXXXXXX"
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            style={{ 
              marginTop: '12px',
              padding: '14px', 
              borderRadius: '12px', 
              background: isLoading ? 'var(--text-muted)' : 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 700, 
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{isLoading ? 'กำลังโหลด...' : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isLogin ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้ว?'}
          </span>
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: 700, 
              marginLeft: '8px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isLogin ? 'สมัครเลย' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
};
