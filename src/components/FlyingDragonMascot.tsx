import React, { useState, useEffect } from 'react';

const MASCOT_MESSAGES = [
  'สวัสดีครับชาวโพธาราม! ขอให้สนุกกับการปั้นกระถางนะครับ 🏺✨',
  'พักสายตา จิบน้ำชาโพธารามกันสักครู่นะครับ 🍵🐉',
  'ยินดีต้อนรับสู่แอป PotPhot เครื่องดินเผาโพธารามครับ! 👑',
  'ลองไปที่แกลเลอรี แล้วแต่งตัวกระถาง 3D กันได้เลยครับ! 🎨',
  'ขอบคุณที่มาเยี่ยมชมร้านกระถางดินเผาโพธารามนะครับ! 🌸',
];

export const FlyingDragonMascot: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [posX, setPosX] = useState(-150);
  const [posY, setPosY] = useState(120);
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  useEffect(() => {
    // Spawn dragon every 40 seconds
    const interval = setInterval(() => {
      if (!isVisible) {
        setPosY(80 + Math.random() * (window.innerHeight * 0.4));
        setPosX(-150);
        setIsVisible(true);
      }
    }, 40000);

    // Initial spawn after 8 seconds
    const initialTimer = setTimeout(() => {
      setPosY(100);
      setPosX(-150);
      setIsVisible(true);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, []);

  // Animation movement loop
  useEffect(() => {
    if (!isVisible) return;

    const moveTimer = setInterval(() => {
      setPosX((prev) => {
        const nextX = prev + 3;
        if (nextX > window.innerWidth + 160) {
          setIsVisible(false);
          setBubbleText(null);
          return -150;
        }
        return nextX;
      });
    }, 30);

    return () => clearInterval(moveTimer);
  }, [isVisible]);

  const handleMascotClick = () => {
    if (bubbleText) return;
    const randomMsg = MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];
    setBubbleText(randomMsg);
    setTimeout(() => {
      setBubbleText(null);
    }, 3800);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${posX}px`,
        top: `${posY}px`,
        zIndex: 9990,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'top 0.5s ease-out',
        animation: 'float 3s ease-in-out infinite',
      }}
      onClick={handleMascotClick}
      title="คลิกเพื่อนคุยกับน้องมังกร! 🐉"
    >
      {/* Dialog Bubble */}
      {bubbleText ? (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #154326, #2D7A47)',
            color: '#FFD700',
            fontWeight: 800,
            fontSize: '12px',
            padding: '9px 16px',
            borderRadius: '18px',
            boxShadow: '0 8px 24px rgba(21, 67, 38, 0.35)',
            whiteSpace: 'nowrap',
            marginBottom: '8px',
            border: '1.5px solid #F59E0B',
            animation: 'bounce-in 0.3s ease-out',
          }}
        >
          {bubbleText}
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(21, 67, 38, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#FFD700',
            fontWeight: 700,
            fontSize: '10px',
            padding: '4px 10px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            marginBottom: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          🐉 น้องมังกรทักทาย! 💬
        </div>
      )}

      {/* Dragon Mascot Avatar */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(217, 119, 6, 0.1) 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)',
        }}
      >
        <img
          src="/mascot.png"
          alt="Dragon Mascot"
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))',
          }}
        />
      </div>
    </div>
  );
};
