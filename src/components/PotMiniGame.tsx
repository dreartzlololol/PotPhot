import React, { useState } from 'react';
import { Flame, ShoppingCart, RotateCcw, ChevronLeft, ChevronRight, UploadCloud, Trash2 } from 'lucide-react';
import type { CustomPot } from '../pages/PotCollection';
import { ThreeModelViewer } from './ThreeModelViewer';



// ─── Data ────────────────────────────────────────────────────────────────────

const SHAPES = [
  { id: 'round',    label: 'ทรงกลมอ้วน',   emoji: '🏺', desc: '฿80+',  borderRadius: '50% 50% 44% 44% / 44% 44% 50% 50%', rimScale: 1.0 },
  { id: 'tall',     label: 'ทรงสูงเพรียว',  emoji: '🪴', desc: '฿90+',  borderRadius: '15% 15% 35% 35% / 10% 10% 40% 40%', rimScale: 1.0 },
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
  // Body decals (no longer emojis, rendered as high-end vector graphics)
  { id: 'body-dragon',  zone: 'body', emoji: '🐉', label: 'มังกรโบราณ',   cost: 200 },
  { id: 'body-lotus',   zone: 'body', emoji: '🪷', label: 'สัตตบงกช',     cost: 120 },
  { id: 'body-phoenix', zone: 'body', emoji: '🦅', label: 'หงส์เหิน',       cost: 180 },
  { id: 'body-bamboo',  zone: 'body', emoji: '🎋', label: 'กอไผ่คราม',     cost: 90 },
  { id: 'body-star',    zone: 'body', emoji: '⭐', label: 'ประจำยามทอง',  cost: 70 },
  // Base decals
  { id: 'base-cloud',   zone: 'base', emoji: '☁️', label: 'เมฆลอย',       cost: 80 },
  { id: 'base-ring',    zone: 'base', emoji: '⭕', label: 'ฐานขอบทอง',    cost: 60 },
  { id: 'base-flame',   zone: 'base', emoji: '🔥', label: 'ลายกนกเปลว',   cost: 90 },
];

const CATEGORIES = [
  { id: 'shape', label: 'ทรง / รูปฟอร์ม',   icon: '🏺' },
  { id: 'clay',  label: 'เนื้อดินปั้น',   icon: '🧱' },
  { id: 'glaze', label: 'เคลือบสี', icon: '✨' },
  { id: 'decal', label: 'ลวดลายรอบใบ', icon: '🎨' },
  { id: 'effects', label: 'ความคืบหน้า / สปิน', icon: '💫' }
];

