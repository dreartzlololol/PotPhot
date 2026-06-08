import React, { useEffect, useState } from 'react';

interface Leaf {
  id: number;
  left: string;
  size: number;
  delay: string;
  duration: string;
  rotate: number;
}

interface Dust {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
}

export const LeafParticles: React.FC = () => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [dustParticles, setDustParticles] = useState<Dust[]>([]);

  useEffect(() => {
    // Generate 12 falling leaves
    const newLeaves = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 15 + 10, // 10px to 25px
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 10}s`, // 10s to 20s
      rotate: Math.random() * 360,
    }));
    setLeaves(newLeaves);

    // Generate 25 floating sun dust particles
    const newDust = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 2, // 2px to 5px
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 15 + 10}s`,
    }));
    setDustParticles(newDust);
  }, []);

  return (
    <div className="fantasy-bg-overlay">
      <div className="sunbeam-effect" />
      
      {/* Falling Leaves */}
      {leaves.map((leaf) => (
        <svg
          key={leaf.id}
          className="leaf-particle"
          style={{
            left: leaf.left,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            animation: `leaf-fall ${leaf.duration} linear infinite`,
            animationDelay: leaf.delay,
            transform: `rotate(${leaf.rotate}deg)`,
            top: '-30px',
          }}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* A cute organic leaf path */}
          <path
            d="M2 22C2 22 6 18 10 18C14 18 22 14 22 2C22 2 10 2 6 10C2 14 2 22 2 22Z"
            fill={leaf.id % 2 === 0 ? '#4E9F3D' : '#1E5128'}
            opacity="0.65"
          />
          <path
            d="M2 22C6 17 12 13 22 2"
            stroke="#D8E9A8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      ))}

      {/* Sun Dust Particles */}
      {dustParticles.map((dust) => (
        <div
          key={dust.id}
          className="sun-dust-particle"
          style={{
            left: dust.left,
            top: dust.top,
            width: `${dust.size}px`,
            height: `${dust.size}px`,
            animation: `sun-dust ${dust.duration} ease-in-out infinite alternate`,
            animationDelay: dust.delay,
            opacity: 0.15 + Math.random() * 0.35,
          }}
        />
      ))}
    </div>
  );
};
