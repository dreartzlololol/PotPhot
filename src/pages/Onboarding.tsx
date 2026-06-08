import React, { useState } from 'react';
import { ArrowRight, Sparkles, Navigation, CloudLightning } from 'lucide-react';

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
      <div className="onboarding-card glass-panel">
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

        {/* Mascot Wrapper */}
        <div className="onboarding-mascot-wrapper">
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

        {/* Action button & indicator row */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
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
      </div>
    </div>
  );
};