export interface EquippedDecal {
  id: string;
  decalId: string;
  emoji?: string;
  url?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

// ─── Custom SVG Decal Graphics Component ───────────────────────────────────────

export const DecalGraphic: React.FC<{ decalId: string; size?: number }> = ({ decalId, size = 64 }) => {
  switch (decalId) {
    case 'body-dragon':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="gold-grad-dragon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
          </defs>
          {/* Detailed Thai/Chinese Dragon silhouette */}
          <path 
            d="M 25 65 C 20 50, 30 35, 45 35 C 55 35, 60 45, 65 42 C 72 38, 70 25, 82 28 C 88 30, 85 45, 75 48 C 65 52, 55 68, 42 68 C 30 68, 28 58, 25 65 Z" 
            fill="url(#gold-grad-dragon)" 
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
          <path 
            d="M 45,35 Q 38,40 38,48 T 50,55 T 62,48" 
            fill="none" stroke="#FFF59D" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Dragon scales & flames */}
          <path d="M 68,35 Q 60,30 55,20 Q 52,32 68,35 Z" fill="#FF8F00" />
          <path d="M 40,58 Q 30,68 20,68 Q 28,58 40,58 Z" fill="#FF8F00" />
          <circle cx="74" cy="35" r="2.5" fill="#E63946" />
        </svg>
      );
    case 'body-lotus':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
          {/* Underlay Leaf */}
          <path d="M 15 55 C 10 70, 90 70, 85 55 C 70 50, 30 50, 15 55 Z" fill="#1B5E20" />
          <path d="M 22 56 C 18 68, 82 68, 78 56 C 65 52, 35 52, 22 56 Z" fill="#2E7D32" />
          {/* Pink Lotus Petals */}
          <path d="M 50 20 C 40 40, 25 58, 50 68 C 75 58, 60 40, 50 20 Z" fill="#D81B60" />
          <path d="M 50 30 C 38 45, 30 58, 50 68 C 70 58, 62 45, 50 30 Z" fill="#E91E63" />
          <path d="M 50 40 C 43 50, 38 60, 50 68 C 62 60, 57 50, 50 40 Z" fill="#F48FB1" />
          <path d="M 50 48 C 45 55, 42 62, 50 68 C 58 62, 55 55, 50 48 Z" fill="#FFF" opacity="0.9" />
          {/* Yellow Pollen center */}
          <circle cx="50" cy="58" r="5" fill="#FBC02D" />
        </svg>
      );
    case 'body-phoenix':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="phoenix-gold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D84315" />
              <stop offset="50%" stopColor="#FF8F00" />
              <stop offset="100%" stopColor="#FBC02D" />
            </linearGradient>
          </defs>
          {/* Swan/Phoenix silhouette body */}
          <path 
            d="M 12 45 Q 32 15, 55 25 Q 40 38, 12 45 Z" 
            fill="url(#phoenix-gold)" 
          />
          <path 
            d="M 12 55 Q 28 68, 50 58 Q 38 48, 12 55 Z" 
            fill="url(#phoenix-gold)" 
          />
          <path 
            d="M 55 25 C 60 20, 72 20, 75 28 C 70 32, 62 30, 57 30 Z" 
            fill="url(#phoenix-gold)" 
          />
          <path d="M 75 28 L 84 32 L 74 35 Z" fill="#FF6F00" />
          {/* Majestic flowing tail */}
          <path d="M 28 60 Q 42 85, 68 88 Q 48 76, 28 60 Z" fill="url(#phoenix-gold)" />
          <path d="M 22 55 Q 12 78, 32 90 Q 22 72, 22 55 Z" fill="url(#phoenix-gold)" />
        </svg>
      );
    case 'body-bamboo':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
          {/* Bamboo stems */}
          <rect x="35" y="15" width="7" height="70" rx="3" fill="#2E7D32" />
          <rect x="55" y="32" width="6" height="53" rx="3" fill="#388E3C" />
          {/* Joints */}
          <line x1="33" y1="35" x2="44" y2="35" stroke="#1B5E20" strokeWidth="2.5" />
          <line x1="33" y1="52" x2="44" y2="52" stroke="#1B5E20" strokeWidth="2.5" />
          <line x1="33" y1="70" x2="44" y2="70" stroke="#1B5E20" strokeWidth="2.5" />
          <line x1="53" y1="50" x2="63" y2="50" stroke="#1B5E20" strokeWidth="2.5" />
          <line x1="53" y1="68" x2="63" y2="68" stroke="#1B5E20" strokeWidth="2.5" />
          {/* Leaves */}
          <path d="M 42 35 C 52 30, 58 20, 53 15 C 48 20, 44 30, 42 35 Z" fill="#4CAF50" />
          <path d="M 35 52 C 24 48, 18 38, 22 33 C 28 38, 32 48, 35 52 Z" fill="#4CAF50" />
          <path d="M 61 50 C 70 46, 75 38, 70 33 C 66 38, 63 45, 61 50 Z" fill="#81C784" />
        </svg>
      );
    case 'body-star':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="star-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
          </defs>
          {/* Traditional Thai Kanok style flower/star ornament */}
          <path 
            d="M 50 10 C 52 35, 65 48, 90 50 C 65 52, 52 65, 50 90 C 48 65, 35 52, 10 50 C 35 48, 48 35, 50 10 Z" 
            fill="url(#star-gold-grad)" 
          />
          <path 
            d="M 50 25 C 51 40, 58 49, 75 50 C 58 51, 51 60, 50 75 C 49 60, 42 51, 25 50 C 42 49, 49 40, 50 25 Z" 
            fill="#FFF" 
            opacity="0.85"
          />
          <circle cx="50" cy="50" r="5" fill="#D84315" />
        </svg>
      );
    case 'rim-gold':
      return (
        <svg width={size} height={12} viewBox="0 0 100 12" style={{ pointerEvents: 'none' }}>
          <rect x="0" y="2" width="100" height="8" rx="2" fill="#FFA000" />
          <rect x="0" y="4" width="100" height="4" rx="1" fill="#FFD54F" />
        </svg>
      );
    case 'rim-dots':
      return (
        <svg width={size} height={12} viewBox="0 0 100 12" style={{ pointerEvents: 'none' }}>
          <circle cx="10" cy="6" r="4" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1" />
          <circle cx="30" cy="6" r="4" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1" />
          <circle cx="50" cy="6" r="4" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1" />
          <circle cx="70" cy="6" r="4" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1" />
          <circle cx="90" cy="6" r="4" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="1" />
        </svg>
      );
    case 'rim-wave':
      return (
        <svg width={size} height={12} viewBox="0 0 100 12" style={{ pointerEvents: 'none' }}>
          <path d="M 0 6 Q 12 0, 25 6 T 50 6 T 75 6 T 100 6" fill="none" stroke="#CD853F" strokeWidth="3" />
        </svg>
      );
    case 'base-cloud':
      return (
        <svg width={size} height={16} viewBox="0 0 100 16" style={{ pointerEvents: 'none' }}>
          <path d="M 10 12 C 15 8, 25 8, 30 12 C 35 8, 45 8, 50 12 C 55 8, 65 8, 70 12 C 75 8, 85 8, 90 12" fill="none" stroke="#81D4FA" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'base-ring':
      return (
        <svg width={size} height={16} viewBox="0 0 100 16" style={{ pointerEvents: 'none' }}>
          <line x1="0" y1="4" x2="100" y2="4" stroke="#FFB300" strokeWidth="2" />
          <line x1="0" y1="10" x2="100" y2="10" stroke="#FFB300" strokeWidth="2" />
        </svg>
      );
    case 'base-flame':
      return (
        <svg width={size} height={16} viewBox="0 0 100 16" style={{ pointerEvents: 'none' }}>
          <path d="M 0 14 Q 10 2, 20 14 T 40 14 T 60 14 T 80 14 T 100 14" fill="none" stroke="#FF5722" strokeWidth="2.5" />
        </svg>
      );
    default:
      return null;
  }
};




// ─── Item Card Component ──────────────────────────────────────────────────────

