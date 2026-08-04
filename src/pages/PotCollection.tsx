import React, { useState, useRef, useEffect } from 'react';
import { Palette, Flame, Sparkles, BookOpen, Award, ShoppingBag, Clock, CheckCircle2, Loader } from 'lucide-react';
import { TetrisGame } from '../components/TetrisGame';
import { PotMiniGame, DecalGraphic } from '../components/PotMiniGame';
import type { Shop } from '../data/shops';
import type { UserProfile } from '../types/auth';

export interface CustomPot {
  id: string;
  name: string;
  shape: 'classic' | 'modern' | 'octagon';
  shapeTh: string;
  color: string;
  colorName: string;
  pattern: 'gold-dragon' | 'emerald-dragon' | 'cute-mascot' | 'ancient-wave';
  patternTh: string;
  cost?: number;
  potDetails?: any;
}

export interface PotOrder {
  id: string;
  pot: CustomPot;
  cost: number;
  status: 'pending' | 'accepted' | 'shaping' | 'baking' | 'completed';
  progress: number;
  shopName?: string;
  address?: string;
}

interface PotCollectionProps {
  customPots: CustomPot[];
  onAddCustomPot: (pot: CustomPot) => void;
  userPoints: number;
  onAwardPoints: (points: number) => void;
  shops: Shop[];
  currentUser?: UserProfile | null;
  onTetrisActiveChange?: (active: boolean) => void;
}

// SHAPES is unused, removed to satisfy compilation

const COLORS = [
  { id: '#CD853F', name: 'ส้มอิฐโพธาราม', gradient: 'radial-gradient(circle at 30% 30%, #E69A5D, #CD853F)' },
  { id: '#8E5431', name: 'น้ำตาลดินเผาเข้ม', gradient: 'radial-gradient(circle at 30% 30%, #A86D4A, #8E5431)' },
  { id: '#F4B41A', name: 'ทองแสงแดดอบอุ่น', gradient: 'radial-gradient(circle at 30% 30%, #F8D360, #F4B41A)' },
  { id: '#1E5128', name: 'หยกเขียวขจี', gradient: 'radial-gradient(circle at 30% 30%, #357F44, #1E5128)' },
];

const PATTERNS = [
  { id: 'gold-dragon' as const, label: 'มังกรทองทะยานฟ้า 🐉', color: '#FFD54F', desc: 'ลวดลายมังกรทองมงคลกวักทรัพย์' },
  { id: 'emerald-dragon' as const, label: 'มังกรหยกนำโชค 🐲', color: '#81C784', desc: 'ลายมังกรจีนเสริมสุขภาพและความสงบ' },
  { id: 'cute-mascot' as const, label: 'มังกรน้อยถือไม้เบสบอล ⚾', color: '#FF8A65', desc: 'ลายน้องมังกรน้อยถือไม้เบสบอลน่ารักขี้เล่น' },
  { id: 'ancient-wave' as const, label: 'คลื่นมงคลโบราณ 🌊', color: '#E0F7FA', desc: 'ลวดลายคลื่นจีนโบราณไหลลื่นไม่สิ้นสุด' },
];

