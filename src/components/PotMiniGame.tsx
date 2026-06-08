import React, { useState } from 'react';
import { Flame, Sparkles, ShoppingCart, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CustomPot } from '../pages/PotCollection';

// Injected styling for modern UI & turntable rotating animation
const SPIN_STYLE = `
@keyframes turntable-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes sparkle-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.15); }
}
`;

// ─── Data ────────────────────────────────────────────────────────────────────

const SHAPES = [
  { id: 'round',    label: 'ทรงกลมอ้วน',   emoji: '🏺', desc: '฿80+',  borderRadius: '50% 50% 44% 44% / 44% 44% 50% 50%', rimScale: 1.0 },
  { id: 'tall',     label: 'ทรงสูงเพรียว',  emoji: '🍶', desc: '฿90+',  borderRadius: '40% 40% 30% 30% / 30% 30% 40% 40%', rimScale: 0.8 },
  { id: 'wide',     label: 'ทรงปากกว้าง',  emoji: '🪣', desc: '฿100+', borderRadius: '48% 48% 38% 38% / 26% 26% 48% 48%', rimScale: 1.2 },
  { id: 'octagon',  label: 'ทรงแปดเหลี่ยม', emoji: '💎', desc: '฿150+', borderRadius: '20%',                                rimScale: 0.9 },
];

const CLAY_TYPES = [
  { id: 'terracotta', label: 'ดินเผา', emoji: '🟤', baseCost: 80,  gradient: 'radial-gradient(circle at 28% 28%, #E8A070, #CD853F 50%, #8B5A2B)' },
  { id: 'stoneware',  label: 'ดินหิน', emoji: '⚫', baseCost: 150, gradient: 'radial-gradient(circle at 28% 28%, #9E9E9E, #616161 50%, #37474F)' },
  { id: 'porcelain',  label: 'กระเบื้อง', emoji: '⚪', baseCost: 250, gradient: 'radial-gradient(circle at 28% 28%, #FAFAFA, #E0E0E0 50%, #BDBDBD)' },
  { id: 'raku',       label: 'ดินราคุ',  emoji: '🔶', baseCost: 320, gradient: 'radial-gradient(circle at 28% 28%, #FFB74D, #E65100 50%, #8D2200)' },
];

const GLAZES = [
  { id: 'none',       label: 'ไม่เคลือบ', color: 'transparent', cost: 0 },
  { id: 'amber',      label: 'อำพัน',    color: 'rgba(255, 180, 50, 0.55)',  cost: 60 },
  { id: 'cobalt',     label: 'โคบอลท์',  color: 'rgba(25, 80, 200, 0.50)',   cost: 80 },
  { id: 'emerald',    label: 'มรกต',     color: 'rgba(20, 140, 80, 0.55)',   cost: 90 },
  { id: 'ruby',       label: 'ทับทิม',   color: 'rgba(200, 30, 60, 0.50)',   cost: 100 },
  { id: 'smoke',      label: 'ควันไฟ',   color: 'rgba(60, 60, 60, 0.45)',    cost: 70 },
  { id: 'pearl',      label: 'มุก',       color: 'rgba(220, 240, 255, 0.60)', cost: 120 },
  { id: 'gold',       label: 'ทอง',      color: 'rgba(255, 210, 0, 0.55)',   cost: 150 },
];