const DressUpItem: React.FC<{
  emoji?: string;
  label: string;
  desc?: string;
  isSelected: boolean;
  onClick: () => void;
  swatch?: string;
  decalId?: string;
}> = ({ emoji, label, desc, isSelected, onClick, swatch, decalId }) => {
  const lastClickRef = React.useRef<number>(0);

  const handleClick = (e: React.SyntheticEvent) => {
    const now = Date.now();
    if (now - lastClickRef.current < 200) {
      e.preventDefault();
      return;
    }
    lastClickRef.current = now;
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
    ) : decalId ? (
      <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DecalGraphic decalId={decalId} size={36} />
      </div>
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
};

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

  // Sculpting States (pot dimensions & scale)
  const [potWidth, setPotWidth] = useState(160);
  const [potHeight, setPotHeight] = useState(180);
  const [rimScale, setRimScale] = useState(1.0);
  const [baseScale, setBaseScale] = useState(1.0);
  const [potScale, setPotScale] = useState(1.0);
  const [referenceObject, setReferenceObject] = useState<'none' | 'iphone' | 'can' | 'coin'>('none');
  const [showAxes, setShowAxes] = useState(true);

  // Real-time Dimension Calculations
  const realDiameterCm = ((potWidth / 15) * potScale).toFixed(1);
  const realDiameterInch = (((potWidth / 15) * potScale) / 2.54).toFixed(1);
  const realHeightCm = ((potHeight / 10) * potScale).toFixed(1);
  const realHeightInch = (((potHeight / 10) * potScale) / 2.54).toFixed(1);
  const estimatedVolumeLiters = (((Math.PI * Math.pow((potWidth / 30) * potScale, 2) * ((potHeight / 10) * potScale))) / 1000).toFixed(1);

  // Custom Colors States (Dual gradient clay mix)
  const [useCustomClayColor, setUseCustomClayColor] = useState(false);
  const [clayColor1, setClayColor1] = useState('#E8A070');
  const [clayColor2, setClayColor2] = useState('#CD853F');
  const [clayGrainLevel, setClayGrainLevel] = useState(30);

  // Custom Glaze color & properties (transparency, gloss, metal shine)
  const [useCustomGlazeColor, setUseCustomGlazeColor] = useState(false);
  const [customGlazeColor, setUseCustomGlazeColorValue] = useState('#1E5128');
  const [glazeOpacity, setGlazeOpacity] = useState(60);
  const [glazeGlossyLevel, setGlazeGlossyLevel] = useState(80);
  const [glazeMetallicLevel, setGlazeMetallicLevel] = useState(20);

  // Finish Texture & Rotation Speed
  const [finishType, setFinishType] = useState<'matte' | 'glossy' | 'crackled'>('glossy');
  const [spinSpeed, setSpinSpeed] = useState(12);

  // Equipped Decals state for individual layout adjustments
  const [equippedDecals, setEquippedDecals] = useState<EquippedDecal[]>([]);
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);

  // Custom Text Engraving
  const [engravedText, setEngravedText] = useState('');
  const [engravingColor, setEngravingColor] = useState('#FFFFFF');

  const [custom3DFileData, setCustom3DFileData] = useState<string | null>(null);
  const [custom3DFileType, setCustom3DFileType] = useState<'stl' | 'obj' | null>(null);

  const shape = SHAPES.find(s => s.id === shapeId) || SHAPES[0];
  const clay  = CLAY_TYPES.find(c => c.id === clayId)!;
  const glaze = GLAZES.find(g => g.id === glazeId)!;

  // Cost calculation
  const decCost = equippedDecals.reduce((sum, d) => {
    if (d.decalId === 'custom-upload') return sum + 150;
    const decItem = DECORATIONS.find(x => x.id === d.decalId);
    return sum + (decItem?.cost ?? 60);
  }, 0);
  const baseDecCost = [...decorations].reduce((sum, id) => sum + (DECORATIONS.find(d => d.id === id)?.cost ?? 0), 0);

  const customClayCost = useCustomClayColor ? 100 : 0;
  const customGlazeCost = useCustomGlazeColor ? 120 : 0;
  const customTextCost = engravedText ? 50 : 0;
  
  const totalCost = clay.baseCost + glaze.cost + decCost + baseDecCost + customClayCost + customGlazeCost + customTextCost + 80;

  const handleShapeSelect = (sId: string) => {
    setShapeId(sId);
    setBaseScale(1.0);
    if (sId === 'wide') {
      setPotWidth(180);
      setPotHeight(140);
      setRimScale(1.2);
    } else if (sId === 'tall') {
      setPotWidth(120);
      setPotHeight(220);
      setRimScale(0.8);
    } else if (sId === 'round') {
      setPotWidth(160);
      setPotHeight(180);
      setRimScale(1.0);
    } else { // octagon
      setPotWidth(150);
      setPotHeight(160);
      setRimScale(0.9);
    }
  };

  const lastDecalAddedTimeRef = React.useRef<number>(0);

  // Add a new decal to the active list (with 350ms anti-double-trigger guard)
  const addDecalInstance = (decalId: string, emoji?: string, url?: string) => {
    const now = Date.now();
    if (now - lastDecalAddedTimeRef.current < 350) {
      return; // Reject duplicate trigger within 350ms window
    }
    lastDecalAddedTimeRef.current = now;

    const newDec: EquippedDecal = {
      id: `dec-${now}-${Math.random().toString(36).substr(2, 5)}`,
      decalId,
      emoji,
      url,
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0
    };
    setEquippedDecals(prev => [...prev, newDec]);
    setSelectedDecalId(newDec.id);
  };

  const handleDecalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดรูปภาพต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        addDecalInstance('custom-upload', undefined, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handle3DModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'stl' && ext !== 'obj') {
        alert('กรุณาอัปโหลดไฟล์นามสกุล .stl หรือ .obj เท่านั้น');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('ขนาดไฟล์โมเดล 3D ต้องไม่เกิน 20MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustom3DFileData(reader.result as string);
        setCustom3DFileType(ext as 'stl' | 'obj');
        setShapeId('custom3d');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrayDecalClick = (id: string) => {
    const decSpec = DECORATIONS.find(d => d.id === id);
    if (decSpec) {
      if (decSpec.zone === 'rim' || decSpec.zone === 'base') {
        // Keep compat toggling for rim/base
        setDecorations(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        // Add individual instance for body decals
        addDecalInstance(decSpec.id, decSpec.emoji);
      }
    }
  };

  const updateSelectedDecalProperty = (id: string, field: keyof EquippedDecal, value: number) => {
    setEquippedDecals(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    }));
  };

  const removeSelectedDecal = () => {
    if (!selectedDecalId) return;
    setEquippedDecals(prev => prev.filter(d => d.id !== selectedDecalId));
    setSelectedDecalId(null);
  };

  const handleFinish = () => {
    const pot: CustomPot & { potDetails?: any } = {
      id: `pot-${Date.now()}`,
      name: potName.trim() || `กระถางปั้นพิเศษ #${Date.now() % 1000}`,
      shape: shapeId === 'round' ? 'classic' : shapeId === 'tall' ? 'modern' : 'octagon',
      shapeTh: shape.label,
      color: useCustomClayColor ? `${clayColor1}_${clayColor2}` : clay.id,
      colorName: useCustomClayColor ? 'สีผสมไล่ระดับพิเศษ' : clay.label,
      pattern: equippedDecals.length > 0 ? 'custom-upload' as any : 'ancient-wave' as any,
      patternTh: equippedDecals.length > 0 ? `แต่งลาย (${equippedDecals.length} ชิ้น)` : 'ไม่มีลายพิเศษ',
      cost: totalCost,
      potDetails: {
        shape: shapeId,
        shapeTh: shape.label,
        clayId,
        glazeId,
        potWidth,
        potHeight,
        rimScale,
        baseScale,
        useCustomClayColor,
        clayColor1,
        clayColor2,
        clayGrainLevel,
        useCustomGlazeColor,
        customGlazeColor,
        glazeOpacity,
        glazeGlossyLevel,
        glazeMetallicLevel,
        finishType,
        spinSpeed,
        engravedText,
        engravingColor,
        equippedDecals
      }
    };
    onComplete(pot, totalCost);
  };

  const handleReset = () => {
    setDecorations(new Set());
    setEquippedDecals([]);
    setSelectedDecalId(null);
    setGlazeId('none');
    setShapeId('round');
    setClayId('terracotta');
    setPotWidth(160);
    setPotHeight(180);
    setRimScale(1.0);
    setBaseScale(1.0);
    setUseCustomClayColor(false);
    setUseCustomGlazeColor(false);
    setFinishType('glossy');
    setSpinSpeed(12);
    setEngravedText('');
  };

  const catIdx = CATEGORIES.findIndex(c => c.id === activeCategory);
  const prevCat = () => setActiveCategory(CATEGORIES[(catIdx - 1 + CATEGORIES.length) % CATEGORIES.length].id);
  const nextCat = () => setActiveCategory(CATEGORIES[(catIdx + 1) % CATEGORIES.length].id);

  const selectedDecal = equippedDecals.find(d => d.id === selectedDecalId);

  const renderItems = () => {
    switch (activeCategory) {
      case 'shape':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0', alignItems: 'center' }}>
              {SHAPES.map(s => (
                <DressUpItem
                  key={s.id}
                  emoji={s.emoji}
                  label={s.label}
                  desc={s.desc}
                  isSelected={shapeId === s.id}
                  onClick={() => handleShapeSelect(s.id)}
                />
              ))}

              {/* Custom 3D Shape Model Uploader */}
              <label style={{
                width: '72px', minHeight: '84px',
                padding: '8px 4px', borderRadius: '16px', cursor: 'pointer',
                border: shapeId === 'custom3d' ? '2.5px solid #4E9F3D' : '1.5px solid rgba(30,81,40,0.08)',
                background: shapeId === 'custom3d' ? 'linear-gradient(135deg, rgba(78,159,61,0.15), rgba(78,159,61,0.05))' : 'rgba(255,255,255,0.9)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '4px', textAlign: 'center', flexShrink: 0,
                boxShadow: shapeId === 'custom3d' ? '0 4px 16px rgba(78,159,61,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
                transition: 'all 0.25s'
              }}>
                {shapeId === 'custom3d' && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#4E9F3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>✓</div>
                )}
                <UploadCloud size={24} style={{ color: '#8E5431' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#1E5128', lineHeight: 1.2 }}>อัปโหลด 3D</span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>.stl / .obj</span>
                <input 
                  type="file" 
                  accept=".stl,.obj" 
                  onChange={handle3DModelUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            {/* Sculpting Sliders with Dimension & Scale Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(30,81,40,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📐 ขนาดมิติและอัตราสเกล (Dimensions & Scale)</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 800, background: 'rgba(244,180,26,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                  สเกล {potScale.toFixed(2)}x
                </span>
              </div>

              {/* Real-time Dimension Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'white', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>เส้นผ่านศูนย์กลาง</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                    {realDiameterInch}" ({realDiameterCm} ซม.)
                  </div>
                </div>
                <div style={{ background: 'white', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ความสูงกระถาง</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#D84315', marginTop: '2px' }}>
                    {realHeightInch}" ({realHeightCm} ซม.)
                  </div>
                </div>
                <div style={{ background: 'white', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ปริมาตรดินประมาณ</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#2E7D32', marginTop: '2px' }}>
                    ~{estimatedVolumeLiters} ลิตร
                  </div>
                </div>
              </div>

              {/* Quick Scale Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)' }}>🔍 เลือกสเกลมาตรฐาน (Scale Presets):</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'S (0.8x)', scale: 0.8 },
                    { label: 'M (1.0x)', scale: 1.0 },
                    { label: 'L (1.25x)', scale: 1.25 },
                    { label: 'XL (1.5x)', scale: 1.5 },
                    { label: 'XXL (2.0x)', scale: 2.0 },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPotScale(p.scale)}
                      style={{
                        flex: 1,
                        padding: '6px 2px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        borderRadius: '8px',
                        border: potScale === p.scale ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                        background: potScale === p.scale ? 'var(--primary-glow)' : 'white',
                        color: potScale === p.scale ? 'var(--primary)' : 'var(--text-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Life Scale Reference Object Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)' }}>📏 วางวัตถุเทียบขนาดในชีวิตจริง (Real-Life Scale Comparison):</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'none', label: '🚫 ไม่แสดง', sub: 'ซ่อนวัตถุ' },
                    { id: 'iphone', label: '📱 iPhone 15', sub: 'สูง 14.7 ซม.' },
                    { id: 'can', label: '🥤 กระป๋องน้ำ', sub: 'สูง 12.3 ซม.' },
                    { id: 'coin', label: '🪙 เหรียญ 10 บาท', sub: 'กว้าง 2.6 ซม.' },
                  ].map(ref => (
                    <button
                      key={ref.id}
                      type="button"
                      onClick={() => setReferenceObject(ref.id as any)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '10px',
                        border: referenceObject === ref.id ? '2px solid #FF9800' : '1px solid rgba(0,0,0,0.1)',
                        background: referenceObject === ref.id ? 'rgba(255,152,0,0.15)' : 'white',
                        color: referenceObject === ref.id ? '#E65100' : 'var(--text-dark)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800 }}>{ref.label}</div>
                      <div style={{ fontSize: '9px', opacity: 0.8 }}>{ref.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* XYZ Axes Helper Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍 เส้นแกนพิกัด 3D (XYZ Axes & Grid):</span>
                  <span style={{ fontSize: '10px', color: '#FF3344', fontWeight: 800 }}>X (แดง)</span>
                  <span style={{ fontSize: '10px', color: '#33CC44', fontWeight: 800 }}>Y (สูง)</span>
                  <span style={{ fontSize: '10px', color: '#3388FF', fontWeight: 800 }}>Z (ลึก)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAxes(!showAxes)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: showAxes ? '1.5px solid #4E9F3D' : '1px solid rgba(0,0,0,0.15)',
                    background: showAxes ? 'var(--primary-glow)' : '#F5F5F5',
                    color: showAxes ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showAxes ? '✓ แสดงแกน XYZ' : '✕ ซ่อนแกน'}
                </button>
              </div>

              {/* Dimension & Sculpting Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>🔍 อัตราสเกลรวม:</span>
                  <input type="range" min="50" max="200" step="5" value={potScale * 100} onChange={e => setPotScale(Number(e.target.value) / 100)} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{potScale.toFixed(2)}x</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>📏 กว้าง/เส้นผ่านศูนย์กลาง:</span>
                  <input type="range" min="100" max="220" value={potWidth} onChange={e => setPotWidth(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{potWidth}px</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>📐 ความสูงกระถาง:</span>
                  <input type="range" min="100" max="260" value={potHeight} onChange={e => setPotHeight(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{potHeight}px</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>⭕ ขนาดขอบปาก:</span>
                  <input type="range" min="70" max="140" value={rimScale * 100} onChange={e => setRimScale(Number(e.target.value) / 100)} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{(rimScale * 100).toFixed(0)}%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>🪵 ขนาดกว้างฐาน:</span>
                  <input type="range" min="50" max="150" value={baseScale * 100} onChange={e => setBaseScale(Number(e.target.value) / 100)} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{(baseScale * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'clay':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {CLAY_TYPES.map(c => (
                <DressUpItem
                  key={c.id}
                  emoji={c.emoji}
                  label={c.label}
                  desc={`฿${c.baseCost}`}
                  isSelected={clayId === c.id && !useCustomClayColor}
                  swatch={c.gradient}
                  onClick={() => {
                    setClayId(c.id);
                    setUseCustomClayColor(false);
                  }}
                />
              ))}
            </div>
            {/* Custom Clay Color Pickers */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🟤 ผสมสีเนื้อดินไล่ระดับสีปั้นเอง (+฿100)</span>
                <input 
                  type="checkbox" 
                  checked={useCustomClayColor} 
                  onChange={e => setUseCustomClayColor(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              {useCustomClayColor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สีส่วนบน:</span>
                    <input 
                      type="color" 
                      value={clayColor1} 
                      onChange={e => setClayColor1(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '45px', height: '30px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สีส่วนฐาน:</span>
                    <input 
                      type="color" 
                      value={clayColor2} 
                      onChange={e => setClayColor2(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '45px', height: '30px', cursor: 'pointer' }}
                    />
                  </div>
                  
                  {/* Texture Grain Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', width: '80px', color: 'var(--text-dark)', fontWeight: 600 }}>ความขรุขระ (Grain):</span>
                    <input 
                      type="range" min="0" max="100" 
                      value={clayGrainLevel} 
                      onChange={e => setClayGrainLevel(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{clayGrainLevel}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'glaze':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {GLAZES.map(g => (
                <DressUpItem
                  key={g.id}
                  emoji={g.id === 'none' ? '🚫' : '💧'}
                  label={g.label}
                  desc={g.cost === 0 ? 'ฟรี' : `+฿${g.cost}`}
                  isSelected={glazeId === g.id && !useCustomGlazeColor}
                  swatch={g.id === 'none'
                    ? 'repeating-linear-gradient(45deg, #eee 0, #eee 4px, white 4px, white 8px)'
                    : `linear-gradient(135deg, ${g.color.replace(/[\d.]+\)$/, '0.9)')}, ${g.color})`}
                  onClick={() => {
                    setGlazeId(g.id);
                    setUseCustomGlazeColor(false);
                  }}
                />
              ))}
            </div>
            {/* Custom Glaze properties */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🎨 ผสมสีและเนื้อเคลือบแก้วเอง (+฿120)</span>
                <input 
                  type="checkbox" 
                  checked={useCustomGlazeColor} 
                  onChange={e => setUseCustomGlazeColor(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              {useCustomGlazeColor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สีน้ำยาเคลือบ:</span>
                    <input 
                      type="color" 
                      value={customGlazeColor} 
                      onChange={e => setUseCustomGlazeColorValue(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '45px', height: '30px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', width: '80px', color: 'var(--text-dark)', fontWeight: 600 }}>ความโปร่งแสง:</span>
                    <input 
                      type="range" min="10" max="90" 
                      value={glazeOpacity} 
                      onChange={e => setGlazeOpacity(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{glazeOpacity}%</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>ความเงามัน:</span>
                    <input 
                      type="range" min="0" max="100" 
                      value={glazeGlossyLevel} 
                      onChange={e => setGlazeGlossyLevel(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{glazeGlossyLevel}%</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>สะท้อนโลหะ (Metallic):</span>
                    <input 
                      type="range" min="0" max="100" 
                      value={glazeMetallicLevel} 
                      onChange={e => setGlazeMetallicLevel(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{glazeMetallicLevel}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'decal':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
            {/* Decal list tray */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {DECORATIONS.map(d => (
                <DressUpItem
                  key={d.id}
                  decalId={d.id}
                  label={d.label}
                  desc={`+฿${d.cost}`}
                  isSelected={false}
                  onClick={() => handleTrayDecalClick(d.id)}
                />
              ))}
            </div>

            {/* Custom Upload Decal & Sliders */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🖼️ อัปโหลดลวดลายภาพถ่ายขึ้นกระถาง (+฿150)</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  <UploadCloud size={14} />
                  <span>เลือกรูป</span>
                  <input type="file" accept="image/*" onChange={handleDecalUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Text Engraving */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>✍️ สลักลายอักษรบนกระถาง (+฿50)</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="พิมพ์อักษรสลัก เช่น Siam 2026..." 
                    value={engravedText} 
                    onChange={e => setEngravedText(e.target.value)} 
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px', outline: 'none' }}
                  />
                  <input 
                    type="color" 
                    value={engravingColor} 
                    onChange={e => setEngravingColor(e.target.value)} 
                    style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer', flexShrink: 0 }}
                  />
                </div>
              </div>

              {/* Individual Decal Fine-Tuning Controls */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                {selectedDecal ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#D84315', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎯 กำลังแต่งลาย:</span>
                        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center' }}>
                          {selectedDecal.url ? (
                            <img src={selectedDecal.url} alt="thumbnail" style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <DecalGraphic decalId={selectedDecal.decalId} size={24} />
                          )}
                        </div>
                      </span>
                      <button 
                        type="button" 
                        onClick={removeSelectedDecal}
                        style={{ background: '#FF4757', border: 'none', borderRadius: '6px', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} /> ลบลายนี้
                      </button>
                    </div>

                    {/* Hint for dragging */}
                    <div style={{ fontSize: '10.5px', color: '#4E9F3D', fontWeight: 700, background: 'rgba(78,159,61,0.08)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #4E9F3D' }}>
                      💡 Tip: คุณสามารถคลิก/แตะที่สติ๊กเกอร์บนตัวกระถาง แล้วลากเมาส์ขยับตำแหน่งจัดวางได้โดยตรงเลย!
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>แนวนอน (X):</span>
                      <input type="range" min="-80" max="80" value={selectedDecal.x} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'x', Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{selectedDecal.x}px</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>แนวตั้ง (Y):</span>
                      <input type="range" min="-100" max="100" value={selectedDecal.y} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'y', Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{selectedDecal.y}px</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>ขนาดลาย:</span>
                      <input type="range" min="40" max="250" value={selectedDecal.scale * 100} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'scale', Number(e.target.value) / 100)} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{(selectedDecal.scale * 100).toFixed(0)}%</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>การหมุน:</span>
                      <input type="range" min="-180" max="180" value={selectedDecal.rotation} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'rotation', Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{selectedDecal.rotation}°</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0', fontStyle: 'italic' }}>
                    👆 แตะรูปสติ๊กเกอร์ลายบนตัวกระถาง หรือคลิกลากขยับจัดตำแหน่ง เลื่อนขนาด หมุนลายแยกชิ้นตามใจชอบได้เลย!
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      case 'effects':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>✨ พื้นผิวดินเผาและการสปินแป้นหมุน</div>
            
            {/* Clay Finish */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dark)' }}>เนื้อผิวเคลือบ (Finish Texture):</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([
                  { id: 'matte', label: 'ด้านธรรมชาติ (Matte)' },
                  { id: 'glossy', label: 'เคลือบเงาวาว (Glossy)' },
                  { id: 'crackled', label: 'ลายครามแก้ว (Crackled)' }
                ] as const).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFinishType(t.id)}
                    style={{
                      flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700, borderRadius: '8px',
                      border: finishType === t.id ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                      background: finishType === t.id ? 'rgba(30,81,40,0.05)' : 'white',
                      color: finishType === t.id ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turntable Spin Speed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', width: '120px', fontWeight: 600, color: 'var(--text-dark)' }}>ความเร็วหมุนแท่น:</span>
              <input 
                type="range" min="0" max="30" step="1"
                value={31 - spinSpeed} 
                onChange={e => {
                  const val = Number(e.target.value);
                  setSpinSpeed(val === 31 ? 0 : 31 - val);
                }} 
                style={{ flex: 1 }} 
              />
              <span style={{ fontSize: '11px', width: '60px', textAlign: 'right' }}>
                {spinSpeed === 0 ? 'หยุดหมุน' : `${(30 / spinSpeed).toFixed(1)}x`}
              </span>
            </div>
          </div>
        );
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
      width: '100%',
      boxSizing: 'border-box'
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
          <button type="button" onClick={handleReset} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} /> รีเซ็ต
          </button>
          <button type="button" onClick={onCancel} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Style sheet for responsive split-screen layout */}
      <style>{`
        .dressup-layout {
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }
        .dressup-stage {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 340px;
          padding: 24px 16px 0;
          background: linear-gradient(180deg, #FFFDF8 0%, #F5F0E8 40%, #EDE4D4 100%);
          position: relative;
          border-bottom: 2px solid rgba(30,81,40,0.06);
          width: 100%;
          box-sizing: border-box;
        }
        .dressup-viewer-container {
          width: 100%;
          height: 340px;
          z-index: 1;
          position: relative;
        }
        .dressup-controls {
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
          background: white;
        }
        @media (min-width: 900px) {
          .dressup-layout {
            flex-direction: row;
            height: calc(100vh - 210px);
            min-height: 520px;
          }
          .dressup-stage {
            flex: 1.2 1 0;
            height: 100%;
            min-height: auto;
            border-right: 2px solid rgba(30,81,40,0.06);
            border-bottom: none;
            padding: 24px 16px;
          }
          .dressup-viewer-container {
            height: 100%;
          }
          .dressup-controls {
            flex: 0.8 1 0;
            height: 100%;
            overflow-y: auto;
          }
        }
      `}</style>

      {/* ── Dress-up Layout ── */}
      <div className="dressup-layout">

        {/* Pot Mannequin Stage */}
        <div className="dressup-stage">

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'repeating-linear-gradient(90deg, #CD853F 0px, #CD853F 8px, transparent 8px, transparent 16px, #1E5128 16px, #1E5128 24px, transparent 24px, transparent 32px)',
            opacity: 0.3,
          }} />

          {equippedDecals.length > 0 && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'rgba(30,81,40,0.85)', backdropFilter: 'blur(4px)',
              borderRadius: '20px', padding: '5px 12px',
              fontSize: '12px', fontWeight: 700, color: 'white',
              display: 'flex', alignItems: 'center', gap: '4px',
              zIndex: 10,
            }}>
              🎨 {equippedDecals.length} ลายบนกระถาง
            </div>
          )}

          {/* Current selections summary */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px',
            zIndex: 10,
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
              {shape.emoji} {shape.label}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
              {useCustomClayColor ? '🎨 สีดินผสมเหลือบสองเฉด' : `${clay.emoji} ดิน${clay.label}`}
            </div>
            {(useCustomGlazeColor || glaze.id !== 'none') && (
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
                ✨ {useCustomGlazeColor ? 'สีเคลือบพิเศษ' : `เคลือบ${glaze.label}`}
              </div>
            )}
          </div>

          {/* Real-time Floating 3D Dimension Badge */}
          <div style={{
            position: 'absolute', bottom: '16px', left: '16px',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            borderRadius: '14px', padding: '6px 14px',
            border: '1.5px solid rgba(78,159,61,0.25)',
            fontSize: '11px', fontWeight: 700, color: '#1E5128',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', gap: '8px',
            zIndex: 10,
          }}>
            <span>📐 ขนาดจริง: <strong>{realDiameterInch}" × {realHeightInch}"</strong> ({realDiameterCm} × {realHeightCm} ซม.)</span>
            <span style={{ background: '#4E9F3D', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 800 }}>
              Scale {potScale.toFixed(2)}x
            </span>
          </div>

          <div style={{
            position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
            width: '240px', height: '120px',
            background: 'radial-gradient(ellipse, rgba(255,247,230,0.6) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {shapeId === 'custom3d' && !custom3DFileData ? (
            <div style={{
              width: '240px', height: '240px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px',
              border: '2.5px dashed rgba(142,84,49,0.3)', borderRadius: '24px',
              background: 'rgba(255,255,255,0.6)', padding: '24px', textAlign: 'center',
              boxSizing: 'border-box', margin: '40px auto 20px', zIndex: 1
            }}>
              <UploadCloud size={40} style={{ color: '#8E5431' }} />
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>รออัปโหลดไฟล์ 3 มิติของคุณ</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>คลิกปุ่ม "อัปโหลด 3D" (.stl / .obj) ด้านล่าง เพื่อดูพรีวิวรูปทรงกระถางเสมือนจริง</div>
            </div>
          ) : (
            <div className="dressup-viewer-container">
              <ThreeModelViewer
                fileData={custom3DFileData}
                fileType={custom3DFileType}
                shapeId={shapeId}
                clayId={clayId}
                potWidth={potWidth}
                potHeight={potHeight}
                rimScale={rimScale}
                baseScale={baseScale}
                potScale={potScale}
                referenceObject={referenceObject}
                showAxes={showAxes}
                useCustomClayColor={useCustomClayColor}
                clayColor1={clayColor1}
                clayColor2={clayColor2}
                glazeId={glazeId}
                useCustomGlazeColor={useCustomGlazeColor}
                customGlazeColor={customGlazeColor}
                glazeOpacity={glazeOpacity}
                glazeGlossyLevel={glazeGlossyLevel}
                glazeMetallicLevel={glazeMetallicLevel}
                finishType={finishType}
                spinSpeed={spinSpeed}
                equippedDecals={equippedDecals}
                selectedDecalId={selectedDecalId}
                onSelectDecal={setSelectedDecalId}
                engravedText={engravedText}
                engravingColor={engravingColor}
              />
            </div>
          )}
        </div>

        {/* Right Column: Controls */}
        <div className="dressup-controls">

          {/* ── Category Ribbon ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0',
            background: 'linear-gradient(180deg, #FEFBF4, #FFF8EC)',
            padding: '0',
            borderBottom: '2px solid rgba(30,81,40,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <button type="button" onClick={prevCat} style={{
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
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'decal') setSelectedDecalId(null);
                  }}
                  style={{
                    flex: '1 0 auto', padding: '10px 12px', fontSize: '11px', fontWeight: 700,
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
            <button type="button" onClick={nextCat} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 8px', color: '#8E5431', display: 'flex', alignItems: 'center',
            }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Items Tray ── */}
          <div style={{
            padding: '16px',
            background: 'white',
            minHeight: '140px',
          }}>
            {renderItems()}
          </div>

          {/* ── Receipt / Finish ── */}
          <div style={{ padding: '12px 16px 16px', background: 'white', borderTop: '1px solid rgba(30,81,40,0.06)' }}>
            {!showReceipt ? (
              <button type="button" onClick={() => { setShowReceipt(true); setSelectedDecalId(null); }} style={{
                width: '100%', padding: '14px', borderRadius: '16px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #8E5431, #CD853F)',
                border: 'none', color: 'white', fontWeight: 800, fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 6px 20px rgba(142,84,49,0.4)',
                transition: 'all 0.3s',
              }}>
                <Flame size={18} /> เข้าเตาอบอบเคลือบดินเผา — ฿{totalCost.toLocaleString()} 🔥
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder={`ตั้งชื่อให้ผลงานกระถางดินเผาพิเศษของคุณ...`}
                  value={potName}
                  onChange={e => setPotName(e.target.value)}
                  style={{
                    width: '100%', height: '44px', borderRadius: '12px',
                    border: '1.5px solid rgba(30,81,40,0.2)', padding: '0 14px',
                    fontSize: '14px', color: '#2C3E30', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Receipt info */}
                <div style={{ background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)', border: '1.5px dashed rgba(200,140,50,0.4)', borderRadius: '14px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#8E5431', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏺 ใบเสร็จการจัดแต่งและปั้นกระถาง</span>
                  </div>
                  {[
                    { label: `ค่ารูปทรง (${shape.label})`, cost: 80 },
                    { label: useCustomClayColor ? 'ค่าดินสีปั้นเหลือบไล่โทนผสมเอง' : `ดินเหนียว ${clay.label}`, cost: clay.baseCost + customClayCost },
                    { label: useCustomGlazeColor ? 'ค่าสีและเนื้อเคลือบแก้วประสมเอง' : (glaze.id !== 'none' ? `เคลือบสี ${glaze.label}` : 'ไม่เคลือบสี'), cost: glaze.cost + customGlazeCost },
                    { label: `ลวดลายสติกเกอร์ / ลายประดับ (${equippedDecals.length} ชิ้น)`, cost: decCost },
                    { label: engravedText ? `อักษรสลัก: "${engravedText}"` : null, cost: customTextCost },
                    { label: 'ค่าความร้อนเตาเผาไฟอบร้อน', cost: 80 },
                  ].filter(r => r.label !== null).map(r => (
                    <div key={r!.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: '1px solid rgba(200,140,50,0.1)' }}>
                      <span style={{ color: '#5C6E60' }}>{r!.label}</span>
                      <span style={{ fontWeight: 700 }}>{r!.cost === 0 ? 'ฟรี' : `฿${r!.cost}`}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E5128' }}>ยอดราคารวม</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#8E5431' }}>฿{totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowReceipt(false)} style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid rgba(30,81,40,0.15)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#5C6E60' }}>
                    ← ย้อนกลับ
                  </button>
                  <button type="button" onClick={handleFinish} style={{
                    flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1E5128, #4E9F3D)',
                    border: 'none', color: 'white', fontWeight: 800, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(30,81,40,0.3)',
                  }}>
                    <ShoppingCart size={16} /> บันทึกและชำระเงิน 🛒
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
