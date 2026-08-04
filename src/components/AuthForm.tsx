import React, { useState } from 'react';
import type { UserProfile } from '../types/auth';
import { Key, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');

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
    
    const id = 'u-' + Math.random().toString(36).substr(2, 9);
    const newUser = { id, name, phone, email, nationalId };
    
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
        onLogin(data.user);
      } else {
        alert(data.error || 'การสมัครสมาชิกผิดพลาด');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

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
