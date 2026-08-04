import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', style = {}, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 2; // max 2 deg micro tilt
    const rotateY = ((x - centerX) / centerX) * 2;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.008)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`glass-panel ${className}`}
      style={{
        ...style,
        transform,
        transition: transform.includes('0deg') ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Dynamic 3D Iridescent Benjarong Holographic Glare Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 215, 0, ${glarePos.opacity}) 0%, rgba(245, 158, 11, 0.1) 45%, transparent 80%)`,
          mixBlendMode: 'overlay',
          transition: 'opacity 0.25s ease',
          zIndex: 10,
        }}
      />
      {children}
    </div>
  );
};
