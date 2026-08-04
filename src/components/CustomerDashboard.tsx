import React, { useState, useEffect } from 'react';
import type { Shop } from '../data/shops';
import type { CustomerProfile } from '../types/auth';
import { User, Heart, Star, Navigation, IdCard, LogOut, ShoppingBag } from 'lucide-react';

interface CustomerDashboardProps {
  user: CustomerProfile;
  favorites: string[];
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  onToggleFavorite: (shopId: string) => void;
  userPoints: number;
  onLogout: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user, favorites, shops, onSelectShop, onToggleFavorite, userPoints, onLogout
}) => {
  const favoriteShops = shops.filter((shop) => favorites.includes(shop.id));
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch(`/api/orders?customerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Hide claimed custom pot commissions from list as they are shown in pot tab inventory
          setOrders(data.orders.filter((o: any) => o.status !== 'claimed'));
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      }
    };
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  let userTitle = 'คนรักสวนฝึกหัด 🌱';
  let badgeColor = 'var(--text-muted)';
  if (userPoints >= 50) {
    userTitle = 'ผู้เชี่ยวชาญดินเผาโพธาราม 🏺✨';
    badgeColor = 'var(--clay-light)';
  } else if (userPoints >= 30) {
    userTitle = 'ช่างปั้นลายมังกรทอง 🐉🥇';
    badgeColor = 'var(--gold)';
  } else if (userPoints >= 10) {
    userTitle = 'นักจัดสวนมืออาชีพ 🏡💚';
    badgeColor = 'var(--primary-light)';
  }

  const userReviewsCount = shops.reduce((acc, shop) => {
    const writtenByMe = shop.reviews.filter((r) => r.id.startsWith('rev-')).length;
    return acc + writtenByMe;
  }, 0);

  const handleNavigateDirect = (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    alert(`กำลังเริ่มระบบนำทางไปที่ "${shop.name}"\nพิกัด GPS: ${shop.address}\n\nน้องมังกร: เดินทางดี ๆ นะครับ! 🚗✨`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'รอยืนยันจากร้านค้า ⏳', color: '#D35400' };
      case 'accepted': return { text: 'เตรียมวัตถุดิบดิน 🧱', color: '#2980B9' };
      case 'shaping': return { text: 'กำลังปั้นขึ้นรูป 🏺', color: '#8E44AD' };
      case 'baking': return { text: 'กำลังเผาในเตาอบ 🔥', color: '#E67E22' };
      case 'ready': return { text: 'ปั้นเสร็จแล้ว - รอไรเดอร์มารับ 📦', color: '#27AE60' };
      case 'picked_up': return { text: 'ไรเดอร์กำลังนำส่ง 🏍️', color: '#16A085' };
      case 'delivered': return { text: 'จัดส่งสำเร็จแล้ว 🎉', color: '#2ECC71' };
      default: return { text: status, color: 'var(--text-muted)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} />
          <span>บัญชีลูกค้า</span>
        </h2>
        <button 
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: '#E63946', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle, var(--white) 30%, var(--gold-glow) 100%)', border: '4px solid var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/mascot.png" alt="Profile" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{user.name}</h3>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {user.phone} <br/> {user.email}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <IdCard size={14} /> ID: {user.nationalId}
          </div>
          <br/>
          <div style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '20px', background: 'var(--white)', border: `2px solid ${badgeColor}`, color: 'var(--text-dark)', fontSize: '12px', fontWeight: 700 }}>
            {userTitle}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', borderTop: '1px solid rgba(30, 81, 40, 0.08)', paddingTop: '20px', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-light)' }}>{userPoints}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>คะแนนสะสม</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderInline: '1px solid rgba(30, 81, 40, 0.08)' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-light)' }}>{userReviewsCount}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>รีวิว</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-light)' }}>{favorites.length}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>ร้านโปรด</span>
          </div>
        </div>
      </div>

      {/* Orders Tracking Section */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} />
          <span>ติดตามคำสั่งซื้อของฉัน ({orders.length})</span>
        </h3>
        {orders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            คุณยังไม่มีประวัติการสั่งซื้อ หรือคำสั่งซื้อค้างอยู่ 🏺🛍️<br/>คุณสามารถเข้าเมนู "เลือกซื้อกระถาง" ในหน้าค้นหาร้านค้า เพื่อส่งรายการสั่งซื้อได้ครับ
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(o => {
              const statusInfo = getStatusLabel(o.status);
              return (
                <div key={o.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: `4px solid ${statusInfo.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{o.potName}</h4>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        ร้าน: {o.shopName} • {o.date}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: statusInfo.color }}>
                      {statusInfo.text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>จำนวน: {o.quantity} ชิ้น</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>฿{(o.price * o.quantity).toLocaleString()}</span>
                  </div>

                  {o.status !== 'delivered' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        <span>ความคืบหน้าคำสั่งซื้อ</span>
                        <span>{o.progress}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${o.progress}%`, height: '100%', background: statusInfo.color, borderRadius: '2px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  )}

                  {o.riderName && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🏍️ <span>ผู้จัดส่ง: <strong>{o.riderName}</strong> กำลังนำทาง</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={18} fill="var(--clay-light)" stroke="var(--clay-light)" />
          <span>ร้านกระถางโปรดของฉัน</span>
        </h3>
        {favoriteShops.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            คุณยังไม่มีร้านโปรดในบัญชีเลย 🏺❤️<br />ลองไปค้นหาในแผนที่แล้วกดบันทึกร้านที่คุณถูกใจไว้ตรงนี้นะครับ!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favoriteShops.map((shop) => (
              <div key={shop.id} className="glass-panel" onClick={() => onSelectShop(shop)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid rgba(30, 81, 40, 0.05)' }}>
                <img src={shop.coverImage} alt={shop.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name.split(' (')[0]}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--gold)', fontWeight: 600 }}><Star size={12} fill="currentColor" /><span>{shop.rating.toFixed(1)}</span></div>
                    <span>•</span><span>ห่าง {shop.distance}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="navigate-btn-card" onClick={(e) => handleNavigateDirect(e, shop)} style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}>
                    <Navigation size={12} fill="currentColor" /> นำทาง
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(shop.id); }} style={{ background: 'none', border: 'none', color: '#E63946', cursor: 'pointer', padding: 4 }}>
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
