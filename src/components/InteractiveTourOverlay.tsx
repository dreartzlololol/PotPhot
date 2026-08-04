import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Store, 
  Search, 
  Palette, 
  Gamepad2, 
  UserCheck, 
  Settings, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import type { TabType } from './BottomNav';

export interface InteractiveTourOverlayProps {
  isActive: boolean;
  onFinish: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onSelectSubTab?: (subTab: 'gallery' | 'tetris') => void;
}

interface TourStep {
  id: string;
  title: string;
  badge: string;
  desc: string;
  tip?: string;
  icon: React.ElementType;
  color: string;
  targetId: string | null;
  onEnterTab?: TabType;
  onEnterSubTab?: 'gallery' | 'tetris';
}

export const InteractiveTourOverlay: React.FC<InteractiveTourOverlayProps> = ({
  isActive,
  onFinish,
  activeTab,
  setActiveTab,
  onSelectSubTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'ยินดีต้อนรับสู่ PotPhot! 🏺✨',
      badge: 'เริ่มต้นการพาทัวร์ 🚀',
      desc: 'ระบบค้นหาร้านกระถาง ออกแบบ 3D และสั่งซื้องานดินเผาโพธารามแบบครบวงจร! เดี๋ยวเราจะพาท่านชมฟีเจอร์เด่นแต่ละส่วนไปพร้อมๆ กันครับ',
      tip: 'ทิป: คุณสามารถกดปุ่ม "ถัดไป" หรือสลับย้อนกลับได้ตลอดเวลา!',
      icon: Sparkles,
      color: '#F4B41A',
      targetId: null,
    },
    {
      id: 'store',
      title: 'แผนที่ร้านกระถางดินเผาเรียลไทม์ 🗺️',
      badge: 'ส่วนที่ 1 จาก 6',
      desc: 'ค้นหาร้านกระถางใกล้ตัวบนแผนที่ Interactive ดูพินร้านค้า สั่งซื้อสินค้า และชมข้อมูลร้านกระถางดินเผาโพธารามได้ทันที!',
      tip: 'สามารถซูมแผนที่ หรือเปลี่ยนไฮไลท์ร้านค้าด้วยจอยสติ๊กได้ด้วยนะครับ',
      icon: Store,
      color: '#4E9F3D',
      targetId: 'tutorial-nav-store',
      onEnterTab: 'store',
    },
    {
      id: 'search',
      title: 'ค้นหา & คัดกรองทรงกระถาง 🔍',
      badge: 'ส่วนที่ 2 จาก 6',
      desc: 'ค้นหากระถางตามประเภท รูปทรง ขนาด สีเคลือบ และช่วงราคาที่คุณต้องการได้สะดวกยิ่งขึ้น พร้อมระบบกรองสินค้าอัจฉริยะ',
      tip: 'พิมพ์ค้นหาตามชื่อรูปทรง เช่น "ทรงกลมอ้วน" หรือ "ทรงสูงเพรียว" ได้เลย!',
      icon: Search,
      color: '#3B82F6',
      targetId: 'tutorial-nav-search',
      onEnterTab: 'search',
    },
    {
      id: 'pot-designer',
      title: 'เวิร์กช็อปแต่งตัวกระถาง 3D 🎨',
      badge: 'ส่วนที่ 3 จาก 6',
      desc: 'สตูดิโอออกแบบกระถาง 3 มิติ! เลือกทรงกระถาง ผสมสีเนื้อดิน เลือกเคลือบเงา เพิ่มลายมังกร-หงส์ และสลักชื่อบนกระถางได้สมจริงสุดๆ',
      tip: 'ลองหมุนกระถาง 3D ดูรอบทิศทาง 360 องศาได้ด้วยเมาส์หรือการสัมผัส!',
      icon: Palette,
      color: '#8E5431',
      targetId: 'tutorial-nav-pot',
      onEnterTab: 'pot',
      onEnterSubTab: 'gallery',
    },
    {
      id: 'tetris-game',
      title: 'มินิเกมตัวต่อดินเผา (Tetris) 🧱🎮',
      badge: 'ส่วนที่ 4 จาก 6',
      desc: 'สนุกกับเกมตัวต่อดินเผาเพื่อสะสมแต้มเลเวลช่างปั้น! รองรับคีย์บอร์ด ปุ่มสัมผัสบนมือถือแบบลอย และจอย Xbox 360',
      tip: 'ฟังเพลงประกอบสบายๆ สไตล์ Cozy Garden เฉพาะในหมวดเกมนี้ได้เลย!',
      icon: Gamepad2,
      color: '#EC4899',
      targetId: 'tutorial-nav-pot',
      onEnterTab: 'pot',
      onEnterSubTab: 'tetris',
    },
    {
      id: 'account',
      title: 'บัญชีผู้ใช้ & แดชบอร์ด 3 บทบาท 👤',
      badge: 'ส่วนที่ 5 จาก 6',
      desc: 'สลับโหมดการใช้งานได้อย่างอิสระ ระหว่าง ลูกค้า (Customer), เจ้าของร้านค้า (Shop Owner), และไรเดอร์ส่งกระถาง (Rider)',
      tip: 'ลองกดเปลี่ยนบทบาทเพื่อทดลองระบบจัดการออเดอร์และส่งของได้ทันที!',
      icon: UserCheck,
      color: '#8B5CF6',
      targetId: 'tutorial-nav-account',
      onEnterTab: 'account',
    },
    {
      id: 'settings',
      title: 'ตั้งค่าแอป & โหมดมืด ⚙️',
      badge: 'ส่วนที่ 6 จาก 6',
      desc: 'ปรับแต่งธีมสว่าง/มืด (Dark Theme) ควบคุมเพลงประกอบ จัดการเสียงเอฟเฟกต์ และเปิดอ่านคู่มือย้อนหลังได้ทุกเมื่อ',
      tip: 'สลับเป็นโหมดมืดเพื่อถนอมสายตาในเวลากลางคืนได้ที่นี่ครับ',
      icon: Settings,
      color: '#6B7280',
      targetId: 'tutorial-nav-settings',
      onEnterTab: 'settings',
    },
    {
      id: 'complete',
      title: 'พร้อมใช้งานแล้วครับ! 🎉🏺',
      badge: 'เสร็จสิ้นพาทัวร์ 🌟',
      desc: 'ขอบคุณที่ร่วมพาทัวร์แอปพลิเคชัน PotPhot ขอให้มีความสุขกับการออกแบบและสั่งซื้องานกระถางดินเผาโพธารามนะครับ!',
      tip: 'กดปุ่ม "คู่มือ" ที่มุมบนขวาได้ทุกเมื่อหากต้องการทบทวนอีกครั้ง!',
      icon: Award,
      color: '#F4B41A',
      targetId: null,
    },
  ];

  // Reset to step 0 when tutorial starts
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
    }
  }, [isActive]);

  // Update target element bounds & handle tab navigation
  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    if (!step) return;

    // Switch tab if step requires it
    if (step.onEnterTab && activeTab !== step.onEnterTab) {
      setActiveTab(step.onEnterTab);
    }

    if (step.onEnterSubTab && onSelectSubTab) {
      onSelectSubTab(step.onEnterSubTab);
    }

    const updateTargetRect = () => {
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
          return;
        }
      }
      setTargetRect(null);
    };

    updateTargetRect();
    const timer = setTimeout(updateTargetRect, 150);
    window.addEventListener('resize', updateTargetRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
    };
  }, [isActive, currentStep, activeTab]);

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const IconComponent = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Determine Popover Position relative to Target Spotlight
  let popoverStyle: React.CSSProperties = {};
  if (targetRect) {
    const isBottomHalf = targetRect.top > window.innerHeight / 2;

    if (isBottomHalf) {
      popoverStyle = {
        position: 'fixed',
        bottom: `${window.innerHeight - targetRect.top + 16}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else {
      popoverStyle = {
        position: 'fixed',
        top: `${targetRect.bottom + 16}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
  } else {
    popoverStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'auto' }}>
      {/* SVG Spotlight Mask Overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          {targetRect && (
            <mask id="tour-spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.x - 8}
                y={targetRect.y - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="16"
                fill="black"
              />
            </mask>
          )}
        </defs>

        {/* Darkened backdrop */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 35, 20, 0.72)"
          mask={targetRect ? 'url(#tour-spotlight-mask)' : undefined}
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Animated Dashed Golden Highlight Ring around spotlight target */}
        {targetRect && (
          <rect
            x={targetRect.x - 8}
            y={targetRect.y - 8}
            width={targetRect.width + 16}
            height={targetRect.height + 16}
            rx="16"
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            strokeDasharray="8 4"
            style={{
              animation: 'pulse 1.5s infinite',
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
            }}
          />
        )}
      </svg>

      {/* Floating Guided Tour Popover Card */}
      <div
        className="glass-panel"
        style={{
          ...popoverStyle,
          width: 'calc(100% - 32px)',
          maxWidth: '440px',
          background: 'rgba(255, 253, 249, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          padding: '24px 22px 20px 22px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: `2px solid ${step.color}`,
          boxSizing: 'border-box',
          zIndex: 100000,
          animation: 'scaleUpTour 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Top Bar: Close button & Progress Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{
            background: `${step.color}18`,
            color: step.color,
            border: `1.5px solid ${step.color}40`,
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {step.badge}
          </span>

          {/* Progress Indicator Dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  height: '6px',
                  borderRadius: '4px',
                  width: idx === currentStep ? '20px' : '6px',
                  background: idx === currentStep ? step.color : 'rgba(30,81,40,0.15)',
                  transition: 'all 0.3s ease-in-out'
                }}
              />
            ))}
          </div>

          <button
            onClick={onFinish}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#5C6E60'
            }}
            title="ข้ามทัวร์"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Icon Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${step.color}, #1E5128)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 8px 20px ${step.color}40`,
              flexShrink: 0,
            }}
          >
            <IconComponent size={28} />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary)', margin: 0, lineHeight: 1.3 }}>
              {step.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-dark)', margin: '6px 0 0 0', lineHeight: 1.55 }}>
              {step.desc}
            </p>
          </div>
        </div>

        {/* Mascot Tip Box */}
        {step.tip && (
          <div style={{
            background: 'rgba(78,159,61,0.08)',
            border: '1.5px dashed rgba(78,159,61,0.25)',
            borderRadius: '16px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🏺</span>
            <span style={{ flex: 1 }}>{step.tip}</span>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <button
            onClick={onFinish}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8E5431',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            ข้ามทัวร์
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!isFirstStep && (
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(30,81,40,0.08)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={16} /> ย้อนกลับ
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                background: `linear-gradient(135deg, ${step.color}, #1E5128)`,
                border: 'none',
                borderRadius: '14px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 800,
                color: 'white',
                cursor: 'pointer',
                boxShadow: `0 6px 18px ${step.color}35`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'transform 0.15s ease'
              }}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>เริ่มใช้งานเลย! 🚀</span>
                </>
              ) : (
                <>
                  <span>ถัดไป</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
