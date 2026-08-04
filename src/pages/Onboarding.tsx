import React, { useState } from 'react';
import { ArrowRight, Sparkles, Navigation, CloudLightning, ShoppingBag, Store, Truck, Crown } from 'lucide-react';
import { TiltCard } from '../components/TiltCard';

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  mascotPoseClass: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: 'หมู่บ้านกระถางแฟนตาซี',
      subtitle: 'ยินดีต้อนรับสู่ PotPhot แอพที่รวบรวมร้านกระถางดินเผา ร้านต้นไม้ และของแต่งสวนสุดเก๋ในอำเภอโพธาราม จังหวัดราชบุรี ค้นหาง่าย สนุก และเปี่ยมไปด้วยแรงบันดาลใจ!',
      badge: 'ยินดีต้อนรับ 🐉',
      icon: <Sparkles size={16} />,
      mascotPoseClass: 'float-pose'
    },
    {
      title: 'แผนที่เดินดินมีชีวิต',
      subtitle: 'ไม่ใช่แค่แอปแผนที่ทั่วไป แต่เป็นแผนที่สไตล์ Cozy Fantasy แดนมหัศจรรย์ พร้อมหมุดกระถางดินเผา และน้องมังกรปั้นที่จะบินผ่านท้องฟ้ามาร่วมเดินทางไปกับคุณ!',
      badge: 'ฟีเจอร์หลัก 🗺️',
      icon: <Navigation size={16} />,
      mascotPoseClass: 'spin-pose'
    },
    {
      title: 'คอมมูนิตี้คนรักสวน',
      subtitle: 'ร่วมรีวิว ให้คะแนนร้านค้า และอัปโหลดภาพถ่ายกระถางสวย ๆ ที่คุณซื้อ เพื่อแบ่งปันไอเดียการจัดสวนสไตล์คุณและร่วมสืบสานวัฒนธรรมปั้นดินเผาของโพธารามกัน!',
      badge: 'คอมมูนิตี้ 🤝',
      icon: <CloudLightning size={16} />,
      mascotPoseClass: 'bounce-pose'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div 
      className="onboarding-container" 
      style={{ backgroundImage: `url('/background.png')` }}
    >
      {/* 🌸 Floating Golden Firefly Dust Particles Overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${12 + (i * 11) % 76}%`,
              top: `${14 + (i * 13) % 72}%`,
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#FFD700',
              boxShadow: '0 0 12px #F59E0B, 0 0 20px #FFD700',
              animation: `float ${3 + (i % 3)}s ease-in-out infinite alternate`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* 👑 Interactive 3D Tilt Card with Benjarong Gold Frame */}
      <div className="onboarding-card-wrapper">
        <TiltCard 
          className="onboarding-card"
          style={{
            border: '2px solid #F59E0B',
            boxShadow: '0 20px 50px rgba(21, 67, 38, 0.22), 0 0 35px rgba(245, 158, 11, 0.35)',
            background: 'rgba(255, 253, 249, 0.94)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          {/* Benjarong Gold Ribbon Trim on top */}
          <div 
            style={{
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '5px',
              background: 'repeating-linear-gradient(90deg, #D97706 0px, #D97706 12px, #154326 12px, #154326 24px, #9A3412 24px, #9A3412 36px, #F59E0B 36px, #F59E0B 48px)',
            }} 
          />

          {/* Header Craft Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.8px', marginBottom: '10px', textTransform: 'uppercase' }}>
            <Crown size={13} />
            <span>เครื่องดินเผาโพธาราม • Benjarong Craft</span>
          </div>

          {/* Step Badge */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'var(--gold-glow)',
              color: 'var(--clay)',
              fontWeight: '700',
              fontSize: '12px',
              marginBottom: '16px',
              border: '1px solid var(--gold-light)'
            }}
          >
            {slides[currentSlide].icon}
            <span>{slides[currentSlide].badge}</span>
          </div>

          {/* Mascot Wrapper with Pulsing Glowing Star Ring */}
          <div className="onboarding-mascot-wrapper" style={{ position: 'relative' }}>
            <div 
              style={{
                position: 'absolute',
                width: '190px',
                height: '190px',
                borderRadius: '50%',
                border: '2px dashed rgba(245, 158, 11, 0.5)',
                animation: 'spin-slow 15s linear infinite',
                pointerEvents: 'none',
              }}
            />
            <div className="onboarding-dragon-spiral" />
            <div className="onboarding-sparkle" />
            <img 
              src="/mascot.png" 
              alt="PotPhot Dragon Mascot" 
              className={`onboarding-mascot ${slides[currentSlide].mascotPoseClass}`}
            />
          </div>

          {/* Slide Info */}
          <h1 className="onboarding-title">{slides[currentSlide].title}</h1>
          <p className="onboarding-subtitle">{slides[currentSlide].subtitle}</p>

          {/* User Role Glass Badges */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '14px 0 20px 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', background: 'rgba(45,122,71,0.1)', padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(45,122,71,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShoppingBag size={12} /> ลูกค้าเลือกซื้อ
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--clay)', background: 'rgba(154,52,18,0.1)', padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(154,52,18,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Store size={12} /> หน้าร้านปั้น
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', background: 'rgba(245,158,11,0.12)', padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Truck size={12} /> ไรเดอร์จัดส่ง
            </span>
          </div>

          {/* Action button & indicator row */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center'
            }}
          >
            {/* Pagination Indicators */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {slides.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: index === currentSlide ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: index === currentSlide ? 'var(--primary)' : 'rgba(30, 81, 40, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>

            {/* Action button */}
            <button 
              className="premium-btn" 
              onClick={handleNext}
              style={{ width: '100%', justifyContent: 'center', padding: '14px 28px', fontSize: '16px' }}
            >
              <span>{currentSlide === slides.length - 1 ? 'เริ่มผจญภัยหาร้านกระถาง!' : 'ถัดไป'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
