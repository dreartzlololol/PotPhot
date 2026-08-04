import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  emoji: string;
  rotation: number;
  opacity: number;
}

const SPARKLE_EMOJIS = ['✨', '🏺', '🌸', '🌟', '💫', '👑'];

export const ClickSparkleEffect: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Create 6-8 particles at click coordinates
      const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
        const speed = 2 + Math.random() * 3;
        return {
          id: Date.now() + i + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1, // slight upward drift
          size: 14 + Math.random() * 12,
          emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
          rotation: Math.random() * 360,
          opacity: 1,
        };
      });

      setParticles((prev) => [...prev.slice(-20), ...newParticles]);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const timer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy + 0.15, // gravity
            rotation: p.rotation + 6,
            opacity: p.opacity - 0.04,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 25);

    return () => clearInterval(timer);
  }, [particles]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999999, overflow: 'hidden' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            transition: 'opacity 0.05s linear',
            filter: 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.6))',
            userSelect: 'none',
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};