const DECORATIONS = [
  // Rim decals
  { id: 'rim-gold',     zone: 'rim',  emoji: '✨', label: 'ขอบทอง',       cost: 80 },
  { id: 'rim-dots',     zone: 'rim',  emoji: '⚪', label: 'ขอบจุดมุก',    cost: 60 },
  { id: 'rim-wave',     zone: 'rim',  emoji: '〰️', label: 'ขอบคลื่น',     cost: 50 },
  // Body decals
  { id: 'body-dragon',  zone: 'body', emoji: '🐉', label: 'มังกรทอง',     cost: 200 },
  { id: 'body-lotus',   zone: 'body', emoji: '🪷', label: 'ดอกบัว',       cost: 120 },
  { id: 'body-phoenix', zone: 'body', emoji: '🦅', label: 'ฟีนิกซ์',      cost: 180 },
  { id: 'body-bamboo',  zone: 'body', emoji: '🎋', label: 'ไผ่มงคล',      cost: 90 },
  { id: 'body-star',    zone: 'body', emoji: '⭐', label: 'ดาวมงคล',      cost: 70 },
  // Base decals
  { id: 'base-cloud',   zone: 'base', emoji: '☁️', label: 'ลายเมฆ',       cost: 80 },
  { id: 'base-ring',    zone: 'base', emoji: '⭕', label: 'ฐานวงแหวน',    cost: 60 },
  { id: 'base-flame',   zone: 'base', emoji: '🔥', label: 'ฐานเปลวไฟ',    cost: 90 },
];

const CATEGORIES = [
  { id: 'shape', label: 'ทรง',   icon: '🏺' },
  { id: 'clay',  label: 'ดิน',   icon: '🧱' },
  { id: 'glaze', label: 'เคลือบ', icon: '✨' },
  { id: 'rim',   label: 'ขอบปาก', icon: '💫' },
  { id: 'body',  label: 'ตัว',    icon: '🎨' },
  { id: 'base',  label: 'ฐาน',   icon: '🏛️' },
];

// ─── Static Pot Mannequin ──────────────────────────────────────────────────────

