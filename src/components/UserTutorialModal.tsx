import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  MapPin, 
  Store, 
  Bike, 
  Sparkles, 
  Gamepad, 
  Award, 
  Palette, 
  UserCheck
} from 'lucide-react';

interface UserTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInteractiveTour?: () => void;
}

export const UserTutorialModal: React.FC<UserTutorialModalProps> = ({ isOpen, onClose, onStartInteractiveTour }) => {
  const [activeCategory, setActiveCategory] = useState<'overview' | 'customer' | 'shop' | 'rider' | 'gamepad'>('overview');

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-cream, #FFFDF9)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--gold-light, #E2B85A)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, var(--primary, #1E5128) 0%, #2E7D32 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={22} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFF' }}>
                คู่มือการใช้งาน PotPhot 🏺✨
              </h2>
              <p style={{ fontSize: '12px', opacity: 0.85, margin: '2px 0 0 0' }}>
                คู่มือแนะนำฟีเจอร์และการใช้งานเว็บไซต์สำหรับทุกบทบาท
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onStartInteractiveTour && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartInteractiveTour();
                }}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA000)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '8px 14px',
                  color: '#1E5128',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={16} />
                <span>พาทัวร์แอปพลิเคชัน 🚀</span>
              </button>
            )}
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={20} />
          </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div 
          style={{
            display: 'flex',
            gap: '6px',
            padding: '12px 20px',
            background: 'rgba(30, 81, 40, 0.05)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveCategory('overview')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeCategory === 'overview' ? 'var(--primary, #1E5128)' : 'transparent',
              color: activeCategory === 'overview' ? '#FFF' : 'var(--text-muted, #666)',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={16} />
            <span>ภาพรวม</span>
          </button>

          <button
            onClick={() => setActiveCategory('customer')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeCategory === 'customer' ? 'var(--primary, #1E5128)' : 'transparent',
              color: activeCategory === 'customer' ? '#FFF' : 'var(--text-muted, #666)',
              transition: 'all 0.2s'
            }}
          >
            <MapPin size={16} />
            <span>โหมดลูกค้า</span>
          </button>

          <button
            onClick={() => setActiveCategory('shop')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeCategory === 'shop' ? 'var(--primary, #1E5128)' : 'transparent',
              color: activeCategory === 'shop' ? '#FFF' : 'var(--text-muted, #666)',
              transition: 'all 0.2s'
            }}
          >
            <Store size={16} />
            <span>โหมดเจ้าของร้าน</span>
          </button>

          <button
            onClick={() => setActiveCategory('rider')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeCategory === 'rider' ? 'var(--primary, #1E5128)' : 'transparent',
              color: activeCategory === 'rider' ? '#FFF' : 'var(--text-muted, #666)',
              transition: 'all 0.2s'
            }}
          >
            <Bike size={16} />
            <span>โหมดไรเดอร์</span>
          </button>

          <button
            onClick={() => setActiveCategory('gamepad')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeCategory === 'gamepad' ? 'var(--primary, #1E5128)' : 'transparent',
              color: activeCategory === 'gamepad' ? '#FFF' : 'var(--text-muted, #666)',
              transition: 'all 0.2s'
            }}
          >
            <Gamepad size={16} />
            <span>จอย Xbox</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* OVERVIEW TAB */}
          {activeCategory === 'overview' && (
            <>
              <div style={{ background: 'rgba(30, 81, 40, 0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(30, 81, 40, 0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--gold)" />
                  <span>ยินดีต้อนรับสู่ PotPhot (โพธารามกระถางดินเผา)</span>
                </h3>
                <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                  <strong>PotPhot</strong> คือเว็บแอปพลิเคชันค้นหาร้านกระถางดินเผา ร้านต้นไม้ และงานหัตถกรรมประจำอำเภอโพธาราม จังหวัดราชบุรี ในรูปแบบ <strong>Cozy Fantasy Directory</strong> ที่ผสมผสานเทคโนโลยีแผนที่ 3D, ระบบออกแบบสั่งทำกระถาง, มินิเกมสะสมแต้ม และระบบล็อกอิน 3 บทบาท (ลูกค้า, เจ้าของร้าน, ไรเดอร์)
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #EEE' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={18} /> 1. สำรวจร้านค้า 🗺️
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                    ดูหมุดร้านค้าบนแผนที่ 3D มีชีวิต พร้อมรายละเอียด ภาพ Gallery, วิดีโอสตรีมมิง และระบบนำทาง GPS
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #EEE' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={18} /> 2. สั่งทำกระถาง 🏺
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                    ออกแบบกระถางในแบบของคุณเอง เลือกทรง สี และลวดลายมังกรโบราณ ส่งตรงคำสั่งซื้อไปยังร้านค้า
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #EEE' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={18} /> 3. มินิเกม Clay Tetris 🎮
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                    เล่นเกมเรียงบล็อกดินเผาสะสมแต้ม นำแต้มไปแลกส่วนลดหรือสั่งทำกระถางลิมิเต็ด
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #EEE' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={18} /> 4. ระบบ 3 บทบาท 👥
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                    สลับการใช้งานได้ง่ายระหว่าง 🛒 ลูกค้า, 🏪 เจ้าของร้าน และ 🛵 ไรเดอร์ส่งของ
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CUSTOMER TAB */}
          {activeCategory === 'customer' && (
            <>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} />
                <span>คำแนะนำการใช้งานสำหรับ "ลูกค้า" (Customer)</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    📍 1. การค้นหาร้านค้าบนแผนที่ & รายชื่อ
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • กดที่แท็บ <strong>ร้านค้า (Store)</strong> เพื่อดูหมวดหมู่ร้านค้าบนแผนที่<br />
                    • คลิกที่หมุดร้านค้าหรือการ์ดร้าน เพื่อเปิดหน้าต่างดูรูปภาพ วิดีโอ เบอร์โทรศัพท์ และพิกัด Google Maps<br />
                    • กดปุ่มหัวใจ ❤️ เพื่อบันทึกร้านค้าไว้ในรายการโปรด
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    🔍 2. การกรองค้นหาขั้นสูง (Filter)
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • กดที่แท็บ <strong>ค้นหา (Search)</strong> เพื่อปรับระยะทาง (เช่น 5 กม., 10 กม.)<br />
                    • เลือกร้านที่มีเวิร์กชอปทำกระถาง หรือร้านที่เปิดอยู่ในขณะนี้
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    🏺 3. การออกแบบและสั่งทำกระถางดินเผา
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • กดที่แท็บ <strong>กระถาง (Pot)</strong> แล้วเลือก <strong>"ออกแบบกระถางใหม่"</strong><br />
                    • เลือกทรงกระถาง (ทรงดั้งเดิม, ทรงสูง, ทรงโมเดิร์น), โทนสีดินเผา และลวดลายมังกร/คลื่นโบราณ<br />
                    • เลือกร้านค้าที่ต้องการให้ปั้น แล้วกด <strong>"ส่งคำสั่งซื้อ"</strong> เพื่อรอร้านค้าอนุมัติ
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    🎮 4. การเล่นมินิเกมสะสมแต้ม
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • ในแท็บ <strong>กระถาง (Pot)</strong> สามารถกดเล่นเกม <strong>Clay Tetris</strong> เพื่อเรียงบล็อกดินเผา<br />
                    • ทุกๆ การทำคะแนนในเกม จะแปลงเป็นแต้มสะสมสวน (Points) สำหรับใช้ในแอป
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SHOP OWNER TAB */}
          {activeCategory === 'shop' && (
            <>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} />
                <span>คำแนะนำการใช้งานสำหรับ "เจ้าของร้าน" (Shop Owner)</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    🔑 1. การเข้าสู่ระบบสิทธิ์เจ้าของร้าน
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • กดที่แท็บ <strong>บัญชี (Account)</strong> แล้วคลิกปุ่ม <strong>"สลับบทบาท"</strong> หรือเลือกสิทธิ์เป็น <strong>เจ้าของร้าน (Shop Owner)</strong><br />
                    • ระบบจะนำคุณเข้าสู่แดชบอร์ดจัดการร้านค้าโดยเฉพาะ
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    📝 2. การจัดการข้อมูลร้านและสถานะเปิด/ปิด
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • คุณสามารถอัปเดตชื่อร้าน, คำอธิบายร้าน, เบอร์โทรศัพท์, ที่อยู่ และรูปภาพปกได้ในแดชบอร์ด<br />
                    • สามารถสวิตช์เปิด-ปิดสถานะร้านค้า (เปิดให้บริการ / ปิดชั่วคราว) ได้แบบ Realtime
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    📦 3. รับและจัดการคำสั่งซื้อกระถางสั่งทำ
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • เมื่อมีลูกค้าสั่งทำกระถาง คำสั่งซื้อจะปรากฏในรายการ <strong>คำสั่งซื้อรอดำเนินการ</strong><br />
                    • เจ้าของร้านสามารถกด <strong>"รับออเดอร์ (Accept)"</strong> เพื่อเริ่มปั้นดินเผา หรือกดปฏิเสธได้ตามความเหมาะสม
                  </div>
                </div>
              </div>
            </>
          )}

          {/* RIDER TAB */}
          {activeCategory === 'rider' && (
            <>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bike size={20} />
                <span>คำแนะนำการใช้งานสำหรับ "ไรเดอร์" (Rider)</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    🛵 1. การสลับเข้าสู่โหมดไรเดอร์
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • ไปที่แท็บ <strong>บัญชี (Account)</strong> แล้วเลือกสลับบทบาทเป็น <strong>ไรเดอร์ (Rider)</strong><br />
                    • แดชบอร์ดไรเดอร์จะแสดงออเดอร์จัดส่งกระถางที่เตรียมพร้อมจัดส่งในพื้นที่โพธาราม
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '14px 18px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', marginBottom: '4px' }}>
                    🗺️ 2. การกดรับงาน & อัปเดตสถานะจัดส่ง
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                    • กด <strong>"รับงานส่งของ"</strong> สำหรับออเดอร์ที่ต้องการ<br />
                    • เมื่อนำกระถางไปส่งถึงมือลูกค้าเรียบร้อยแล้ว กดปุ่ม <strong>"ส่งเรียบร้อย"</strong> เพื่อปิดออเดอร์และรับค่าบริการ
                  </div>
                </div>
              </div>
            </>
          )}

          {/* GAMEPAD TAB */}
          {activeCategory === 'gamepad' && (
            <>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gamepad size={20} />
                <span>ปุ่มควบคุมด้วยจอยเกม (Xbox 360 Controller Support)</span>
              </h3>

              <div style={{ background: 'var(--bg-cream)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                    🎮 LB / RB: <span style={{ fontWeight: 400, color: '#666' }}>สลับแท็บเมนูบาร์ด่วน</span>
                  </div>
                  <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                    🔍 LT / RT: <span style={{ fontWeight: 400, color: '#666' }}>ซูมเข้า - ซูมออก แผนที่</span>
                  </div>
                  <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                    🕹️ Analog / D-Pad: <span style={{ fontWeight: 400, color: '#666' }}>เลื่อนโฟกัส / หมุนมุมกล้อง</span>
                  </div>
                  <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                    🟢 ปุ่ม A: <span style={{ fontWeight: 400, color: '#666' }}>ตกลง / เลือกไฮไลต์ร้านค้า</span>
                  </div>
                  <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                    🔴 ปุ่ม B: <span style={{ fontWeight: 400, color: '#666' }}>ยกเลิก / ย้อนกลับ</span>
                  </div>
                  <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', fontWeight: 600 }}>
                    🔵 ปุ่ม X: <span style={{ fontWeight: 400, color: '#666' }}>กดบันทึกร้านโปรด ❤️</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div 
          style={{
            padding: '16px 24px',
            background: 'rgba(30, 81, 40, 0.04)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            className="premium-btn"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            <span>เข้าใจแล้ว เริ่มใช้งานเลย! 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