export const PotCollection: React.FC<PotCollectionProps> = ({
  customPots,
  onAddCustomPot,
  userPoints,
  onAwardPoints,
  shops,
  currentUser,
  onTetrisActiveChange,
}) => {
  const [subTab, setSubTab] = useState<'gallery' | 'tetris'>('gallery');
  const [bakedSuccess, setBakedSuccess] = useState(false);
  const [lastCost, setLastCost] = useState<number | null>(null);
  const [orders, setOrders] = useState<PotOrder[]>([]);
  const designerRef = useRef<HTMLDivElement>(null);

  // Notify parent component when entering/leaving Tetris subTab
  useEffect(() => {
    if (onTetrisActiveChange) {
      onTetrisActiveChange(subTab === 'tetris');
    }
    return () => {
      if (onTetrisActiveChange) {
        onTetrisActiveChange(false);
      }
    };
  }, [subTab, onTetrisActiveChange]);

  // Pot Selection & Commission States
  const [designedPot, setDesignedPot] = useState<CustomPot | null>(null);
  const [designedCost, setDesignedCost] = useState<number | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);

  // Load real orders from DB if logged in, otherwise use client-side state
  const fetchOrdersFromDB = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/orders?customerId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        const customOrders = data.orders.filter((o: any) => o.potDetails !== null && o.status !== 'claimed');
        const mappedOrders: PotOrder[] = customOrders.map((o: any) => ({
          id: o.id,
          pot: {
            id: o.id,
            name: o.potName,
            shape: o.potDetails.shape || 'classic',
            shapeTh: o.potDetails.shapeTh || 'ทรงดั้งเดิม 🏺',
            color: o.potDetails.color || '#CD853F',
            colorName: o.potDetails.colorName || 'ดินส้มอิฐ',
            pattern: o.potDetails.pattern || 'ancient-wave',
            patternTh: o.potDetails.patternTh || 'ไม่มีลาย',
            cost: o.price
          },
          cost: o.price * o.quantity,
          status: o.status,
          progress: o.progress,
          shopName: o.shopName,
          address: o.address
        }));
        setOrders(mappedOrders);
      }
    } catch (e) {
      console.error('Failed to load real custom orders:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchOrdersFromDB();
      const interval = setInterval(fetchOrdersFromDB, 5000);
      return () => clearInterval(interval);
    } else {
      // Mock order progress simulator for guest users
      const timer = setInterval(() => {
        setOrders((prev) => {
          let changed = false;
          const next = prev.map((ord) => {
            if (ord.status === 'completed') return ord;
            changed = true;
            const stages: PotOrder['status'][] = ['pending', 'accepted', 'shaping', 'baking', 'completed'];
            const curIdx = stages.indexOf(ord.status);
            const nextStatus = stages[curIdx + 1];
            const nextProgress = Math.min(100, Math.round(((curIdx + 1) / 4) * 100));
            return {
              ...ord,
              status: nextStatus,
              progress: nextProgress,
            };
          });
          return changed ? next : prev;
        });
      }, 4500);
      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const handleMiniGameComplete = (newPot: CustomPot, cost: number) => {
    // Show Shop Selection dialog instead of instantly creating mock order
    setDesignedPot(newPot);
    setDesignedCost(cost);
  };

  const submitCustomPotOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designedPot || !designedCost) return;
    
    if (!currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนปั้นกระถางสั่งทำครับ!');
      return;
    }
    if (!selectedShopId) {
      alert('กรุณาเลือกหน้าร้านที่คุณต้องการสั่งทำกระถาง');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('กรุณากรอกที่อยู่ในการจัดส่งกระถาง');
      return;
    }

    setOrderSubmitting(true);
    try {
      const selectedShop = shops.find(s => s.id === selectedShopId);
      
      const payload = {
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        shopId: selectedShopId,
        shopName: selectedShopId === 'global' ? 'ร้านปั้นใดก็ได้ (Global Pool)' : (selectedShop ? selectedShop.name : 'ร้านกระถางสั่งปั้นพิเศษ'),
        potName: designedPot.name,
        price: designedCost,
        quantity: 1,
        status: 'pending',
        progress: 0,
        address: deliveryAddress,
        potDetails: designedPot.potDetails || designedPot
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setDesignedPot(null);
        setDesignedCost(null);
        setSelectedShopId('');
        setDeliveryAddress('');
        fetchOrdersFromDB();
        
        // Show success splash
        alert('ส่งใบสั่งปั้นกระถางของคุณไปยังร้านสำเร็จแล้ว! ติดตามสถานะเตาอบได้ด้านล่างครับ 🏺✨');
      } else {
        alert('เกิดข้อผิดพลาดในการส่งใบปั้นกระถาง');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleClaimPot = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    onAddCustomPot(order.pot);
    
    if (currentUser) {
      try {
        await fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'claimed' })
        });
        fetchOrdersFromDB();
      } catch (err) {
        console.error(err);
      }
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
    
    // Visual indicator of award
    setLastCost(order.cost);
    setBakedSuccess(true);
    setTimeout(() => {
      setBakedSuccess(false);
      setLastCost(null);
    }, 4000);
  };

  const currentLevel = Math.floor(userPoints / 20) + 1;
  const nextLevelPoints = currentLevel * 20;
  const progressPercent = Math.min(100, (userPoints % 20) * 5);

  const isDesigning = subTab === 'gallery' && !bakedSuccess && designedPot === null;

  return (
    <div 
      className="tab-page-container"
      style={{
        padding: isDesigning ? '16px 16px 20px 16px' : '24px 24px 80px 24px',
        maxWidth: isDesigning ? '1060px' : '680px',
        margin: '0 auto',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
        transition: 'max-width 0.3s ease-in-out',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={24} />
          <span>แกลเลอรีกระถางของฉัน</span>
        </h2>
        {!bakedSuccess && (
          <button 
            className="premium-btn gamepad-focusable"
            onClick={() => {
              setSubTab('gallery');
              setTimeout(() => {
                designerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '13px' }}
          >
            <Palette size={16} />
            <span>ออกแบบกระถาง 🎮</span>
          </button>
        )}
      </div>

      {/* User Level Dashboard */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--gold-light), var(--gold))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            boxShadow: 'var(--glow-gold)'
          }}
        >
          <Award size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>ช่างปั้นดินเผาเลเวล {currentLevel}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userPoints} / {nextLevelPoints} แต้ม</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(30,81,40,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary-light)', borderRadius: '4px', transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div 
        className="view-tab-container"
        style={{ margin: 0, padding: 4 }}
      >
        <button
          className={`view-tab-btn gamepad-focusable ${subTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setSubTab('gallery')}
          style={{ flex: 1, padding: '10px', fontSize: '13px' }}
        >
          <Palette size={16} />
          <span>แกลเลอรี & ออกแบบ</span>
        </button>
        <button
          className={`view-tab-btn gamepad-focusable ${subTab === 'tetris' ? 'active' : ''}`}
          onClick={() => setSubTab('tetris')}
          style={{ flex: 1, padding: '10px', fontSize: '13px' }}
        >
          <Flame size={16} />
          <span>เกมตัวต่อดินเผา (Tetris)</span>
        </button>
      </div>

      {subTab === 'tetris' ? (
        <TetrisGame userPoints={userPoints} onAwardPoints={onAwardPoints} onGameActiveChange={onTetrisActiveChange} />
      ) : (
        <>
          {/* MiniGame Designer */}
          {bakedSuccess && lastCost !== null ? (
            <div
              className="glass-panel"
              style={{
                padding: '28px 20px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: '12px',
                border: '2px solid var(--primary-light)',
                animation: 'bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'radial-gradient(circle, var(--gold-light), var(--gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--glow-gold)'
              }}>
                <Flame size={40} style={{ color: 'var(--clay)', animation: 'float 2s ease-in-out infinite' }} />
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>อบกระถางเสร็จสมบูรณ์! 🏺</h4>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)' }}>
                กระถางของคุณถูกบันทึกเรียบร้อยแล้ว 🐉✨
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)',
                border: '1.5px dashed rgba(200,140,50,0.4)',
                borderRadius: '14px', padding: '12px 20px',
                fontSize: '22px', fontWeight: 900, color: 'var(--clay)'
              }}>
                ราคารวม: ฿{lastCost.toLocaleString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--clay-light)' }}>
                <Sparkles size={14} className="star-input-btn active" />
                <span>แต้มช่างปั้นเพิ่มขึ้น! (+10 แต้ม)</span>
              </div>
            </div>
          ) : designedPot !== null ? (
            <form 
              onSubmit={submitCustomPotOrder} 
              className="glass-panel" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'white' }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>เลือกหน้าร้านและส่งใบสั่งปั้นกระถาง</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>กระถางที่คุณออกแบบเสร็จแล้ว พร้อมคำนวณราคารวมแล้ว กรุณาเลือกช่างปั้นและระบุที่อยู่จัดส่ง</p>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ width: '50px', height: '55px', borderRadius: '8px', background: 'var(--clay)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  🏺
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{designedPot.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>รูปทรง: {designedPot.shapeTh} • ดิน: {designedPot.colorName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>เลือกหน้าร้านรับทำปั้น:</label>
                <select 
                  required
                  value={selectedShopId}
                  onChange={e => setSelectedShopId(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: 'var(--text-dark)', fontSize: '13px' }}
                >
                  <option value="">-- กรุณาเลือกร้านกระถาง --</option>
                  <option value="global">🌐 ส่งประกาศเข้าบอร์ดกลาง (ให้ทุกร้านรับออร์เดอร์ได้) 📢</option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (ห่าง {s.distance})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>ที่อยู่จัดส่ง:</label>
                <textarea 
                  required
                  placeholder="กรุณากรอกที่อยู่ในการจัดส่งกระถาง..."
                  value={deliveryAddress} 
                  onChange={e => setDeliveryAddress(e.target.value)} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', height: '70px', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)', border: '1.5px dashed rgba(200,140,50,0.4)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#8E5431' }}>ยอดรวมใบสั่งทำ:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#8E5431' }}>฿{designedCost?.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={() => { setDesignedPot(null); setDesignedCost(null); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(0,0,0,0.05)', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer' }}>ยกเลิกออกแบบ</button>
                <button type="submit" disabled={orderSubmitting} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  {orderSubmitting ? 'กำลังส่งใบปั้น...' : 'ส่งคำสั่งปั้น 🚀'}
                </button>
              </div>
            </form>
          ) : (
            <div ref={designerRef}>
              <PotMiniGame
                onComplete={handleMiniGameComplete}
                onCancel={() => setSubTab('gallery')}
              />
            </div>
          )}

          {/* Active Orders Tracker */}
          <div id="my-pot-orders" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)' }}>
              <ShoppingBag size={16} />
              <span>ติดตามออร์เดอร์การปั้นกระถาง ({orders.length})</span>
            </div>

            {orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                ✨ ไม่มีคำสั่งซื้อที่อยู่ระหว่างดำเนินการ ลองแต่งตัวและส่งคำสั่งซื้อกระถางใหม่ด้านบนได้เลย!
              </div>
            ) : (
              orders.map((ord) => {
                const getStatusStep = () => {
                  switch (ord.status) {
                    case 'pending':
                      return { text: 'ร้านค้ากำลังรับออร์เดอร์...', sub: 'กำลังตรวจสอบรายการและวัตถุดิบดิน', color: '#E65100', icon: <Clock size={16} /> };
                    case 'accepted':
                      return { text: 'ร้านค้าเตรียมดินดินเหนียว...', sub: 'นวดเนื้อดินให้เข้ากันและขจัดฟองอากาศ', color: '#0288D1', icon: <Loader size={16} className="spin-animation" /> };
                    case 'shaping':
                      return { text: 'ช่างกำลังขึ้นรูปและแกะลาย...', sub: 'ปั้นแต่งรูปทรงบนแป้นและประดับลวดลายตามแบบ', color: '#7B1FA2', icon: <Palette size={16} /> };
                    case 'baking':
                      return { text: 'กำลังเผาอบเตาไฟแรง...', sub: 'เผาอุณหภูมิ 1200 องศาเซลเซียสเพื่อความแกร่ง', color: '#D84315', icon: <Flame size={16} style={{ animation: 'bounce 0.8s infinite alternate' }} /> };
                    case 'completed':
                      return { text: 'การปั้นเสร็จสมบูรณ์ร้อยเปอร์เซ็นต์!', sub: 'อบแห้ง เคลือบสี และแพ็คลงกล่องพร้อมส่งมอบ', color: '#2E7D32', icon: <CheckCircle2 size={16} /> };
                  }
                };

                const step = getStatusStep();

                return (
                  <div 
                    key={ord.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      borderLeft: `5px solid ${step.color}`,
                      animation: 'fade-in 0.4s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                          {ord.pot.name}
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>{ord.pot.colorName}</span>
                          <span>•</span>
                          <span>{ord.pot.shapeTh}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 700, color: 'var(--clay)' }}>฿{ord.cost}</span>
                        </div>
                      </div>
                      <div 
                        style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          color: 'white', 
                          background: step.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {step.icon}
                        <span>{ord.status.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Progress tracking display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '6px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: step.color }}>
                        <span>{step.text}</span>
                        <span>{ord.progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${ord.progress}%`, 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${step.color}, #81C784)`, 
                            borderRadius: '3px',
                            transition: 'width 0.6s ease',
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{step.sub}</span>
                    </div>

                    {/* Timeline dot representations */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px 0', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '10px' }}>
                      {['pending', 'accepted', 'shaping', 'baking', 'completed'].map((st, i) => {
                        const stages: PotOrder['status'][] = ['pending', 'accepted', 'shaping', 'baking', 'completed'];
                        const curIdx = stages.indexOf(ord.status);
                        const isDone = stages.indexOf(st as any) <= curIdx;
                        const labelText = ['สั่งซื้อ', 'เตรียมดิน', 'ขึ้นรูป', 'เผาอบ', 'สำเร็จ'][i];
                        return (
                          <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
                            <div 
                              style={{ 
                                width: '12px', height: '12px', 
                                borderRadius: '50%', 
                                background: isDone ? step.color : '#E0E0E0',
                                boxShadow: isDone ? `0 0 6px ${step.color}` : 'none',
                                transition: 'all 0.4s',
                              }} 
                            />
                            <span style={{ fontSize: '9px', fontWeight: isDone ? 700 : 500, color: isDone ? '#2C3E30' : 'var(--text-muted)' }}>
                              {labelText}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Claim Button once done */}
                    {ord.status === 'completed' && (
                      <button 
                        onClick={() => handleClaimPot(ord.id)}
                        className="premium-btn"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 800,
                          marginTop: '4px',
                          background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                          boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          animation: 'pulse 1.5s infinite',
                        }}
                      >
                        <Sparkles size={14} />
                        <span>รับผลงานกระถางเข้าร้าน! 🏺 (+10 แต้ม)</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Virtual Collection Inventory Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)' }}>
              <BookOpen size={16} />
              <span>กระถางปั้นดินเผาที่ครอบครอง ({customPots.length + 3})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              {/* Starter Pot 1 */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '70px', height: '75px',
                    background: 'radial-gradient(circle at 30% 30%, #E69A5D, #CD853F)',
                    borderRadius: '8px 8px 24px 24px', border: '2px solid var(--white)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1), inset 0 -6px 6px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-3px', left: '-4px', right: '-4px', height: '6px', borderRadius: '2px', background: '#CD853F', border: '2px solid var(--white)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>กระถางดินเหนียวฝึกหัด</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>สีส้มอิฐ • ทรงกลม</div>
                </div>
              </div>

              {/* Starter Pot 2 */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '70px', height: '75px',
                    background: 'radial-gradient(circle at 30% 30%, #F8D360, #F4B41A)',
                    borderRadius: '8px 8px 24px 24px', border: '2px solid var(--white)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1), inset 0 -6px 6px rgba(0,0,0,0.15)',
                    position: 'relative', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'rgba(30,81,40,0.5)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-3px', left: '-4px', right: '-4px', height: '6px', borderRadius: '2px', background: '#F4B41A', border: '2px solid var(--white)' }} />
                  <Sparkles size={20} style={{ opacity: 0.7 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>กระถางดินเผาทองอำพัน</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>สีทองมงคล • ทรงกลม</div>
                </div>
              </div>

              {/* Starter Pot 3 */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '70px', height: '75px',
                    background: 'radial-gradient(circle at 30% 30%, #A86D4A, #8E5431)',
                    borderRadius: '8px 8px 24px 24px', border: '2px solid var(--white)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1), inset 0 -6px 6px rgba(0,0,0,0.15)',
                    position: 'relative', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--gold)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-3px', left: '-4px', right: '-4px', height: '6px', borderRadius: '2px', background: '#8E5431', border: '2px solid var(--white)' }} />
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '28px', height: '28px', opacity: 0.8 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>กระถางสยามมังกรห้าเล็บ</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>สีดินเหนียวเข้ม • ทรงกลม</div>
                </div>
              </div>

              {/* Render custom pots created by user */}
              {customPots.map((pot) => {
                const pd = pot.potDetails;
                const hasDetails = pd !== undefined && pd !== null;

                // Determine background style
                const bgStyle = hasDetails && pd.useCustomClayColor
                  ? `radial-gradient(circle at 30% 30%, ${pd.clayColor1}, ${pd.clayColor2})`
                  : (COLORS.find(c => c.id === pot.color)?.gradient || pot.color);

                // Determine glaze overlay style
                const glazeColorsMap: { [key: string]: string } = {
                  amber: 'rgba(255, 180, 50, 0.55)',
                  cobalt: 'rgba(25, 80, 200, 0.50)',
                  emerald: 'rgba(20, 140, 80, 0.55)',
                  ruby: 'rgba(200, 30, 60, 0.50)',
                  smoke: 'rgba(60, 60, 60, 0.45)',
                  pearl: 'rgba(220, 240, 255, 0.60)',
                  gold: 'rgba(255, 210, 0, 0.55)'
                };
                const hasGlaze = hasDetails && (pd.useCustomGlazeColor || pd.glazeId !== 'none');
                const glazeColorVal = hasDetails && pd.useCustomGlazeColor
                  ? pd.customGlazeColor
                  : (pd ? glazeColorsMap[pd.glazeId] || 'transparent' : 'transparent');
                const glazeOpacityVal = hasDetails && pd.useCustomGlazeColor ? pd.glazeOpacity / 100 : 0.6;

                // Determine border radius
                const borderRad = pot.shape === 'classic' 
                  ? '8px 8px 24px 24px' 
                  : pot.shape === 'modern' ? '6px 6px 8px 8px' : '18px 18px 8px 8px';

                return (
                  <div key={pot.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '70px', height: '75px',
                        background: bgStyle,
                        borderRadius: borderRad,
                        border: '2px solid var(--white)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.1), inset 0 -6px 6px rgba(0,0,0,0.15)',
                        position: 'relative', display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Glaze overlay in miniature */}
                      {hasGlaze && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(160deg, ${glazeColorVal}, transparent)`,
                          opacity: glazeOpacityVal,
                          pointerEvents: 'none',
                          mixBlendMode: 'multiply'
                        }} />
                      )}

                      {/* Render individual decals in miniature */}
                      {hasDetails && pd.equippedDecals && pd.equippedDecals.map((dec: any) => (
                        <div
                          key={dec.id}
                          style={{
                            position: 'absolute',
                            left: `calc(50% + ${dec.x * 0.3}px)`,
                            top: `calc(50% + ${dec.y * 0.3}px)`,
                            transform: `translate(-50%, -50%) rotate(${dec.rotation}deg)`,
                            fontSize: `${14 * dec.scale}px`,
                            lineHeight: 1,
                            pointerEvents: 'none'
                          }}
                        >
                          {dec.url ? (
                            <img src={dec.url} alt="decal" style={{ width: `${16 * dec.scale}px`, height: 'auto', pointerEvents: 'none' }} />
                          ) : (
                            <DecalGraphic decalId={dec.decalId} size={16 * dec.scale} />
                          )}
                        </div>
                      ))}

                      {/* Fallback legacy pattern SVG if no rich potDetails */}
                      {!hasDetails && (
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '28px', height: '28px', opacity: 0.8, mixBlendMode: 'overlay', color: PATTERNS.find(p => p.id === pot.pattern)?.color || '#FFF' }}>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                        </svg>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{pot.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {pot.colorName} • {pot.shapeTh}
                      </div>
                      {pot.cost && (
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clay)', marginTop: '4px' }}>
                          ฿{pot.cost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </>
      )}

    </div>
  );
};