const PotMannequin: React.FC<{
  shape: typeof SHAPES[0];
  clay: typeof CLAY_TYPES[0];
  glaze: typeof GLAZES[0];
  decorations: Set<string>;
}> = ({ shape, clay, glaze, decorations }) => {
  const rimDecs  = DECORATIONS.filter(d => d.zone === 'rim'  && decorations.has(d.id));
  const bodyDecs = DECORATIONS.filter(d => d.zone === 'body' && decorations.has(d.id));
  const baseDecs = DECORATIONS.filter(d => d.zone === 'base' && decorations.has(d.id));

  const isWide   = shape.id === 'wide';
  const isTall   = shape.id === 'tall';
  const potW     = isWide ? 180 : isTall ? 120 : 160;
  const potH     = isTall ? 220 : isWide ? 140 : 180;
  const rimW     = Math.round(potW * shape.rimScale);
  const rimH     = 20;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-end', gap: '0px', position: 'relative',
      paddingBottom: '16px',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }}>

      {/* Zone label: Rim */}
      {rimDecs.length > 0 && (
        <div style={{
          position: 'absolute', top: '-8px', right: '-60px',
          background: 'linear-gradient(135deg, #FFD700, #FFA000)',
          borderRadius: '12px', padding: '3px 10px',
          fontSize: '10px', fontWeight: 700, color: 'white',
          boxShadow: '0 2px 8px rgba(255, 160, 0, 0.3)',
          whiteSpace: 'nowrap',
        }}>
          💫 ขอบ x{rimDecs.length}
        </div>
      )}

      {/* Rim */}
      <div style={{
        width: `${rimW}px`, height: `${rimH}px`,
        background: clay.gradient, borderRadius: '10px',
        border: '3px solid rgba(255,255,255,0.8)',
        boxShadow: rimDecs.length > 0
          ? '0 2px 12px rgba(255, 200, 50, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
        position: 'relative', zIndex: 2, marginBottom: '-4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '4px', fontSize: '14px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        {rimDecs.map(d => <span key={d.id} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{d.emoji}</span>)}
      </div>

      {/* Body */}
      <div style={{
        width: `${potW}px`, height: `${potH}px`,
        background: clay.gradient,
        borderRadius: shape.borderRadius,
        border: '3px solid rgba(255,255,255,0.7)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.25), inset 4px 4px 12px rgba(255,255,255,0.15), inset -4px -8px 12px rgba(0,0,0,0.2)',
        position: 'relative', overflow: 'hidden', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 8px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>

        {/* Glaze overlay */}
        {glaze.id !== 'none' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(160deg, ${glaze.color}, transparent 70%)`,
            borderRadius: 'inherit', pointerEvents: 'none',
          }} />
        )}

        {/* Highlight shine */}
        <div style={{
          position: 'absolute', top: '8%', left: '12%',
          width: '28%', height: '35%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Body decorations */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '12px', position: 'relative', zIndex: 2 }}>
          {bodyDecs.map(d => (
            <span key={d.id} style={{
              fontSize: '32px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              transition: 'all 0.3s ease',
            }}>
              {d.emoji}
            </span>
          ))}
          {bodyDecs.length === 0 && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '24px', textAlign: 'center' }}>
              แตะลายเพื่อตกแต่ง
            </div>
          )}
        </div>

        {/* Base decorations */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          {baseDecs.map(d => <span key={d.id} style={{ fontSize: '18px' }}>{d.emoji}</span>)}
        </div>
      </div>

      {/* Spinning Pottery Wheel Plate */}
      <style>{SPIN_STYLE}</style>
      <div 
        style={{
          width: `${potW * 1.3}px`,
          height: '22px',
          background: 'linear-gradient(to bottom, #A1887F, #5D4F43)',
          borderRadius: '50%',
          border: '1.5px solid #3E2723',
          boxShadow: '0 6px 15px rgba(0,0,0,0.22), inset 0 2px 4px rgba(255,255,255,0.25)',
          position: 'relative',
          marginTop: '-10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
        }}
      >
        {/* Rotating surface design */}
        <div 
          style={{
            position: 'absolute',
            inset: '1.5px',
            borderRadius: '50%',
            background: 'repeating-conic-gradient(from 0deg, #D7CCC8 0deg 15deg, #BCAAA4 15deg 30deg, #8D6E63 30deg 45deg)',
            opacity: 0.45,
            animation: 'turntable-spin 15s linear infinite',
          }}
        />
        {/* Metal center cap */}
        <div style={{
          width: '16px', height: '6px',
          background: 'radial-gradient(circle, #FAFAFA, #9E9E9E)',
          borderRadius: '50%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          zIndex: 2,
        }} />
      </div>
    </div>
  );
};

// ─── Item Card Component ──────────────────────────────────────────────────────

const DressUpItem: React.FC<{
  emoji: string;
  label: string;
  desc?: string;
  isSelected: boolean;
  onClick: () => void;
  color?: string;
  swatch?: string;
}> = ({ emoji, label, desc, isSelected, onClick, swatch }) => (
  <button
    onClick={onClick}
    style={{
      width: '72px', minHeight: '84px',
      padding: '8px 4px', borderRadius: '16px', cursor: 'pointer',
      border: isSelected ? '2.5px solid #4E9F3D' : '1.5px solid rgba(30,81,40,0.08)',
      background: isSelected
        ? 'linear-gradient(135deg, rgba(78,159,61,0.15), rgba(78,159,61,0.05))'
        : 'rgba(255,255,255,0.9)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '4px', textAlign: 'center',
      transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: isSelected
        ? '0 4px 16px rgba(78,159,61,0.25), 0 0 0 2px rgba(78,159,61,0.1)'
        : '0 2px 8px rgba(0,0,0,0.04)',
      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
      position: 'relative',
    }}
  >
    {/* Selection checkmark */}
    {isSelected && (
      <div style={{
        position: 'absolute', top: '-4px', right: '-4px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#4E9F3D', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 800,
        boxShadow: '0 2px 4px rgba(30,81,40,0.3)',
      }}>
        ✓
      </div>
    )}

    {swatch ? (
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: swatch,
        border: isSelected ? '2.5px solid #4E9F3D' : '2px solid rgba(0,0,0,0.08)',
        boxShadow: isSelected ? '0 0 0 3px rgba(78,159,61,0.2)' : 'none',
        flexShrink: 0,
      }} />
    ) : (
      <span style={{ fontSize: '26px', lineHeight: 1 }}>{emoji}</span>
    )}
    <div style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? '#1E5128' : '#2C3E30', lineHeight: 1.2 }}>
      {label}
    </div>
    {desc && (
      <div style={{ fontSize: '9px', color: '#8E5431', fontWeight: 600 }}>{desc}</div>
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface PotMiniGameProps {
  onComplete: (pot: CustomPot, cost: number) => void;
  onCancel: () => void;
}

export const PotMiniGame: React.FC<PotMiniGameProps> = ({ onComplete, onCancel }) => {
  const [activeCategory, setActiveCategory] = useState('shape');
  const [shapeId,     setShapeId]     = useState('round');
  const [clayId,      setClayId]      = useState('terracotta');
  const [glazeId,     setGlazeId]     = useState('none');
  const [decorations, setDecorations] = useState<Set<string>>(new Set());
  const [potName,     setPotName]     = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const shape = SHAPES.find(s => s.id === shapeId)!;
  const clay  = CLAY_TYPES.find(c => c.id === clayId)!;
  const glaze = GLAZES.find(g => g.id === glazeId)!;

  // Cost
  const decCost  = [...decorations].reduce((sum, id) => sum + (DECORATIONS.find(d => d.id === id)?.cost ?? 0), 0);
  const totalCost = clay.baseCost + glaze.cost + decCost + 80; // 80 = kiln

  const toggleDec = (id: string) => {
    setDecorations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFinish = () => {
    const pot: CustomPot = {
      id: `pot-${Date.now()}`,
      name: potName.trim() || `กระถาง ${clay.label} #${Date.now() % 1000}`,
      shape: shapeId === 'round' ? 'classic' : shapeId === 'tall' ? 'modern' : 'octagon',
      shapeTh: shape.label,
      color: '#CD853F',
      colorName: clay.label,
      pattern: decorations.has('body-dragon') ? 'gold-dragon' : decorations.has('body-phoenix') ? 'emerald-dragon' : decorations.has('body-lotus') ? 'cute-mascot' : 'ancient-wave',
      patternTh: decorations.size > 0 ? 'ลายผสม' : 'ไม่มีลาย',
    };
    onComplete(pot, totalCost);
  };

  const handleReset = () => {
    setDecorations(new Set());
    setGlazeId('none');
    setShapeId('round');
    setClayId('terracotta');
  };

  // Navigate categories
  const catIdx = CATEGORIES.findIndex(c => c.id === activeCategory);
  const prevCat = () => setActiveCategory(CATEGORIES[(catIdx - 1 + CATEGORIES.length) % CATEGORIES.length].id);
  const nextCat = () => setActiveCategory(CATEGORIES[(catIdx + 1) % CATEGORIES.length].id);

  // Render items for current category
  const renderItems = () => {
    switch (activeCategory) {
      case 'shape':
        return SHAPES.map(s => (
          <DressUpItem
            key={s.id}
            emoji={s.emoji}
            label={s.label}
            desc={s.desc}
            isSelected={shapeId === s.id}
            onClick={() => setShapeId(s.id)}
          />
        ));
      case 'clay':
        return CLAY_TYPES.map(c => (
          <DressUpItem
            key={c.id}
            emoji={c.emoji}
            label={c.label}
            desc={`฿${c.baseCost}`}
            isSelected={clayId === c.id}
            swatch={c.gradient}
            onClick={() => setClayId(c.id)}
          />
        ));
      case 'glaze':
        return GLAZES.map(g => (
          <DressUpItem
            key={g.id}
            emoji={g.id === 'none' ? '🚫' : '💧'}
            label={g.label}
            desc={g.cost === 0 ? 'ฟรี' : `+฿${g.cost}`}
            isSelected={glazeId === g.id}
            swatch={g.id === 'none'
              ? 'repeating-linear-gradient(45deg, #eee 0, #eee 4px, white 4px, white 8px)'
              : `linear-gradient(135deg, ${g.color.replace(/[\d.]+\)$/, '0.9)')}, ${g.color})`}
            onClick={() => setGlazeId(g.id)}
          />
        ));
      case 'rim':
        return DECORATIONS.filter(d => d.zone === 'rim').map(d => (
          <DressUpItem
            key={d.id}
            emoji={d.emoji}
            label={d.label}
            desc={`+฿${d.cost}`}
            isSelected={decorations.has(d.id)}
            onClick={() => toggleDec(d.id)}
          />
        ));
      case 'body':
        return DECORATIONS.filter(d => d.zone === 'body').map(d => (
          <DressUpItem
            key={d.id}
            emoji={d.emoji}
            label={d.label}
            desc={`+฿${d.cost}`}
            isSelected={decorations.has(d.id)}
            onClick={() => toggleDec(d.id)}
          />
        ));
      case 'base':
        return DECORATIONS.filter(d => d.zone === 'base').map(d => (
          <DressUpItem
            key={d.id}
            emoji={d.emoji}
            label={d.label}
            desc={`+฿${d.cost}`}
            isSelected={decorations.has(d.id)}
            onClick={() => toggleDec(d.id)}
          />
        ));
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(30,81,40,0.15)',
      background: '#FFFDF8',
    }}>

      {/* ── Header bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E5128, #4E9F3D)',
        padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            🎀 แต่งตัวกระถาง
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
            Pottery Dress Up!
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Cost badge */}
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
            borderRadius: '20px', padding: '5px 14px',
            fontSize: '14px', fontWeight: 900, color: 'white',
            boxShadow: '0 2px 8px rgba(255,160,0,0.3)',
          }}>
            ฿{totalCost.toLocaleString()}
          </div>
          <button onClick={handleReset} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} /> รีเซ็ต
          </button>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Dress-up Layout ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Pot Mannequin Stage — Static, no spinning */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          minHeight: '300px', padding: '24px 16px 0',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #F5F0E8 40%, #EDE4D4 100%)',
          position: 'relative',
          borderBottom: '2px solid rgba(30,81,40,0.06)',
        }}>

          {/* Decorative Thai pattern border */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'repeating-linear-gradient(90deg, #CD853F 0px, #CD853F 8px, transparent 8px, transparent 16px, #1E5128 16px, #1E5128 24px, transparent 24px, transparent 32px)',
            opacity: 0.3,
          }} />

          {/* Items equipped counter */}
          {decorations.size > 0 && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'rgba(30,81,40,0.85)', backdropFilter: 'blur(4px)',
              borderRadius: '20px', padding: '5px 12px',
              fontSize: '12px', fontWeight: 700, color: 'white',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              🎨 {decorations.size} ลาย
            </div>
          )}

          {/* Current selections summary */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
              {shape.emoji} {shape.label}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
              {clay.emoji} {clay.label}
            </div>
            {glaze.id !== 'none' && (
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
                ✨ {glaze.label}
              </div>
            )}
          </div>

          {/* Spotlight effect */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
            width: '240px', height: '120px',
            background: 'radial-gradient(ellipse, rgba(255,247,230,0.6) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <PotMannequin shape={shape} clay={clay} glaze={glaze} decorations={decorations} />
        </div>

        {/* ── Category Ribbon (Dress-up game style) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0',
          background: 'linear-gradient(180deg, #FEFBF4, #FFF8EC)',
          padding: '0',
          borderBottom: '2px solid rgba(30,81,40,0.06)',
        }}>
          <button onClick={prevCat} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px 8px', color: '#8E5431', display: 'flex', alignItems: 'center',
          }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{
            flex: 1, display: 'flex', gap: '0', overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  flex: '1 0 auto', padding: '10px 6px', fontSize: '11px', fontWeight: 700,
                  background: activeCategory === cat.id
                    ? 'linear-gradient(180deg, rgba(78,159,61,0.12), rgba(78,159,61,0.04))'
                    : 'none',
                  border: 'none', cursor: 'pointer',
                  color: activeCategory === cat.id ? '#1E5128' : '#8C9E90',
                  borderBottom: activeCategory === cat.id ? '3px solid #4E9F3D' : '3px solid transparent',
                  transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
          <button onClick={nextCat} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px 8px', color: '#8E5431', display: 'flex', alignItems: 'center',
          }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* ── Items Tray (Dress-up game wardrobe style) ── */}
        <div style={{
          padding: '14px 16px',
          background: 'white',
          minHeight: '120px',
        }}>
          <div style={{
            display: 'flex', gap: '8px', overflowX: 'auto',
            padding: '4px 0',
            scrollbarWidth: 'none',
          }}>
            {renderItems()}
          </div>
          <div style={{
            marginTop: '8px', textAlign: 'center',
            fontSize: '11px', color: '#8C9E90', fontWeight: 500,
          }}>
            🪷 แตะเพื่อเลือกส่วนประกอบให้กระถางของคุณ 🪷
          </div>
        </div>

        {/* ── Receipt / Finish ── */}
        <div style={{ padding: '12px 16px 16px', background: 'white', borderTop: '1px solid rgba(30,81,40,0.06)' }}>
          {!showReceipt ? (
            <button onClick={() => setShowReceipt(true)} style={{
              width: '100%', padding: '14px', borderRadius: '16px', cursor: 'pointer',
              background: 'linear-gradient(135deg, #8E5431, #CD853F)',
              border: 'none', color: 'white', fontWeight: 800, fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 6px 20px rgba(142,84,49,0.4)',
              transition: 'all 0.3s',
            }}>
              <Flame size={18} /> เข้าตู้เผา — ฿{totalCost.toLocaleString()} 🔥
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Name input */}
              <input
                type="text"
                placeholder={`กระถาง${clay.label}ลายพิเศษ...`}
                value={potName}
                onChange={e => setPotName(e.target.value)}
                style={{
                  width: '100%', height: '44px', borderRadius: '12px',
                  border: '1.5px solid rgba(30,81,40,0.2)', padding: '0 14px',
                  fontSize: '14px', color: '#2C3E30', outline: 'none', fontFamily: 'inherit',
                }}
              />

              {/* Receipt */}
              <div style={{ background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)', border: '1.5px dashed rgba(200,140,50,0.4)', borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#8E5431', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingCart size={13} /> ใบรายการ
                </div>
                {[
                  { label: `ดิน${clay.label}`, cost: clay.baseCost },
                  { label: glaze.label === 'ไม่เคลือบ' ? 'ไม่เคลือบ' : `เคลือบ${glaze.label}`, cost: glaze.cost },
                  { label: `ลวดลาย (${decorations.size})`, cost: decCost },
                  { label: 'ค่าเผาเตา',  cost: 80 },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: '1px solid rgba(200,140,50,0.1)' }}>
                    <span style={{ color: '#5C6E60' }}>{r.label}</span>
                    <span style={{ fontWeight: 700 }}>{r.cost === 0 ? 'ฟรี' : `฿${r.cost}`}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E5128' }}>รวม</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#8E5431' }}>฿{totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowReceipt(false)} style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid rgba(30,81,40,0.15)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#5C6E60' }}>
                  ← แก้ไข
                </button>
                <button onClick={handleFinish} style={{
                  flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #1E5128, #4E9F3D)',
                  border: 'none', color: 'white', fontWeight: 800, fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 20px rgba(30,81,40,0.3)',
                }}>
                  <ShoppingCart size={16} /> ส่งคำสั่งซื้อกระถาง 🛒
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
